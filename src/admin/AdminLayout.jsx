import { useState } from 'react'
import { Link, Navigate, NavLink, Outlet } from 'react-router-dom'
import { BookOpen, Box, ClipboardList, ExternalLink, FolderTree, Inbox, LayoutDashboard, LogOut, Megaphone, Menu, Package, Tag, Users, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const nav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/inquiries', label: 'Inquiries', icon: ClipboardList },
  { to: '/admin/messages', label: 'Messages', icon: Inbox },
  { to: '/admin/products', label: 'Products & stock', icon: Package },
  { to: '/admin/containers', label: 'Containers', icon: Box },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree },
  { to: '/admin/brands', label: 'Brands', icon: Tag },
  { to: '/admin/promotions', label: 'Promotions', icon: Megaphone },
  { to: '/admin/blogs', label: 'Blog posts', icon: BookOpen },
  { to: '/admin/customers', label: 'Customers', icon: Users },
]

export default function AdminLayout() {
  const { ready, user, profile, isAdmin, signOut } = useAuth()
  const [open, setOpen] = useState(false)

  if (!ready || (user && !profile)) return <div className="grid min-h-screen place-items-center text-sm text-slate-500">Loading…</div>
  if (!user) return <Navigate to="/login?next=/admin" replace />
  if (!isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center px-4 text-center">
        <div>
          <p className="font-serif text-3xl text-forest-800">Admins only</p>
          <p className="mt-2 text-sm text-slate-600">You're signed in as {user.email}, which doesn't have admin access.</p>
          <Link to="/" className="mt-5 inline-block rounded-full bg-forest-800 px-6 py-3 text-sm font-bold text-cream">Back to the store</Link>
        </div>
      </div>
    )
  }

  const sidebar = (
    <nav className="flex h-full flex-col">
      <Link to="/admin" className="flex items-center gap-2.5 px-2">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-white"><img src="/cey/globe.png" alt="" className="h-7 w-7" /></span>
        <span className="leading-none">
          <span className="block font-serif text-lg font-semibold text-cream">Cey <strong className="font-bold text-gold">Exports</strong></span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-cream/50">Admin panel</span>
        </span>
      </Link>
      <ul className="mt-8 space-y-1">
        {nav.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition ${isActive ? 'bg-cream text-forest-800' : 'text-cream/75 hover:bg-white/10 hover:text-cream'}`}
            >
              <Icon className="h-4 w-4" /> {label}
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="mt-auto space-y-1 border-t border-white/10 pt-4">
        <Link to="/" className="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold text-cream/75 hover:bg-white/10"><ExternalLink className="h-4 w-4" /> View store</Link>
        <button type="button" onClick={signOut} className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold text-cream/75 hover:bg-white/10"><LogOut className="h-4 w-4" /> Sign out</button>
        <p className="truncate px-3 pt-2 text-[11px] text-cream/40">{user.email}</p>
      </div>
    </nav>
  )

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="sticky top-0 hidden h-screen bg-forest-900 p-5 lg:block">{sidebar}</aside>
      <header className="sticky top-0 z-30 flex items-center justify-between bg-forest-900 px-4 py-3 lg:hidden">
        <span className="font-serif text-lg text-cream">Cey <strong className="font-bold text-gold">Admin</strong></span>
        <button type="button" aria-label="Open menu" onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-cream"><Menu className="h-5 w-5" /></button>
      </header>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="absolute inset-0 bg-black/40" />
          <aside className="absolute inset-y-0 left-0 w-72 bg-forest-900 p-5">
            <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="absolute right-4 top-4 text-cream"><X className="h-5 w-5" /></button>
            {sidebar}
          </aside>
        </div>
      )}
      <main className="min-w-0 p-4 sm:p-6 lg:p-8"><Outlet /></main>
    </div>
  )
}

export function AdminTitle({ title, subtitle, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-3xl font-medium text-forest-800">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}
