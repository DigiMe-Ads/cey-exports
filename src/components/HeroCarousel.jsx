import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { brands } from '../data/catalog'

function SlideProfile() {
  return (
    <div className="relative h-full">
      <img src="/cey/aerial.jpg" alt="Cey Exports farmland in Kandy" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-forest-950/85 via-forest-900/45 to-transparent" />
      <div className="relative flex h-full max-w-xl flex-col justify-center p-6 sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold">Export consolidator · Agricultural producer</p>
        <h1 className="mt-3 text-4xl font-medium leading-[1.05] text-cream sm:text-5xl lg:text-6xl">
          Sri Lanka's finest, <em className="text-gold">sourced</em> for the world.
        </h1>
        <p className="mt-4 max-w-md text-sm text-cream/80 sm:text-base">Premium Sri Lankan brands, spices and fresh produce for importers, distributors and wholesalers worldwide.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/shop" className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-bold text-forest-900 transition hover:bg-gold-dark">Shop the range <ArrowRight className="h-4 w-4" /></Link>
          <Link to="/contact" className="glass-dark inline-flex items-center rounded-full px-6 py-3 text-sm font-bold text-cream hover:bg-white/15">Request a quote</Link>
        </div>
      </div>
      <img src="/cey/logo-round.png" alt="" className="absolute bottom-6 right-6 hidden h-28 w-28 animate-float rounded-full ring-4 ring-gold md:block" />
    </div>
  )
}

function SlideOwnProducts() {
  const tiles = ['own-jams', 'own-mackerel', 'own-gingerbev', 'own-lankasoy']
  return (
    <div className="relative grid h-full items-center gap-6 overflow-hidden bg-sand p-6 sm:p-10 md:grid-cols-2">
      <div className="rings pointer-events-none absolute inset-0 opacity-70" />
      <div className="relative">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-rust">Now in the UAE</p>
        <h2 className="mt-3 text-4xl font-medium leading-tight text-forest-800 sm:text-5xl">Our very own <em className="text-rust">Sri Lankan</em> products</h2>
        <p className="mt-3 text-sm text-forest-800/75">Cloves · Cinnamon · Nutmeg · MD jams & cordials · Lanka Foods mackerel · Ginger beer · Highland · Lankasoy</p>
        <Link to="/brands" className="mt-6 inline-flex items-center gap-2 rounded-full bg-forest-800 px-6 py-3 text-sm font-bold text-cream hover:bg-forest-700">Explore our brands <ArrowRight className="h-4 w-4 text-gold" /></Link>
      </div>
      <div className="relative hidden grid-cols-2 gap-3 md:grid">
        {tiles.map((t, i) => (
          <div key={t} className={`glass overflow-hidden rounded-3xl p-2 ${i % 2 ? 'translate-y-6' : ''}`}>
            <img src={`/cey/${t}.jpg`} alt="" className="aspect-[4/3] w-full rounded-2xl object-cover" />
          </div>
        ))}
      </div>
    </div>
  )
}

function SlideFarm() {
  return (
    <div className="relative h-full">
      <img src="/cey/greenhouse.jpg" alt="Poly tunnel cultivation" className="absolute inset-0 h-full w-full object-cover object-[50%_40%]" />
      <div className="absolute inset-0 bg-gradient-to-l from-forest-950/85 via-forest-900/40 to-transparent" />
      <div className="relative ml-auto flex h-full max-w-lg flex-col justify-center p-6 text-right sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold">Kandy · Farm & poly tunnels</p>
        <h2 className="mt-3 text-4xl font-medium leading-tight text-cream sm:text-5xl">Grown under cover, <em className="text-gold">all year round</em></h2>
        <p className="mt-3 text-sm text-cream/80">A 31-acre landholding and a 25,000 sq ft poly tunnel complex for export-grade vegetables.</p>
        <Link to="/shop?category=fresh" className="mt-6 inline-flex items-center gap-2 self-end rounded-full bg-gold px-6 py-3 text-sm font-bold text-forest-900 hover:bg-gold-dark">Fresh produce <ArrowRight className="h-4 w-4" /></Link>
      </div>
    </div>
  )
}

function SlideImage({ src, alt, position = 'center' }) {
  return <img src={src} alt={alt} className="h-full w-full object-cover" style={{ objectPosition: position }} />
}

const slides = [
  <SlideProfile key="profile" />,
  <SlideImage key="grocery" src="/cey/grocery-banner.jpg" alt="Fresh fruits & vegetables, beverages and grocery" />,
  <SlideOwnProducts key="own" />,
  <SlideFarm key="farm" />,
  <SlideImage key="milco" src="/images/banner-milco.jpg" alt="Highland — pure Sri Lankan goodness" position="50% 30%" />,
]

// AKLife's signature: brand logos stacked on both sides of the slider. Here they drift slowly in glass rails.
function BrandRail({ items, reverse = false }) {
  const loop = [...items, ...items]
  return (
    <div className="glass relative hidden h-full w-[112px] shrink-0 overflow-hidden rounded-3xl xl:block">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b from-cream/90 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10 bg-gradient-to-t from-cream/90 to-transparent" />
      <div className={`flex flex-col gap-3 p-3 hover:[animation-play-state:paused] animate-marquee-y ${reverse ? '[animation-direction:reverse]' : ''}`}>
        {loop.map((b, i) => (
          <Link key={`${b.slug}-${i}`} to={`/shop?brand=${b.slug}`} title={b.name} className="grid h-16 place-items-center rounded-2xl bg-white p-2 shadow-sm ring-1 ring-black/5 transition hover:scale-105 hover:ring-gold">
            <img src={b.logo} alt={b.name} className="max-h-full max-w-full object-contain" />
          </Link>
        ))}
      </div>
    </div>
  )
}

export default function HeroCarousel() {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const n = slides.length
  useEffect(() => {
    if (paused) return
    const t = setInterval(() => setI((v) => (v + 1) % n), 6000)
    return () => clearInterval(t)
  }, [paused, n])

  const logos = brands.filter((b) => !b.own)
  const half = Math.ceil(logos.length / 2)

  return (
    <section className="mx-auto max-w-[1440px] px-4 pt-4">
      <div className="flex h-[480px] gap-4 sm:h-[460px]">
        <BrandRail items={logos.slice(0, half)} />
        <div className="relative min-w-0 flex-1 overflow-hidden rounded-[2rem] shadow-2xl shadow-forest-900/20 ring-1 ring-white/60" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <div className="flex h-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]" style={{ transform: `translateX(-${i * 100}%)` }}>
            {slides.map((s, idx) => (
              <div key={idx} className="h-full w-full shrink-0" aria-hidden={idx !== i}>{s}</div>
            ))}
          </div>
          <button type="button" aria-label="Previous slide" onClick={() => setI((i - 1 + n) % n)} className="glass absolute left-3 top-1/2 hidden sm:grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-forest-800 hover:bg-white">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button type="button" aria-label="Next slide" onClick={() => setI((i + 1) % n)} className="glass absolute right-3 top-1/2 hidden sm:grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-forest-800 hover:bg-white">
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="glass absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full px-3 py-2">
            {slides.map((_, idx) => (
              <button key={idx} type="button" aria-label={`Go to slide ${idx + 1}`} onClick={() => setI(idx)} className={`h-2 rounded-full transition-all ${idx === i ? 'w-7 bg-rust' : 'w-2 bg-forest-800/30 hover:bg-forest-800/60'}`} />
            ))}
          </div>
        </div>
        <BrandRail items={logos.slice(half)} reverse />
      </div>
    </section>
  )
}
