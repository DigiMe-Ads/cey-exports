import { Star } from 'lucide-react'
import CrudPage, { Flag, Thumb, inputCls } from './CrudPage'
import { formatAED } from '../data/catalog'
import { cartonFits, fmtCm3, fmtM3 } from '../lib/container'

const brandOptions = ({ catalog }) => catalog.brands.map((b) => ({ value: b.id, label: b.name }))
const categoryOptions = ({ catalog }) => catalog.categories.map((c) => ({ value: c.id, label: c.name }))
const num = (v) => (v == null || v === '' ? null : Number(v))

// Live carton maths shown while editing a product
function CartonPreview({ values, catalog }) {
  const dims = [num(values.carton_length_cm), num(values.carton_width_cm), num(values.carton_height_cm)]
  if (dims.some((d) => !d)) return <p className="rounded-2xl bg-forest-50 p-3 text-xs text-slate-500">Enter all three carton dimensions to see its volume and how many fit per container.</p>
  const volume = dims[0] * dims[1] * dims[2]
  const weight = num(values.gross_weight_kg) || 0
  const p = { dims, volume, weight }
  return (
    <div className="rounded-2xl bg-forest-800 p-4 text-cream">
      <p className="text-xs font-bold uppercase tracking-widest text-gold">Carton volume</p>
      <p className="font-serif text-3xl">{fmtCm3(volume)} <span className="text-base text-cream/60">· {fmtM3(volume, 4)}</span></p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {catalog.containers.map((c) => {
          const fits = cartonFits(p, c)
          const byVol = Math.floor(Number(c.usable_volume_cm3) / volume)
          const byKg = weight && c.max_payload_kg ? Math.floor(Number(c.max_payload_kg) / weight) : Infinity
          return (
            <p key={c.id} className="rounded-xl bg-white/10 px-3 py-2 text-xs">
              <b>{c.name}:</b> {fits ? `max ${Math.min(byVol, byKg).toLocaleString()} cartons${byKg < byVol ? ' (weight-limited)' : ''}` : 'carton too large'}
            </p>
          )
        })}
      </div>
    </div>
  )
}

function StockCell({ row, updateRow }) {
  return (
    <input
      type="number"
      defaultValue={row.stock}
      key={row.stock}
      onBlur={(e) => Number(e.target.value) !== row.stock && updateRow(row.id, { stock: Number(e.target.value) || 0 })}
      onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
      aria-label={`Stock for ${row.name}`}
      className={`w-24 rounded-lg px-2 py-1.5 text-sm font-bold ring-1 ${row.stock <= 20 ? 'bg-rust/10 text-rust ring-rust/30' : 'bg-white text-forest-800 ring-forest-100'}`}
    />
  )
}

