import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Box, ChevronDown, Handshake, Headphones, LayoutGrid, Menu, Phone, Search, ShieldCheck, User, X } from 'lucide-react'
import { FillRing } from './ContainerMeter'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'
import { TelegramIcon, WhatsAppIcon } from './BrandIcons'
import { useCatalog } from '../context/CatalogContext'
import { useCart } from '../context/CartContext'

export const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/offers', label: 'Offers' },
  { to: '/brands', label: 'Brands' },
  { to: '/about', label: 'About' },
  { to: '/blogs', label: 'Blogs' },
  { to: '/contact', label: 'Contact' },
]

function UtilityBar() {
  const { user } = useAuth()
  // AKLife's top strip: quick-contact channels left, currency / language / login right
  return (
    <div className="bg-forest-950 text-[12px] text-cream/80">
      <div className="mx-auto flex h-10 max-w-7xl items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-1 sm:gap-4">
          <a href="#" className="flex items-center gap-1.5 rounded-full px-2 py-1 transition hover:bg-white/10">
            <span className="grid h-5 w-5 place-items-center rounded-md bg-globe-blue text-white"><TelegramIcon className="h-3 w-3 fill-current" /></span>
            <span className="hidden sm:inline">Telegram</span>
          </a>
          <a href="#" className="flex items-center gap-1.5 rounded-full px-2 py-1 transition hover:bg-white/10">
            <span className="grid h-5 w-5 place-items-center rounded-md bg-globe-green text-white"><WhatsAppIcon className="h-3 w-3 fill-current" /></span>
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
          <a href="tel:+971501639820" className="flex items-center gap-1.5 rounded-full px-2 py-1 transition hover:bg-white/10">
            <span className="grid h-5 w-5 place-items-center rounded-md bg-gold text-forest-900"><Headphones className="h-3 w-3" /></span>
            <span className="hidden sm:inline">Support Line</span>
          </a>
        </div>
        <p className="hidden tracking-wide lg:block">
          A fully owned subsidiary of <b className="font-semibold text-cream">Lanka Foods Middle East LLC, UAE</b>
        </p>
        <div className="flex items-center gap-2 sm:gap-3">
          <label className="flex items-center gap-1.5">
            <span className="hidden font-bold uppercase tracking-wider text-gold/80 sm:inline">Currency</span>
            <select className="rounded-md border border-white/15 bg-white/10 px-1.5 py-0.5 font-semibold text-cream outline-none" defaultValue="AED" aria-label="Currency">
              <option className="text-ink">AED</option><option className="text-ink">USD</option><option className="text-ink">LKR</option><option className="text-ink">AUD</option>
            </select>
          </label>
          <select className="rounded-md border border-white/15 bg-white/10 px-1.5 py-0.5 font-semibold text-cream outline-none" defaultValue="EN" aria-label="Language">
            <option className="text-ink">EN</option><option className="text-ink">AR</option><option className="text-ink">SI</option>
          </select>
          <Link to={user ? '/account' : '/login'} className="hidden font-bold uppercase tracking-wider text-cream hover:text-gold sm:inline">{user ? 'My account' : 'Login'}</Link>
        </div>
      </div>
    </div>
  )
}

function SearchBar({ className = '' }) {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')
  const { categories } = useCatalog()
  const submit = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (cat) params.set('category', cat)
    navigate(`/shop?${params}`)
  }
  return (
    <form onSubmit={submit} className={`glass-strong flex h-12 items-center overflow-hidden rounded-full p-1 ${className}`}>
      <div className="relative hidden md:block">
        <select value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Category" className="h-10 appearance-none rounded-full bg-forest-800 pl-4 pr-8 text-sm font-semibold text-cream outline-none">
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-3 h-4 w-4 text-cream" />
      </div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Can't find a product? Search, or ask us on WhatsApp…"
        className="h-10 min-w-0 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-slate-400"
      />
      <button type="submit" aria-label="Search" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold text-forest-900 transition hover:bg-gold-dark">
        <Search className="h-4 w-4" />
      </button>
    </form>
  )
}

