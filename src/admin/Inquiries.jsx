import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Mail, MessageCircle, PackageCheck, PackageMinus, Phone, Search, Send, StickyNote, Trash2 } from 'lucide-react'
import { AdminTitle } from './AdminLayout'
import { inputCls } from './CrudPage'
import StatusBadge, { STATUSES } from '../components/StatusBadge'
import { ContainerVisual } from '../components/ContainerMeter'
import { formatAED } from '../data/catalog'
import { fmtKg, fmtM3, planStats } from '../lib/container'
import { inquiryRef, supabase } from '../lib/supabase'
import { useCatalog } from '../context/CatalogContext'

const fmtDate = (d) => new Date(d).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

export function InquiriesAdmin() {
  const [rows, setRows] = useState(null)
  const [status, setStatus] = useState('open')
  const [q, setQ] = useState('')
  useEffect(() => {
    supabase
      .from('inquiries')
      .select('id, ref_no, status, container_name, fill_pct, contact_name, company, email, destination, created_at, stock_applied, estimated_value')
      .order('created_at', { ascending: false })
      .then(({ data }) => setRows(data ?? []))
  }, [])

  const list = useMemo(() => {
    const t = q.trim().toLowerCase()
    return (rows ?? []).filter((r) =>
      (status === 'all' || (status === 'open' ? !['completed', 'cancelled'].includes(r.status) : r.status === status))
      && (!t || `${inquiryRef(r.ref_no)} ${r.contact_name} ${r.company} ${r.email} ${r.destination}`.toLowerCase().includes(t)))
  }, [rows, status, q])

  const counts = Object.fromEntries(STATUSES.map((s) => [s.key, (rows ?? []).filter((r) => r.status === s.key).length]))

  return (
    <>
      <AdminTitle title="Inquiries" subtitle="Container inquiries from buyers. Update the status as you contact them — buyers see each status change." />
      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
        {[{ key: 'open', label: 'Open' }, { key: 'all', label: 'All' }, ...STATUSES].map((s) => (
          <button key={s.key} type="button" onClick={() => setStatus(s.key)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${status === s.key ? 'bg-forest-800 text-cream' : 'glass text-forest-800'}`}>
            {s.label}{counts[s.key] ? ` · ${counts[s.key]}` : ''}
          </button>
        ))}
      </div>
      <div className="glass overflow-hidden rounded-3xl">
        <div className="flex items-center gap-2 border-b border-forest-800/10 p-3">
          <Search className="ml-2 h-4 w-4 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search reference, name, company, destination…" className="flex-1 bg-transparent py-1.5 text-sm outline-none" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-forest-800/10 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">Reference</th><th className="px-4 py-3">Buyer</th><th className="px-4 py-3">Container</th><th className="px-4 py-3">Value</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Received</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-forest-800/5">
              {!rows && <tr><td colSpan={6} className="p-8 text-center text-slate-500">Loading…</td></tr>}
              {rows && list.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-slate-500">No inquiries here.</td></tr>}
              {list.map((r) => (
                <tr key={r.id} className="cursor-pointer hover:bg-white/60">
                  <td className="px-4 py-3"><Link to={`/admin/inquiries/${r.id}`} className="font-mono font-bold text-forest-800 hover:underline">{inquiryRef(r.ref_no)}</Link></td>
                  <td className="px-4 py-3"><p className="font-semibold">{r.contact_name}</p><p className="text-[11px] text-slate-500">{r.company || r.email}</p></td>
                  <td className="px-4 py-3"><p>{r.container_name}</p><p className="text-[11px] text-slate-500">{Number(r.fill_pct).toFixed(1)}% full{r.destination ? ` → ${r.destination}` : ''}</p></td>
                  <td className="whitespace-nowrap px-4 py-3">{r.estimated_value ? formatAED(r.estimated_value) : '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} />{r.stock_applied && <p className="mt-1 text-[10px] font-bold text-leaf">Stock deducted</p>}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">{fmtDate(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export function InquiryAdmin() {
  const { id } = useParams()
  const navigate = useNavigate()
  const catalog = useCatalog()
  const [inq, setInq] = useState(undefined)
  const [notes, setNotes] = useState([])
  const [stockNow, setStockNow] = useState({})
  const [newStatus, setNewStatus] = useState('')
  const [publicNote, setPublicNote] = useState('')
  const [note, setNote] = useState('')
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const { data } = await supabase.from('inquiries').select('*, inquiry_items(*), inquiry_events(*)').eq('id', id).maybeSingle()
    setInq(data)
    if (!data) return
    setNewStatus(data.status)
    const [{ data: n }, { data: stock }] = await Promise.all([
      supabase.from('inquiry_notes').select('*').eq('inquiry_id', id).order('created_at', { ascending: false }),
      supabase.from('products').select('id, stock').in('id', data.inquiry_items.map((i) => i.product_id).filter(Boolean)),
    ])
    setNotes(n ?? [])
    setStockNow(Object.fromEntries((stock ?? []).map((s) => [s.id, s.stock])))
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  if (inq === undefined) return <p className="text-sm text-slate-500">Loading…</p>
  if (!inq) return <p className="text-sm text-slate-500">Inquiry not found.</p>

  const run = async (fn, ok) => {
    setBusy(true)
    setMsg(null)
    const { error } = await fn()
    setBusy(false)
    if (error) {
      setMsg({ tone: 'err', text: error.message })
      return false
    }
    setMsg({ tone: 'ok', text: ok })
    await load()
    catalog.refresh()
    return true
  }

  const saveStatus = async (e) => {
    e.preventDefault()
    const ok = await run(() => supabase.rpc('update_inquiry_status', { p_id: inq.id, p_status: newStatus, p_note: publicNote }), 'Status updated — the buyer can see it now.')
    if (ok) setPublicNote('')
  }
  const deduct = async () => {
    const ok = await run(() => supabase.rpc('apply_inquiry_stock', { p_id: inq.id }), 'Stock deducted.')
    if (!ok && window.confirm('Some products do not have enough stock. Deduct anyway (stock may go negative)?')) {
      await run(() => supabase.rpc('apply_inquiry_stock', { p_id: inq.id, p_force: true }), 'Stock deducted (forced).')
    }
  }
  const addNote = async (e) => {
    e.preventDefault()
    if (!note.trim()) return
    const ok = await run(() => supabase.from('inquiry_notes').insert({ inquiry_id: inq.id, body: note.trim() }), 'Note added.')
    if (ok) setNote('')
  }
  const del = async () => {
    if (!window.confirm(`Delete inquiry ${inquiryRef(inq.ref_no)}? This can't be undone.${inq.stock_applied ? ' Stock that was deducted will NOT be returned automatically.' : ''}`)) return
    const { error } = await supabase.from('inquiries').delete().eq('id', inq.id)
    if (error) return setMsg({ tone: 'err', text: error.message })
    navigate('/admin/inquiries')
  }

  // Rebuild the load for the container graphic from the snapshot on the inquiry
  const lines = inq.inquiry_items.map((it) => ({ slug: it.id, qty: it.qty, product: { name: it.product_name, volume: Number(it.unit_volume_cm3), weight: Number(it.unit_weight_kg || 0) } }))
  // Capacity comes from the snapshot taken at submission; inner size/margin from the live container if it still exists
  const container = {
    ...(catalog.containers.find((c) => c.id === inq.container_id) ?? { inner_volume_cm3: inq.container_usable_cm3, safety_margin_pct: 0, min_fill_pct: 0 }),
    name: inq.container_name,
    usable_volume_cm3: inq.container_usable_cm3,
    max_payload_kg: inq.container_max_payload_kg,
  }
  const stats = planStats(lines, container)
  const events = [...inq.inquiry_events].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  const wa = inq.phone ? `https://wa.me/${inq.phone.replace(/\D/g, '')}` : null

  return (
    <>
      <Link to="/admin/inquiries" className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-forest-800 hover:underline"><ArrowLeft className="h-4 w-4" /> All inquiries</Link>
      <AdminTitle title={<>{inquiryRef(inq.ref_no)} <StatusBadge status={inq.status} className="align-middle" /></>} subtitle={`Received ${fmtDate(inq.created_at)} · ${inq.container_name} · ${Number(inq.fill_pct).toFixed(1)}% full`}>
        <button type="button" onClick={del} className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-rust hover:bg-rust/10"><Trash2 className="h-4 w-4" /> Delete</button>
      </AdminTitle>

      {msg && <p className={`mb-4 rounded-2xl p-3 text-sm font-semibold ${msg.tone === 'err' ? 'bg-rust/10 text-rust' : 'bg-leaf/15 text-forest-800'}`}>{msg.text}</p>}

      <div className="grid items-start gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <div className="glass rounded-3xl p-5">
            <ContainerVisual lines={lines} stats={stats} container={container} compact />
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div><dt className="text-xs text-slate-500">Cartons</dt><dd className="font-bold">{stats.cartons.toLocaleString()}</dd></div>
              <div><dt className="text-xs text-slate-500">Volume</dt><dd className="font-bold">{fmtM3(inq.total_volume_cm3)} / {fmtM3(inq.container_usable_cm3)}</dd></div>
              <div><dt className="text-xs text-slate-500">Weight</dt><dd className="font-bold">{fmtKg(inq.total_weight_kg)}</dd></div>
              <div><dt className="text-xs text-slate-500">Indicative value</dt><dd className="font-bold">{inq.estimated_value ? formatAED(inq.estimated_value) : '—'}</dd></div>
            </dl>
          </div>

          <div className="glass overflow-hidden rounded-3xl">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-forest-800/10 px-5 py-4">
              <p className="font-extrabold text-forest-800">Items</p>
              {inq.stock_applied ? (
                <button type="button" disabled={busy} onClick={() => window.confirm('Return these cartons to stock?') && run(() => supabase.rpc('revert_inquiry_stock', { p_id: inq.id }), 'Stock returned.')} className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-forest-800 ring-1 ring-forest-100">
                  <PackageCheck className="h-4 w-4 text-leaf" /> Stock deducted · undo
                </button>
              ) : (
                <button type="button" disabled={busy} onClick={deduct} className="flex items-center gap-2 rounded-full bg-forest-800 px-4 py-2 text-xs font-bold text-cream">
                  <PackageMinus className="h-4 w-4 text-gold" /> Deduct from stock
                </button>
              )}
            </div>
            <table className="w-full text-sm">
              <thead><tr className="text-left text-[11px] font-bold uppercase tracking-wider text-slate-500"><th className="px-5 py-2">Product</th><th className="px-3 py-2 text-right">Cartons</th><th className="px-3 py-2 text-right">Volume</th><th className="px-3 py-2 text-right">In stock</th><th className="px-5 py-2 text-right">Value</th></tr></thead>
              <tbody className="divide-y divide-forest-800/5">
                {inq.inquiry_items.map((it) => {
                  const s = stockNow[it.product_id]
                  return (
                    <tr key={it.id}>
                      <td className="px-5 py-2.5"><div className="flex items-center gap-2">{it.product_image && <img src={it.product_image} alt="" className="h-9 w-9 rounded-lg object-cover" />}<span className="font-semibold">{it.product_name}</span></div></td>
                      <td className="px-3 py-2.5 text-right font-bold">{it.qty.toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-right">{fmtM3(it.unit_volume_cm3 * it.qty)}</td>
                      <td className={`px-3 py-2.5 text-right font-semibold ${s != null && !inq.stock_applied && s < it.qty ? 'text-rust' : ''}`}>{s ?? '—'}</td>
                      <td className="px-5 py-2.5 text-right">{it.unit_price != null ? formatAED(it.unit_price * it.qty) : '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="glass rounded-3xl p-5">
            <p className="mb-3 font-extrabold text-forest-800">Buyer timeline</p>
            <ol className="space-y-3">
              {events.map((e) => (
                <li key={e.id} className="flex gap-3 text-sm">
                  <StatusBadge status={e.status} />
                  <div><p>{e.note || <span className="text-slate-400">No message</span>}</p><p className="text-[11px] text-slate-500">{fmtDate(e.created_at)}</p></div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-strong rounded-3xl p-5">
            <p className="font-extrabold text-forest-800">{inq.contact_name}</p>
            {inq.company && <p className="text-sm text-slate-600">{inq.company}</p>}
            <div className="mt-3 space-y-1.5 text-sm">
              <a href={`mailto:${inq.email}?subject=${encodeURIComponent(`Your inquiry ${inquiryRef(inq.ref_no)}`)}`} className="flex items-center gap-2 font-semibold text-forest-800 hover:underline"><Mail className="h-4 w-4 text-rust" /> {inq.email}</a>
              {inq.phone && <a href={`tel:${inq.phone}`} className="flex items-center gap-2 font-semibold text-forest-800 hover:underline"><Phone className="h-4 w-4 text-rust" /> {inq.phone}</a>}
              {wa && <a href={wa} target="_blank" rel="noreferrer" className="flex items-center gap-2 font-semibold text-forest-800 hover:underline"><MessageCircle className="h-4 w-4 text-rust" /> WhatsApp</a>}
            </div>
            <dl className="mt-4 space-y-2 border-t border-forest-800/10 pt-3 text-sm">
              <div><dt className="text-xs text-slate-500">Destination</dt><dd className="font-semibold">{inq.destination || '—'}</dd></div>
              <div><dt className="text-xs text-slate-500">Preferred shipping</dt><dd className="font-semibold">{inq.preferred_date || '—'}</dd></div>
              {inq.notes && <div><dt className="text-xs text-slate-500">Buyer notes</dt><dd className="whitespace-pre-line">{inq.notes}</dd></div>}
            </dl>
          </div>

          <form onSubmit={saveStatus} className="glass-strong space-y-3 rounded-3xl p-5">
            <p className="font-extrabold text-forest-800">Update status</p>
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className={inputCls}>
              {STATUSES.map((s) => <option key={s.key} value={s.key}>{s.label} — {s.hint}</option>)}
            </select>
            <textarea rows={3} value={publicNote} onChange={(e) => setPublicNote(e.target.value)} placeholder="Message the buyer will see (optional)" className={inputCls} />
            {newStatus === 'confirmed' && !inq.stock_applied && <p className="rounded-xl bg-gold/20 p-2 text-xs text-forest-900">Tip: once confirmed, use “Deduct from stock” so inventory stays accurate.</p>}
            <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-full bg-gold py-2.5 text-sm font-bold text-forest-900 disabled:opacity-60"><Send className="h-4 w-4" /> Save status</button>
          </form>

          <div className="glass-strong rounded-3xl p-5">
            <p className="mb-3 flex items-center gap-2 font-extrabold text-forest-800"><StickyNote className="h-4 w-4 text-rust" /> Internal notes</p>
            <form onSubmit={addNote} className="flex gap-2">
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Only admins see these" className={inputCls} />
              <button className="rounded-xl bg-forest-800 px-4 text-sm font-bold text-cream">Add</button>
            </form>
            <ul className="mt-3 space-y-2">
              {notes.map((n) => (
                <li key={n.id} className="rounded-xl bg-white/80 p-3 text-sm"><p>{n.body}</p><p className="mt-1 text-[11px] text-slate-500">{fmtDate(n.created_at)}</p></li>
              ))}
              {notes.length === 0 && <li className="text-xs text-slate-400">No notes yet.</li>}
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}