export function ProductsAdmin() {
  return (
    <CrudPage
      table="products"
      title="Products & stock"
      subtitle="Carton dimensions drive the container planner. Stock is counted in cartons — edit it inline or from an inquiry."
      singular="product"
      searchKeys={['name', 'slug', 'pack']}
      defaults={{ is_active: true, min_order_qty: 5, stock: 0 }}
      columns={[
        { key: 'image_url', label: '', render: (r) => <Thumb src={r.image_url} />, className: 'w-16' },
        { key: 'name', label: 'Product', render: (r, { catalog }) => (
          <div className="max-w-xs">
            <p className="font-semibold text-ink">{r.name}</p>
            <p className="text-[11px] text-slate-500">{catalog.brands.find((b) => b.id === r.brand_id)?.name ?? '—'} · {catalog.categories.find((c) => c.id === r.category_id)?.name ?? '—'}</p>
          </div>
        ) },
        { key: 'dims', label: 'Carton', render: (r) => (
          <div className="whitespace-nowrap text-xs">
            <p className="font-semibold">{Number(r.carton_length_cm)}×{Number(r.carton_width_cm)}×{Number(r.carton_height_cm)} cm</p>
            <p className="text-slate-500">{fmtCm3(r.volume_cm3)}{r.gross_weight_kg ? ` · ${Number(r.gross_weight_kg)} kg` : ''}</p>
          </div>
        ) },
        { key: 'price', label: 'Price / ctn', render: (r) => (r.price != null ? formatAED(r.price) : <span className="text-slate-400">On request</span>), className: 'whitespace-nowrap' },
        { key: 'stock', label: 'Stock (ctns)', render: (r, { updateRow }) => <StockCell row={r} updateRow={updateRow} /> },
        { key: 'flags', label: 'Status', render: (r, { updateRow }) => (
          <div className="flex flex-wrap gap-1">
            <button type="button" onClick={() => updateRow(r.id, { is_active: !r.is_active })} title="Toggle visibility"><Flag on={r.is_active} label={r.is_active ? 'Live' : 'Hidden'} /></button>
            {r.featured && <Flag on label="Featured" />}
            {r.best && <Flag on label="Best" />}
          </div>
        ) },
      ]}
      fields={[
        { key: 'name', label: 'Name', required: true, wide: true },
        { key: 'slug', label: 'URL slug', type: 'slug', from: 'name' },
        { key: 'pack', label: 'Pack description', hint: 'e.g. 500 g × 20 per carton' },
        { key: 'brand_id', label: 'Brand', type: 'select', options: brandOptions },
        { key: 'category_id', label: 'Category', type: 'select', options: categoryOptions },
        { key: 'image_url', label: 'Image', type: 'image', folder: 'products' },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'carton_length_cm', label: 'Length (cm)', type: 'number', required: true, min: 0.1, step: 0.1, section: 'Carton dimensions (outer)' },
        { key: 'carton_width_cm', label: 'Width (cm)', type: 'number', required: true, min: 0.1, step: 0.1, section: 'Carton dimensions (outer)' },
        { key: 'carton_height_cm', label: 'Height (cm)', type: 'number', required: true, min: 0.1, step: 0.1, section: 'Carton dimensions (outer)' },
        { key: 'gross_weight_kg', label: 'Gross weight (kg)', type: 'number', min: 0, step: 0.1, section: 'Carton dimensions (outer)' },
        { type: 'custom', section: 'Carton dimensions (outer)', render: (values, _set, { catalog }) => <CartonPreview values={values} catalog={catalog} /> },
        { key: 'price', label: 'Price per carton (AED)', type: 'number', min: 0, step: 0.01, hint: 'blank = on request', section: 'Pricing & stock' },
        { key: 'compare_at', label: 'Was price (AED)', type: 'number', min: 0, step: 0.01, section: 'Pricing & stock' },
        { key: 'stock', label: 'Stock (cartons)', type: 'number', step: 1, section: 'Pricing & stock' },
        { key: 'min_order_qty', label: 'Minimum order (cartons)', type: 'number', min: 1, step: 1, required: true, section: 'Pricing & stock' },
        { key: 'is_active', label: 'Visible in store', type: 'checkbox', section: 'Display' },
        { key: 'is_new', label: 'Show “New” tag', type: 'checkbox', section: 'Display' },
        { key: 'featured', label: 'Featured on home page', type: 'checkbox', section: 'Display' },
        { key: 'best', label: 'Best seller', type: 'checkbox', section: 'Display' },
        { key: 'sort', label: 'Sort order', type: 'number', step: 1, section: 'Display' },
      ]}
    />
  )
}

function ContainerPreview({ values }) {
  const [l, w, h] = [num(values.length_cm), num(values.width_cm), num(values.height_cm)]
  if (!l || !w || !h) return null
  const inner = l * w * h
  const margin = num(values.safety_margin_pct) ?? 10
  const usable = inner * (1 - margin / 100)
  const min = num(values.min_fill_pct) ?? 80
  return (
    <div className="grid gap-2 rounded-2xl bg-forest-800 p-4 text-cream sm:grid-cols-3">
      <div><p className="text-[11px] font-bold uppercase tracking-widest text-gold">Inner volume</p><p className="font-serif text-2xl">{fmtM3(inner)}</p></div>
      <div><p className="text-[11px] font-bold uppercase tracking-widest text-gold">Usable ({100 - margin}%)</p><p className="font-serif text-2xl">{fmtM3(usable)}</p></div>
      <div><p className="text-[11px] font-bold uppercase tracking-widest text-gold">Needed to inquire</p><p className="font-serif text-2xl">{fmtM3(usable * (min / 100))}</p></div>
      <p className="text-xs text-cream/70 sm:col-span-3">The safety margin is never filled by the planner — it absorbs carton measurement errors and imperfect stacking. 8–15% is typical.</p>
    </div>
  )
}

