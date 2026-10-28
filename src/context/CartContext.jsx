import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { coupons, getProduct } from '../data/catalog'

const CartContext = createContext(null)
const STORAGE_KEY = 'cey-exports-cart'
const FREE_DELIVERY_FROM = 100
const DELIVERY_FEE = 15

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* storage unavailable — start empty */
  }
  // Seed the demo cart so the client sees a populated cart on first visit
  return [
    { slug: 'ceylon-cinnamon', qty: 1 },
    { slug: 'keeri-samba', qty: 2 },
    { slug: 'mackerel', qty: 3 },
  ]
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [couponCode, setCouponCode] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      /* ignore */
    }
  }, [items])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(t)
  }, [toast])

  const lines = useMemo(
    () => items.map((i) => ({ ...i, product: getProduct(i.slug) })).filter((l) => l.product),
    [items],
  )

  const add = (slug, qty = 1, { openDrawer = true } = {}) => {
    setItems((prev) => {
      const found = prev.find((i) => i.slug === slug)
      if (found) return prev.map((i) => (i.slug === slug ? { ...i, qty: i.qty + qty } : i))
      return [...prev, { slug, qty }]
    })
    const p = getProduct(slug)
    setToast({ title: 'Added to cart', body: p?.name, image: p?.image })
    if (openDrawer) setDrawerOpen(true)
  }
  const setQty = (slug, qty) =>
    setItems((prev) => (qty <= 0 ? prev.filter((i) => i.slug !== slug) : prev.map((i) => (i.slug === slug ? { ...i, qty } : i))))
  const remove = (slug) => setItems((prev) => prev.filter((i) => i.slug !== slug))
  const clear = () => setItems([])
  const qtyOf = (slug) => items.find((i) => i.slug === slug)?.qty ?? 0

  const count = lines.reduce((s, l) => s + l.qty, 0)
  const subtotal = lines.reduce((s, l) => s + l.qty * l.product.price, 0)
  const savings = lines.reduce((s, l) => s + l.qty * ((l.product.compareAt ?? l.product.price) - l.product.price), 0)
  const coupon = coupons.find((c) => c.code === couponCode)
  const couponValid = coupon && subtotal >= coupon.min
  const discount = couponValid && coupon.type === 'percent' ? (subtotal * coupon.value) / 100 : 0
  const freeDelivery = subtotal >= FREE_DELIVERY_FROM || (couponValid && coupon.type === 'shipping')
  const delivery = lines.length === 0 || freeDelivery ? 0 : DELIVERY_FEE
  const total = Math.max(0, subtotal - discount + delivery)

  const applyCoupon = (code) => {
    const c = coupons.find((x) => x.code === code.trim().toUpperCase())
    if (!c) return { ok: false, message: 'That code is not valid.' }
    if (subtotal < c.min) return { ok: false, message: `Add AED ${(c.min - subtotal).toFixed(2)} more to use ${c.code}.` }
    setCouponCode(c.code)
    return { ok: true, message: `${c.code} applied — ${c.title}!` }
  }

  const value = {
    lines, count, subtotal, savings, discount, delivery, total, coupon: couponValid ? coupon : null,
    freeDeliveryFrom: FREE_DELIVERY_FROM, toFreeDelivery: Math.max(0, FREE_DELIVERY_FROM - subtotal),
    add, setQty, remove, clear, qtyOf, applyCoupon, removeCoupon: () => setCouponCode(null),
    drawerOpen, openDrawer: () => setDrawerOpen(true), closeDrawer: () => setDrawerOpen(false),
    toast, notify: setToast,
  }
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)