function CategoryMenu() {
  const [open, setOpen] = useState(false)
  const { categories, countIn } = useCatalog()
  const { pathname, search } = useLocation()
  useEffect(() => {
    setOpen(false)
  }, [pathname, search])
  return (
    <div className="relative" onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        className="flex h-11 items-center gap-2 rounded-full bg-gold px-5 text-sm font-bold text-forest-900 transition hover:bg-gold-dark"
      >
        <LayoutGrid className="h-4 w-4" /> Our Products <ChevronDown className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 pt-3">
          <div className="glass-strong grid w-[min(92vw,640px)] animate-pop grid-cols-2 gap-1 rounded-3xl p-3">
            {categories.map((c) => (
              <Link key={c.slug} to={`/shop?category=${c.slug}`} className="group flex items-center gap-3 rounded-2xl p-2 transition hover:bg-forest-50">
                <img src={c.image} alt="" className="h-12 w-12 rounded-xl object-cover ring-1 ring-forest-100" />
                <span>
                  <span className="block text-sm font-bold text-ink group-hover:text-forest-700">{c.name}</span>
                  <span className="text-xs text-slate-500">{countIn(c.slug)} products</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Header() {
  const { count, openDrawer, stats } = useCart()
  const { user, isAdmin } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { categories } = useCatalog()
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <UtilityBar />
      <header className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? 'glass-strong rounded-none border-x-0 border-t-0' : 'bg-cream/50 backdrop-blur-md'}`}>
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 lg:gap-6">
          <button type="button" aria-label="Open menu" onClick={() => setMobileOpen(true)} className="grid h-10 w-10 place-items-center rounded-full bg-white/70 text-forest-800 lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/" className="shrink-0"><Logo /></Link>
          <SearchBar className="hidden flex-1 lg:flex" />
          {/* AKLife's "Be our dealer" call-out, reworded for Cey Exports buyers */}
          <Link to="/contact" className="group hidden items-center gap-3 xl:flex">
            <span className="text-right leading-tight">
              <span className="block text-sm font-extrabold uppercase tracking-wide text-forest-800">Become a Buyer</span>
              <span className="text-xs text-slate-500">Importers, distributors & wholesalers</span>
            </span>
            <span className="grid h-11 w-11 place-items-center rounded-full border-2 border-gold text-rust transition group-hover:bg-gold group-hover:text-forest-900">
              <Handshake className="h-5 w-5" />
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <a href="tel:+971501639820" className="hidden h-10 items-center gap-2 rounded-full bg-forest-800 px-4 text-sm font-bold text-cream shadow-lg shadow-forest-800/25 md:flex 2xl:flex xl:hidden">
              <Phone className="h-4 w-4 text-gold" /> +971 50 163 9820
            </a>
            {isAdmin && (
              <Link to="/admin" aria-label="Admin panel" title="Admin panel" className="hidden h-10 items-center gap-1.5 rounded-full bg-rust px-3 text-xs font-bold text-cream sm:flex">
                <ShieldCheck className="h-4 w-4" /> Admin
              </Link>
            )}
            <Link to={user ? '/account' : '/login'} aria-label={user ? 'My account' : 'Sign in'} title={user ? 'My account' : 'Sign in'} className="glass hidden h-10 w-10 place-items-center rounded-full text-forest-800 sm:grid">
              <User className="h-5 w-5" />
            </Link>
            {/* Container fill ring replaces the cart icon */}
            <button type="button" onClick={openDrawer} aria-label={`Open container plan, ${Math.round(stats.fill)} percent full`} className="flex h-11 items-center gap-2 rounded-full bg-white/80 py-0.5 pl-0.5 pr-3 shadow-lg shadow-forest-800/10 ring-1 ring-forest-100 transition hover:bg-white">
              <span className="relative grid h-10 w-10 place-items-center">
                <FillRing pct={stats.fill} ready={stats.canCheckout} />
                <Box className="h-4 w-4 text-forest-800" />
              </span>
              <span className="text-left leading-none">
                <span className={`block text-sm font-extrabold ${stats.canCheckout ? 'text-leaf' : 'text-forest-800'}`}>{Math.round(stats.fill)}%</span>
                <span className="text-[10px] font-semibold text-slate-500">{count ? `${count.toLocaleString()} ctns` : 'Container'}</span>
              </span>
            </button>
          </div>
        </div>
        <div className="px-4 pb-3 lg:hidden"><SearchBar /></div>

        {/* AKLife's dark category strip, reborn as a floating forest-glass pill */}
        <nav className="mx-auto hidden max-w-7xl px-4 pb-3 lg:block">
          <div className="glass-forest flex items-center justify-between rounded-full p-1.5">
            <CategoryMenu />
            <ul className="flex items-center gap-0.5">
              {navLinks.map((l) => (
                <li key={l.to}>
                  <NavLink
                    to={l.to}
                    end={l.to === '/'}
                    className={({ isActive }) =>
                      `rounded-full px-3.5 py-2.5 text-[13px] font-bold uppercase tracking-wider transition xl:px-4 ${isActive ? 'bg-cream text-forest-800 shadow' : 'text-cream/80 hover:bg-white/10 hover:text-cream'}`
                    }
                  >
                    {l.label}
                  </NavLink>
                </li>
              ))}
            </ul>
            <Link to="/contact" className="mr-1 hidden rounded-full border border-gold/60 px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-gold transition hover:bg-gold hover:text-forest-900 xl:block">
              Request a Quote
            </Link>
          </div>
        </nav>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-forest-950/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="glass-strong absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col overflow-y-auto rounded-r-3xl p-5">
            <div className="mb-6 flex items-center justify-between">
              <Logo />
              <button type="button" aria-label="Close menu" onClick={() => setMobileOpen(false)} className="grid h-10 w-10 place-items-center rounded-full bg-forest-50 text-forest-800"><X className="h-5 w-5" /></button>
            </div>
            <ul className="space-y-1">
              {navLinks.map((l) => (
                <li key={l.to}>
                  <NavLink to={l.to} end={l.to === '/'} className={({ isActive }) => `block rounded-2xl px-4 py-3 font-bold ${isActive ? 'bg-forest-800 text-cream' : 'text-ink hover:bg-forest-50'}`}>
                    {l.label}
                  </NavLink>
                </li>
              ))}
            </ul>
            <p className="mb-2 mt-6 px-1 text-xs font-bold uppercase tracking-widest text-rust">Our Products</p>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((c) => (
                <Link key={c.slug} to={`/shop?category=${c.slug}`} className="flex items-center gap-2 rounded-2xl bg-white/70 p-2 text-xs font-bold">
                  <img src={c.image} alt="" className="h-8 w-8 rounded-lg object-cover" /> {c.name}
                </Link>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-2">
              <Link to={user ? '/account' : '/login'} className="flex items-center justify-center gap-2 rounded-2xl bg-white/80 p-3 text-sm font-bold text-forest-800"><User className="h-4 w-4" /> {user ? 'My account' : 'Sign in'}</Link>
              {isAdmin && <Link to="/admin" className="flex items-center justify-center gap-2 rounded-2xl bg-rust p-3 text-sm font-bold text-cream"><ShieldCheck className="h-4 w-4" /> Admin</Link>}
            </div>
            <Link to="/contact" className="mt-3 flex items-center gap-3 rounded-2xl bg-forest-800 p-4 text-cream">
              <Handshake className="h-6 w-6 text-gold" />
              <span><span className="block font-bold">Become a Buyer</span><span className="text-xs text-cream/70">Importers, distributors & wholesalers</span></span>
            </Link>
          </aside>
        </div>
      )}
    </>
  )
}
