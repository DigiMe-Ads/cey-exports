import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Box, Minus, Package, Plus, Ruler } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useCatalog } from '../context/CatalogContext'
import { formatAED, discountPct } from '../data/catalog'
import { fmtCm3 } from '../lib/container'

export function DiscountRibbon({ pct, className = '' }) {
  // AKLife-style stacked "%5 Discount" tag, redone in the Cey rust/gold
  return (
    <span className={`flex flex-col items-center rounded-lg rounded-tl-xl bg-gradient-to-b from-rust to-[#7a3610] px-2 py-1 text-center leading-none text-cream shadow-lg shadow-rust/30 ${className}`}>
      <span className="text-sm font-extrabold">%{pct}</span>
      <span className="text-[9px] font-bold uppercase tracking-wide text-gold">Discount</span>
    </span>
  )
}

// Stepper with a typeable quantity; commits on blur / Enter
export function QtyStepper({ qty, onChange, size = 'md', step = 1 }) {
  const [draft, setDraft] = useState(String(qty))
  useEffect(() => setDraft(String(qty)), [qty])
  const s = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10'
  const commit = () => {
    const n = parseInt(draft, 10)
    if (Number.isNaN(n)) setDraft(String(qty))
    else if (n !== qty) onChange(n)
  }
  return (
    <div className="flex items-center justify-between rounded-full bg-forest-50 p-1 ring-1 ring-forest-100">
      <button type="button" aria-label="Fewer cartons" onClick={() => onChange(qty - step)} className={`${s} grid shrink-0 place-items-center rounded-full bg-white text-forest-800 shadow-sm transition hover:bg-forest-800 hover:text-white`}>
        <Minus className="h-4 w-4" />
      </button>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value.replace(/\D/g, ''))}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        inputMode="numeric"
        aria-label="Cartons"
        className="w-full min-w-0 bg-transparent text-center text-sm font-bold text-forest-900 outline-none"
      />
      <button type="button" aria-label="More cartons" onClick={() => onChange(qty + step)} className={`${s} grid shrink-0 place-items-center rounded-full bg-forest-800 text-white shadow-sm transition hover:bg-forest-700`}>
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}

export default function ProductCard({ product }) {
  const { add, qtyOf, setQty, roomFor, container } = useCart()
  const { getBrand } = useCatalog()
  const brand = getBrand(product.brand)
  const pct = discountPct(product)
  const qty = qtyOf(product.slug)
  const room = roomFor(product)
  const full = qty === 0 && room < product.minQty

  return (
    <article className="glass group relative flex flex-col rounded-3xl p-3 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-forest-800/15">
      <Link to={`/product/${product.slug}`} className="relative block overflow-hidden rounded-2xl bg-white">
        <img src={product.image} alt={product.name} loading="lazy" className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105" />
        {brand?.logo && (
          <span className="absolute bottom-2 right-2 grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-white p-1 shadow-md ring-1 ring-black/5">
            <img src={brand.logo} alt={brand.name} className="max-h-full max-w-full object-contain" />
          </span>
        )}
        <span className="glass-strong absolute bottom-2 left-2 flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold text-forest-800">
          <Box className="h-3 w-3 text-rust" /> {fmtCm3(product.volume)}
        </span>
      </Link>
      <div className="pointer-events-none absolute left-5 top-5 flex flex-col items-start gap-1.5">
        {pct > 0 && <DiscountRibbon pct={pct} />}
        {product.isNew && <span className="rounded-full bg-gold px-2.5 py-0.5 text-[11px] font-extrabold text-forest-900 shadow">New</span>}
      </div>

      <div className="flex flex-1 flex-col px-1 pt-3">
        <Link to={`/shop?brand=${brand?.slug}`} className="text-xs font-bold text-rust hover:underline">{brand?.name}</Link>
        <Link to={`/product/${product.slug}`} className="mt-1 line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-ink hover:text-forest-700">
          {product.name}
        </Link>
        <div className="mt-1.5 space-y-0.5 text-[11px] font-medium text-slate-500">
          {product.pack && <p className="flex items-center gap-1"><Package className="h-3 w-3" /> {product.pack}</p>}
          <p className="flex items-center gap-1"><Ruler className="h-3 w-3" /> {product.dims.join(' × ')} cm carton</p>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          {product.price != null ? (
            <>
              <span className="text-lg font-extrabold text-forest-800">{formatAED(product.price)}</span>
              <span className="text-[11px] text-slate-500">/ carton</span>
            </>
          ) : (
            <span className="text-sm font-bold text-forest-800">Price on request</span>
          )}
        </div>
        <p className={`mt-1 text-[11px] font-semibold ${product.stock > 0 ? 'text-leaf' : 'text-rust'}`}>
          {product.stock > 0 ? `${product.stock.toLocaleString()} cartons in stock` : 'Sourced to order'}
        </p>
        <div className="mt-auto pt-3">
          {qty > 0 ? (
            <div className="space-y-1">
              <QtyStepper qty={qty} onChange={(q) => setQty(product.slug, q)} />
              <p className="text-center text-[10px] text-slate-500">{room > 0 ? `${room.toLocaleString()} more fit` : 'No more room'}</p>
            </div>
          ) : (
            <button
              type="button"
              disabled={full || !container}
              onClick={() => add(product.slug)}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-forest-800 text-sm font-bold text-cream shadow-lg shadow-forest-800/25 transition hover:bg-forest-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-white disabled:shadow-none"
            >
              <Box className="h-4 w-4" /> {full ? 'No room left' : `Add ${product.minQty} cartons`}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
