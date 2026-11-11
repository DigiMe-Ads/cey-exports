import { Link } from 'react-router-dom'
import { ArrowRight, Box, ClipboardList, MessageSquare, Ship } from 'lucide-react'
import PageHero from '../components/PageHero'
import ProductCard from '../components/ProductCard'
import SectionHeader from '../components/SectionHeader'
import { useCatalog } from '../context/CatalogContext'

const steps = [
  { icon: Box, title: 'Plan your container', body: 'Add cartons and watch the container fill. We keep a safety margin so loads are never packed snug.' },
  { icon: ClipboardList, title: 'Send an inquiry', body: 'Once you reach the minimum fill, send your plan — no payment online.' },
  { icon: MessageSquare, title: 'We contact you', body: 'Our team confirms availability, pricing and shipping dates directly.' },
  { icon: Ship, title: 'Track the status', body: 'Follow each step of your order from your account.' },
]

export default function Offers() {
  const { products, promotions } = useCatalog()
  const deals = products.filter((p) => p.compareAt)
  return (
    <>
      <PageHero eyebrow="Cey Exports" title="Offers &" accent="Deals" subtitle="Current campaigns and marked-down lines. Mix them into any container — prices are confirmed by our team when you inquire." image="/cey/own-poster.jpg">
        <a href="#promotions" className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-bold text-forest-900 hover:bg-gold-dark">Browse promotions <ArrowRight className="h-4 w-4" /></a>
      </PageHero>

      <section id="promotions" className="mx-auto mt-14 max-w-7xl scroll-mt-40 px-4">
        <SectionHeader eyebrow="Live campaigns" title="Active" accent="promotions" />
        <div className="grid gap-5 md:grid-cols-3">
          {promotions.map((p) => (
            <Link key={p.id} to={p.to} className="group relative isolate flex min-h-64 flex-col justify-end overflow-hidden rounded-[2rem] p-6 text-cream">
              {p.image && <img src={p.image} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover transition duration-700 group-hover:scale-110" />}
              <div className="absolute inset-0 -z-10 bg-gradient-to-t from-forest-950/90 via-forest-900/40 to-forest-800/30" />
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
        <SectionHeader eyebrow="Bulk ordering" title="How container" accent="orders work" />
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, title, body }, i) => (
            <li key={title} className="glass rounded-3xl p-5">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-forest-800 text-gold"><Icon className="h-5 w-5" /></span>
              <p className="mt-3 text-xs font-extrabold uppercase tracking-wider text-rust">Step {i + 1}</p>
              <p className="text-lg font-bold text-forest-800">{title}</p>
              <p className="mt-1 text-sm text-slate-600">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      {deals.length > 0 && (
        <section className="mx-auto mt-16 max-w-7xl px-4">
          <SectionHeader eyebrow="Marked down" title="On sale" accent="now" to="/shop" />
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">{deals.map((p) => <ProductCard key={p.slug} product={p} />)}</div>
        </section>
      )}
    </>
  )
}
