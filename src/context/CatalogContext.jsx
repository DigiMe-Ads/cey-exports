import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

const CatalogContext = createContext(null)

// Shape DB rows into what the storefront components use
const toProduct = (r, brandSlug, catSlug) => ({
  id: r.id,
  slug: r.slug,
  name: r.name,
  description: r.description,
  brand: brandSlug[r.brand_id] ?? null,
  category: catSlug[r.category_id] ?? null,
  image: r.image_url,
  pack: r.pack,
  price: r.price == null ? null : Number(r.price),
  compareAt: r.compare_at == null ? null : Number(r.compare_at),
  dims: [Number(r.carton_length_cm), Number(r.carton_width_cm), Number(r.carton_height_cm)],
  volume: Number(r.volume_cm3),
  weight: r.gross_weight_kg == null ? 0 : Number(r.gross_weight_kg),
  stock: r.stock,
  minQty: r.min_order_qty,
  isNew: r.is_new,
  featured: r.featured,
  best: r.best,
})

export function CatalogProvider({ children }) {
  const [data, setData] = useState({ categories: [], brands: [], products: [], containers: [], blogs: [], promotions: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    const [cats, brands, prods, conts, blogs, promos] = await Promise.all([
      supabase.from('categories').select('*').order('sort'),
      supabase.from('brands').select('*').order('sort'),
      // Admins can read inactive rows too; the storefront only shows active ones
      supabase.from('products').select('*').eq('is_active', true).order('sort'),
      supabase.from('containers').select('*').eq('is_active', true).order('sort'),
      supabase.from('blogs').select('*').eq('is_published', true).order('published_at', { ascending: false }),
      supabase.from('promotions').select('*').eq('is_active', true).order('sort'),
    ])
    const failed = [cats, brands, prods, conts, blogs, promos].find((r) => r.error)
    if (failed) {
      setError(failed.error.message)
      setLoading(false)
      return
    }
    const brandSlug = Object.fromEntries(brands.data.map((b) => [b.id, b.slug]))
    const catSlug = Object.fromEntries(cats.data.map((c) => [c.id, c.slug]))
    setData({
      categories: cats.data.map((c) => ({ ...c, image: c.image_url })),
      brands: brands.data.map((b) => ({ ...b, logo: b.logo_url })),
      products: prods.data.map((p) => toProduct(p, brandSlug, catSlug)),
      containers: conts.data,
      blogs: blogs.data.map((b) => ({ ...b, image: b.image_url, read: b.read_time, date: new Date(b.published_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) })),
      promotions: promos.data.map((p) => ({ ...p, image: p.image_url, ends: p.ends_text, to: p.link || '/shop' })),
    })
    setError(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const value = useMemo(() => {
    const bySlug = (list) => Object.fromEntries(list.map((x) => [x.slug, x]))
    const brandMap = bySlug(data.brands)
    const catMap = bySlug(data.categories)
    const prodMap = bySlug(data.products)
    return {
      ...data,
      loading,
      error,
      refresh: load,
      getBrand: (slug) => brandMap[slug],
      getCategory: (slug) => catMap[slug],
      getProduct: (slug) => prodMap[slug],
      countIn: (slug) => data.products.filter((p) => p.category === slug).length,
      brandCount: (slug) => data.products.filter((p) => p.brand === slug).length,
      defaultContainer: data.containers.find((c) => c.is_default) ?? data.containers[0] ?? null,
    }
  }, [data, loading, error, load])

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

export const useCatalog = () => useContext(CatalogContext)
