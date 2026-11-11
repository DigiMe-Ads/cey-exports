// Container-planning maths. Capacity always uses the container's *usable* volume
// (inner volume minus the admin-set safety margin), so plans never pack snugly.

const sorted = (a) => [...a].map(Number).sort((x, y) => x - y)

export const m3 = (cm3) => Number(cm3) / 1_000_000
export const fmtM3 = (cm3, digits = 2) => `${m3(cm3).toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: digits })} m³`
export const fmtCm3 = (cm3) => `${Math.round(Number(cm3)).toLocaleString()} cm³`
export const fmtKg = (kg) => `${Math.round(Number(kg)).toLocaleString()} kg`

// A carton fits if, in some orientation, every side is within the container's inner size
export function cartonFits(product, container) {
  if (!product || !container) return false
  const p = sorted(product.dims)
  const c = sorted([container.length_cm, container.width_cm, container.height_cm])
  return p[0] <= c[0] && p[1] <= c[1] && p[2] <= c[2]
}

export function planStats(lines, container) {
  const usable = Number(container?.usable_volume_cm3 || 0)
  const inner = Number(container?.inner_volume_cm3 || 0)
  const payload = container?.max_payload_kg ? Number(container.max_payload_kg) : null
  const usedVol = lines.reduce((s, l) => s + l.product.volume * l.qty, 0)
  const usedKg = lines.reduce((s, l) => s + (l.product.weight || 0) * l.qty, 0)
  const value = lines.reduce((s, l) => s + (l.product.price || 0) * l.qty, 0)
  const volPct = usable ? (usedVol / usable) * 100 : 0
  const kgPct = payload ? (usedKg / payload) * 100 : 0
  const fill = Math.max(volPct, kgPct)
  const minPct = Number(container?.min_fill_pct ?? 0)
  return {
    usable, inner, payload, usedVol, usedKg, value, volPct, kgPct, fill, minPct,
    limitedBy: kgPct > volPct ? 'weight' : 'volume',
    remainingVol: Math.max(0, usable - usedVol),
    remainingKg: payload ? Math.max(0, payload - usedKg) : Infinity,
    // Volume still needed to reach the minimum (by volume — weight-heavy plans reach it sooner)
    toMinVol: Math.max(0, (minPct / 100) * usable - usedVol),
    over: fill > 100.0001,
    canCheckout: lines.length > 0 && fill + 1e-6 >= minPct && fill <= 100.0001,
    cartons: lines.reduce((s, l) => s + l.qty, 0),
  }
}

// How many more cartons of a product still fit (volume and payload)
export function maxAddable(product, stats, container) {
  if (!cartonFits(product, container)) return 0
  const byVol = Math.floor(stats.remainingVol / product.volume + 1e-9)
  const byKg = product.weight && stats.payload ? Math.floor(stats.remainingKg / product.weight + 1e-9) : Infinity
  return Math.max(0, Math.min(byVol, byKg))
}

// Products that can still be added, best fillers first
export function recommendations(products, stats, container, inPlan = new Set(), limit = 8) {
  return products
    .map((p) => ({ product: p, room: maxAddable(p, stats, container) }))
    .filter(({ product, room }) => room >= product.minQty)
    .sort((a, b) => {
      const aIn = inPlan.has(a.product.slug) ? 1 : 0
      const bIn = inPlan.has(b.product.slug) ? 1 : 0
      if (aIn !== bIn) return aIn - bIn // suggest new items before ones already planned
      return b.product.volume - a.product.volume
    })
    .slice(0, limit)
}

// Cartons of a product needed to close the gap to the minimum fill
export const cartonsToMin = (product, stats) =>
  stats.toMinVol > 0 ? Math.max(product.minQty ?? 1, Math.ceil(stats.toMinVol / product.volume)) : 0

export const SEGMENT_COLORS = ['#27624c', '#e2a757', '#9a4a1a', '#5e8021', '#3a8fd0', '#c98c3a', '#1a4a39', '#e2452f', '#6fb04a', '#7a3610']
