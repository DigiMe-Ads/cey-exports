import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ShoppingBag, Trash2, Truck, X } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { formatAED, getBrand } from '../data/catalog'
import { QtyStepper } from './ProductCard'

export function FreeDeliveryMeter() {
  const { subtotal, freeDeliveryFrom, toFreeDelivery } = useCart()
  const pct = Math.min(100, (subtotal / freeDeliveryFrom) * 100)
  return (
    <div className="rounded-2xl bg-forest-50 p-3">
      <p className="flex items-center gap-2 text-xs font-semibold text-forest-900">
        <Truck className="h-4 w-4 text-forest-800" />
        {toFreeDelivery > 0 ? <>Add <b>{formatAED(toFreeDelivery)}</b> more for free delivery</> : <>You've unlocked <b>free delivery</b> 🎉</>}
      </p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
        <div className="h-full rounded-full bg-gradient-to-r from-gold to-leaf transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function CartDrawer() {
  const { drawerOpen, closeDrawer, lines, count, subtotal, setQty, remove } = useCart()
  const { pathname } = useLocation()

  // Close when the route changes (e.g. browser back, or a link elsewhere on the page)
  useEffect(() => {
    closeDrawer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (e) => e.key === 'Escape' && closeDrawer()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [drawerOpen, closeDrawer])

  if (!drawerOpen) return null
  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <button type="button" aria-label="Close cart" onClick={closeDrawer} className="absolute inset-0 bg-forest-950/40 backdrop-blur-sm" />
      <aside className="glass-strong absolute inset-y-0 right-0 flex w-full max-w-md animate-slide-in flex-col rounded-l-[2rem] sm:inset-y-3 sm:right-3 sm:rounded-[2rem]">
        <div className="flex items-center justify-between border-b border-forest-100 p-5">
          <h2 className="flex items-center gap-2 text-lg font-extrabold text-forest-900">
            <ShoppingBag className="h-5 w-5" /> Your cart <span className="rounded-full bg-gold px-2 py-0.5 text-xs text-forest-900">{count}</span>
          </h2>
          <button type="button" aria-label="Close cart" onClick={closeDrawer} className="grid h-10 w-10 place-items-center rounded-full bg-forest-50 text-forest-800 hover:bg-forest-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="grid flex-1 place-items-center p-8 text-center">
            <div>
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-forest-50"><ShoppingBag className="h-9 w-9 text-forest-800" /></div>
              <p className="mt-4 font-bold text-forest-900">Your cart is empty</p>
              <p className="mt-1 text-sm text-slate-500">Taste of home is just a click away.</p>
              <Link to="/shop" onClick={closeDrawer} className="mt-5 inline-block rounded-full bg-forest-800 px-6 py-3 text-sm font-bold text-cream">Start shopping</Link>
            </div>
          </div>
        ) : (
          <>
            <div className="px-5 pt-4"><FreeDeliveryMeter /></div>
            <ul className="flex-1 space-y-3 overflow-y-auto p-5">
              {lines.map(({ slug, qty, product }) => (
                <li key={slug} className="flex gap-3 rounded-2xl bg-white/70 p-3 ring-1 ring-white">
                  <Link to={`/product/${slug}`} onClick={closeDrawer}>
                    <img src={product.image} alt="" className="h-20 w-20 rounded-xl object-cover" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="text-[11px] font-semibold text-rust">{getBrand(product.brand)?.name}</p>
                    <p className="line-clamp-2 text-sm font-semibold leading-5">{product.name}</p>
                    <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                      <div className="w-28"><QtyStepper qty={qty} size="sm" onChange={(q) => setQty(slug, q)} /></div>
                      <span className="text-sm font-extrabold text-forest-900">{formatAED(product.price * qty)}</span>
                    </div>
                  </div>
                  <button type="button" aria-label="Remove item" onClick={() => remove(slug)} className="self-start text-slate-400 hover:text-rust">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="space-y-3 border-t border-forest-100 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Subtotal</span>
                <span className="text-xl font-extrabold text-forest-900">{formatAED(subtotal)}</span>
              </div>
              <p className="text-xs text-slate-500">Delivery and coupons calculated in the cart.</p>
              <div className="grid grid-cols-2 gap-2">
                <Link to="/cart" onClick={closeDrawer} className="grid h-12 place-items-center rounded-full bg-forest-50 text-sm font-bold text-forest-800 ring-1 ring-forest-100 hover:bg-forest-100">View cart</Link>
                <Link to="/cart?checkout=1" onClick={closeDrawer} className="grid h-12 place-items-center rounded-full bg-gold text-sm font-bold text-forest-900 shadow-lg shadow-gold/40 hover:bg-gold-dark">Checkout</Link>
              </div>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
