import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Box, Trash2, X } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { fmtM3 } from '../lib/container'
import { ContainerMeter, ContainerVisual } from './ContainerMeter'
import { QtyStepper } from './ProductCard'

export default function CartDrawer() {
  const { drawerOpen, closeDrawer, lines, stats, container, containers, setContainerId, setQty, remove, suggestions, add } = useCart()
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
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Container plan">
      <button type="button" aria-label="Close" onClick={closeDrawer} className="absolute inset-0 bg-forest-950/40 backdrop-blur-sm" />
      <aside className="glass-strong absolute inset-y-0 right-0 flex w-full max-w-md animate-slide-in flex-col rounded-l-[2rem] sm:inset-y-3 sm:right-3 sm:rounded-[2rem]">
        <div className="flex items-center justify-between border-b border-forest-100 p-5">
          <div>
            <h2 className="flex items-center gap-2 font-sans text-lg font-extrabold text-forest-900"><Box className="h-5 w-5" /> Your container</h2>
            <p className="text-xs text-slate-500">{container?.name} · {stats.cartons.toLocaleString()} cartons</p>
          </div>
          <button type="button" aria-label="Close" onClick={closeDrawer} className="grid h-10 w-10 place-items-center rounded-full bg-forest-50 text-forest-800 hover:bg-forest-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Container choice up front, so buyers see they can switch size without visiting the planner */}
        <div className="border-b border-forest-100 px-5 pb-4 pt-4">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">Container size</p>
          <div role="radiogroup" aria-label="Container size" className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {containers.map((c) => {
              const active = c.id === container?.id
              return (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setContainerId(c.id)}
                  title={c.name}
                  className={`min-w-[92px] shrink-0 rounded-2xl px-3 py-2 text-left transition ${active ? 'bg-forest-800 text-cream shadow-lg shadow-forest-800/20' : 'bg-white/80 text-forest-800 ring-1 ring-forest-100 hover:bg-white'}`}
                >
                  <span className={`block text-xs font-extrabold ${active ? 'text-gold' : 'text-rust'}`}>{c.code || c.name}</span>
                  <span className="block text-[11px] font-semibold">{fmtM3(c.usable_volume_cm3, 1)}</span>
                  <span className={`block text-[10px] ${active ? 'text-cream/70' : 'text-slate-500'}`}>min {Math.round(c.min_fill_pct)}%</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="space-y-4 border-b border-forest-100 p-5">
          <ContainerVisual lines={lines} stats={stats} container={container} compact />
          <ContainerMeter stats={stats} container={container} showWeight={false} />
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {lines.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">No cartons yet. Browse the range and start filling your container.</p>
          ) : (
            <ul className="space-y-3">
              {lines.map(({ slug, qty, product }) => (
                <li key={slug} className="flex gap-3 rounded-2xl bg-white/70 p-3 ring-1 ring-white">
                  <img src={product.image} alt="" className="h-16 w-16 rounded-xl object-cover" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="line-clamp-1 text-sm font-semibold">{product.name}</p>
                    <p className="text-[11px] text-slate-500">{fmtM3(product.volume * qty)} · min {product.minQty}</p>
                    <div className="mt-1.5 w-32"><QtyStepper qty={qty} size="sm" onChange={(q) => setQty(slug, q)} /></div>
                  </div>
                  <button type="button" aria-label="Remove" onClick={() => remove(slug)} className="self-start text-slate-400 hover:text-rust"><Trash2 className="h-4 w-4" /></button>
                </li>
              ))}
            </ul>
          )}
          {suggestions.length > 0 && stats.cartons > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-rust">Still fits</p>
              <div className="space-y-2">
                {suggestions.slice(0, 3).map(({ product, room }) => (
                  <div key={product.slug} className="flex items-center gap-3 rounded-2xl bg-white/50 p-2">
                    <img src={product.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold">{product.name}</p>
                      <p className="text-[10px] text-slate-500">Up to {room.toLocaleString()} cartons</p>
                    </div>
                    <button type="button" onClick={() => add(product.slug, undefined, { openDrawer: false })} className="rounded-full bg-forest-800 px-3 py-1.5 text-[11px] font-bold text-cream">+ {product.minQty}</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-forest-100 p-5">
          <Link to="/container" onClick={closeDrawer} className="grid h-12 place-items-center rounded-full bg-forest-50 text-sm font-bold text-forest-800 ring-1 ring-forest-100 hover:bg-forest-100">Plan in detail</Link>
          {stats.canCheckout ? (
            <Link to="/container?inquire=1" onClick={closeDrawer} className="grid h-12 place-items-center rounded-full bg-gold text-sm font-bold text-forest-900 shadow-lg shadow-gold/40 hover:bg-gold-dark">Send inquiry</Link>
          ) : (
            <span className="grid h-12 place-items-center rounded-full bg-slate-200 text-sm font-bold text-slate-500" title="Fill the container to the minimum first">Send inquiry</span>
          )}
        </div>
      </aside>
    </div>
  )
}
