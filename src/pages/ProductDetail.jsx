import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronRight, Package, RotateCcw, ShieldCheck, ShoppingCart, Truck, Zap } from 'lucide-react'
import ProductCard, { DiscountRibbon, QtyStepper } from '../components/ProductCard'
import SectionHeader from '../components/SectionHeader'
import Stars from '../components/Stars'
import { WhatsAppIcon } from '../components/BrandIcons'
import { brandCount, discountPct, formatAED, getBrand, getCategory, getProduct, products } from '../data/catalog'
import { useCart } from '../context/CartContext'

export default function ProductDetail() {
  const { slug } = useParams()
  const product = getProduct(slug)
  const { add } = useCart()
  const [qty, setQty] = useState(1)
  const [tab, setTab] = useState('description')

  if (!product) {
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
  const soldOut = product.stock === 0
  const related = products.filter((p) => p.category === product.category && p.slug !== product.slug).slice(0, 4)

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6">
      <nav className="mb-5 flex flex-wrap items-center gap-1 text-sm text-slate-500" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-forest-800">Home</Link><ChevronRight className="h-4 w-4" />
        <Link to={`/shop?category=${category?.slug}`} className="hover:text-forest-800">{category?.name}</Link><ChevronRight className="h-4 w-4" />
        <span className="line-clamp-1 font-semibold text-forest-800">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="glass relative rounded-[2rem] p-3">
          <img src={product.image} alt={product.name} className="aspect-square w-full rounded-[1.5rem] bg-white object-cover" />
          <div className="absolute left-7 top-7 flex flex-col items-start gap-2">
            {pct > 0 && <DiscountRibbon pct={pct} />}
            {product.isNew && <span className="rounded-full bg-gold px-3 py-1 text-xs font-extrabold text-forest-900">New</span>}
          </div>
        </div>

        <div className="flex flex-col">
          <Link to={`/shop?brand=${brand?.slug}`} className="flex items-center gap-3 self-start">
            <span className="grid h-12 w-16 place-items-center rounded-xl bg-white p-1.5 ring-1 ring-black/5"><img src={brand?.logo} alt="" className="max-h-full max-w-full object-contain" /></span>
            <span className="text-sm font-bold text-rust hover:underline">{brand?.name}</span>
          </Link>
          <h1 className="mt-4 text-3xl font-medium leading-tight text-forest-800 sm:text-4xl">{product.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <Stars value={product.rating} count={product.reviews} size="h-4 w-4" />
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${soldOut ? 'bg-rust/10 text-rust' : 'bg-leaf/15 text-leaf'}`}>{soldOut ? 'Next harvest soon' : 'In stock'}</span>
          </div>

          <div className="glass mt-6 rounded-3xl p-5">
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-4xl text-forest-800">{formatAED(product.price)}</span>
              {product.compareAt && <span className="text-slate-400 line-through">{formatAED(product.compareAt)}</span>}
              {pct > 0 && <span className="rounded-full bg-rust px-2.5 py-0.5 text-xs font-bold text-cream">Save {pct}%</span>}
            </div>
            {product.pack && <p className="mt-2 flex items-center gap-2 text-sm text-slate-600"><Package className="h-4 w-4 text-rust" /> Pack: <b>{product.pack}</b></p>}
            <div className="mt-5 grid gap-3 sm:grid-cols-[150px_1fr]">
              <QtyStepper qty={qty} onChange={(q) => setQty(Math.max(1, q))} />
              <button type="button" disabled={soldOut} onClick={() => add(product.slug, qty)} className="flex h-12 items-center justify-center gap-2 rounded-full bg-forest-800 font-bold text-cream shadow-lg shadow-forest-800/25 hover:bg-forest-700 disabled:bg-slate-300">
                <ShoppingCart className="h-5 w-5" /> Add to cart
              </button>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <button type="button" disabled={soldOut} onClick={() => add(product.slug, qty)} className="flex h-12 items-center justify-center gap-2 rounded-full bg-gold font-bold text-forest-900 hover:bg-gold-dark disabled:opacity-50">
                <Zap className="h-4 w-4" /> Buy now
              </button>
              <a href="#" className="flex h-12 items-center justify-center gap-2 rounded-full bg-white font-bold text-forest-800 ring-1 ring-forest-100 hover:bg-forest-50">
                <WhatsAppIcon className="h-4 w-4 fill-globe-green" /> Bulk quote
              </a>
            </div>
          </div>

          <ul className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
            {[[Truck, 'UAE delivery', 'Free over AED 100'], [ShieldCheck, 'Quality inspected', 'Before every shipment'], [RotateCcw, 'Easy returns', 'Within 7 days']].map(([Icon, t, s]) => (
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
          {['description', 'specifications', 'brand'].map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)} className={`rounded-full px-4 py-2 text-sm font-bold capitalize ${tab === t ? 'bg-forest-800 text-cream' : 'text-forest-800 hover:bg-white'}`}>{t}</button>
          ))}
        </div>
        {tab === 'description' && (
          <p className="max-w-3xl leading-relaxed text-slate-700">
            {product.name} is sourced through Cey Exports' long-standing relationships with Sri Lankan growers and manufacturers, consolidated at our Kurunegala warehouse and quality-inspected before every shipment. Available for retail delivery across the UAE through Lanka Foods Middle East, and in bulk or private-label for importers and wholesalers.
          </p>
        )}
        {tab === 'specifications' && (
          <dl className="grid max-w-2xl gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
            {[['Brand', brand?.name], ['Category', category?.name], ['Pack size', product.pack || '—'], ['Origin', 'Sri Lanka'], ['Dispatched from', 'Kurunegala · Sharjah'], ['Private label', 'Available on request']].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-forest-800/10 pb-2"><dt className="text-slate-500">{k}</dt><dd className="font-semibold text-forest-800">{v}</dd></div>
            ))}
          </dl>
        )}
        {tab === 'brand' && (
          <div className="flex items-center gap-4">
            <span className="grid h-20 w-28 place-items-center rounded-2xl bg-white p-3 ring-1 ring-black/5"><img src={brand?.logo} alt="" className="max-h-full max-w-full object-contain" /></span>
            <div>
              <p className="font-serif text-2xl text-forest-800">{brand?.name}</p>
              <p className="text-sm text-slate-600">{brand?.tagline || 'A trusted Sri Lankan brand consolidated by Cey Exports.'}</p>
              <Link to={`/shop?brand=${brand?.slug}`} className="mt-2 inline-block text-sm font-bold text-rust underline">{brandCount(brand?.slug)} products from this brand</Link>
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
