import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Box, CircleCheck, Lightbulb, LogIn, Send, Trash2, X } from 'lucide-react'
import { ContainerMeter, ContainerVisual } from '../components/ContainerMeter'
import { QtyStepper } from '../components/ProductCard'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useCatalog } from '../context/CatalogContext'
import { formatAED } from '../data/catalog'
import { SEGMENT_COLORS, cartonsToMin, fmtKg, fmtM3 } from '../lib/container'
import { inquiryRef, supabase } from '../lib/supabase'

const field = 'w-full rounded-2xl bg-white px-4 py-3 text-sm outline-none ring-1 ring-forest-100 focus:ring-2 focus:ring-gold'

function InquiryModal({ onClose }) {
  const { lines, container, stats, clear } = useCart()
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    contact_name: profile?.full_name ?? '',
    company: profile?.company ?? '',
    email: profile?.email ?? user?.email ?? '',
    phone: profile?.phone ?? '',
    destination: profile?.country ?? '',
    preferred_date: '',
    notes: '',
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(null)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const { data, error: err } = await supabase.rpc('submit_inquiry', {
      p_container_id: container.id,
      p_items: lines.map((l) => ({ product_id: l.product.id, qty: l.qty })),
      p_contact: form,
    })
    setBusy(false)
    if (err) return setError(err.message)
    setDone(data)
    clear()
  }

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto p-4" role="dialog" aria-modal="true" aria-label="Send inquiry">
      <button type="button" aria-label="Close" onClick={onClose} className="fixed inset-0 bg-forest-950/50 backdrop-blur-sm" />
      <div className="glass-strong relative my-8 w-full max-w-xl animate-pop rounded-[2rem] p-6 sm:p-8">
        <button type="button" aria-label="Close" onClick={onClose} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-forest-50"><X className="h-4 w-4" /></button>
        {done ? (
          <div className="py-6 text-center">
            <CircleCheck className="mx-auto h-16 w-16 text-leaf" />
            <p className="mt-4 font-serif text-3xl text-forest-800">Inquiry sent!</p>
            <p className="mt-2 text-slate-600">Reference <b className="text-forest-800">{inquiryRef(done.ref_no)}</b> · {done.container_name} · {Number(done.fill_pct).toFixed(1)}% full</p>
            <p className="mt-1 text-sm text-slate-500">Our team will contact you to confirm availability, pricing and shipping.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <button type="button" onClick={() => navigate(`/account/inquiries/${done.id}`)} className="rounded-full bg-forest-800 px-6 py-3 text-sm font-bold text-cream">Track status</button>
              <Link to="/shop" onClick={onClose} className="rounded-full bg-white px-6 py-3 text-sm font-bold text-forest-800 ring-1 ring-forest-100">Plan another container</Link>
            </div>
          </div>
        ) : !user ? (
          <div className="py-4 text-center">
            <LogIn className="mx-auto h-12 w-12 text-forest-800" />
            <p className="mt-4 font-serif text-3xl text-forest-800">Sign in to send your inquiry</p>
            <p className="mt-2 text-sm text-slate-600">Your container plan is saved. With an account you can follow the status of every inquiry.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Link to="/login?next=/container%3Finquire%3D1" className="rounded-full bg-forest-800 px-6 py-3 text-sm font-bold text-cream">Sign in</Link>
              <Link to="/register?next=/container%3Finquire%3D1" className="rounded-full bg-gold px-6 py-3 text-sm font-bold text-forest-900">Create account</Link>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-rust">No payment — our team will contact you</p>
            <h2 className="text-3xl font-medium text-forest-800">Send your <strong className="font-bold text-rust">inquiry</strong></h2>
            <div className="rounded-2xl bg-forest-50 p-3 text-sm text-forest-800">
              <b>{container.name}</b> · {stats.cartons.toLocaleString()} cartons · {fmtM3(stats.usedVol)} · <b>{stats.fill.toFixed(1)}% full</b>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input required className={field} placeholder="Contact name *" value={form.contact_name} onChange={set('contact_name')} />
              <input className={field} placeholder="Company" value={form.company} onChange={set('company')} />
              <input required type="email" className={field} placeholder="Email *" value={form.email} onChange={set('email')} />
              <input className={field} placeholder="Phone / WhatsApp" value={form.phone} onChange={set('phone')} />
              <input className={field} placeholder="Destination port / country" value={form.destination} onChange={set('destination')} />
              <label className="relative">
                <span className="absolute -top-2 left-4 bg-white px-1 text-[10px] font-bold text-slate-500">Preferred shipping date</span>
                <input type="date" className={field} value={form.preferred_date} onChange={set('preferred_date')} />
              </label>
            </div>
            <textarea rows={3} className={field} placeholder="Notes — labelling, private label, payment terms…" value={form.notes} onChange={set('notes')} />
            {error && <p className="rounded-2xl bg-rust/10 p-3 text-sm font-semibold text-rust">{error}</p>}
            <button type="submit" disabled={busy} className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gold font-bold text-forest-900 hover:bg-gold-dark disabled:opacity-60">
              <Send className="h-4 w-4" /> {busy ? 'Sending…' : 'Send inquiry'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default function ContainerPlan() {
  const { lines, stats, container, containers, setContainerId, setQty, remove, clear, add, roomFor, suggestions } = useCart()
  const { getBrand, loading } = useCatalog()
  const [params, setParams] = useSearchParams()
  const [inquiring, setInquiring] = useState(false)

  // ?inquire=1 (from the drawer, or after signing in) opens the form once the catalogue has loaded
  useEffect(() => {
    if (loading || params.get('inquire') !== '1') return
    if (stats.canCheckout) setInquiring(true)
    setParams({}, { replace: true })
  }, [loading, params, setParams, stats.canCheckout])

  if (loading) return null
  if (!container) {
    return <p className="mx-auto max-w-xl px-4 py-24 text-center text-slate-600">No containers are available right now. Please contact us.</p>
  }

  const gapPick = suggestions.find(({ product, room }) => room >= cartonsToMin(product, stats))

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-rust">Bulk order planner</p>
          <h1 className="text-4xl font-medium text-forest-800">Your <strong className="font-bold text-rust">container</strong></h1>
        </div>
        <Link to="/shop" className="flex items-center gap-2 text-sm font-bold text-forest-800 hover:underline"><ArrowLeft className="h-4 w-4" /> Add more products</Link>
      </div>

      {/* Container choice */}
      <div className="no-scrollbar -mx-4 mb-6 flex gap-3 overflow-x-auto px-4 pb-1">
        {containers.map((c) => {
          const active = c.id === container.id
          return (
            <button key={c.id} type="button" onClick={() => setContainerId(c.id)} className={`min-w-56 shrink-0 rounded-3xl p-4 text-left transition ${active ? 'bg-forest-800 text-cream shadow-xl shadow-forest-800/25' : 'glass hover:bg-white'}`}>
              <p className={`text-[11px] font-extrabold uppercase tracking-wider ${active ? 'text-gold' : 'text-rust'}`}>{c.code}</p>
              <p className="font-bold">{c.name}</p>
              <p className={`mt-1 text-xs ${active ? 'text-cream/70' : 'text-slate-500'}`}>
                {Number(c.length_cm)}×{Number(c.width_cm)}×{Number(c.height_cm)} cm · {fmtM3(c.usable_volume_cm3, 1)} usable
              </p>
              <p className={`text-xs ${active ? 'text-cream/70' : 'text-slate-500'}`}>Min fill {Math.round(c.min_fill_pct)}%{c.max_payload_kg ? ` · ${fmtKg(c.max_payload_kg)}` : ''}</p>
            </button>
          )
        })}
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="glass rounded-[2rem] p-5 sm:p-6">
            <ContainerVisual lines={lines} stats={stats} container={container} />
          </div>

          <div className="glass overflow-hidden rounded-[2rem]">
            <div className="flex items-center justify-between border-b border-forest-800/10 px-5 py-4">
              <h2 className="font-sans text-lg font-extrabold text-forest-800">Load list <span className="text-sm font-semibold text-slate-500">({lines.length} products)</span></h2>
              {lines.length > 0 && <button type="button" onClick={clear} className="text-xs font-bold text-rust underline">Empty container</button>}
            </div>
            {lines.length === 0 ? (
              <div className="p-10 text-center">
                <Box className="mx-auto h-10 w-10 text-forest-800" />
                <p className="mt-3 font-serif text-2xl text-forest-800">Your container is empty</p>
                <Link to="/shop" className="mt-4 inline-block rounded-full bg-forest-800 px-6 py-3 text-sm font-bold text-cream">Browse products</Link>
              </div>
            ) : (
              <ul className="divide-y divide-forest-800/10">
                {lines.map(({ slug, qty, product }, i) => {
                  const room = roomFor(product)
                  const share = (product.volume * qty) / stats.usable * 100
                  return (
                    <li key={slug} className="grid gap-3 p-4 sm:grid-cols-[1fr_170px_120px_32px] sm:items-center sm:px-5">
                      <div className="flex items-center gap-3">
                        <span className="h-12 w-1.5 shrink-0 rounded-full" style={{ background: SEGMENT_COLORS[i % SEGMENT_COLORS.length] }} />
                        <img src={product.image} alt="" className="h-14 w-14 shrink-0 rounded-xl bg-white object-cover" />
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-rust">{getBrand(product.brand)?.name}</p>
                          <Link to={`/product/${slug}`} className="line-clamp-1 font-semibold hover:text-forest-700">{product.name}</Link>
                          <p className="text-[11px] text-slate-500">{product.dims.join('×')} cm · {fmtM3(product.volume, 3)} / carton · min {product.minQty}</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <QtyStepper qty={qty} size="sm" onChange={(q) => setQty(slug, q)} />
                        <div className="flex justify-center gap-1">
                          <button type="button" disabled={room < 1} onClick={() => add(slug, 10, { openDrawer: false })} className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-forest-800 ring-1 ring-forest-100 disabled:opacity-40">+10</button>
                          <button type="button" disabled={room < 1} onClick={() => add(slug, room, { openDrawer: false })} className="rounded-full bg-gold/40 px-2 py-0.5 text-[10px] font-bold text-forest-900 disabled:opacity-40">Fill (+{room})</button>
                        </div>
                      </div>
                      <div className="text-sm sm:text-right">
                        <p className="font-extrabold text-forest-800">{fmtM3(product.volume * qty)}</p>
                        <p className="text-[11px] text-slate-500">{share.toFixed(1)}% of space</p>
                        {product.price != null && <p className="text-[11px] text-slate-500">{formatAED(product.price * qty)}</p>}
                      </div>
                      <button type="button" aria-label="Remove" onClick={() => remove(slug)} className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-rust/10 hover:text-rust"><Trash2 className="h-4 w-4" /></button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {suggestions.length > 0 && (
            <section>
              <h2 className="mb-1 flex items-center gap-2 font-sans text-lg font-extrabold text-forest-800"><Lightbulb className="h-5 w-5 text-gold-dark" /> Still fits in your container</h2>
              <p className="mb-4 text-sm text-slate-600">
                {gapPick && stats.toMinVol > 0
                  ? <>To reach the minimum, add about <b>{cartonsToMin(gapPick.product, stats).toLocaleString()} cartons of {gapPick.product.name}</b> — or mix any of these:</>
                  : `${fmtM3(stats.remainingVol)} of usable space left. These products still fit:`}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {suggestions.map(({ product, room }) => (
                  <div key={product.slug} className="glass flex items-center gap-3 rounded-2xl p-3">
                    <img src={product.image} alt="" className="h-14 w-14 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-semibold">{product.name}</p>
                      <p className="text-[11px] text-slate-500">Up to <b className="text-forest-800">{room.toLocaleString()}</b> cartons · {fmtM3(product.volume, 3)} each</p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button type="button" onClick={() => add(product.slug, undefined, { openDrawer: false })} className="rounded-full bg-forest-800 px-3 py-1 text-[11px] font-bold text-cream">+{product.minQty}</button>
                      <button type="button" onClick={() => add(product.slug, room, { openDrawer: false })} className="rounded-full bg-gold/50 px-3 py-1 text-[11px] font-bold text-forest-900">Fill</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="glass-strong space-y-4 rounded-[2rem] p-6 lg:sticky lg:top-44">
          <h2 className="text-2xl font-medium text-forest-800">{container.name}</h2>
          <ContainerMeter stats={stats} container={container} />
          <dl className="space-y-2 border-t border-forest-800/10 pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-slate-600">Cartons</dt><dd className="font-semibold">{stats.cartons.toLocaleString()}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-600">Inner volume</dt><dd className="font-semibold">{fmtM3(stats.inner)}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-600">Usable after {Number(container.safety_margin_pct)}% margin</dt><dd className="font-semibold">{fmtM3(stats.usable)}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-600">Gross weight</dt><dd className="font-semibold">{fmtKg(stats.usedKg)}</dd></div>
            {stats.value > 0 && (
              <div className="flex items-baseline justify-between border-t border-forest-800/10 pt-3">
                <dt className="font-bold text-forest-800">Indicative value</dt>
                <dd className="font-serif text-2xl text-forest-800">{formatAED(stats.value)}</dd>
              </div>
            )}
          </dl>
          <button
            type="button"
            disabled={!stats.canCheckout}
            onClick={() => setInquiring(true)}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gold py-3.5 font-bold text-forest-900 shadow-lg shadow-gold/40 hover:bg-gold-dark disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
          >
            <Send className="h-4 w-4" /> Send inquiry
          </button>
          <p className="text-center text-[11px] text-slate-500">No payment online — pricing and shipping are confirmed by our team.</p>
        </aside>
      </div>

      {inquiring && <InquiryModal onClose={() => setInquiring(false)} />}
    </div>
  )
}
