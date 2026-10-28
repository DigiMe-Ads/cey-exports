import { CircleCheck } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function Toast() {
  const { toast, drawerOpen } = useCart()
  if (!toast || drawerOpen) return null
  return (
    <div className="fixed bottom-5 left-1/2 z-[70] w-[min(92vw,380px)] -translate-x-1/2 animate-pop" role="status">
      <div className="glass-forest flex items-center gap-3 rounded-2xl p-3 text-cream">
        {toast.image ? <img src={toast.image} alt="" className="h-12 w-12 rounded-xl object-cover" /> : <CircleCheck className="h-6 w-6 text-gold" />}
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm font-bold"><CircleCheck className="h-4 w-4 text-gold" /> {toast.title}</p>
          {toast.body && <p className="truncate text-xs text-cream/70">{toast.body}</p>}
        </div>
      </div>
    </div>
  )
}
