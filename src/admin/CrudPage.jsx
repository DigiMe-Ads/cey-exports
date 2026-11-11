import { useCallback, useEffect, useMemo, useState } from 'react'
import { ImageUp, Loader2, Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import { supabase, uploadImage } from '../lib/supabase'
import { useCatalog } from '../context/CatalogContext'
import { AdminTitle } from './AdminLayout'

export const inputCls = 'w-full rounded-xl bg-white px-3 py-2.5 text-sm outline-none ring-1 ring-forest-100 focus:ring-2 focus:ring-gold'
export const slugify = (s) => String(s).toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-')

function ImageField({ value, onChange, folder }) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)
  const pick = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    setErr(null)
    try {
      onChange(await uploadImage(file, folder))
    } catch (ex) {
      setErr(ex.message)
    }
    setBusy(false)
  }
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white ring-1 ring-forest-100">
        {value ? <img src={value} alt="" className="h-full w-full object-contain" /> : <ImageUp className="h-6 w-6 text-slate-300" />}
      </span>
      <div className="min-w-0 flex-1 space-y-1.5">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-forest-800 px-4 py-2 text-xs font-bold text-cream">
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageUp className="h-3.5 w-3.5" />} {value ? 'Replace image' : 'Upload image'}
          <input type="file" accept="image/*" className="hidden" onChange={pick} />
        </label>
        <input className={`${inputCls} text-xs`} placeholder="…or paste an image URL" value={value ?? ''} onChange={(e) => onChange(e.target.value || null)} />
        {err && <p className="text-xs text-rust">{err}</p>}
      </div>
    </div>
  )
}