export function ContainersAdmin() {
  return (
    <CrudPage
      table="containers"
      title="Containers"
      subtitle="Internal dimensions, safety margin and the minimum fill a buyer must reach before sending an inquiry."
      singular="container"
      searchKeys={['name', 'code']}
      defaults={{ is_active: true, safety_margin_pct: 10, min_fill_pct: 80 }}
      columns={[
        { key: 'name', label: 'Container', render: (r) => <div><p className="font-semibold">{r.name}</p><p className="text-[11px] text-slate-500">{r.code}</p></div> },
        { key: 'dims', label: 'Inside (L×W×H)', render: (r) => `${Number(r.length_cm)}×${Number(r.width_cm)}×${Number(r.height_cm)} cm`, className: 'whitespace-nowrap' },
        { key: 'usable', label: 'Usable volume', render: (r) => <div><p className="font-semibold">{fmtM3(r.usable_volume_cm3)}</p><p className="text-[11px] text-slate-500">of {fmtM3(r.inner_volume_cm3)} · {Number(r.safety_margin_pct)}% margin</p></div> },
        { key: 'min_fill_pct', label: 'Min fill', render: (r) => `${Number(r.min_fill_pct)}%` },
        { key: 'max_payload_kg', label: 'Payload', render: (r) => (r.max_payload_kg ? `${Number(r.max_payload_kg).toLocaleString()} kg` : '—') },
        { key: 'flags', label: 'Status', render: (r, { updateRow }) => (
          <div className="flex flex-wrap items-center gap-1">
            <button type="button" onClick={() => updateRow(r.id, { is_active: !r.is_active })}><Flag on={r.is_active} label={r.is_active ? 'Active' : 'Hidden'} /></button>
            {r.is_default ? <span className="flex items-center gap-1 rounded-full bg-gold/30 px-2 py-0.5 text-[10px] font-bold text-forest-900"><Star className="h-3 w-3" /> Default</span>
              : <button type="button" onClick={async (e) => { e.stopPropagation(); await updateRow(r.id, { is_default: true }); }} className="text-[10px] font-bold text-slate-400 underline hover:text-forest-800">Make default</button>}
          </div>
        ) },
      ]}
      fields={[
        { key: 'name', label: 'Name', required: true },
        { key: 'code', label: 'Code', hint: 'e.g. 20GP' },
        { key: 'description', label: 'Description', wide: true },
        { key: 'length_cm', label: 'Inside length (cm)', type: 'number', required: true, min: 1, section: 'Internal dimensions' },
        { key: 'width_cm', label: 'Inside width (cm)', type: 'number', required: true, min: 1, section: 'Internal dimensions' },
        { key: 'height_cm', label: 'Inside height (cm)', type: 'number', required: true, min: 1, section: 'Internal dimensions' },
        { key: 'max_payload_kg', label: 'Max payload (kg)', type: 'number', min: 1, hint: 'optional', section: 'Internal dimensions' },
        { key: 'safety_margin_pct', label: 'Safety margin (%)', type: 'number', min: 0, max: 50, step: 0.5, required: true, hint: 'space kept free', section: 'Rules' },
        { key: 'min_fill_pct', label: 'Minimum fill to inquire (%)', type: 'number', min: 0, max: 100, step: 1, required: true, section: 'Rules' },
        { type: 'custom', section: 'Rules', render: (values) => <ContainerPreview values={values} /> },
        { key: 'is_active', label: 'Available to buyers', type: 'checkbox', section: 'Display' },
        { key: 'is_default', label: 'Default container', type: 'checkbox', section: 'Display' },
        { key: 'sort', label: 'Sort order', type: 'number', step: 1, section: 'Display' },
      ]}
    />
  )
}

export function CategoriesAdmin() {
  return (
    <CrudPage
      table="categories"
      title="Categories"
      singular="category"
      columns={[
        { key: 'image_url', label: '', render: (r) => <Thumb src={r.image_url} />, className: 'w-16' },
        { key: 'name', label: 'Name', render: (r) => <span className="font-semibold">{r.name}</span> },
        { key: 'slug', label: 'Slug' },
        { key: 'count', label: 'Products', render: (r, { catalog }) => catalog.countIn(r.slug) },
        { key: 'sort', label: 'Sort' },
      ]}
      fields={[
        { key: 'name', label: 'Name', required: true },
        { key: 'slug', label: 'URL slug', type: 'slug', from: 'name' },
        { key: 'image_url', label: 'Image', type: 'image', folder: 'categories' },
        { key: 'sort', label: 'Sort order', type: 'number', step: 1 },
      ]}
    />
  )
}

