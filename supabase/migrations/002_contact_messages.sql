-- Quote requests / messages from the Contact page. Anyone can send one; only admins can read them.
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  name text not null check (length(trim(name)) between 1 and 200),
  company text check (length(company) <= 200),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and length(email) <= 320),
  phone text check (length(phone) <= 60),
  buyer_type text check (length(buyer_type) <= 60),
  interest text check (length(interest) <= 120),
  message text check (length(message) <= 5000),
  status text not null default 'new' check (status in ('new', 'read', 'replied', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index contact_messages_status_idx on public.contact_messages (status, created_at desc);
create trigger contact_messages_touch before update on public.contact_messages for each row execute function public.touch_updated_at();

-- Signed-in senders are linked to their account; guests can't claim someone else's id
create or replace function public.contact_message_owner()
returns trigger language plpgsql as $$
begin
  new.user_id := auth.uid();
  new.status := 'new';
  return new;
end $$;
create trigger contact_messages_owner before insert on public.contact_messages
  for each row execute function public.contact_message_owner();

alter table public.contact_messages enable row level security;
create policy "contact anyone insert" on public.contact_messages for insert to anon, authenticated with check (true);
create policy "contact admin read" on public.contact_messages for select to authenticated using (public.is_admin());
create policy "contact admin update" on public.contact_messages for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "contact admin delete" on public.contact_messages for delete to authenticated using (public.is_admin());

grant insert on public.contact_messages to anon;
grant select, insert, update, delete on public.contact_messages to authenticated;
