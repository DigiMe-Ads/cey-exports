import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useCatalog } from './CatalogContext'
import { maxAddable, planStats, recommendations } from '../lib/container'

// The "cart" is a container load plan: cartons per product + the chosen container.
const CartContext = createContext(null)
const STORAGE_KEY = 'cey-container-plan'

function loadPlan() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const p = JSON.parse(raw)
      if (Array.isArray(p.items)) return p
    }
  } catch {
    /* storage unavailable — start empty */
  }
  return { items: [], containerId: null }
}

export function CartProvider({ children }) {
  const catalog = useCatalog()
  const [plan, setPlan] = useState(loadPlan)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plan))
    } catch {
      /* ignore */
    }
  }, [plan])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2800)
    return () => clearTimeout(t)
  }, [toast])

  const container = catalog.containers.find((c) => c.id === plan.containerId) ?? catalog.defaultContainer
  const lines = useMemo(
    () => plan.items.map((i) => ({ ...i, product: catalog.getProduct(i.slug) })).filter((l) => l.product),
    [plan.items, catalog],
  )
  const stats = useMemo(() => planStats(lines, container), [lines, container])
  const inPlan = useMemo(() => new Set(lines.map((l) => l.slug)), [lines])
  const suggestions = useMemo(
    () => (container ? recommendations(catalog.products, stats, container, inPlan) : []),
    [catalog.products, stats, container, inPlan],
  )

  const qtyOf = (slug) => plan.items.find((i) => i.slug === slug)?.qty ?? 0
  // Room for a product, counting cartons of it already in the plan
  const roomFor = (product) => (container ? maxAddable(product, stats, container) : 0)

  // Adds cartons, capped to what still fits. Returns how many were actually added.
  const add = (slug, qty, { openDrawer = true } = {}) => {
    const product = catalog.getProduct(slug)
    if (!product || !container) return 0
    const current = qtyOf(slug)
    const wanted = Math.max(qty ?? product.minQty, current === 0 ? product.minQty : 1)
    const room = roomFor(product)
    const n = Math.min(wanted, room)
    if (n <= 0 || (current === 0 && n < product.minQty)) {
      setToast({ title: 'Container is full', body: `${product.name} no longer fits in a ${container.name}.`, image: product.image, tone: 'warn' })
      return 0
    }
    setPlan((p) => ({
      ...p,
      items: p.items.some((i) => i.slug === slug)
        ? p.items.map((i) => (i.slug === slug ? { ...i, qty: i.qty + n } : i))
        : [...p.items, { slug, qty: n }],
    }))
    setToast({
      title: n < wanted ? `Added ${n} — container nearly full` : `Added ${n} carton${n > 1 ? 's' : ''}`,
      body: product.name,
      image: product.image,
      tone: n < wanted ? 'warn' : 'ok',
    })
    if (openDrawer) setDrawerOpen(true)
    return n
  }

  // Sets an exact quantity, capped to capacity; below the minimum order removes the line
  const setQty = (slug, qty) => {
    const product = catalog.getProduct(slug)
    if (!product) return
    const current = qtyOf(slug)
    const cap = current + roomFor(product)
    const next = Math.min(Math.max(0, Math.floor(qty) || 0), cap)
    if (qty > cap) setToast({ title: `Only ${cap} cartons fit`, body: product.name, image: product.image, tone: 'warn' })
    setPlan((p) => ({
      ...p,
      items: next < product.minQty ? p.items.filter((i) => i.slug !== slug) : p.items.map((i) => (i.slug === slug ? { ...i, qty: next } : i)),
    }))
  }

  const remove = (slug) => setPlan((p) => ({ ...p, items: p.items.filter((i) => i.slug !== slug) }))
  const clear = () => setPlan((p) => ({ ...p, items: [] }))

  // Switching to a smaller container trims lines from the bottom until the plan fits
  const setContainerId = (id) => {
    const next = catalog.containers.find((c) => c.id === id)
    if (!next) return
    let kept = [...plan.items]
    const fits = (items) => {
      const ls = items.map((i) => ({ ...i, product: catalog.getProduct(i.slug) })).filter((l) => l.product)
      return planStats(ls, next).fill <= 100.0001
    }
    let trimmed = false
    while (kept.length && !fits(kept)) {
      const last = kept[kept.length - 1]
      const product = catalog.getProduct(last.slug)
      const reduced = last.qty - Math.max(1, Math.ceil(last.qty * 0.05))
      kept = reduced >= (product?.minQty ?? 1) ? [...kept.slice(0, -1), { ...last, qty: reduced }] : kept.slice(0, -1)
      trimmed = true
    }
    setPlan({ items: kept, containerId: id })
    if (trimmed) setToast({ title: 'Plan trimmed to fit', body: `Some cartons were removed to fit a ${next.name}.`, tone: 'warn' })
  }

  const value = {
    lines, stats, container, containers: catalog.containers, suggestions,
    count: stats.cartons,
    add, setQty, remove, clear, qtyOf, roomFor, setContainerId,
    drawerOpen, openDrawer: () => setDrawerOpen(true), closeDrawer: () => setDrawerOpen(false),
    toast, notify: setToast,
  }
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)
