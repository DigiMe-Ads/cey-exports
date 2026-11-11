import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Box, ChevronRight, MessageCircle, Package, Ruler, ShieldCheck, Ship, Weight } from 'lucide-react'
import ProductCard, { DiscountRibbon, QtyStepper } from '../components/ProductCard'
import SectionHeader from '../components/SectionHeader'
import { ContainerMeter } from '../components/ContainerMeter'
import { discountPct, formatAED } from '../data/catalog'
import { cartonFits, fmtCm3, fmtM3 } from '../lib/container'
import { useCatalog } from '../context/CatalogContext'
import { useCart } from '../context/CartContext'

export default function ProductDetail() {
  const { slug } = useParams()
  const { getProduct, getBrand, getCategory, brandCount, products, loading } = useCatalog()
  const { add, qtyOf, setQty, roomFor, stats, container } = useCart()
  const product = getProduct(slug)
  const [qty, setDraftQty] = useState(null)
  const [tab, setTab] = useState('description')

  if (!product) {
    if (loading) return null
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="font-serif text-3xl text-forest-800">Product not found</p>
        <Link to="/shop" className="mt-6 inline-block rounded-full bg-forest-800 px-6 py-3 font-bold text-cream">Back to shop</Link>
      </div>
    )
  }

  const brand = getBrand(product.brand)
  const category = getCategory(product.category)
  const pct = discountPct(product)
  const inPlan = qtyOf(product.slug)
  const room = roomFor(product)
  const fits = cartonFits(product, container)
  const draft = qty ?? product.minQty
  const related = products.filter((p) => p.category === product.category && p.slug !== product.slug).slice(0, 4)
  const canAdd = fits && room >= (inPlan ? 1 : product.minQty)

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6">
      <nav className="mb-5 flex flex-wrap items-center gap-1 text-sm text-slate-500" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-forest-800">Home</Link><ChevronRight className="h-4 w-4" />
        <Link to={`/shop?category=${category?.slug}`} className="hover:text-forest-800">{category?.name}</Link><ChevronRight className="h-4 w-4" />
        <span className="line-clamp-1 font-semibold text-forest-800">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="glass relative self-start rounded-[2rem] p-3">
          <img src={product.image} alt={product.name} className="aspect-square w-full rounded-[1.5rem] bg-white object-cover" />
          <div className="absolute left-7 top-7 flex flex-col items-start gap-2">
            {pct > 0 && <DiscountRibbon pct={pct} />}
            {product.isNew && <span className="rounded-full bg-gold px-3 py-1 text-xs font-extrabold text-forest-900">New</span>}
          </div>
        </div>

        <div className="flex flex-col">
          {brand && (
            <Link to={`/shop?brand=${brand.slug}`} className="flex items-center gap-3 self-start">
              <span className="grid h-12 w-16 place-items-center rounded-xl bg-white p-1.5 ring-1 ring-black/5"><img src={brand.logo} alt="" className="max-h-full max-w-full object-contain" /></span>
              <span className="text-sm font-bold text-rust hover:underline">{brand.name}</span>
            </Link>
          )}
          <h1 className="mt-4 text-3xl font-medium leading-tight text-forest-800 sm:text-4xl">{product.name}</h1>
          <p className={`mt-2 text-sm font-bold ${product.stock > 0 ? 'text-leaf' : 'text-rust'}`}>
            {product.stock > 0 ? `${product.stock.toLocaleString()} cartons in stock` : 'Sourced to order'}
          </p>

          {/* Carton spec — the numbers the container planner works with */}
          <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              [Ruler, 'Carton (L×W×H)', `${product.dims.join(' × ')} cm`],
              [Box, 'Carton volume', fmtCm3(product.volume)],
              [Weight, 'Gross weight', product.weight ? `${product.weight} kg` : '—'],
              [Package, 'Min. order', `${product.minQty} cartons`],
            ].map(([Icon, k, v]) => (
              <div key={k} className="glass rounded-2xl p-3">
                <dt className="flex items-center gap-1 text-[11px] font-semibold text-slate-500"><Icon className="h-3.5 w-3.5 text-rust" /> {k}</dt>
                <dd className="mt-1 text-sm font-extrabold text-forest-800">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="glass mt-5 rounded-3xl p-5">
            <div className="flex flex-wrap items-baseline gap-3">
              {product.price != null ? (
                <>
                  <span className="font-serif text-4xl text-forest-800">{formatAED(product.price)}</span>
                  <span className="text-sm text-slate-500">per carton</span>
                  {product.compareAt && <span className="text-slate-400 line-through">{formatAED(product.compareAt)}</span>}
                </>
              ) : (
                <span className="font-serif text-3xl text-forest-800">Price on request</span>
              )}
            </div>
            {product.pack && <p className="mt-1 text-sm text-slate-600">{product.pack}</p>}

            {!fits ? (
              <p className="mt-4 rounded-2xl bg-rust/10 p-3 text-sm font-semibold text-rust">This carton is too large for a {container?.name}. Choose a bigger container on the container page.</p>
            ) : inPlan > 0 ? (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-semibold text-forest-800">{inPlan.toLocaleString()} cartons in your container · {fmtM3(product.volume * inPlan)}</p>
                <QtyStepper qty={inPlan} onChange={(q) => setQty(product.slug, q)} />
                <div className="flex flex-wrap gap-2">
                  {[10, 50].map((n) => (
                    <button key={n} type="button" disabled={room < 1} onClick={() => add(product.slug, n, { openDrawer: false })} className="rounded-full bg-white px-4 py-2 text-xs font-bold text-forest-800 ring-1 ring-forest-100 hover:bg-forest-50 disabled:opacity-40">+{n}</button>
                  ))}
                  <button type="button" disabled={room < 1} onClick={() => add(product.slug, room, { openDrawer: false })} className="rounded-full bg-gold px-4 py-2 text-xs font-bold text-forest-900 hover:bg-gold-dark disabled:opacity-40">
                    Fill remaining space (+{room.toLocaleString()})
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-[170px_1fr]">
                <QtyStepper qty={draft} onChange={(q) => setDraftQty(Math.max(product.minQty, Math.min(q, room)))} />
                <button type="button" disabled={!canAdd} onClick={() => add(product.slug, draft)} className="flex h-12 items-center justify-center gap-2 rounded-full bg-forest-800 font-bold text-cream shadow-lg shadow-forest-800/25 hover:bg-forest-700 disabled:bg-slate-300">
                  <Box className="h-5 w-5" /> {canAdd ? `Add ${draft} cartons to container` : 'No room left in container'}
                </button>
              </div>
            )}
            <p className="mt-3 text-xs text-slate-500">
              Room for <b className="text-forest-800">{room.toLocaleString()}</b> more cartons in your {container?.name}.
            </p>
            <div className="mt-4 border-t border-forest-800/10 pt-4">
              <ContainerMeter stats={stats} container={container} showWeight={false} />
            </div>
          </div>

          <ul className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
            {[[Ship, 'Container loads', '20ft, 40ft & 40HC'], [ShieldCheck, 'Quality inspected', 'Before every shipment'], [MessageCircle, 'Talk to sales', 'We reply within a day']].map(([Icon, t, s]) => (
              <li key={t} className="glass flex items-center gap-3 rounded-2xl p-3">
                <Icon className="h-5 w-5 shrink-0 text-rust" />
                <span><b className="block text-forest-800">{t}</b><span className="text-xs text-slate-500">{s}</span></span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="glass mt-10 rounded-[2rem] p-5 sm:p-8">
        <div className="mb-5 flex gap-2">
          {['description', 'brand'].map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)} className={`rounded-full px-4 py-2 text-sm font-bold capitalize ${tab === t ? 'bg-forest-800 text-cream' : 'text-forest-800 hover:bg-white'}`}>{t}</button>
          ))}
        </div>
        {tab === 'description' && <p className="max-w-3xl whitespace-pre-line leading-relaxed text-slate-700">{product.description}</p>}
        {tab === 'brand' && brand && (
          <div className="flex items-center gap-4">
            <span className="grid h-20 w-28 place-items-center rounded-2xl bg-white p-3 ring-1 ring-black/5"><img src={brand.logo} alt="" className="max-h-full max-w-full object-contain" /></span>
            <div>
              <p className="font-serif text-2xl text-forest-800">{brand.name}</p>
              <p className="text-sm text-slate-600">{brand.tagline || 'A trusted Sri Lankan brand consolidated by Cey Exports.'}</p>
              <Link to={`/shop?brand=${brand.slug}`} className="mt-2 inline-block text-sm font-bold text-rust underline">{brandCount(brand.slug)} products from this brand</Link>
            </div>
          </div>
        )}
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <SectionHeader eyebrow="You may also like" title="Related" accent="products" to={`/shop?category=${category?.slug}`} />
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {related.map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>
        </section>
      )}
    </div>
  )
}
