import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import PageHero from '../components/PageHero'
import SectionHeader from '../components/SectionHeader'
import { company } from '../data/catalog'

const glance = [
  ['Business model', 'Export consolidator & agricultural producer'],
  ['Parent company', 'Lanka Foods Middle East LLC, UAE'],
  ['Primary markets', 'Middle East · Australia · international importers & wholesalers'],
  ['Core partners & brands', 'Elephant House · Highland · Araliya Rice · Cargills Kist · Wijaya Products · private label'],
  ['Bankers', 'Hatton National Bank & Bank of Ceylon'],
  ['Auditors', 'Jayasinghe Associates (Chartered Accountants)'],
]

export default function About() {
  return (
    <>
      <PageHero eyebrow="01 — About the company" title="About the" accent="Company" subtitle="Ceylon International Exports (Pvt) Ltd is a Sri Lankan export consolidator and agricultural producer, established as a fully owned subsidiary of Lanka Foods Middle East LLC, UAE." image="/cey/aerial.jpg" />

      <section className="mx-auto mt-12 max-w-7xl px-4">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4 text-slate-700">
            <p className="font-serif text-2xl leading-snug text-forest-800">Dedicated to delivering premium local brands and high-quality agricultural products to global markets.</p>
            <p>The company leverages a robust supply chain built on direct sourcing from an extensive network of growers, complemented by its own farming assets, advanced protected-cultivation facilities and secure warehousing infrastructure.</p>
            <p>This integrated model enables the reliable export of dry foodstuffs, spices, rice, and fresh fruits and vegetables to importers, distributors and wholesalers across the Middle East, Australia and other international destinations.</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {['team', 'cucumber', 'loading-team'].map((p) => <img key={p} src={`/cey/${p}.jpg`} alt="" className="aspect-[3/4] w-full rounded-3xl object-cover" />)}
          </div>
        </div>
        <div className="glass mt-10 grid grid-cols-2 divide-forest-800/10 rounded-[2rem] lg:grid-cols-4 lg:divide-x">
          {company.stats.map((s, i) => (
            <div key={s.value} className="p-6">
              <p className={`font-serif text-5xl ${i % 2 ? 'text-rust' : 'text-forest-800'}`}>{s.value}</p>
              <p className="mt-2 text-sm text-slate-600">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-4">
        <div className="relative grid items-center gap-8 overflow-hidden rounded-[2.5rem] bg-forest-800 p-8 text-cream sm:p-12 md:grid-cols-[1fr_auto]">
          <div className="rings-tr pointer-events-none absolute inset-0" />
          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold">Our vision</p>
            <p className="mt-3 font-serif text-3xl leading-snug sm:text-4xl">To become a go-to name in global sourcing for <em className="text-gold">Sri Lankan food brands</em> and agricultural produce.</p>
            <div className="my-6 h-px bg-cream/15" />
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold">Our mission</p>
            <p className="mt-3 max-w-2xl font-serif text-xl text-cream/90">To be a reliable, trusted supplier of Sri Lankan food products by delivering consistent quality, secure logistics and strong supplier relationships.</p>
          </div>
          <img src="/cey/pepper.jpg" alt="Black pepper" className="relative mx-auto h-56 w-56 rounded-full object-cover ring-4 ring-gold" />
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-4">
        <SectionHeader eyebrow="The principles behind every shipment" title="Our" accent="Values" />
        <div className="grid gap-4 sm:grid-cols-2">
          {company.values.map((v) => (
            <div key={v.no} className="glass rounded-3xl p-6">
              <p className="flex items-baseline gap-3"><span className="font-serif text-4xl text-rust">{v.no}</span><span className="text-xl font-bold text-forest-800">{v.title}</span></p>
              <p className="mt-2 text-slate-600">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="facilities" className="mx-auto mt-16 max-w-7xl scroll-mt-40 px-4">
        <SectionHeader eyebrow="04 — Facilities & supply chain" title="Our" accent="Facilities" />
        <div className="grid gap-5 md:grid-cols-2">
          {company.facilities.map((f, i) => (
            <article key={f.title} className={`overflow-hidden rounded-[2rem] ${i === 0 ? 'bg-forest-800 text-cream' : i === 3 ? 'bg-sand' : 'glass'}`}>
              <img src={f.image} alt="" className="aspect-[16/7] w-full object-cover" />
              <div className="p-6">
                <p className={`text-xs font-bold uppercase tracking-[0.2em] ${i === 0 ? 'text-gold' : 'text-rust'}`}>{f.place}</p>
                <h3 className={`mt-1 text-2xl font-medium ${i === 0 ? '' : 'text-forest-800'}`}>{f.title}</h3>
                <p className={`mt-2 text-sm ${i === 0 ? 'text-cream/75' : 'text-slate-600'}`}>{f.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-4">
        <div className="glass-forest grid gap-6 rounded-[2rem] p-8 text-cream md:grid-cols-2">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold md:col-span-2">Company at a glance</p>
          {glance.map(([k, v]) => (
            <div key={k}><p className="text-sm text-cream/60">{k}</p><p className="font-semibold">{v}</p></div>
          ))}
          <Link to="/contact" className="inline-flex items-center gap-2 justify-self-start rounded-full bg-gold px-6 py-3 text-sm font-bold text-forest-900 md:col-span-2">Work with us <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </>
  )
}
