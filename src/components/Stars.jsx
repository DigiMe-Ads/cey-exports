import { Star } from 'lucide-react'

export default function Stars({ value = 0, count, size = 'h-3.5 w-3.5' }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={`${size} ${i <= Math.round(value) ? 'fill-gold text-gold' : 'text-slate-300'}`} />
        ))}
      </span>
      {count != null && <span className="text-xs text-slate-500">({count})</span>}
    </span>
  )
}
