// Inner-page banner modelled on the profile's dark-green cover panels
export default function PageHero({ eyebrow, title, accent, subtitle, image, children }) {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-4">
      <div className="relative isolate overflow-hidden rounded-[2rem] bg-forest-800 px-6 py-10 text-cream sm:px-10 sm:py-14">
        {image && (
          <>
            <img src={image} alt="" className="absolute inset-y-0 right-0 -z-10 h-full w-full object-cover opacity-35 md:w-2/3 md:opacity-60" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-forest-800 via-forest-800/90 to-forest-800/20" />
          </>
        )}
        <div className="rings pointer-events-none absolute inset-0 -z-10" />
        <div className="absolute left-0 top-0 h-1.5 w-1/4 bg-gold" />
        {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold">{eyebrow}</p>}
        <h1 className="mt-3 max-w-3xl text-4xl font-medium leading-tight sm:text-5xl">
          {title} {accent && <em className="text-gold">{accent}</em>}
        </h1>
        {subtitle && <p className="mt-3 max-w-2xl text-sm text-cream/75 sm:text-base">{subtitle}</p>}
        {children}
      </div>
    </section>
  )
}
