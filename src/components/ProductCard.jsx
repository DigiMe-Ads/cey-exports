import { Link } from 'react-router-dom'
import { Heart, Minus, Package, Plus, ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { discountPct, formatAED, getBrand } from '../data/catalog'
import Stars from './Stars'

export function DiscountRibbon({ pct, className = '' }) {
  // AKLife-style stacked "%5 Discount" tag, redone in the Cey rust/gold
  return (
    <span className={`flex flex-col items-center rounded-lg rounded-tl-xl bg-gradient-to-b from-rust to-[#7a3610] px-2 py-1 text-center leading-none text-cream shadow-lg shadow-rust/30 ${className}`}>
      <span className="text-sm font-extrabold">%{pct}</span>
      <span className="text-[9px] font-bold uppercase tracking-wide text-gold">Discount</span>
    </span>
  )
}

export function QtyStepper({ qty, onChange, size = 'md' }) {
  const s = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10'
  return (
    <div className="flex items-center justify-between rounded-full bg-forest-50 p-1 ring-1 ring-forest-100">
      <button type="button" aria-label="Decrease quantity" onClick={() => onChange(qty - 1)} className={`${s} grid place-items-center rounded-full bg-white text-forest-800 shadow-sm transition hover:bg-forest-800 hover:text-white`}>
        <Minus className="h-4 w-4" />
      </button>
      <span className="min-w-8 text-center text-sm font-bold text-forest-900">{qty}</span>
      <button type="button" aria-label="Increase quantity" onClick={() => onChange(qty + 1)} className={`${s} grid place-items-center rounded-full bg-forest-800 text-white shadow-sm transition hover:bg-forest-700`}>
        <Plus className="h-4 w-4" />
      </button>
    </div>
  )
}

export default function ProductCard({ product }) {
  const { add, qtyOf, setQty } = useCart()
  const [liked, setLiked] = useState(false)
  const brand = getBrand(product.brand)
  const pct = discountPct(product)
  const qty = qtyOf(product.slug)
  const soldOut = product.stock === 0

  return (
    <article className="glass group relative flex flex-col rounded-3xl p-3 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-forest-800/15">
      <Link to={`/product/${product.slug}`} className="relative block overflow-hidden rounded-2xl bg-white">
        <img src={product.image} alt={product.name} loading="lazy" className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105" />
        {soldOut && (
          <span className="absolute inset-0 grid place-items-center bg-white/60 backdrop-blur-[2px]">
            <span className="rounded-full bg-forest-900 px-3 py-1 text-xs font-bold text-cream">Next harvest soon</span>
          </span>
        )}
        {brand?.logo && (
          <span className="absolute bottom-2 right-2 grid h-10 w-10 place-items-center overflow-hidden rounded-xl bg-white p-1 shadow-md ring-1 ring-black/5">
            <img src={brand.logo} alt={brand.name} className="max-h-full max-w-full object-contain" />
          </span>
        )}
      </Link>
      <div className="pointer-events-none absolute left-5 top-5 flex flex-col items-start gap-1.5">
        {pct > 0 && <DiscountRibbon pct={pct} />}
        {product.isNew && <span className="rounded-full bg-gold px-2.5 py-0.5 text-[11px] font-extrabold text-forest-900 shadow">New</span>}
      </div>
      <button
        type="button"
        aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
        onClick={() => setLiked((v) => !v)}
        className="glass-strong absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full transition sm:opacity-0 sm:group-hover:opacity-100"
      >
        <Heart className={`h-4 w-4 ${liked ? 'fill-rust text-rust' : 'text-forest-800'}`} />
      </button>

      <div className="flex flex-1 flex-col px-1 pt-3">
        <Link to={`/shop?brand=${brand?.slug}`} className="text-xs font-bold text-rust hover:underline">{brand?.name}</Link>
        <Link to={`/product/${product.slug}`} className="mt-1 line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-ink hover:text-forest-700">
          {product.name}
        </Link>
        {product.pack && (
          <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-slate-500"><Package className="h-3 w-3" /> {product.pack}</p>
        )}
        <div className="mt-1.5"><Stars value={product.rating} count={product.reviews} /></div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-extrabold text-forest-800">{formatAED(product.price)}</span>
          {product.compareAt && <span className="text-xs text-slate-400 line-through">{formatAED(product.compareAt)}</span>}
        </div>
        <div className="mt-auto pt-3">
          {qty > 0 ? (
            <QtyStepper qty={qty} onChange={(q) => setQty(product.slug, q)} />
          ) : (
            <button
              type="button"
              disabled={soldOut}
              onClick={() => add(product.slug)}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-forest-800 text-sm font-bold text-cream shadow-lg shadow-forest-800/25 transition hover:bg-forest-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-white disabled:shadow-none"
            >
              <ShoppingCart className="h-4 w-4" /> {soldOut ? 'Pre-order' : 'Add to cart'}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
