import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Copy, TicketPercent } from 'lucide-react'
import PageHero from '../components/PageHero'
import ProductCard from '../components/ProductCard'
import SectionHeader from '../components/SectionHeader'
import { coupons, products, promotions } from '../data/catalog'

function CouponCard({ c }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(c.code) } catch { /* clipboard blocked — still show feedback */ }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }
  return (
    <div className="glass relative overflow-hidden rounded-3xl p-5">
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gold/25" />
      <div className="relative flex items-start justify-between">
        <span className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-rust"><TicketPercent className="h-4 w-4" /> {c.type === 'shipping' ? 'Delivery' : 'Percent off'}</span>
        <span className="text-xs text-slate-500">{c.by}</span>
      </div>
      <p className="relative mt-3 font-serif text-4xl text-forest-800">{c.title}</p>
      <div className="relative mt-4 flex items-center justify-between rounded-2xl border-2 border-dashed border-forest-800/20 bg-white/70 p-2 pl-4">
        <span className="font-mono text-sm font-bold tracking-widest text-forest-800">{c.code}</span>
        <button type="button" onClick={copy} className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition ${copied ? 'bg-leaf text-white' : 'bg-forest-800 text-cream hover:bg-forest-700'}`}>
          {copied ? <><Check className="h-3.5 w-3.5" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
        </button>
      </div>
      <p className="relative mt-3 text-xs text-slate-500">{c.valid} · Min. order AED {c.min.toFixed(2)}</p>
    </div>
  )
}

export default function Offers() {
  const deals = products.filter((p) => p.compareAt)
  return (
    <>
      <PageHero eyebrow="Cey Exports" title="Offers &" accent="Deals" subtitle="Live promotions are applied automatically at checkout — or copy a coupon code when you need one." image="/cey/own-poster.jpg">
        <a href="#coupons" className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-bold text-forest-900 hover:bg-gold-dark">Browse promotions <ArrowRight className="h-4 w-4" /></a>
      </PageHero>

      <section id="coupons" className="mx-auto mt-14 max-w-7xl scroll-mt-40 px-4">
        <SectionHeader eyebrow="Copy & apply at checkout" title="Coupon" accent="codes" />
        <div className="grid gap-5 md:grid-cols-3">{coupons.map((c) => <CouponCard key={c.code} c={c} />)}</div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-4">
        <SectionHeader eyebrow="Live campaigns" title="Active" accent="promotions" />
        <div className="grid gap-5 md:grid-cols-3">
          {promotions.map((p) => (
            <Link key={p.title} to={p.to} className="group relative isolate flex min-h-64 flex-col justify-end overflow-hidden rounded-[2rem] p-6 text-cream">
              <img src={p.image} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover transition duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-forest-950/90 via-forest-900/40 to-transparent" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold">{p.label}</span>
              <span className="mt-1 font-serif text-3xl">{p.title}</span>
              <span className="mt-3 flex items-center justify-between text-xs text-cream/75">
                {p.ends}
                <span className="rounded-full bg-cream px-4 py-2 text-xs font-bold text-forest-800">View offer</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-4">
        <SectionHeader eyebrow="Marked down" title="On sale" accent="now" to="/shop" />
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">{deals.map((p) => <ProductCard key={p.slug} product={p} />)}</div>
      </section>
    </>
  )
}