export function BrandsAdmin() {
  return (
    <CrudPage
      table="brands"
      title="Brands"
      singular="brand"
      columns={[
        { key: 'logo_url', label: '', render: (r) => <Thumb src={r.logo_url} />, className: 'w-16' },
        { key: 'name', label: 'Name', render: (r) => <div><p className="font-semibold">{r.name}</p><p className="max-w-xs truncate text-[11px] text-slate-500">{r.tagline}</p></div> },
        { key: 'count', label: 'Products', render: (r, { catalog }) => catalog.brandCount(r.slug) },
        { key: 'flags', label: 'Flags', render: (r) => <div className="flex gap-1"><Flag on={r.featured} label="Core partner" />{r.own && <Flag on label="Own brand" />}</div> },
      ]}
      fields={[
        { key: 'name', label: 'Name', required: true },
        { key: 'slug', label: 'URL slug', type: 'slug', from: 'name' },
        { key: 'logo_url', label: 'Logo', type: 'image', folder: 'brands' },
        { key: 'tagline', label: 'Tagline', wide: true },
        { key: 'featured', label: 'Core partner (footer & badges)', type: 'checkbox' },
        { key: 'own', label: 'Own brand', type: 'checkbox' },
        { key: 'sort', label: 'Sort order', type: 'number', step: 1 },
      ]}
    />
  )
}

export function PromotionsAdmin() {
  return (
    <CrudPage
      table="promotions"
      title="Promotions"
      subtitle="Campaign tiles on the Offers page."
      singular="promotion"
      searchKeys={['title', 'label']}
      defaults={{ is_active: true }}
      columns={[
        { key: 'image_url', label: '', render: (r) => <Thumb src={r.image_url} />, className: 'w-16' },
        { key: 'title', label: 'Title', render: (r) => <div><p className="font-semibold">{r.title}</p><p className="text-[11px] text-slate-500">{r.label}</p></div> },
        { key: 'ends_text', label: 'Runs' },
        { key: 'link', label: 'Links to' },
        { key: 'is_active', label: 'Status', render: (r, { updateRow }) => <button type="button" onClick={() => updateRow(r.id, { is_active: !r.is_active })}><Flag on={r.is_active} label={r.is_active ? 'Live' : 'Hidden'} /></button> },
      ]}
      fields={[
        { key: 'title', label: 'Title', required: true },
        { key: 'label', label: 'Label', hint: 'small text above the title' },
        { key: 'ends_text', label: 'Ends / runs', hint: 'e.g. Ends 11/20/2026' },
        { key: 'link', label: 'Link', hint: 'e.g. /shop?category=spices' },
        { key: 'image_url', label: 'Image', type: 'image', folder: 'promotions' },
        { key: 'is_active', label: 'Live', type: 'checkbox' },
        { key: 'sort', label: 'Sort order', type: 'number', step: 1 },
      ]}
    />
  )
}

export function BlogsAdmin() {
  return (
    <CrudPage
      table="blogs"
      title="Blog posts"
      singular="post"
      order={{ column: 'published_at', ascending: false }}
      searchKeys={['title', 'category']}
      defaults={{ is_published: true, published_at: new Date().toISOString().slice(0, 10) }}
      columns={[
        { key: 'image_url', label: '', render: (r) => <Thumb src={r.image_url} />, className: 'w-16' },
        { key: 'title', label: 'Title', render: (r) => <p className="max-w-md font-semibold">{r.title}</p> },
        { key: 'category', label: 'Category' },
        { key: 'published_at', label: 'Date', className: 'whitespace-nowrap' },
        { key: 'is_published', label: 'Status', render: (r, { updateRow }) => <button type="button" onClick={() => updateRow(r.id, { is_published: !r.is_published })}><Flag on={r.is_published} label={r.is_published ? 'Published' : 'Draft'} /></button> },
      ]}
      fields={[
        { key: 'title', label: 'Title', required: true, wide: true },
        { key: 'slug', label: 'URL slug', type: 'slug', from: 'title' },
        { key: 'category', label: 'Category' },
        { key: 'read_time', label: 'Read time', hint: 'e.g. 5 min' },
        { key: 'published_at', label: 'Publish date', type: 'date' },
        { key: 'image_url', label: 'Cover image', type: 'image', folder: 'blogs' },
        { key: 'excerpt', label: 'Excerpt', type: 'textarea', rows: 2 },
        { key: 'body', label: 'Article', type: 'textarea', rows: 10 },
        { key: 'is_published', label: 'Published', type: 'checkbox' },
      ]}
    />
  )
}

export { inputCls }
