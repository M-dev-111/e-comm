import { Star } from 'lucide-react'

/** Compact rating chip in the brand's olive green. */
export function RatingBadge ({ value, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md bg-olive-600 px-1.5 py-0.5 text-[11px] font-semibold text-white ${className}`}
    >
      {value.toFixed(1)}
      <Star className='h-2.5 w-2.5' fill='currentColor' strokeWidth={0} />
    </span>
  )
}

/** Row of 5 stars, partially filled. */
export function RatingStars ({ value, size = 'h-4 w-4', className = '' }) {
  return (
    <span className={`inline-flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`${size} ${i <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`}
          strokeWidth={0}
        />
      ))}
    </span>
  )
}
