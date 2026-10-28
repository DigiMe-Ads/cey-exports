import { Link } from 'react-router-dom'
import { ChevronRight, Mail, MapPin, Phone, Send } from 'lucide-react'
import Logo from './Logo'
import { AppleIcon, FacebookIcon, InstagramIcon, PlayIcon, TelegramIcon, TikTokIcon, WhatsAppIcon } from './BrandIcons'
import { brands, categories, company } from '../data/catalog'

const col = (title, items) => (
  <div>
    <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-gold">{title}</h4>
    <ul className="space-y-2.5 text-sm text-cream/70">
      {items.map(([label, to]) => (
        <li key={label}><Link to={to} className="transition hover:text-gold">{label}</Link></li>
      ))}
    </ul>
  </div>
)

export default function Footer() {
  const institutions = brands.filter((b) => b.featured)
  return (
    <footer className="relative mt-28">
      {/* Newsletter card floating over the farm photo */}
      <div className="relative z-10 mx-auto -mb-20 max-w-6xl px-4">
        <div className="glass-strong flex flex-col items-center justify-between gap-6 rounded-[2rem] p-6 sm:p-8 md:flex-row">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-rust">Stay in the loop</p>
            <h3 className="mt-1 text-2xl font-medium text-forest-800">Harvest updates & <em className="text-rust">trade offers</em></h3>
            <p className="mt-1 text-sm text-slate-600">Monthly price lists, new brands and container schedules.</p>
          </div>
          <form onSubmit={(e) => e.preventDefault()} className="flex w-full max-w-md items-center rounded-full bg-white p-1.5 ring-1 ring-forest-100">
            <Mail className="ml-3 h-4 w-4 shrink-0 text-slate-400" />
            <input type="email" placeholder="you@company.com" className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none" />
            <button className="flex items-center gap-2 rounded-full bg-forest-800 px-5 py-3 text-sm font-bold text-cream hover:bg-forest-700">
              Subscribe <Send className="h-4 w-4 text-gold" />
            </button>
          </form>
        </div>
      </div>

      <div className="relative h-56 overflow-hidden sm:h-72">
        <img src="/cey/aerial.jpg" alt="Company farmland in Kandy" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-cream via-transparent to-forest-900" />
        <div className="absolute bottom-0 left-0 h-1.5 w-1/4 bg-gold" />
      </div>

      <div className="relative overflow-hidden bg-forest-900 text-cream">
        <div className="rings-tr pointer-events-none absolute -right-10 -top-10 h-96 w-96 opacity-60" />
        {/* AKLife social strip */}
        <div className="relative border-b border-white/10">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
            <div className="flex gap-2">
              {[FacebookIcon, InstagramIcon, TikTokIcon, WhatsAppIcon].map((Icon, i) => (
                <a key={i} href="#" aria-label="Social link" className="glass-dark grid h-10 w-10 place-items-center rounded-full transition hover:bg-gold hover:text-forest-900">
                  <Icon className="h-4 w-4 fill-current" />
                </a>
              ))}
            </div>
            <div className="flex gap-3 text-sm">
              <a href="#" className="glass-dark flex items-center gap-2 rounded-full px-4 py-2"><TelegramIcon className="h-4 w-4 fill-globe-blue" /> Telegram</a>
              <a href="#" className="glass-dark flex items-center gap-2 rounded-full px-4 py-2"><WhatsAppIcon className="h-4 w-4 fill-globe-green" /> WhatsApp</a>
            </div>
          </div>
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.4fr]">
          <div>
            <Logo light />
            <p className="mt-5 max-w-xs font-serif text-xl leading-snug">
              Sri Lanka's finest, <em className="text-gold">sourced</em> for the world.
            </p>
            <p className="mt-3 max-w-xs text-sm text-cream/60">A fully owned subsidiary of Lanka Foods Middle East LLC, UAE.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <a href="#" className="glass-dark flex items-center gap-2 rounded-xl px-3 py-2">
                <AppleIcon className="h-5 w-5 fill-cream" />
                <span className="leading-tight"><span className="block text-[10px] text-cream/60">Download on the</span><span className="text-sm font-bold">App Store</span></span>
              </a>
              <a href="#" className="glass-dark flex items-center gap-2 rounded-xl px-3 py-2">
                <PlayIcon className="h-5 w-5 fill-gold" />
                <span className="leading-tight"><span className="block text-[10px] text-cream/60">Get it on</span><span className="text-sm font-bold">Google Play</span></span>
              </a>
            </div>
          </div>
          {col('Our Products', categories.slice(0, 6).map((c) => [c.name, `/shop?category=${c.slug}`]))}
          {col('Company', [['About Us', '/about'], ['Our Facilities', '/about#facilities'], ['Brands', '/brands'], ['Offers', '/offers'], ['Blog', '/blogs'], ['Contact', '/contact']])}
          <div className="space-y-5">
            {company.offices.map((o) => (
              <div key={o.region}>
                <h4 className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-gold">{o.region}</h4>
                <ul className="space-y-1.5 text-sm text-cream/70">
                  <li className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> {o.address}</li>
                  <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-gold" /> {o.phone}</li>
                  <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-gold" /> {o.email}</li>
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* AKLife "Our institutions" chevron strip → core partner brands */}
        <div className="relative border-y border-white/10 bg-forest-950/60">
          <div className="no-scrollbar mx-auto flex max-w-7xl items-center gap-4 overflow-x-auto px-4 py-4">
            <span className="shrink-0 text-[11px] font-bold uppercase leading-tight tracking-widest text-gold/70">Core<br />Partners</span>
            {institutions.map((b) => (
              <span key={b.slug} className="flex shrink-0 items-center gap-4">
                <ChevronRight className="h-6 w-6 text-gold/30" />
                <Link to={`/shop?brand=${b.slug}`} className="grid h-12 w-20 place-items-center overflow-hidden rounded-xl bg-white p-1.5 opacity-75 grayscale transition hover:opacity-100 hover:grayscale-0">
                  <img src={b.logo} alt={b.name} className="max-h-full max-w-full object-contain" />
                </Link>
              </span>
            ))}
          </div>
        </div>

        <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-cream/55 md:flex-row">
          <p>© 2026 {company.legal} · Bankers: Hatton National Bank & Bank of Ceylon</p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            {['Become a Supplier', 'Private Label', 'Terms & Conditions', 'Privacy Policy', 'Cookie Policy'].map((l) => (
              <a key={l} href="#" className="hover:text-gold">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
