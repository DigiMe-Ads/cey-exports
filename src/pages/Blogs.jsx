import { useState } from 'react'
import { ArrowUpRight, Clock } from 'lucide-react'
import PageHero from '../components/PageHero'
import { blogs } from '../data/catalog'

export default function Blogs() {
  const cats = ['All', ...new Set(blogs.map((b) => b.category))]
  const [cat, setCat] = useState('All')
  const [lead, ...rest] = blogs
  const list = cat === 'All' ? rest : blogs.filter((b) => b.category === cat)

  return (
    <>
      <PageHero eyebrow="Journal" title="Our latest" accent="Blog" subtitle="Articles, recipes and stories from our farms, warehouses and partner brands." />

      {cat === 'All' && (
        <section className="mx-auto mt-10 max-w-7xl px-4">
          <article className="glass-strong group grid overflow-hidden rounded-[2rem] md:grid-cols-2">
            <img src={lead.image} alt="" className="h-full min-h-64 w-full object-cover" />
            <div className="flex flex-col justify-center p-6 sm:p-10">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-rust">Featured · {lead.category}</p>
              <h2 className="mt-3 text-3xl font-medium leading-tight text-forest-800 sm:text-4xl">{lead.title}</h2>
              <p className="mt-3 text-slate-600">{lead.excerpt}</p>
              <p className="mt-5 flex items-center gap-2 text-sm text-slate-500"><Clock className="h-4 w-4" /> {lead.date} · {lead.read} read</p>
              <a href="#" className="mt-6 inline-flex items-center gap-2 self-start rounded-full bg-forest-800 px-6 py-3 text-sm font-bold text-cream">Read article <ArrowUpRight className="h-4 w-4 text-gold" /></a>
            </div>
          </article>
        </section>
      )}

      <section className="mx-auto mt-10 max-w-7xl px-4">
        <div className="no-scrollbar mb-6 flex gap-2 overflow-x-auto">
          {cats.map((c) => (
            <button key={c} type="button" onClick={() => setCat(c)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${cat === c ? 'bg-forest-800 text-cream' : 'glass text-forest-800 hover:bg-white'}`}>{c}</button>
          ))}
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((b) => (
            <a key={b.slug} href="#" className="glass group overflow-hidden rounded-[2rem] p-3">
              <div className="relative overflow-hidden rounded-3xl">
                <img src={b.image} alt="" className="aspect-[16/10] w-full object-cover transition duration-700 group-hover:scale-105" />
                <span className="glass-strong absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold text-forest-800">{b.category}</span>
              </div>
              <div className="p-3">
                <p className="text-xs text-slate-500">{b.date} · {b.read} read</p>
                <h3 className="mt-2 text-xl font-medium leading-snug text-forest-800 group-hover:text-rust">{b.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-slate-600">{b.excerpt}</p>
              </div>
            </a>
          ))}
        </div>
      </section>
    </>
  )
}
