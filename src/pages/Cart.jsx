import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, CircleCheck, CreditCard, Lock, ShoppingBag, TicketPercent, Trash2, Truck, X } from 'lucide-react'
import { FreeDeliveryMeter } from '../components/CartDrawer'
import { QtyStepper } from '../components/ProductCard'
import ProductCard from '../components/ProductCard'
import SectionHeader from '../components/SectionHeader'
import { useCart } from '../context/CartContext'
import { coupons, formatAED, getBrand, products } from '../data/catalog'

function CheckoutModal({ onClose, total }) {
  const { clear } = useCart()
  const [done, setDone] = useState(false)
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center p-4" role="dialog" aria-modal="true">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-forest-950/50 backdrop-blur-sm" />
      <div className="glass-strong relative w-full max-w-md animate-pop rounded-[2rem] p-6 sm:p-8">
        <button type="button" aria-label="Close" onClick={onClose} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-forest-50"><X className="h-4 w-4" /></button>
        {done ? (
          <div className="py-6 text-center">
            <CircleCheck className="mx-auto h-16 w-16 text-leaf" />
            <p className="mt-4 font-serif text-3xl text-forest-800">Order placed!</p>
            <p className="mt-2 text-sm text-slate-600">Order <b>#CEY-{Math.floor(Math.random() * 90000 + 10000)}</b> · {formatAED(total)}</p>
            <p className="mt-1 text-xs text-slate-500">Design preview only — no payment was taken.</p>
            <Link to="/shop" onClick={() => { clear(); onClose() }} className="mt-6 inline-block rounded-full bg-forest-800 px-6 py-3 text-sm font-bold text-cream">Continue shopping</Link>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setDone(true) }} className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-rust">Secure checkout</p>
            <h2 className="text-3xl font-medium text-forest-800">Delivery <em className="text-rust">details</em></h2>
            {['Full name', 'Phone', 'Address, Emirate'].map((p) => <input key={p} placeholder={p} className="w-full rounded-2xl bg-white px-4 py-3 text-sm ring-1 ring-forest-100 outline-none focus:ring-2 focus:ring-gold" />)}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {[['Card', CreditCard], ['Cash on delivery', Truck]].map(([l, Icon], i) => (
                <label key={l} className="flex cursor-pointer items-center gap-2 rounded-2xl bg-white p-3 text-sm font-semibold ring-1 ring-forest-100 has-[:checked]:ring-2 has-[:checked]:ring-forest-800">
                  <input type="radio" name="pay" defaultChecked={i === 1} className="accent-forest-800" /><Icon className="h-4 w-4 text-rust" /> {l}
                </label>
              ))}
            </div>
            <button type="submit" className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gold font-bold text-forest-900 hover:bg-gold-dark">
              <Lock className="h-4 w-4" /> Place order · {formatAED(total)}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default function Cart() {
  const { lines, count, subtotal, savings, discount, delivery, total, coupon, applyCoupon, removeCoupon, setQty, remove } = useCart()
  const [params, setParams] = useSearchParams()
  const [code, setCode] = useState('')
  const [msg, setMsg] = useState(null)
  const [checkout, setCheckout] = useState(params.get('checkout') === '1')

  useEffect(() => {
    if (params.get('checkout')) setParams({}, { replace: true })
  }, [params, setParams])

  const submitCoupon = (e) => {
    e.preventDefault()
    const r = applyCoupon(code)
    setMsg(r)
    if (r.ok) setCode('')
  }

  const suggestions = products.filter((p) => p.tags?.includes('best') && !lines.some((l) => l.slug === p.slug)).slice(0, 4)

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-rust">Your order</p>
          <h1 className="text-4xl font-medium text-forest-800">Shopping <em className="text-rust">cart</em> <span className="font-sans text-lg text-slate-500">({count} items)</span></h1>
        </div>
        <Link to="/shop" className="flex items-center gap-2 text-sm font-bold text-forest-800 hover:underline"><ArrowLeft className="h-4 w-4" /> Continue shopping</Link>
      </div>

      {lines.length === 0 ? (
        <div className="glass rounded-[2rem] p-14 text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-forest-800" />
          <p className="mt-4 font-serif text-3xl text-forest-800">Your cart is empty</p>
          <Link to="/shop" className="mt-6 inline-block rounded-full bg-forest-800 px-6 py-3 font-bold text-cream">Start shopping</Link>
        </div>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_380px]">
          <div className="glass overflow-hidden rounded-[2rem]">
            <div className="hidden grid-cols-[1fr_140px_120px_40px] gap-4 border-b border-forest-800/10 px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 md:grid">
              <span>Product</span><span>Quantity</span><span className="text-right">Total</span><span />
            </div>
            <ul className="divide-y divide-forest-800/10">
              {lines.map(({ slug, qty, product }) => (
                <li key={slug} className="grid grid-cols-[80px_1fr] items-center gap-4 p-4 md:grid-cols-[1fr_140px_120px_40px] md:px-6">
                  <div className="flex items-center gap-4 md:col-span-1">
                    <Link to={`/product/${slug}`}><img src={product.image} alt="" className="h-20 w-20 shrink-0 rounded-2xl bg-white object-cover" /></Link>
                    <div className="hidden min-w-0 md:block">
                      <p className="text-xs font-bold text-rust">{getBrand(product.brand)?.name}</p>
                      <Link to={`/product/${slug}`} className="line-clamp-2 font-semibold text-ink hover:text-forest-700">{product.name}</Link>
                      <p className="text-xs text-slate-500">{formatAED(product.price)} · {product.pack}</p>
                    </div>
                  </div>
                  <div className="space-y-2 md:contents">
                    <div className="md:hidden">
                      <p className="text-xs font-bold text-rust">{getBrand(product.brand)?.name}</p>
                      <p className="line-clamp-2 text-sm font-semibold">{product.name}</p>
                    </div>
                    <div className="flex items-center justify-between gap-3 md:contents">
                      <div className="w-32 md:w-auto"><QtyStepper qty={qty} size="sm" onChange={(q) => setQty(slug, q)} /></div>
                      <p className="text-right font-extrabold text-forest-800">{formatAED(product.price * qty)}</p>
                      <button type="button" aria-label="Remove" onClick={() => remove(slug)} className="grid h-9 w-9 place-items-center rounded-full text-slate-400 hover:bg-rust/10 hover:text-rust"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <aside className="glass-strong space-y-4 rounded-[2rem] p-6 lg:sticky lg:top-44">
            <h2 className="text-2xl font-medium text-forest-800">Order summary</h2>
            <FreeDeliveryMeter />
            {coupon ? (
              <div className="flex items-center justify-between rounded-2xl bg-leaf/15 p-3 text-sm">
                <span className="flex items-center gap-2 font-bold text-forest-800"><TicketPercent className="h-4 w-4 text-leaf" /> {coupon.code} · {coupon.title}</span>
                <button type="button" onClick={() => { removeCoupon(); setMsg(null) }}className="text-xs font-bold text-rust underline">Remove</button>
              </div>
            ) : (
              <form onSubmit={submitCoupon}>
                <div className="flex rounded-full bg-white p-1 ring-1 ring-forest-100">
                  <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Coupon code" className="min-w-0 flex-1 bg-transparent px-4 text-sm uppercase outline-none" />
                  <button className="rounded-full bg-forest-800 px-5 py-2 text-sm font-bold text-cream">Apply</button>
                </div>
                {msg && <p className={`mt-2 text-xs font-semibold ${msg.ok ? 'text-leaf' : 'text-rust'}`}>{msg.message}</p>}
                <p className="mt-2 text-xs text-slate-500">Try {coupons.map((c) => <button key={c.code} type="button" onClick={() => setCode(c.code)} className="mr-1 font-mono font-bold text-forest-800 underline">{c.code}</button>)}</p>
              </form>
            )}
            <dl className="space-y-2 border-t border-forest-800/10 pt-4 text-sm">
              <div className="flex justify-between"><dt className="text-slate-600">Subtotal</dt><dd className="font-semibold">{formatAED(subtotal)}</dd></div>
              {savings > 0 && <div className="flex justify-between text-leaf"><dt>Product savings</dt><dd className="font-semibold">−{formatAED(savings)}</dd></div>}
              {discount > 0 && <div className="flex justify-between text-leaf"><dt>Coupon</dt><dd className="font-semibold">−{formatAED(discount)}</dd></div>}
              <div className="flex justify-between"><dt className="text-slate-600">Delivery</dt><dd className="font-semibold">{delivery ? formatAED(delivery) : 'Free'}</dd></div>
              <div className="flex items-baseline justify-between border-t border-forest-800/10 pt-3">
                <dt className="font-bold text-forest-800">Total <span className="text-xs font-normal text-slate-500">(incl. VAT)</span></dt>
                <dd className="font-serif text-3xl text-forest-800">{formatAED(total)}</dd>
              </div>
            </dl>
            <button type="button" onClick={() => setCheckout(true)} className="flex h-13 w-full items-center justify-center gap-2 rounded-full bg-gold py-3.5 font-bold text-forest-900 shadow-lg shadow-gold/40 hover:bg-gold-dark">
              <Lock className="h-4 w-4" /> Proceed to checkout
            </button>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <span className="rounded bg-white px-2 py-0.5 font-extrabold italic text-forest-800 ring-1 ring-forest-100">VISA</span>
              <span className="rounded bg-white px-2 py-0.5 font-bold ring-1 ring-forest-100">Mastercard</span>
              <span className="rounded bg-white px-2 py-0.5 font-bold ring-1 ring-forest-100">COD</span>
            </div>
          </aside>
        </div>
      )}

      {suggestions.length > 0 && (
        <section className="mt-16">
          <SectionHeader eyebrow="Complete your order" title="Frequently" accent="bought together" />
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">{suggestions.map((p) => <ProductCard key={p.slug} product={p} />)}</div>
        </section>
      )}

      {checkout && lines.length > 0 && <CheckoutModal total={total} onClose={() => setCheckout(false)} />}
    </div>
  )
}
