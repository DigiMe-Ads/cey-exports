import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

// Profile-style heading: serif title with an italic accent word, small caps eyebrow
export default function SectionHeader({ eyebrow, title, accent, to, cta = 'View all', light = false, children }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className={`mb-2 text-xs font-bold uppercase tracking-[0.22em] ${light ? 'text-gold' : 'text-rust'}`}>{eyebrow}</p>}
        <h2 className={`text-3xl font-medium tracking-tight sm:text-4xl ${light ? 'text-cream' : 'text-forest-800'}`}>
          {title} {accent && <em className={`font-medium ${light ? 'text-gold' : 'text-rust'}`}>{accent}</em>}
        </h2>
      </div>
      <div className="flex items-center gap-3">
        {children}
        {to && (
          <Link to={to} className={`group inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition ${light ? 'glass-dark text-cream hover:bg-white/15' : 'glass text-forest-800 hover:bg-white'}`}>
            {cta} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
    </div>
  )
}
