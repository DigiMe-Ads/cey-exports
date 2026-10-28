import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, Star, X } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import PageHero from '../components/PageHero'
import { brands, categories, countIn, getBrand, getCategory, products } from '../data/catalog'

const PER_PAGE = 12
const sorts = {
  relevance: { label: 'Relevance', fn: () => 0 },
  popular: { label: 'Most popular', fn: (a, b) => b.reviews - a.reviews },
  'price-asc': { label: 'Price: low to high', fn: (a, b) => a.price - b.price },
  'price-desc': { label: 'Price: high to low', fn: (a, b) => b.price - a.price },
  rating: { label: 'Top rated', fn: (a, b) => b.rating - a.rating },
}

function Panel({ title, children }) {
  return (
    <div className="glass rounded-3xl p-4">
      <h3 className="mb-3 border-b border-forest-800/10 pb-2 font-sans text-sm font-extrabold uppercase tracking-wider text-forest-800">{title}</h3>
      {children}
    </div>
  )
}

export default function Shop() {
  const [params, setParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const category = params.get('category') || ''
  const brand = params.get('brand') || ''
  const q = params.get('q') || ''
  const sort = params.get('sort') || 'relevance'
  const minRating = Number(params.get('rating') || 0)
  const inStock = params.get('stock') === '1'
  const page = Number(params.get('page') || 1)

  const set = (key, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== 'page') next.delete('page')
    setParams(next)
  }

  const filtered = useMemo(() => {
    const lo = Number(priceMin) || 0
    const hi = Number(priceMax) || Infinity
    return products
      .filter((p) => (!category || p.category === category)
        && (!brand || p.brand === brand)
        && (!q || `${p.name} ${getBrand(p.brand)?.name}`.toLowerCase().includes(q.toLowerCase()))
        && p.rating >= minRating
        && (!inStock || p.stock > 0)
        && p.price >= lo && p.price <= hi)
      .sort(sorts[sort]?.fn ?? sorts.relevance.fn)
  }, [category, brand, q, minRating, inStock, sort, priceMin, priceMax])

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const current = Math.min(page, pages)
  const visible = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE)
  const activeBrand = getBrand(brand)
  const title = getCategory(category)?.name || activeBrand?.name || (q ? `Results for “${q}”` : 'All products')

  const chips = [
    category && { label: getCategory(category)?.name, clear: () => set('category') },
    brand && { label: activeBrand?.name, clear: () => set('brand') },
    q && { label: `“${q}”`, clear: () => set('q') },
    minRating && { label: `${minRating}★ & up`, clear: () => set('rating') },
    inStock && { label: 'In stock', clear: () => set('stock') },
  ].filter(Boolean)

  const sidebar = (
    <div className="space-y-4">
      <Panel title="Shop by category">
        <ul className="space-y-0.5 text-sm">
          <li>
            <button type="button" onClick={() => set('category')} className={`flex w-full justify-between rounded-xl px-3 py-2 text-left font-semibold ${!category ? 'bg-forest-800 text-cream' : 'hover:bg-white/70'}`}>
              All products <span className="opacity-70">{products.length}</span>
            </button>
          </li>
          {categories.map((c) => (
            <li key={c.slug}>
              <button type="button" onClick={() => set('category', c.slug)} className={`flex w-full justify-between rounded-xl px-3 py-2 text-left font-semibold ${category === c.slug ? 'bg-forest-800 text-cream' : 'hover:bg-white/70'}`}>
                {c.name} <span className="opacity-70">{countIn(c.slug)}</span>
              </button>
            </li>
          ))}
        </ul>
      </Panel>
      <Panel title="Brand">
        <select value={brand} onChange={(e) => set('brand', e.target.value)} className="w-full rounded-xl bg-white px-3 py-2.5 text-sm font-semibold outline-none ring-1 ring-forest-100">
          <option value="">All brands</option>
          {brands.map((b) => <option key={b.slug} value={b.slug}>{b.name}</option>)}
        </select>
      </Panel>
      <Panel title="Price range (AED)">
        <div className="flex gap-2">
          <input value={priceMin} onChange={(e) => setPriceMin(e.target.value)} inputMode="numeric" placeholder="Min" className="w-full rounded-xl bg-white px-3 py-2 text-sm outline-none ring-1 ring-forest-100" />
          <input value={priceMax} onChange={(e) => setPriceMax(e.target.value)} inputMode="numeric" placeholder="Max" className="w-full rounded-xl bg-white px-3 py-2 text-sm outline-none ring-1 ring-forest-100" />
        </div>
      </Panel>
      <Panel title="Rating">
        <div className="space-y-1">
          {[5, 4, 3].map((r) => (
            <button key={r} type="button" onClick={() => set('rating', minRating === r ? '' : String(r))} className={`flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-sm ${minRating === r ? 'bg-gold/30' : 'hover:bg-white/70'}`}>
              <span className="flex">{[1, 2, 3, 4, 5].map((i) => <Star key={i} className={`h-4 w-4 ${i <= r ? 'fill-gold text-gold' : 'text-slate-300'}`} />)}</span>
              <span className="text-xs font-semibold text-slate-600">& up</span>
            </button>
          ))}
        </div>
      </Panel>
      <Panel title="Availability">
        <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={inStock} onChange={(e) => set('stock', e.target.checked ? '1' : '')} className="h-4 w-4 accent-forest-800" /> In stock only
        </label>
      </Panel>
    </div>
  )

  return (
    <>
      <PageHero eyebrow="Our products" title={title} accent={null} subtitle={activeBrand?.tagline || 'Dry foods, spices, branded goods and fresh produce — consolidated in Sri Lanka, delivered in the UAE.'} image="/cey/grocery-banner.jpg" />
      <div className="mx-auto mt-8 grid max-w-7xl gap-6 px-4 lg:grid-cols-[270px_1fr]">
        <aside className="hidden lg:block">{sidebar}</aside>

        <div>
          <div className="glass mb-5 flex flex-wrap items-center justify-between gap-3 rounded-3xl p-3 pl-5">
            <p className="text-sm text-slate-600">
              Showing <b className="text-forest-800">{visible.length ? (current - 1) * PER_PAGE + 1 : 0}–{(current - 1) * PER_PAGE + visible.length}</b> of <b className="text-forest-800">{filtered.length}</b> products
            </p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setFiltersOpen(true)} className="flex items-center gap-2 rounded-full bg-forest-800 px-4 py-2 text-sm font-bold text-cream lg:hidden">
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </button>
              <select value={sort} onChange={(e) => set('sort', e.target.value)} aria-label="Sort products" className="rounded-full bg-white px-4 py-2 text-sm font-semibold outline-none ring-1 ring-forest-100">
                {Object.entries(sorts).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
              </select>
            </div>
          </div>

          {chips.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-2">
              {chips.map((c) => (
                <button key={c.label} type="button" onClick={c.clear} className="flex items-center gap-1.5 rounded-full bg-gold/30 px-3 py-1.5 text-xs font-bold text-forest-900 hover:bg-gold/50">
                  {c.label} <X className="h-3.5 w-3.5" />
                </button>
              ))}
              <button type="button" onClick={() => setParams({})} className="px-2 text-xs font-bold text-rust underline">Clear all</button>
            </div>
          )}

          {visible.length ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4 md:grid-cols-3">
              {visible.map((p) => <ProductCard key={p.slug} product={p} />)}
            </div>
          ) : (
            <div className="glass rounded-3xl p-12 text-center">
              <p className="font-serif text-2xl text-forest-800">Nothing here <em className="text-rust">yet</em></p>
              <p className="mt-2 text-sm text-slate-500">Can't find a brand? We consolidate 30+ Sri Lankan brands — ask us on WhatsApp.</p>
            </div>
          )}

          {/* AKLife-style numbered pagination */}
          {pages > 1 && (
            <nav className="mt-10 flex justify-center gap-1.5" aria-label="Pagination">
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <button key={n} type="button" onClick={() => set('page', String(n))} className={`h-10 min-w-10 rounded-full px-3 text-sm font-bold ${n === current ? 'bg-gold text-forest-900 shadow-lg shadow-gold/40' : 'glass text-forest-800 hover:bg-white'}`}>
                  {n}
                </button>
              ))}
              {current < pages && (
                <button type="button" onClick={() => set('page', String(current + 1))} className="h-10 rounded-full bg-forest-800 px-4 text-sm font-bold text-cream">Next</button>
              )}
            </nav>
          )}
        </div>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Close filters" className="absolute inset-0 bg-forest-950/40 backdrop-blur-sm" onClick={() => setFiltersOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-[2rem] bg-cream p-4">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-serif text-2xl text-forest-800">Filters</p>
              <button type="button" onClick={() => setFiltersOpen(false)} className="rounded-full bg-forest-800 px-5 py-2 text-sm font-bold text-cream">Show {filtered.length}</button>
            </div>
            {sidebar}
          </div>
        </div>
      )}
    </>
  )
}
