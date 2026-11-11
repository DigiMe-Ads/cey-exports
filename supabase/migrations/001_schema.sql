-- Cey Exports — bulk-order (container) storefront schema
-- Catalogue, containers, customer profiles, inquiries, stock, storage and RLS.

-- ───────────────────────── Profiles & roles ─────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  company text,
  phone text,
  country text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, company, phone, country)
  values (
    new.id, new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'company',
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'country'
  )
  on conflict (id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Customers may edit their own profile but never their role
create or replace function public.guard_profile_role()
returns trigger language plpgsql as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null and not public.is_admin() then
    raise exception 'Only admins can change roles';
  end if;
  new.updated_at := now();
  return new;
end $$;

create trigger profiles_guard_role before update on public.profiles
  for each row execute function public.guard_profile_role();

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- ───────────────────────── Catalogue ─────────────────────────
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  image_url text,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  logo_url text,
  tagline text,
  featured boolean not null default false,
  own boolean not null default false,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  brand_id uuid references public.brands (id) on delete set null,
  category_id uuid references public.categories (id) on delete set null,
  description text,
  image_url text,
  pack text,                                   -- e.g. "500 g × 20 per carton"
  price numeric(12, 2),                        -- price per carton (AED); null = price on request
  compare_at numeric(12, 2),
  -- Outer carton dimensions: the unit used for container planning
  carton_length_cm numeric(8, 2) not null check (carton_length_cm > 0),
  carton_width_cm numeric(8, 2) not null check (carton_width_cm > 0),
  carton_height_cm numeric(8, 2) not null check (carton_height_cm > 0),
  volume_cm3 numeric generated always as (carton_length_cm * carton_width_cm * carton_height_cm) stored,
  gross_weight_kg numeric(8, 2) check (gross_weight_kg is null or gross_weight_kg >= 0),
  stock int not null default 0,                -- cartons on hand
  min_order_qty int not null default 1 check (min_order_qty >= 1),
  is_active boolean not null default true,
  is_new boolean not null default false,
  featured boolean not null default false,
  best boolean not null default false,
  sort int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_category_idx on public.products (category_id);
create index products_brand_idx on public.products (brand_id);
create trigger products_touch before update on public.products for each row execute function public.touch_updated_at();

-- Shipping containers. Usable volume keeps a safety margin for measurement error and imperfect stacking.
create table public.containers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text,
  description text,
  length_cm numeric(8, 2) not null check (length_cm > 0),
  width_cm numeric(8, 2) not null check (width_cm > 0),
  height_cm numeric(8, 2) not null check (height_cm > 0),
  max_payload_kg numeric(10, 2) check (max_payload_kg is null or max_payload_kg > 0),
  safety_margin_pct numeric(5, 2) not null default 10 check (safety_margin_pct between 0 and 50),
  min_fill_pct numeric(5, 2) not null default 80 check (min_fill_pct between 0 and 100),
  inner_volume_cm3 numeric generated always as (length_cm * width_cm * height_cm) stored,
  usable_volume_cm3 numeric generated always as (length_cm * width_cm * height_cm * (1 - safety_margin_pct / 100)) stored,
  is_active boolean not null default true,
  is_default boolean not null default false,
  sort int not null default 0,
  created_at timestamptz not null default now()
);
create unique index containers_one_default on public.containers (is_default) where is_default;

create table public.blogs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  body text,
  image_url text,
  category text,
  read_time text,
  published_at date not null default current_date,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.promotions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  label text,
  ends_text text,
  image_url text,
  link text,
  is_active boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

-- ───────────────────────── Inquiries ─────────────────────────
create type public.inquiry_status as enum ('new', 'reviewing', 'contacted', 'quoted', 'confirmed', 'shipped', 'completed', 'cancelled');

create sequence public.inquiry_ref_seq start 1001;

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  ref_no bigint not null default nextval('public.inquiry_ref_seq') unique,
  user_id uuid not null references auth.users (id) on delete cascade,
  status public.inquiry_status not null default 'new',
  container_id uuid references public.containers (id) on delete set null,
  container_name text not null,
  container_usable_cm3 numeric not null,
  container_max_payload_kg numeric,
  total_volume_cm3 numeric not null,
  total_weight_kg numeric not null default 0,
  fill_pct numeric(6, 2) not null,
  estimated_value numeric(14, 2),
  contact_name text not null,
  company text,
  email text not null,
  phone text,
  destination text,
  preferred_date date,
  notes text,
  stock_applied boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index inquiries_user_idx on public.inquiries (user_id, created_at desc);
create index inquiries_status_idx on public.inquiries (status, created_at desc);
create trigger inquiries_touch before update on public.inquiries for each row execute function public.touch_updated_at();

