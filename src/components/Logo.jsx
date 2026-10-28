export default function Logo({ light = false, compact = false }) {
  return (
    <span className="inline-flex items-center gap-2.5" aria-label="Cey Exports — Ceylon International Exports">
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full sm:h-12 sm:w-12 ${light ? 'bg-white' : 'bg-white shadow-md shadow-forest-800/10 ring-2 ring-gold/70'}`}>
        <img src="/cey/globe.png" alt="" className="h-7 w-7 object-contain sm:h-9 sm:w-9" />
      </span>
      {!compact && (
        <span className="leading-none">
          <span className={`block font-serif text-xl sm:text-[1.45rem] font-semibold tracking-tight ${light ? 'text-cream' : 'text-forest-800'}`}>
            Cey <em className={`font-medium ${light ? 'text-gold' : 'text-rust'}`}>Exports</em>
          </span>
          <span className={`mt-0.5 hidden text-[9.5px] sm:block font-bold uppercase tracking-[0.18em] ${light ? 'text-cream/60' : 'text-forest-700/70'}`}>
            Ceylon International Exports
          </span>
        </span>
      )}
    </span>
  )
}
