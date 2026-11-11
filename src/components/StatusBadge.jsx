// Inquiry statuses, in workflow order
export const STATUSES = [
  { key: 'new', label: 'Received', tone: 'bg-globe-blue/15 text-globe-blue', hint: 'We have your inquiry.' },
  { key: 'reviewing', label: 'Reviewing', tone: 'bg-gold/25 text-forest-900', hint: 'Checking stock and pricing.' },
  { key: 'contacted', label: 'Contacted', tone: 'bg-gold/40 text-forest-900', hint: 'Our team has reached out to you.' },
  { key: 'quoted', label: 'Quoted', tone: 'bg-forest-100 text-forest-800', hint: 'A quotation has been sent.' },
  { key: 'confirmed', label: 'Confirmed', tone: 'bg-leaf/20 text-forest-800', hint: 'Order confirmed and being prepared.' },
  { key: 'shipped', label: 'Shipped', tone: 'bg-forest-700 text-cream', hint: 'Your container is on its way.' },
  { key: 'completed', label: 'Completed', tone: 'bg-forest-900 text-gold', hint: 'Delivered — thank you!' },
  { key: 'cancelled', label: 'Cancelled', tone: 'bg-rust/15 text-rust', hint: 'This inquiry was closed.' },
]
export const statusOf = (key) => STATUSES.find((s) => s.key === key) ?? STATUSES[0]

export default function StatusBadge({ status, className = '' }) {
  const s = statusOf(status)
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide ${s.tone} ${className}`}>{s.label}</span>
}