create table public.inquiry_items (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.inquiries (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  product_image text,
  qty int not null check (qty > 0),
  unit_volume_cm3 numeric not null,
  unit_weight_kg numeric,
  unit_price numeric(12, 2)
);
create index inquiry_items_inquiry_idx on public.inquiry_items (inquiry_id);

-- Customer-visible status timeline
create table public.inquiry_events (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.inquiries (id) on delete cascade,
  status public.inquiry_status not null,
  note text,
  created_at timestamptz not null default now()
);
create index inquiry_events_inquiry_idx on public.inquiry_events (inquiry_id, created_at);

-- Internal notes, admins only
create table public.inquiry_notes (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.inquiries (id) on delete cascade,
  author_id uuid references auth.users (id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

-- ───────────────────────── RPCs ─────────────────────────
-- Customers submit inquiries only through this function so volumes, fill and limits are computed server-side.
create or replace function public.submit_inquiry(p_container_id uuid, p_items jsonb, p_contact jsonb)
returns public.inquiries
language plpgsql security definer set search_path = public as $$
declare
  c public.containers;
  inq public.inquiries;
  item jsonb;
  p public.products;
  q int;
  tot_vol numeric := 0;
  tot_w numeric := 0;
  tot_val numeric := 0;
  vol_pct numeric;
  w_pct numeric := 0;
  fill numeric;
  c_dims numeric[];
  p_dims numeric[];
begin
  if auth.uid() is null then
    raise exception 'Please sign in to send an inquiry';
  end if;
  select * into c from public.containers where id = p_container_id and is_active;
  if not found then raise exception 'Container not available'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Your container is empty';
  end if;
  if coalesce(trim(p_contact ->> 'contact_name'), '') = '' or coalesce(trim(p_contact ->> 'email'), '') = '' then
    raise exception 'Name and email are required';
  end if;

  select array_agg(d order by d) into c_dims from unnest(array[c.length_cm, c.width_cm, c.height_cm]) d;

  for item in select * from jsonb_array_elements(p_items) loop
    q := (item ->> 'qty')::int;
    select * into p from public.products where id = (item ->> 'product_id')::uuid and is_active;
    if not found then raise exception 'A product in your container is no longer available'; end if;
    if q is null or q < p.min_order_qty then
      raise exception '% needs at least % cartons', p.name, p.min_order_qty;
    end if;
    select array_agg(d order by d) into p_dims from unnest(array[p.carton_length_cm, p.carton_width_cm, p.carton_height_cm]) d;
    if p_dims[1] > c_dims[1] or p_dims[2] > c_dims[2] or p_dims[3] > c_dims[3] then
      raise exception '% cartons do not fit in a %', p.name, c.name;
    end if;
    tot_vol := tot_vol + p.volume_cm3 * q;
    tot_w := tot_w + coalesce(p.gross_weight_kg, 0) * q;
    tot_val := tot_val + coalesce(p.price, 0) * q;
  end loop;

  vol_pct := tot_vol / c.usable_volume_cm3 * 100;
  if c.max_payload_kg is not null then w_pct := tot_w / c.max_payload_kg * 100; end if;
  fill := greatest(vol_pct, w_pct);

  if fill > 100.0001 then raise exception 'Your order exceeds the usable capacity of a %', c.name; end if;
  if fill + 0.0001 < c.min_fill_pct then
    raise exception 'Fill at least % percent of the container before sending (currently % percent)', c.min_fill_pct, round(fill, 1);
  end if;

  insert into public.inquiries (
    user_id, container_id, container_name, container_usable_cm3, container_max_payload_kg,
    total_volume_cm3, total_weight_kg, fill_pct, estimated_value,
    contact_name, company, email, phone, destination, preferred_date, notes
  ) values (
    auth.uid(), c.id, c.name, c.usable_volume_cm3, c.max_payload_kg,
    tot_vol, tot_w, round(fill, 2), tot_val,
    trim(p_contact ->> 'contact_name'), p_contact ->> 'company', trim(p_contact ->> 'email'),
    p_contact ->> 'phone', p_contact ->> 'destination',
    nullif(p_contact ->> 'preferred_date', '')::date, p_contact ->> 'notes'
  ) returning * into inq;

  insert into public.inquiry_items (inquiry_id, product_id, product_name, product_image, qty, unit_volume_cm3, unit_weight_kg, unit_price)
  select inq.id, pr.id, pr.name, pr.image_url, (it ->> 'qty')::int, pr.volume_cm3, pr.gross_weight_kg, pr.price
  from jsonb_array_elements(p_items) it
  join public.products pr on pr.id = (it ->> 'product_id')::uuid;

  insert into public.inquiry_events (inquiry_id, status, note) values (inq.id, 'new', 'Inquiry received');
  return inq;
end $$;

create or replace function public.update_inquiry_status(p_id uuid, p_status public.inquiry_status, p_note text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Admins only'; end if;
  update public.inquiries set status = p_status where id = p_id;
  if not found then raise exception 'Inquiry not found'; end if;
  insert into public.inquiry_events (inquiry_id, status, note) values (p_id, p_status, nullif(trim(p_note), ''));
end $$;

-- Deduct cartons from stock once an inquiry goes ahead
create or replace function public.apply_inquiry_stock(p_id uuid, p_force boolean default false)
returns void language plpgsql security definer set search_path = public as $$
declare
  short text;
begin
  if not public.is_admin() then raise exception 'Admins only'; end if;
  perform 1 from public.inquiries where id = p_id and not stock_applied for update;
  if not found then raise exception 'Stock was already deducted for this inquiry'; end if;

  select string_agg(format('%s (need %s, have %s)', pr.name, ii.qty, pr.stock), '; ')
    into short
  from public.inquiry_items ii join public.products pr on pr.id = ii.product_id
  where ii.inquiry_id = p_id and pr.stock < ii.qty;
  if short is not null and not p_force then
    raise exception 'Not enough stock: %', short;
  end if;

  update public.products pr set stock = pr.stock - agg.qty
  from (select product_id, sum(qty)::int qty from public.inquiry_items where inquiry_id = p_id and product_id is not null group by product_id) agg
  where pr.id = agg.product_id;
  update public.inquiries set stock_applied = true where id = p_id;
  insert into public.inquiry_notes (inquiry_id, author_id, body) values (p_id, auth.uid(), 'Stock deducted for this inquiry');
end $$;

create or replace function public.revert_inquiry_stock(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Admins only'; end if;
  perform 1 from public.inquiries where id = p_id and stock_applied for update;
  if not found then raise exception 'Stock has not been deducted for this inquiry'; end if;
  update public.products pr set stock = pr.stock + agg.qty
  from (select product_id, sum(qty)::int qty from public.inquiry_items where inquiry_id = p_id and product_id is not null group by product_id) agg
  where pr.id = agg.product_id;
  update public.inquiries set stock_applied = false where id = p_id;
  insert into public.inquiry_notes (inquiry_id, author_id, body) values (p_id, auth.uid(), 'Stock returned to inventory');
end $$;

-- Only one default container at a time
create or replace function public.single_default_container()
returns trigger language plpgsql as $$
begin
  if new.is_default then
    update public.containers set is_default = false where id <> new.id and is_default;
  end if;
  return new;
end $$;
create trigger containers_single_default before insert or update of is_default on public.containers
  for each row when (new.is_default) execute function public.single_default_container();

-- ───────────────────────── Row level security ─────────────────────────
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.containers enable row level security;
alter table public.blogs enable row level security;
alter table public.promotions enable row level security;
alter table public.inquiries enable row level security;
alter table public.inquiry_items enable row level security;
alter table public.inquiry_events enable row level security;
alter table public.inquiry_notes enable row level security;

-- Public catalogue reads, admin writes
create policy "categories read" on public.categories for select using (true);
create policy "brands read" on public.brands for select using (true);
create policy "products read" on public.products for select using (is_active or public.is_admin());
create policy "containers read" on public.containers for select using (is_active or public.is_admin());
create policy "blogs read" on public.blogs for select using (is_published or public.is_admin());
create policy "promotions read" on public.promotions for select using (is_active or public.is_admin());

create policy "categories admin" on public.categories for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "brands admin" on public.brands for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "products admin" on public.products for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "containers admin" on public.containers for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "blogs admin" on public.blogs for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "promotions admin" on public.promotions for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Profiles
create policy "profiles self read" on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "profiles self update" on public.profiles for update to authenticated using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());
create policy "profiles admin delete" on public.profiles for delete to authenticated using (public.is_admin());

-- Inquiries: customers read their own (status only — changes go through admin RPCs)
create policy "inquiries read" on public.inquiries for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "inquiries admin update" on public.inquiries for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "inquiries admin delete" on public.inquiries for delete to authenticated using (public.is_admin());

create policy "items read" on public.inquiry_items for select to authenticated
  using (exists (select 1 from public.inquiries i where i.id = inquiry_id and (i.user_id = auth.uid() or public.is_admin())));
create policy "items admin" on public.inquiry_items for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "events read" on public.inquiry_events for select to authenticated
  using (exists (select 1 from public.inquiries i where i.id = inquiry_id and (i.user_id = auth.uid() or public.is_admin())));
create policy "events admin" on public.inquiry_events for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "notes admin" on public.inquiry_notes for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Grants (RLS still applies)
grant usage on schema public to anon, authenticated;
grant select on public.categories, public.brands, public.products, public.containers, public.blogs, public.promotions to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage on sequence public.inquiry_ref_seq to authenticated;
revoke execute on function public.submit_inquiry(uuid, jsonb, jsonb) from public, anon;
grant execute on function public.submit_inquiry(uuid, jsonb, jsonb) to authenticated;
grant execute on function public.update_inquiry_status(uuid, public.inquiry_status, text) to authenticated;
grant execute on function public.apply_inquiry_stock(uuid, boolean) to authenticated;
grant execute on function public.revert_inquiry_stock(uuid) to authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- ───────────────────────── Storage ─────────────────────────
insert into storage.buckets (id, name, public) values ('media', 'media', true) on conflict (id) do nothing;

create policy "media public read" on storage.objects for select using (bucket_id = 'media');
create policy "media admin insert" on storage.objects for insert to authenticated with check (bucket_id = 'media' and public.is_admin());
create policy "media admin update" on storage.objects for update to authenticated using (bucket_id = 'media' and public.is_admin());
create policy "media admin delete" on storage.objects for delete to authenticated using (bucket_id = 'media' and public.is_admin());
