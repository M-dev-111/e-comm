import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import Img from '../ui/Img'
import { RatingBadge } from '../ui/Rating'
import AddToCartControl from '../product/AddToCartControl'
import { formatINR, discountPct } from '../../utils/format'

/** One recommendation: the product, why it matched, and quick actions. */
export default function ProductSuggestion ({ match, onNavigate }) {
  const { product, match: score, reasons } = match

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className='overflow-hidden rounded-xl border border-slate-200 bg-white'
    >
      <div className='flex gap-3 p-2.5'>
        <Link to={`/product/${product.id}`} onClick={onNavigate} className='shrink-0'>
          <Img src={product.images[0]} alt={product.name} className='h-16 w-16 rounded-lg' />
        </Link>

        <div className='min-w-0 flex-1'>
          <div className='flex items-start justify-between gap-2'>
            <Link
              to={`/product/${product.id}`}
              onClick={onNavigate}
              className='clamp-2 text-[12.5px] font-semibold leading-snug text-slate-800 transition-colors hover:text-royal-700'
            >
              {product.name}
            </Link>
            <span className='shrink-0 rounded-md bg-olive-50 px-1.5 py-0.5 text-[10px] font-bold text-olive-700'>
              {score}% match
            </span>
          </div>

          <div className='mt-1 flex flex-wrap items-baseline gap-x-2'>
            <span className='text-[13.5px] font-bold text-slate-900'>{formatINR(product.price)}</span>
            <span className='text-[11px] text-slate-400 line-through'>{formatINR(product.mrp)}</span>
            <span className='text-[11px] font-bold text-olive-600'>{discountPct(product.mrp, product.price)}% off</span>
            <RatingBadge value={product.rating} className='ml-auto' />
          </div>
        </div>
      </div>

      <ul className='space-y-1 border-t border-slate-100 bg-slate-50/70 px-3 py-2'>
        {reasons.map(reason => (
          <li key={reason} className='flex items-start gap-1.5 text-[11px] text-slate-600'>
            <Check className='mt-0.5 h-3 w-3 shrink-0 text-olive-600' strokeWidth={3} />
            {reason}
          </li>
        ))}
      </ul>

      <div className='flex items-center gap-2 border-t border-slate-100 p-2'>
        <Link
          to={`/product/${product.id}`}
          onClick={onNavigate}
          className='flex-1 rounded-xl py-2 text-center text-[12px] font-bold text-royal-600 transition-colors hover:bg-royal-50'
        >
          View details
        </Link>
        <div className='flex-1'>
          <AddToCartControl product={product} />
        </div>
      </div>
    </motion.div>
  )
}
