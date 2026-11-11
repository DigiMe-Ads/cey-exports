import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowRight, Box, ClipboardList, Inbox, Package, Users } from 'lucide-react'
import { AdminTitle } from './AdminLayout'
import StatusBadge from '../components/StatusBadge'
import { inquiryRef, supabase } from '../lib/supabase'

const LOW_STOCK = 20

export function Dashboard() {
  const [d, setD] = useState(null)
  useEffect(() => {
    Promise.all([
      supabase.from('inquiries').select('id, ref_no, status, contact_name, company, container_name, fill_pct, created_at').order('created_at', { ascending: false }),
      supabase.from('products').select('id, name, stock, image_url, is_active').order('stock'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
      supabase.from('containers').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('contact_messages').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    ]).then(([inq, prods, cust, conts, msgs]) => setD({ inq: inq.data ?? [], prods: prods.data ?? [], customers: cust.count ?? 0, containers: conts.count ?? 0, messages: msgs.count ?? 0 }))
  }, [])

  if (!d) return <p className="text-sm text-slate-500">Loading…</p>
  const newCount = d.inq.filter((i) => i.status === 'new').length
  const open = d.inq.filter((i) => !['completed', 'cancelled'].includes(i.status)).length
  const low = d.prods.filter((p) => p.is_active && p.stock <= LOW_STOCK)
  const cards = [
    { label: 'New inquiries', value: newCount, icon: ClipboardList, to: '/admin/inquiries', hot: newCount > 0 },
    { label: 'Open inquiries', value: open, icon: ClipboardList, to: '/admin/inquiries' },
    { label: 'New messages', value: d.messages, icon: Inbox, to: '/admin/messages', hot: d.messages > 0 },
    { label: 'Products', value: d.prods.length, icon: Package, to: '/admin/products' },
    { label: 'Customers', value: d.customers, icon: Users, to: '/admin/customers' },
    { label: 'Active containers', value: d.containers, icon: Box, to: '/admin/containers' },
  ]

  return (
    <>
      <AdminTitle title="Dashboard" subtitle="Inquiries, stock and catalogue at a glance." />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {cards.map(({ label, value, icon: Icon, to, hot }) => (
          <Link key={label} to={to} className={`rounded-3xl p-4 transition hover:-translate-y-0.5 ${hot ? 'bg-forest-800 text-cream' : 'glass'}`}>
            <Icon className={`h-5 w-5 ${hot ? 'text-gold' : 'text-rust'}`} />
            <p className={`mt-3 font-serif text-4xl ${hot ? '' : 'text-forest-800'}`}>{value}</p>
            <p className={`text-xs ${hot ? 'text-cream/70' : 'text-slate-500'}`}>{label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="glass overflow-hidden rounded-3xl">
          <div className="flex items-center justify-between border-b border-forest-800/10 px-5 py-4">
            <p className="font-extrabold text-forest-800">Latest inquiries</p>
            <Link to="/admin/inquiries" className="flex items-center gap-1 text-xs font-bold text-rust">All <ArrowRight className="h-3 w-3" /></Link>
          </div>
          <ul className="divide-y divide-forest-800/5">
            {d.inq.slice(0, 6).map((i) => (
              <li key={i.id}>
                <Link to={`/admin/inquiries/${i.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-white/60">
                  <span className="font-mono text-sm font-bold text-forest-800">{inquiryRef(i.ref_no)}</span>
                  <span className="min-w-0 flex-1 truncate text-sm">{i.company || i.contact_name} · {i.container_name} · {Number(i.fill_pct).toFixed(0)}%</span>
                  <StatusBadge status={i.status} />
                </Link>
              </li>
            ))}
            {d.inq.length === 0 && <li className="p-6 text-center text-sm text-slate-500">No inquiries yet.</li>}
          </ul>
        </div>

        <div className="glass overflow-hidden rounded-3xl">
          <div className="flex items-center justify-between border-b border-forest-800/10 px-5 py-4">
            <p className="flex items-center gap-2 font-extrabold text-forest-800"><AlertTriangle className="h-4 w-4 text-rust" /> Low stock (≤ {LOW_STOCK} cartons)</p>
            <Link to="/admin/products" className="flex items-center gap-1 text-xs font-bold text-rust">Manage <ArrowRight className="h-3 w-3" /></Link>
          </div>
          <ul className="divide-y divide-forest-800/5">
            {low.map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-5 py-2.5">
                {p.image_url && <img src={p.image_url} alt="" className="h-9 w-9 rounded-lg object-cover" />}
                <span className="min-w-0 flex-1 truncate text-sm">{p.name}</span>
                <span className={`text-sm font-bold ${p.stock <= 0 ? 'text-rust' : 'text-gold-dark'}`}>{p.stock}</span>
              </li>
            ))}
            {low.length === 0 && <li className="p-6 text-center text-sm text-slate-500">All products are well stocked.</li>}
          </ul>
        </div>
      </div>
    </>
  )
}

export function CustomersAdmin() {
  const [rows, setRows] = useState(null)
  const [counts, setCounts] = useState({})
  const [error, setError] = useState(null)
  const load = async () => {
    const [{ data: p }, { data: i }] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('inquiries').select('user_id'),
    ])
    setRows(p ?? [])
    const c = {}
    for (const r of i ?? []) c[r.user_id] = (c[r.user_id] ?? 0) + 1
    setCounts(c)
  }
  useEffect(() => {
    load()
  }, [])

  const setRole = async (row, role) => {
    if (role === 'admin' && !window.confirm(`Give ${row.email} full admin access?`)) return
    const { error: err } = await supabase.from('profiles').update({ role }).eq('id', row.id)
    if (err) setError(err.message)
    load()
  }

  return (
    <>
      <AdminTitle title="Customers" subtitle="Everyone with an account. Promote a teammate to admin here." />
      {error && <p className="mb-4 rounded-2xl bg-rust/10 p-3 text-sm font-semibold text-rust">{error}</p>}
      <div className="glass overflow-x-auto rounded-3xl">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-forest-800/10 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3">Name</th><th className="px-4 py-3">Company</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3">Inquiries</th><th className="px-4 py-3">Joined</th><th className="px-4 py-3">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-forest-800/5">
            {!rows && <tr><td colSpan={6} className="p-8 text-center text-slate-500">Loading…</td></tr>}
            {rows?.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3 font-semibold">{r.full_name || '—'}</td>
                <td className="px-4 py-3">{r.company || '—'}<p className="text-[11px] text-slate-500">{r.country}</p></td>
                <td className="px-4 py-3"><p>{r.email}</p><p className="text-[11px] text-slate-500">{r.phone}</p></td>
                <td className="px-4 py-3 font-bold">{counts[r.id] ?? 0}</td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">{new Date(r.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <select value={r.role} onChange={(e) => setRole(r, e.target.value)} className={`rounded-lg px-2 py-1 text-xs font-bold ring-1 ${r.role === 'admin' ? 'bg-rust/10 text-rust ring-rust/30' : 'bg-white ring-forest-100'}`}>
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
