import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, BadgeCheck, Leaf, ShieldCheck, Ship, Truck } from 'lucide-react'
import HeroCarousel from '../components/HeroCarousel'
import ProductCard from '../components/ProductCard'
import SectionHeader from '../components/SectionHeader'
import { blogs, brands, categories, company, countIn, products } from '../data/catalog'

const perks = [
  { icon: BadgeCheck, title: 'Authentic Sri Lankan', body: 'Direct from growers & brands' },
  { icon: ShieldCheck, title: 'Inspected every shipment', body: 'Quality checked before dispatch' },
  { icon: Truck, title: 'UAE delivery', body: 'Via Lanka Foods Middle East' },
  { icon: Ship, title: 'Export worldwide', body: 'Middle East · Australia & more' },
]

function PromoStrip() {
  // AKLife's full-width brand strip under the slider ("Happiness in every spoonful")
  return (
    <section className="mx-auto mt-5 max-w-7xl px-4">
      <Link to="/product/ginger-bev" className="group relative flex items-center overflow-hidden rounded-[2rem] bg-gradient-to-r from-gold via-[#eebc72] to-gold-dark p-4 shadow-xl shadow-gold/30 sm:p-5">
        <div className="rings pointer-events-none absolute inset-0 opacity-40" />
        <img src="/cey/own-gingerbev.jpg" alt="" className="relative hidden h-24 w-24 rounded-2xl object-cover shadow-lg ring-4 ring-white/60 sm:block" />
        <div className="relative flex-1 px-2 text-center sm:px-6">
          <p className="font-serif text-2xl font-medium italic text-forest-900 sm:text-4xl">“Happiness in every sip!”</p>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-forest-800/80 sm:text-sm">Elephant House Ginger Bev · 8 pack only AED 60</p>
        </div>
        <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-full bg-forest-800 text-gold transition group-hover:scale-110">
          <ArrowRight className="h-5 w-5" />
        </span>
      </Link>
    </section>
  )
}