export function Field({ f, values, set, ctx }) {
  const v = values[f.key]
  const label = (
    <span className="mb-1 block text-xs font-bold text-slate-600">
      {f.label}{f.required && <span className="text-rust"> *</span>}
      {f.hint && <span className="ml-1 font-normal text-slate-400">— {f.hint}</span>}
    </span>
  )
  switch (f.type) {
    case 'textarea':
      return <label className="block">{label}<textarea rows={f.rows ?? 4} className={inputCls} value={v ?? ''} onChange={(e) => set(f.key, e.target.value)} /></label>
    case 'number':
      return (
        <label className="block">{label}
          <input type="number" step={f.step ?? 'any'} min={f.min} max={f.max} required={f.required} className={inputCls} value={v ?? ''} onChange={(e) => set(f.key, e.target.value === '' ? null : Number(e.target.value))} />
        </label>
      )
    case 'checkbox':
      return (
        <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-sm font-semibold ring-1 ring-forest-100">
          <input type="checkbox" checked={!!v} onChange={(e) => set(f.key, e.target.checked)} className="h-4 w-4 accent-forest-800" /> {f.label}
        </label>
      )
    case 'select': {
      const opts = typeof f.options === 'function' ? f.options(ctx) : f.options
      return (
        <label className="block">{label}
          <select required={f.required} className={inputCls} value={v ?? ''} onChange={(e) => set(f.key, e.target.value || null)}>
            <option value="">{f.placeholder ?? '— none —'}</option>
            {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
      )
    }
    case 'image':
      return <div>{label}<ImageField value={v} onChange={(url) => set(f.key, url)} folder={f.folder} /></div>
    case 'date':
      return <label className="block">{label}<input type="date" className={inputCls} value={v ?? ''} onChange={(e) => set(f.key, e.target.value)} /></label>
    case 'custom':
      return f.render(values, set, ctx)
    default:
      return <label className="block">{label}<input required={f.required} className={inputCls} value={v ?? ''} onChange={(e) => set(f.key, e.target.value)} /></label>
  }
}

/**
 * Generic list + create/edit/delete screen for one table.
 * columns: [{ key, label, render?(row, ctx), className? }]
 * fields:  [{ key, label, type?, required?, wide?, section?, ... }]
 */
export default function CrudPage({ table, title, subtitle, singular, select = '*', order = { column: 'sort', ascending: true }, columns, fields, searchKeys = ['name'], defaults = {}, beforeSave, toolbar }) {
  const catalog = useCatalog()
  const [rows, setRows] = useState(null)
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState(null) // row being edited, or {} for new
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const { data, error: err } = await supabase.from(table).select(select).order(order.column, { ascending: order.ascending })
    if (err) setError(err.message)
    setRows(data ?? [])
  }, [table, select, order.column, order.ascending])

  useEffect(() => {
    load()
  }, [load])

  const updateRow = async (id, patch) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)))
    const { error: err } = await supabase.from(table).update(patch).eq('id', id)
    if (err) setError(err.message)
    else catalog.refresh()
    // Reload: triggers can change other rows too (e.g. only one default container)
    load()
  }

  const ctx = { catalog, rows, updateRow, reload: load }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    let values = { ...editing }
    // Only send editable fields (generated columns like volume_cm3 are rejected by Postgres)
    const keys = fields.filter((f) => f.type !== 'custom' || f.key).map((f) => f.key).filter(Boolean)
    let payload = Object.fromEntries(keys.map((k) => [k, values[k] === '' ? null : values[k]]))
    const slugField = fields.find((f) => f.type === 'slug')
    if (slugField && !payload[slugField.key]) payload[slugField.key] = slugify(values[slugField.from] ?? '')
    if (beforeSave) payload = beforeSave(payload, values)
    const res = values.id
      ? await supabase.from(table).update(payload).eq('id', values.id)
      : await supabase.from(table).insert(payload)
    setSaving(false)
    if (res.error) return setError(res.error.message)
    setEditing(null)
    await load()
    catalog.refresh()
  }

  const del = async (row) => {
    if (!window.confirm(`Delete “${row.name ?? row.title}”? This can't be undone.`)) return
    const { error: err } = await supabase.from(table).delete().eq('id', row.id)
    if (err) return setError(err.message.includes('foreign key') ? 'This item is still used elsewhere (e.g. by products or inquiries). Deactivate it instead.' : err.message)
    await load()
    catalog.refresh()
  }

  const filtered = useMemo(() => {
    if (!rows) return []
    const t = q.trim().toLowerCase()
    if (!t) return rows
    return rows.filter((r) => searchKeys.some((k) => String(r[k] ?? '').toLowerCase().includes(t)))
  }, [rows, q, searchKeys])

  const set = (k, val) => setEditing((v) => ({ ...v, [k]: val }))
  const sections = []
  for (const f of fields) {
    const name = f.section ?? 'Details'
    let s = sections.find((x) => x.name === name)
    if (!s) sections.push((s = { name, fields: [] }))
    s.fields.push(f)
  }

  return (
    <>
      <AdminTitle title={title} subtitle={subtitle}>
        {toolbar}
        <button type="button" onClick={() => setEditing({ ...defaults })} className="flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-bold text-forest-900 hover:bg-gold-dark">
          <Plus className="h-4 w-4" /> Add {singular}
        </button>
      </AdminTitle>

      {error && (
        <p className="mb-4 flex items-start justify-between gap-3 rounded-2xl bg-rust/10 p-3 text-sm font-semibold text-rust">
          {error} <button type="button" onClick={() => setError(null)} aria-label="Dismiss"><X className="h-4 w-4" /></button>
        </p>
      )}

      <div className="glass overflow-hidden rounded-3xl">
        <div className="flex items-center gap-2 border-b border-forest-800/10 p-3">
          <Search className="ml-2 h-4 w-4 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${title.toLowerCase()}…`} className="flex-1 bg-transparent py-1.5 text-sm outline-none" />
          <span className="pr-2 text-xs text-slate-500">{rows ? `${filtered.length} of ${rows.length}` : ''}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-forest-800/10 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {columns.map((c) => <th key={c.key} className={`px-4 py-3 ${c.className ?? ''}`}>{c.label}</th>)}
                <th className="w-24 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-forest-800/5">
              {!rows && <tr><td colSpan={columns.length + 1} className="p-8 text-center text-slate-500">Loading…</td></tr>}
              {filtered.map((r) => (
                <tr key={r.id} className="align-middle hover:bg-white/60">
                  {columns.map((c) => <td key={c.key} className={`px-4 py-3 ${c.className ?? ''}`}>{c.render ? c.render(r, ctx) : String(r[c.key] ?? '—')}</td>)}
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button type="button" aria-label="Edit" onClick={() => setEditing({ ...r })} className="grid h-8 w-8 place-items-center rounded-full text-forest-800 hover:bg-forest-50"><Pencil className="h-4 w-4" /></button>
                      <button type="button" aria-label="Delete" onClick={() => del(r)} className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-rust/10 hover:text-rust"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={`${editing.id ? 'Edit' : 'New'} ${singular}`}>
          <button type="button" aria-label="Close" onClick={() => setEditing(null)} className="absolute inset-0 bg-forest-950/40 backdrop-blur-sm" />
          <form onSubmit={save} className="absolute inset-y-0 right-0 flex w-full max-w-2xl animate-slide-in flex-col bg-cream shadow-2xl">
            <div className="flex items-center justify-between border-b border-forest-800/10 p-5">
              <h2 className="text-2xl font-medium text-forest-800">{editing.id ? 'Edit' : 'New'} {singular}</h2>
              <button type="button" aria-label="Close" onClick={() => setEditing(null)} className="grid h-9 w-9 place-items-center rounded-full bg-forest-50"><X className="h-4 w-4" /></button>
            </div>
            <div className="flex-1 space-y-6 overflow-y-auto p-5">
              {sections.map((s) => (
                <fieldset key={s.name}>
                  <legend className="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-rust">{s.name}</legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {s.fields.map((f, i) => (
                      <div key={f.key ?? i} className={f.wide || ['textarea', 'image', 'custom'].includes(f.type) ? 'sm:col-span-2' : ''}>
                        {f.type === 'slug'
                          ? <Field f={{ ...f, type: 'text', hint: 'leave blank to generate' }} values={editing} set={set} ctx={ctx} />
                          : <Field f={f} values={editing} set={set} ctx={ctx} />}
                      </div>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
            {error && <p className="mx-5 rounded-2xl bg-rust/10 p-3 text-sm font-semibold text-rust">{error}</p>}
            <div className="flex justify-end gap-2 border-t border-forest-800/10 p-5">
              <button type="button" onClick={() => setEditing(null)} className="rounded-full px-5 py-2.5 text-sm font-bold text-forest-800 hover:bg-forest-50">Cancel</button>
              <button disabled={saving} className="flex items-center gap-2 rounded-full bg-forest-800 px-6 py-2.5 text-sm font-bold text-cream disabled:opacity-60">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save {singular}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}

// Small shared cell renderers
export const Thumb = ({ src }) => (
  <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-xl bg-white ring-1 ring-black/5">
    {src ? <img src={src} alt="" className="h-full w-full object-contain" /> : null}
  </span>
)
export const Flag = ({ on, label }) => (
  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${on ? 'bg-leaf/20 text-forest-800' : 'bg-slate-100 text-slate-400'}`}>{label}</span>
)
