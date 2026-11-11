import { CircleCheck, Lock, Weight } from 'lucide-react'
import { SEGMENT_COLORS, fmtKg, fmtM3 } from '../lib/container'

// Side view of a shipping container. Cargo segments are drawn against the *inner* length,
// so the hatched band at the doors shows the safety space the planner never fills.
export function ContainerVisual({ lines, stats, container, compact = false }) {
  if (!container) return null
  const inner = stats.inner || 1
  const usableFrac = stats.usable / inner
  const W = 600
  const H = compact ? 150 : 190
  const pad = 14
  const bodyW = W - pad * 2 - 18
  const bodyH = H - pad * 2 - 14
  const x0 = pad
  const y0 = pad
  let cursor = 0
  const segments = lines.map((l, i) => {
    const w = ((l.product.volume * l.qty) / inner) * bodyW
    const seg = { x: x0 + cursor, w, color: SEGMENT_COLORS[i % SEGMENT_COLORS.length], name: l.product.name, qty: l.qty }
    cursor += w
    return seg
  })
  const usableX = x0 + usableFrac * bodyW
  const minX = x0 + (stats.minPct / 100) * usableFrac * bodyW
  const ribs = Array.from({ length: 22 }, (_, i) => x0 + ((i + 1) * bodyW) / 23)

  return (
    <figure className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`${container.name} ${Math.round(stats.fill)} percent full`}>
        <defs>
          <pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="8" height="8" fill="#f5f1e6" />
            <line x1="0" y1="0" x2="0" y2="8" stroke="#e2a757" strokeWidth="3" />
          </pattern>
          <clipPath id="body"><rect x={x0} y={y0} width={bodyW} height={bodyH} rx="6" /></clipPath>
        </defs>
        {/* shell */}
        <rect x={x0 - 4} y={y0 - 4} width={bodyW + 8} height={bodyH + 8} rx="9" fill="#103629" />
        <rect x={x0} y={y0} width={bodyW} height={bodyH} rx="6" fill="#fffdf8" />
        <g clipPath="url(#body)">
          <rect x={usableX} y={y0} width={x0 + bodyW - usableX} height={bodyH} fill="url(#hatch)" opacity="0.7" />
          {segments.map((s) => (
            <g key={s.name}>
              <rect x={s.x} y={y0} width={Math.max(0, s.w)} height={bodyH} fill={s.color} opacity="0.92">
                <title>{`${s.name} — ${s.qty} cartons`}</title>
              </rect>
              <line x1={s.x + s.w} y1={y0} x2={s.x + s.w} y2={y0 + bodyH} stroke="#fff" strokeWidth="1.5" opacity="0.7" />
            </g>
          ))}
          {ribs.map((rx) => <line key={rx} x1={rx} y1={y0} x2={rx} y2={y0 + bodyH} stroke="#103629" strokeOpacity="0.07" strokeWidth="3" />)}
        </g>
        {/* doors */}
        <rect x={x0 + bodyW + 4} y={y0 - 4} width="14" height={bodyH + 8} rx="3" fill="#0b2a1f" />
        <line x1={x0 + bodyW + 11} y1={y0 + 8} x2={x0 + bodyW + 11} y2={y0 + bodyH - 8} stroke="#e2a757" strokeWidth="2" />
        {/* minimum marker */}
        {stats.minPct > 0 && (
          <g>
            <line x1={minX} y1={y0 - 8} x2={minX} y2={y0 + bodyH + 8} stroke="#9a4a1a" strokeWidth="2" strokeDasharray="5 4" />
            <rect x={minX - 34} y={y0 + bodyH + 6} width="68" height="16" rx="8" fill="#9a4a1a" />
            <text x={minX} y={y0 + bodyH + 17.5} textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff">MIN {Math.round(stats.minPct)}%</text>
          </g>
        )}
        {/* fill label */}
        <text x={x0 + 14} y={y0 + 28} fontSize="22" fontWeight="800" fill={segments.length ? '#fff' : '#103629'} style={{ paintOrder: 'stroke' }} stroke={segments.length ? '#103629' : 'none'} strokeWidth="3" strokeOpacity="0.35">
          {Math.min(999, Math.round(stats.fill))}%
        </text>
      </svg>
      {!compact && (
        <figcaption className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5"><i className="h-2.5 w-4 rounded-sm bg-[repeating-linear-gradient(45deg,#e2a757_0_3px,#f5f1e6_3px_6px)]" /> Safety space ({Number(container.safety_margin_pct)}%) — kept free for measurement and stacking tolerance</span>
          <span className="flex items-center gap-1.5"><i className="h-3 w-0 border-l-2 border-dashed border-rust" /> Minimum fill to send an inquiry</span>
        </figcaption>
      )}
    </figure>
  )
}

export function ContainerMeter({ stats, container, showWeight = true }) {
  if (!container) return null
  const pct = Math.min(100, stats.volPct)
  const ready = stats.canCheckout
  return (
    <div className="space-y-3">
      <div>
        <div className="mb-1.5 flex items-baseline justify-between text-sm">
          <span className="font-bold text-forest-800">Space used</span>
          <span className="font-semibold text-slate-600">
            {fmtM3(stats.usedVol)} <span className="text-slate-400">/ {fmtM3(stats.usable)} usable</span>
          </span>
        </div>
        <div className="relative h-4 overflow-visible rounded-full bg-forest-50 ring-1 ring-forest-100">
          <div
            className={`h-full rounded-full transition-all duration-500 ${ready ? 'bg-gradient-to-r from-leaf to-forest-600' : 'bg-gradient-to-r from-gold to-gold-dark'}`}
            style={{ width: `${pct}%` }}
          />
          <span className="absolute -top-1 bottom-[-4px] w-0.5 rounded bg-rust" style={{ left: `${stats.minPct}%` }} title={`Minimum ${stats.minPct}%`} />
        </div>
        <div className="mt-1 flex justify-between text-[11px] text-slate-500">
          <span>{stats.volPct.toFixed(1)}% by volume</span>
          <span className="font-semibold text-rust">Min {Math.round(stats.minPct)}%</span>
        </div>
      </div>
      {showWeight && stats.payload && (
        <div>
          <div className="mb-1 flex items-baseline justify-between text-xs">
            <span className="flex items-center gap-1 font-bold text-forest-800"><Weight className="h-3.5 w-3.5" /> Payload</span>
            <span className="text-slate-600">{fmtKg(stats.usedKg)} / {fmtKg(stats.payload)}</span>
          </div>
          <div className="h-2 rounded-full bg-forest-50 ring-1 ring-forest-100">
            <div className="h-full rounded-full bg-forest-600 transition-all duration-500" style={{ width: `${Math.min(100, stats.kgPct)}%` }} />
          </div>
        </div>
      )}
      <p className={`flex items-start gap-2 rounded-2xl p-3 text-xs font-semibold ${ready ? 'bg-leaf/15 text-forest-800' : 'bg-gold/20 text-forest-900'}`}>
        {ready ? <CircleCheck className="h-4 w-4 shrink-0 text-leaf" /> : <Lock className="h-4 w-4 shrink-0 text-rust" />}
        {ready
          ? stats.fill >= 99
            ? 'Container full — you can send your inquiry.'
            : `Minimum reached — send your inquiry now, or keep filling (${fmtM3(stats.remainingVol)} left).`
          : stats.cartons === 0
            ? `Start adding cartons. Fill at least ${Math.round(stats.minPct)}% of the ${container.name} to send an inquiry.`
            : `Add about ${fmtM3(stats.toMinVol)} more to reach the ${Math.round(stats.minPct)}% minimum.`}
      </p>
    </div>
  )
}

// Small ring used in the header
export function FillRing({ pct, ready, size = 40 }) {
  const r = 16
  const c = 2 * Math.PI * r
  const p = Math.min(100, Math.max(0, pct))
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className="absolute inset-0 -rotate-90" aria-hidden="true">
      <circle cx="20" cy="20" r={r} fill="none" stroke="rgba(16,54,41,0.12)" strokeWidth="3" />
      <circle cx="20" cy="20" r={r} fill="none" stroke={ready ? '#5e8021' : '#9a4a1a'} strokeWidth="3" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (p / 100) * c} className="transition-all duration-500" />
    </svg>
  )
}
