import { useCallback, useEffect, useMemo, useState } from 'react'
import { Archive, ChevronDown, Mail, MessageCircle, Phone, Reply, Search, Trash2 } from 'lucide-react'
import { AdminTitle } from './AdminLayout'
import { supabase } from '../lib/supabase'

const STATUS = [
  { key: 'new', label: 'New', tone: 'bg-globe-blue/15 text-globe-blue' },
  { key: 'read', label: 'Read', tone: 'bg-gold/25 text-forest-900' },
  { key: 'replied', label: 'Replied', tone: 'bg-leaf/20 text-forest-800' },
  { key: 'archived', label: 'Archived', tone: 'bg-slate-100 text-slate-500' },
]
const tone = (s) => STATUS.find((x) => x.key === s)?.tone ?? ''
const fmtDate = (d) => new Date(d).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

export function MessagesAdmin() {
  const [rows, setRows] = useState(null)
  const [filter, setFilter] = useState('inbox')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(null)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    const { data, error: err } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false })
    if (err) setError(err.message)
    setRows(data ?? [])
  }, [])
  useEffect(() => {
    load()
  }, [load])

  const setStatus = async (row, status) => {
    setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, status } : r)))
    const { error: err } = await supabase.from('contact_messages').update({ status }).eq('id', row.id)
    if (err) {
      setError(err.message)
      load()
    }
  }

  const toggle = (row) => {
    setOpen((id) => (id === row.id ? null : row.id))
    if (row.status === 'new') setStatus(row, 'read')
  }

  const del = async (row) => {
    if (!window.confirm(`Delete the message from ${row.name}? This can't be undone.`)) return
    const { error: err } = await supabase.from('contact_messages').delete().eq('id', row.id)
    if (err) return setError(err.message)
    load()
  }

  const list = useMemo(() => {
    const t = q.trim().toLowerCase()
    return (rows ?? []).filter((r) =>
      (filter === 'all' || (filter === 'inbox' ? r.status !== 'archived' : r.status === filter))
      && (!t || `${r.name} ${r.company} ${r.email} ${r.phone} ${r.message}`.toLowerCase().includes(t)))
  }, [rows, filter, q])
  const count = (k) => (rows ?? []).filter((r) => r.status === k).length

  return (
    <>
      <AdminTitle title="Messages" subtitle="Quote requests from the Contact page. Opening a message marks it as read." />
      {error && <p className="mb-4 rounded-2xl bg-rust/10 p-3 text-sm font-semibold text-rust">{error}</p>}
      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
        {[{ key: 'inbox', label: 'Inbox' }, ...STATUS, { key: 'all', label: 'All' }].map((s) => (
          <button key={s.key} type="button" onClick={() => setFilter(s.key)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold ${filter === s.key ? 'bg-forest-800 text-cream' : 'glass text-forest-800'}`}>
            {s.label}{STATUS.some((x) => x.key === s.key) && count(s.key) ? ` · ${count(s.key)}` : ''}
          </button>
        ))}
      </div>
      <div className="glass overflow-hidden rounded-3xl">
        <div className="flex items-center gap-2 border-b border-forest-800/10 p-3">
          <Search className="ml-2 h-4 w-4 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, company, email, message…" className="flex-1 bg-transparent py-1.5 text-sm outline-none" />
        </div>
        {!rows && <p className="p-8 text-center text-sm text-slate-500">Loading…</p>}
        {rows && list.length === 0 && <p className="p-8 text-center text-sm text-slate-500">No messages here.</p>}
        <ul className="divide-y divide-forest-800/5">
          {list.map((r) => {
            const expanded = open === r.id
            const wa = r.phone ? `https://wa.me/${r.phone.replace(/\D/g, '')}` : null
            const reply = `mailto:${r.email}?subject=${encodeURIComponent('Re: your enquiry to Cey Exports')}&body=${encodeURIComponent(`Dear ${r.name},\n\nThank you for contacting Cey Exports.\n\n`)}`
            return (
              <li key={r.id} className={r.status === 'new' ? 'bg-white/50' : ''}>
                <button type="button" onClick={() => toggle(r)} aria-expanded={expanded} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-white/60">
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${tone(r.status)}`}>{r.status}</span>
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-sm ${r.status === 'new' ? 'font-extrabold' : 'font-semibold'}`}>{r.name}{r.company ? ` · ${r.company}` : ''}</span>
                    <span className="block truncate text-xs text-slate-500">{r.interest ? `${r.interest} — ` : ''}{r.message}</span>
                  </span>
                  <span className="hidden shrink-0 text-xs text-slate-500 sm:block">{fmtDate(r.created_at)}</span>
                  <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition ${expanded ? 'rotate-180' : ''}`} />
                </button>
                {expanded && (
                  <div className="space-y-4 px-4 pb-5 sm:px-6">
                    <dl className="grid gap-3 text-sm sm:grid-cols-4">
                      <div><dt className="text-xs text-slate-500">Buyer type</dt><dd className="font-semibold">{r.buyer_type || '—'}</dd></div>
                      <div><dt className="text-xs text-slate-500">Interested in</dt><dd className="font-semibold">{r.interest || '—'}</dd></div>
                      <div><dt className="text-xs text-slate-500">Received</dt><dd className="font-semibold">{fmtDate(r.created_at)}</dd></div>
                      <div><dt className="text-xs text-slate-500">Account</dt><dd className="font-semibold">{r.user_id ? 'Signed-in buyer' : 'Guest'}</dd></div>
                    </dl>
                    <p className="whitespace-pre-line rounded-2xl bg-white/80 p-4 text-sm leading-relaxed">{r.message || <span className="text-slate-400">No message</span>}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <a href={reply} onClick={() => setStatus(r, 'replied')} className="flex items-center gap-2 rounded-full bg-forest-800 px-4 py-2 text-xs font-bold text-cream"><Reply className="h-4 w-4 text-gold" /> Reply by email</a>
                      {r.phone && <a href={`tel:${r.phone}`} className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-forest-800 ring-1 ring-forest-100"><Phone className="h-4 w-4 text-rust" /> {r.phone}</a>}
                      {wa && <a href={wa} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-forest-800 ring-1 ring-forest-100"><MessageCircle className="h-4 w-4 text-rust" /> WhatsApp</a>}
                      <span className="flex items-center gap-1 text-xs text-slate-500"><Mail className="h-3.5 w-3.5" /> {r.email}</span>
                      <span className="ml-auto flex gap-1">
                        <select value={r.status} onChange={(e) => setStatus(r, e.target.value)} aria-label="Status" className="rounded-full bg-white px-3 py-1.5 text-xs font-bold ring-1 ring-forest-100">
                          {STATUS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                        </select>
                        {r.status !== 'archived' && (
                          <button type="button" onClick={() => setStatus(r, 'archived')} className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-forest-50"><Archive className="h-4 w-4" /> Archive</button>
                        )}
                        <button type="button" onClick={() => del(r)} aria-label="Delete message" className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-rust/10 hover:text-rust"><Trash2 className="h-4 w-4" /></button>
                      </span>
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </>
  )
}
