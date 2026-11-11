import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, Box, ChevronRight, LogOut, Save } from 'lucide-react'
import StatusBadge, { STATUSES, statusOf } from '../components/StatusBadge'
import { useAuth } from '../context/AuthContext'
import { formatAED } from '../data/catalog'
import { fmtKg, fmtM3 } from '../lib/container'
import { inquiryRef, supabase } from '../lib/supabase'

const field = 'w-full rounded-2xl bg-white/90 px-4 py-2.5 text-sm outline-none ring-1 ring-forest-100 focus:ring-2 focus:ring-gold'
const fmtDate = (d) => new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })

export function RequireAuth({ children }) {
  const { ready, user } = useAuth()
  if (!ready) return null
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(window.location.hash.slice(1) || '/account')}`} replace />
  return children
}

function ProfileCard() {
  const { profile, refreshProfile, signOut } = useAuth()
  const [form, setForm] = useState(null)
  const [saved, setSaved] = useState(false)
  useEffect(() => {
    if (profile) setForm({ full_name: profile.full_name ?? '', company: profile.company ?? '', phone: profile.phone ?? '', country: profile.country ?? '' })
  }, [profile])
  if (!form) return null
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const save = async (e) => {
    e.preventDefault()
    await supabase.from('profiles').update(form).eq('id', profile.id)
    await refreshProfile()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }
  return (
    <form onSubmit={save} className="glass-strong space-y-3 rounded-[2rem] p-6">
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-forest-800 font-serif text-xl text-gold">{(form.full_name || profile.email || '?')[0].toUpperCase()}</span>
        <div className="min-w-0">
          <p className="truncate font-bold text-forest-800">{form.full_name || 'Your profile'}</p>
          <p className="truncate text-xs text-slate-500">{profile.email}</p>
        </div>
      </div>
      {[['full_name', 'Full name'], ['company', 'Company'], ['phone', 'Phone / WhatsApp'], ['country', 'Country']].map(([k, label]) => (
        <label key={k} className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-500">{label}</span>
          <input className={field} value={form[k]} onChange={set(k)} />
        </label>
      ))}
      <button className="flex w-full items-center justify-center gap-2 rounded-full bg-forest-800 py-2.5 text-sm font-bold text-cream">
        <Save className="h-4 w-4 text-gold" /> {saved ? 'Saved' : 'Save profile'}
      </button>
      <button type="button" onClick={signOut} className="flex w-full items-center justify-center gap-2 rounded-full py-2 text-sm font-bold text-rust hover:bg-rust/10">
        <LogOut className="h-4 w-4" /> Sign out
      </button>
    </form>
  )
}

export function Account() {
  const { user } = useAuth()
  const [rows, setRows] = useState(null)
  useEffect(() => {
    supabase
      .from('inquiries')
      .select('id, ref_no, status, container_name, fill_pct, total_volume_cm3, created_at, updated_at, inquiry_items(qty)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setRows(data ?? []))
  }, [user.id])

  const open = rows?.filter((r) => !['completed', 'cancelled'].includes(r.status)).length ?? 0
  return (
    <div className="mx-auto max-w-7xl px-4 pt-8">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-rust">My account</p>
      <h1 className="text-4xl font-medium text-forest-800">Your <em className="text-rust">inquiries</em></h1>
      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[['Total', rows?.length ?? '—'], ['Open', open], ['Completed', rows?.filter((r) => r.status === 'completed').length ?? 0]].map(([k, v]) => (
              <div key={k} className="glass rounded-3xl p-4"><p className="font-serif text-3xl text-forest-800">{v}</p><p className="text-xs text-slate-500">{k}</p></div>
            ))}
          </div>
          {rows && rows.length === 0 && (
            <div className="glass rounded-[2rem] p-10 text-center">
              <Box className="mx-auto h-10 w-10 text-forest-800" />
              <p className="mt-3 font-serif text-2xl text-forest-800">No inquiries yet</p>
              <Link to="/container" className="mt-4 inline-block rounded-full bg-forest-800 px-6 py-3 text-sm font-bold text-cream">Plan a container</Link>
            </div>
          )}
          {rows?.map((r) => {
            const cartons = r.inquiry_items.reduce((s, i) => s + i.qty, 0)
            return (
              <Link key={r.id} to={`/account/inquiries/${r.id}`} className="glass group flex flex-wrap items-center gap-4 rounded-3xl p-4 transition hover:bg-white sm:p-5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-mono text-sm font-bold text-forest-800">{inquiryRef(r.ref_no)}</p>
                    <StatusBadge status={r.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{r.container_name} · {cartons.toLocaleString()} cartons · {Number(r.fill_pct).toFixed(1)}% full</p>
                  <p className="text-xs text-slate-500">Sent {fmtDate(r.created_at)} · {statusOf(r.status).hint}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1" />
              </Link>
            )
          })}
        </div>
        <ProfileCard />
      </div>
    </div>
  )
}

// Status-only view for customers: timeline and what was requested, no actions
export function AccountInquiry() {
  const { id } = useParams()
  const [inq, setInq] = useState(undefined)
  useEffect(() => {
    supabase
      .from('inquiries')
      .select('*, inquiry_items(*), inquiry_events(*)')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => setInq(data))
  }, [id])

  if (inq === undefined) return null
  if (!inq) return <p className="mx-auto max-w-xl px-4 py-24 text-center text-slate-600">Inquiry not found.</p>

  const events = [...inq.inquiry_events].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
  const flow = STATUSES.filter((s) => s.key !== 'cancelled')
  const reached = flow.findIndex((s) => s.key === inq.status)
  const cartons = inq.inquiry_items.reduce((s, i) => s + i.qty, 0)

  return (
    <div className="mx-auto max-w-5xl px-4 pt-8">
      <Link to="/account" className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-forest-800 hover:underline"><ArrowLeft className="h-4 w-4" /> All inquiries</Link>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-sm font-bold text-rust">{inquiryRef(inq.ref_no)}</p>
          <h1 className="text-4xl font-medium text-forest-800">{inq.container_name}</h1>
          <p className="text-sm text-slate-500">Sent {fmtDate(inq.created_at)}</p>
        </div>
        <StatusBadge status={inq.status} className="text-sm" />
      </div>

      {/* Progress through the workflow */}
      {inq.status !== 'cancelled' && (
        <ol className="glass mt-6 grid grid-cols-7 gap-1 rounded-3xl p-4">
          {flow.map((s, i) => (
            <li key={s.key} className="text-center">
              <span className={`mx-auto block h-2 rounded-full ${i <= reached ? 'bg-leaf' : 'bg-forest-100'}`} />
              <span className={`mt-2 block text-[10px] font-bold uppercase sm:text-xs ${i <= reached ? 'text-forest-800' : 'text-slate-400'}`}>{s.label}</span>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-6 grid items-start gap-6 md:grid-cols-[1fr_300px]">
        <div className="glass overflow-hidden rounded-[2rem]">
          <p className="border-b border-forest-800/10 px-5 py-4 font-extrabold text-forest-800">Requested load · {cartons.toLocaleString()} cartons</p>
          <ul className="divide-y divide-forest-800/10">
            {inq.inquiry_items.map((it) => (
              <li key={it.id} className="flex items-center gap-3 px-5 py-3">
                {it.product_image && <img src={it.product_image} alt="" className="h-12 w-12 rounded-xl object-cover" />}
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-semibold">{it.product_name}</p>
                  <p className="text-[11px] text-slate-500">{fmtM3(it.unit_volume_cm3 * it.qty)}</p>
                </div>
                <p className="text-sm font-bold text-forest-800">{it.qty.toLocaleString()} ctns</p>
              </li>
            ))}
          </ul>
          <dl className="grid grid-cols-2 gap-3 border-t border-forest-800/10 p-5 text-sm sm:grid-cols-4">
            <div><dt className="text-xs text-slate-500">Fill</dt><dd className="font-bold">{Number(inq.fill_pct).toFixed(1)}%</dd></div>
            <div><dt className="text-xs text-slate-500">Volume</dt><dd className="font-bold">{fmtM3(inq.total_volume_cm3)}</dd></div>
            <div><dt className="text-xs text-slate-500">Weight</dt><dd className="font-bold">{fmtKg(inq.total_weight_kg)}</dd></div>
            {inq.estimated_value > 0 && <div><dt className="text-xs text-slate-500">Indicative value</dt><dd className="font-bold">{formatAED(inq.estimated_value)}</dd></div>}
          </dl>
        </div>

        <div className="glass-strong rounded-[2rem] p-5">
          <p className="mb-4 font-extrabold text-forest-800">Status history</p>
          <ol className="relative space-y-4 border-l-2 border-forest-100 pl-5">
            {events.map((e) => (
              <li key={e.id} className="relative">
                <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-gold ring-4 ring-cream" />
                <StatusBadge status={e.status} />
                {e.note && <p className="mt-1 text-sm text-slate-700">{e.note}</p>}
                <p className="text-[11px] text-slate-500">{new Date(e.created_at).toLocaleString()}</p>
              </li>
            ))}
          </ol>
          <p className="mt-5 rounded-2xl bg-forest-50 p-3 text-xs text-slate-600">Questions? Reply to our email or message us on WhatsApp with your reference.</p>
        </div>
      </div>
    </div>
  )
}