function Perks() {
  return (
    <section className="mx-auto mt-5 max-w-7xl px-4">
      <div className="glass grid grid-cols-2 divide-forest-800/10 rounded-3xl lg:grid-cols-4 lg:divide-x">
        {perks.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex items-center gap-3 p-3 sm:p-5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-forest-800 text-gold"><Icon className="h-5 w-5" /></span>
            <span>
              <span className="block text-sm font-bold text-forest-800">{title}</span>
              <span className="hidden text-xs text-slate-500 sm:block">{body}</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

function Pillars() {
  return (
    <section className="mx-auto mt-20 max-w-7xl px-4">
      <SectionHeader eyebrow="What we do" title="From the spice garden to the" accent="supermarket shelf" />
      <div className="grid gap-5 md:grid-cols-3">
        {company.pillars.map((p) => (
          <Link key={p.no} to={p.to} className="group relative isolate flex min-h-80 flex-col justify-end overflow-hidden rounded-[2rem] p-6 text-cream">
            <img src={p.image} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover transition duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-forest-950/95 via-forest-900/50 to-transparent" />
            <span className="font-serif text-5xl text-gold">{p.no}</span>
            <h3 className="mt-2 text-2xl font-medium">{p.title}</h3>
            <p className="mt-2 text-sm text-cream/75">{p.body}</p>
            <span className="glass-dark absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full transition group-hover:bg-gold group-hover:text-forest-900">
              <ArrowUpRight className="h-5 w-5" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}

function Categories() {
  return (
    <section className="mx-auto mt-20 max-w-7xl px-4">
      <SectionHeader eyebrow="Our products" title="Shop by" accent="category" to="/shop" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {categories.map((c) => (
          <Link key={c.slug} to={`/shop?category=${c.slug}`} className="glass group flex items-center gap-3 rounded-3xl p-2.5 pr-4 transition hover:-translate-y-0.5 hover:bg-white">
            <img src={c.image} alt="" className="h-16 w-16 shrink-0 rounded-2xl object-cover sm:h-20 sm:w-20" />
            <span className="min-w-0">
              <span className="block text-sm font-bold leading-tight text-forest-800 sm:text-base">{c.name}</span>
              <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-rust">{countIn(c.slug)} items <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" /></span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}

function FeaturedProducts() {
  const tabs = [{ key: 'all', label: 'All' }, ...categories.slice(0, 4).map((c) => ({ key: c.slug, label: c.name }))]
  const [tab, setTab] = useState('all')
  const list = products.filter((p) => p.tags?.includes('featured') && (tab === 'all' || p.category === tab)).slice(0, 8)
  return (
    <section className="mx-auto mt-20 max-w-7xl px-4">
      <SectionHeader eyebrow="Hand-picked" title="Featured" accent="products" to="/shop" />
      <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4">
        {tabs.map((t) => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${tab === t.key ? 'bg-forest-800 text-cream shadow-lg shadow-forest-800/20' : 'glass text-forest-800 hover:bg-white'}`}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {list.map((p) => <ProductCard key={p.slug} product={p} />)}
      </div>
    </section>
  )
}

function AboutBand() {
  return (
    <section className="mx-auto mt-24 max-w-7xl px-4">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-forest-800 p-6 text-cream sm:p-12">
        <div className="rings pointer-events-none absolute inset-0" />
        <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">About the company</p>
            <h2 className="mt-3 text-4xl font-medium leading-tight sm:text-5xl">Source any Sri Lankan brand — <em className="text-gold">under one roof.</em></h2>
            <p className="mt-5 max-w-xl text-cream/75">
              Ceylon International Exports (Pvt) Ltd is a Sri Lankan export consolidator and agricultural producer — a fully owned subsidiary of Lanka Foods Middle East LLC, UAE — delivering premium local brands and high-quality produce to global markets.
            </p>
            <Link to="/about" className="mt-7 inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-bold text-forest-900 hover:bg-gold-dark">Our story <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <img src="/cey/team.jpg" alt="The Cey Exports team" className="col-span-2 aspect-[16/8] w-full rounded-3xl object-cover ring-1 ring-white/10" />
            {company.stats.map((s, i) => (
              <div key={s.value} className="glass-dark rounded-3xl p-4">
                <p className={`font-serif text-4xl ${i % 2 ? 'text-gold' : 'text-cream'}`}>{s.value}</p>
                <p className="mt-1 text-xs leading-snug text-cream/65">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function BestSellers() {
  const list = products.filter((p) => p.tags?.includes('best')).slice(0, 8)
  return (
    <section className="mx-auto mt-24 max-w-7xl px-4">
      <SectionHeader eyebrow="Most ordered" title="Best" accent="sellers" to="/shop?sort=popular" />
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {list.map((p) => <ProductCard key={p.slug} product={p} />)}
      </div>
    </section>
  )
}

function BrandWall() {
  const logos = brands.filter((b) => !b.own)
  return (
    <section className="mx-auto mt-24 max-w-7xl px-4">
      <SectionHeader eyebrow="Brands we consolidate" title="Your gateway to Sri Lanka's" accent="finest brands" to="/brands" cta="All brands" />
      <div className="glass-strong relative overflow-hidden rounded-[2rem] border-t-4 border-t-gold p-5 sm:p-8">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-6">
          {logos.map((b) => (
            <Link key={b.slug} to={`/shop?brand=${b.slug}`} title={b.name} className="group grid h-20 place-items-center rounded-2xl bg-white p-3 ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-lg hover:ring-gold sm:h-24">
              <img src={b.logo} alt={b.name} className="max-h-full max-w-full object-contain transition group-hover:scale-105" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function Process() {
  return (
    <section className="mx-auto mt-24 max-w-7xl px-4">
      <SectionHeader eyebrow="Our export process" title="From grower" accent="to buyer" />
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {company.process.map((p, i) => {
          const last = i === company.process.length - 1
          return (
            <li key={p.step} className={`relative rounded-3xl border-t-4 p-5 ${last ? 'border-gold bg-forest-800 text-cream' : 'glass border-t-rust'}`}>
              <p className={`text-xs font-extrabold uppercase tracking-wider ${last ? 'text-gold' : 'text-rust'}`}>Step {i + 1}</p>
              <p className={`mt-2 text-xl font-bold ${last ? '' : 'text-forest-800'}`}>{p.step}</p>
              <p className={`mt-1 text-sm ${last ? 'text-cream/75' : 'text-slate-600'}`}>{p.body}</p>
              {!last && <ArrowRight className="absolute -right-3 top-1/2 z-10 hidden h-6 w-6 -translate-y-1/2 rounded-full bg-gold p-1 text-forest-900 lg:block" />}
            </li>
          )
        })}
      </ol>
    </section>
  )
}

function Gallery() {
  const g = company.gallery
  return (
    <section className="mx-auto mt-24 max-w-7xl px-4">
      <SectionHeader eyebrow="Sri Lanka · UAE" title="Our operations" accent="in pictures" to="/about" cta="About us" />
      <div className="grid auto-rows-[160px] grid-cols-2 gap-3 md:grid-cols-4 md:auto-rows-[190px]">
        {g.map((item, i) => (
          <figure key={item.image} className={`group relative overflow-hidden rounded-3xl ${i === 0 ? 'row-span-2' : ''} ${i === 4 ? 'md:col-span-2' : ''}`}>
            <img src={item.image} alt={item.caption} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
            <figcaption className="glass-strong absolute bottom-2 left-2 rounded-full px-3 py-1 text-[11px] font-bold text-forest-800 opacity-0 transition group-hover:opacity-100">
              {item.caption}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

function LatestBlogs() {
  return (
    <section className="mx-auto mt-24 max-w-7xl px-4">
      <SectionHeader eyebrow="Journal" title="Stories from the" accent="island" to="/blogs" />
      <div className="grid gap-5 md:grid-cols-3">
        {blogs.slice(0, 3).map((b) => (
          <Link key={b.slug} to="/blogs" className="glass group overflow-hidden rounded-[2rem] p-3">
            <div className="overflow-hidden rounded-3xl"><img src={b.image} alt="" className="aspect-[16/10] w-full object-cover transition duration-700 group-hover:scale-105" /></div>
            <div className="p-3">
              <p className="text-xs font-bold text-rust">{b.category} · {b.read} read</p>
              <h3 className="mt-2 text-xl font-medium leading-snug text-forest-800">{b.title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <>
      <HeroCarousel />
      <PromoStrip />
      <Perks />
      <Pillars />
      <Categories />
      <FeaturedProducts />
      <AboutBand />
      <BestSellers />
      <BrandWall />
      <Process />
      <Gallery />
      <LatestBlogs />
      <div className="mt-6 flex justify-center"><Leaf className="h-5 w-5 text-leaf/60" /></div>
    </>
  )
}
