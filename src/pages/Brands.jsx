import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Search, Star } from 'lucide-react'
import PageHero from '../components/PageHero'
import { brandCount, brands } from '../data/catalog'

export default function Brands() {
  const [q, setQ] = useState('')
  const own = brands.filter((b) => b.own)
  const others = brands.filter((b) => !b.own && b.name.toLowerCase().includes(q.toLowerCase()))

  return (
    <>
      <PageHero eyebrow="Brands we consolidate" title="Your gateway to Sri Lanka's" accent="finest brands" subtitle="From heritage food products and wellness essentials to household staples and premium beverages — source any Sri Lankan brand efficiently, reliably and under one roof." image="/cey/boxes.jpg" />

      <section className="mx-auto mt-12 max-w-7xl px-4">
        <div className="grid gap-5 md:grid-cols-2">
          {own.map((b) => (
            <div key={b.slug} className="glass-strong flex items-center gap-5 rounded-[2rem] p-5">
              <span className="grid h-24 w-24 shrink-0 place-items-center rounded-3xl bg-white p-3 ring-2 ring-gold/60"><img src={b.logo} alt="" className="max-h-full max-w-full object-contain" /></span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-rust">Our own range</p>
                <p className="font-serif text-2xl text-forest-800">{b.name}</p>
                <p className="text-sm text-slate-600">{b.tagline}</p>
              </div>
              <Link to={`/shop?brand=${b.slug}`} className="hidden h-11 shrink-0 items-center gap-2 rounded-full bg-forest-800 px-5 text-sm font-bold text-cream sm:flex">{brandCount(b.slug)} items <ArrowRight className="h-4 w-4 text-gold" /></Link>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-7xl px-4">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-3xl font-medium text-forest-800">All <em className="text-rust">partner brands</em> <span className="font-sans text-base text-slate-500">({others.length})</span></h2>
          <label className="glass flex h-11 w-full max-w-xs items-center gap-2 rounded-full px-4">
            <Search className="h-4 w-4 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a brand…" className="w-full bg-transparent text-sm outline-none" />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {others.map((b) => {
            const n = brandCount(b.slug)
            return (
              <Link key={b.slug} to={`/shop?brand=${b.slug}`} className="glass group flex flex-col rounded-3xl p-3 transition hover:-translate-y-1 hover:shadow-xl">
                <span className="grid h-28 place-items-center rounded-2xl bg-white p-4 ring-1 ring-black/5">
                  <img src={b.logo} alt={b.name} className="max-h-full max-w-full object-contain transition group-hover:scale-105" />
                </span>
                <span className="mt-3 flex items-start justify-between gap-2 px-1">
                  <span>
                    <span className="block font-bold text-forest-800">{b.name}</span>
                    <span className="flex items-center gap-1 text-xs text-slate-500"><Star className="h-3 w-3 fill-gold text-gold" /> 5.0 · Since 2024</span>
                  </span>
                  {b.featured && <span className="rounded-full bg-gold/30 px-2 py-0.5 text-[10px] font-extrabold uppercase text-forest-900">Core</span>}
                </span>
                <span className="mt-2 px-1 text-xs font-bold text-rust">{n ? `${n} products online` : 'Available on request'}</span>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-4">
        <div className="relative overflow-hidden rounded-[2rem] bg-sand p-8 sm:p-12">
          <div className="rings pointer-events-none absolute inset-0" />
          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-rust">Don't see your brand?</p>
              <h3 className="mt-2 text-3xl font-medium text-forest-800">We consolidate, pack and ship <em className="text-rust">any Sri Lankan brand.</em></h3>
            </div>
            <Link to="/contact" className="inline-flex shrink-0 items-center gap-2 rounded-full bg-forest-800 px-6 py-3 font-bold text-cream">Request a brand <ArrowRight className="h-4 w-4 text-gold" /></Link>
          </div>
        </div>
      </section>
    </>
  )
}
