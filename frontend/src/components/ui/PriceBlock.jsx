import { formatINR, discountPct } from '../../utils/format'

/** price + struck MRP + green % off — the classic e-comm price row */
export default function PriceBlock ({ price, mrp, size = 'md', className = '' }) {
  const sizes = {
    sm: { price: 'text-[15px]', rest: 'text-[11px]' },
    md: { price: 'text-lg', rest: 'text-[12px]' },
    lg: { price: 'text-[28px]', rest: 'text-sm' }
  }[size]

  return (
    <div className={`flex flex-wrap items-baseline gap-x-2 gap-y-0.5 ${className}`}>
      <span className={`font-display font-bold text-slate-900 ${sizes.price}`}>{formatINR(price)}</span>
      {mrp > price && (
        <>
          <span className={`text-slate-400 line-through ${sizes.rest}`}>{formatINR(mrp)}</span>
          <span className={`font-semibold text-olive-600 ${sizes.rest}`}>{discountPct(mrp, price)}% off</span>
        </>
      )}
    </div>
  )
}
