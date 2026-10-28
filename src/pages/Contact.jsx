import { useState } from 'react'
import { CircleCheck, Globe, Mail, MapPin, Phone, Send } from 'lucide-react'
import PageHero from '../components/PageHero'
import { company } from '../data/catalog'

const field = 'w-full rounded-2xl bg-white/80 px-4 py-3 text-sm outline-none ring-1 ring-forest-100 transition focus:ring-2 focus:ring-gold'

export default function Contact() {
  const [sent, setSent] = useState(false)
  return (
    <>
      <PageHero eyebrow="Let's work together" title="Source any Sri Lankan brand —" accent="under one roof." subtitle="Importers, distributors, wholesalers and private-label buyers: talk to our teams in Sri Lanka and the UAE." />

      <section className="mx-auto mt-10 grid max-w-7xl gap-6 px-4 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-5">
          {company.offices.map((o) => (
            <div key={o.region} className="glass-strong rounded-[2rem] p-6">
              <div className="flex items-start gap-4">
                <img src={o.logo} alt="" className="h-14 w-14 shrink-0 rounded-2xl bg-white object-contain p-1 ring-1 ring-black/5" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-rust">{o.region}</p>
                  <p className="font-serif text-2xl leading-tight text-forest-800">{o.name}</p>
                  <p className="text-sm text-slate-500">{o.kind}</p>
                </div>
              </div>
              <ul className="mt-5 space-y-2.5 border-t border-forest-800/10 pt-4 text-sm">
                <li className="flex gap-3"><MapPin className="h-4 w-4 shrink-0 text-rust" /> {o.address}</li>
                <li className="flex gap-3"><Phone className="h-4 w-4 text-rust" /> <a href={`tel:${o.phone.replace(/\s/g, '')}`} className="font-semibold hover:underline">{o.phone}</a></li>
                <li className="flex gap-3"><Mail className="h-4 w-4 text-rust" /> <a href={`mailto:${o.email}`} className="font-semibold hover:underline">{o.email}</a></li>
                <li className="flex gap-3"><Globe className="h-4 w-4 text-rust" /> <span className="font-semibold text-rust">{o.web}</span></li>
              </ul>
            </div>
          ))}
          <div className="grid grid-cols-3 gap-3 rounded-[2rem] bg-forest-800 p-5 text-cream">
            {[['Markets', 'Middle East · Australia · global'], ['Bankers', 'HNB · Bank of Ceylon'], ['Auditors', 'Jayasinghe Associates']].map(([k, v]) => (
              <div key={k}><p className="text-[11px] font-bold uppercase tracking-widest text-gold">{k}</p><p className="mt-1 text-xs text-cream/80">{v}</p></div>
            ))}
          </div>
        </div>

        <div className="glass-strong rounded-[2rem] p-6 sm:p-8">
          {sent ? (
            <div className="grid h-full place-items-center py-16 text-center">
              <div>
                <CircleCheck className="mx-auto h-14 w-14 text-leaf" />
                <p className="mt-4 font-serif text-3xl text-forest-800">Thank you!</p>
                <p className="mt-2 text-slate-600">This is a design preview — no message was sent.</p>
                <button type="button" onClick={() => setSent(false)} className="mt-6 rounded-full bg-forest-800 px-6 py-3 text-sm font-bold text-cream">Send another</button>
              </div>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSent(true) }} className="space-y-4">
              <h2 className="text-3xl font-medium text-forest-800">Request a <em className="text-rust">quote</em></h2>
              <p className="text-sm text-slate-600">Tell us what you need and our team will get back within one business day.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <input className={field} placeholder="Your name" />
                <input className={field} placeholder="Company" />
                <input className={field} type="email" placeholder="Email" />
                <input className={field} placeholder="Phone / WhatsApp" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <select className={field} defaultValue="">
                  <option value="" disabled>I am a…</option>
                  <option>Importer</option><option>Distributor</option><option>Wholesaler</option><option>Retailer</option><option>Private-label buyer</option>
                </select>
                <select className={field} defaultValue="">
                  <option value="" disabled>Interested in…</option>
                  <option>Dry foods & spices</option><option>Branded goods</option><option>Fresh fruits & vegetables</option><option>Private label</option>
                </select>
              </div>
              <textarea rows={5} className={field} placeholder="Products, volumes and destination port…" />
              <button type="submit" className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-forest-800 font-bold text-cream shadow-lg shadow-forest-800/25 hover:bg-forest-700">
                Send enquiry <Send className="h-4 w-4 text-gold" />
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  )
}
