import { BRANDS } from '../../data/data'

/** Infinite scrolling brand strip. */
export default function BrandMarquee () {
  const row = [...BRANDS, ...BRANDS]
  return (
    <div className='w-full overflow-hidden border-y border-slate-100 bg-white py-5'>
      <div className='flex w-max animate-marquee items-center gap-14 pr-14'>
        {row.map((b, i) => (
          <span
            key={i}
            className='font-display text-lg font-bold tracking-tight text-slate-300 transition-colors hover:text-royal-500'
          >
            {b}
          </span>
        ))}
      </div>
    </div>
  )
}
