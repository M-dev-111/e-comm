import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, ShoppingCart, BadgeCheck } from 'lucide-react'
import Img from '../ui/Img'
import PriceBlock from '../ui/PriceBlock'
import { RatingBadge } from '../ui/Rating'
import { useWishlist } from '../../context/WishlistContext'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../context/ToastContext'
import { fadeUp } from '../../utils/motion'

const TAG_STYLES = {
  bestseller: 'bg-amber-400/95 text-amber-950',
  deal: 'bg-olive-600 text-white',
  trending: 'bg-royal-600 text-white',
  premium: 'bg-slate-900 text-white'
}

const TAG_LABELS = { bestseller: 'Bestseller', deal: 'Deal', trending: 'Trending', premium: 'Premium' }

/** The core product card — used in rails, grids and related sections. */
export default function ProductCard ({ product, index = 0 }) {
  const wishlist = useWishlist()
  const cart = useCart()
  const toast = useToast()
  const liked = wishlist.has(product.id)
  const tag = product.tags?.[0]

  const quickAdd = e => {
    e.preventDefault()
    // pre-select first variant so quick-add mirrors what PDP would do
    cart.add(product.id, { size: product.sizes?.[0] || null, color: product.colors?.[0] || null })
    toast(`${product.brand} added to cart`)
  }

  return (
    <motion.article
      variants={fadeUp}
      initial='hidden'
      whileInView='show'
      viewport={{ once: true, margin: '-30px' }}
      transition={{ delay: (index % 4) * 0.05 }}
      whileHover={{ y: -6 }}
      className='group relative h-full'
    >
      <Link
        to={`/product/${product.id}`}
        className='flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card transition-shadow duration-300 group-hover:shadow-card-hover'
      >
        {/* image */}
        <div className='relative aspect-[4/4.4] overflow-hidden bg-slate-50'>
          <Img
            src={product.images[0]}
            alt={product.name}
            className='h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108'
          />

          {tag && (
            <span className={`absolute left-2.5 top-2.5 rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${TAG_STYLES[tag]}`}>
              {TAG_LABELS[tag]}
            </span>
          )}

          <motion.button
            whileTap={{ scale: 0.8 }}
            aria-label='Toggle wishlist'
            onClick={e => {
              e.preventDefault()
              wishlist.toggle(product.id)
              toast(liked ? 'Removed from wishlist' : 'Saved to wishlist', 'wishlist')
            }}
            className='absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full bg-white/90 shadow backdrop-blur transition-transform hover:scale-110'
          >
            <Heart
              className={`h-4 w-4 transition-colors ${liked ? 'fill-rose-500 text-rose-500' : 'text-slate-500'}`}
              strokeWidth={2}
            />
          </motion.button>

          {/* slide-up quick add */}
          <div className='absolute inset-x-2.5 bottom-2.5 translate-y-[120%] opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100'>
            <button
              onClick={quickAdd}
              className='flex w-full items-center justify-center gap-2 rounded-xl bg-royal-600 py-2.5 text-[12px] font-bold text-white shadow-glow-royal transition-colors hover:bg-royal-700'
            >
              <ShoppingCart className='h-3.5 w-3.5' strokeWidth={2.4} />
              Add to Cart
            </button>
          </div>
        </div>

        {/* body */}
        <div className='flex flex-1 flex-col gap-1.5 p-3.5'>
          <div className='flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400'>
            {product.brand}
            {product.assured && (
              <span className='inline-flex items-center gap-0.5 rounded bg-royal-50 px-1.5 py-0.5 text-[9.5px] font-bold normal-case text-royal-600'>
                <BadgeCheck className='h-3 w-3' strokeWidth={2.4} /> Verified
              </span>
            )}
          </div>

          {/* fixed two-line title block so every card's rating/price rows align */}
          <h3 className='clamp-2 min-h-[2.75em] text-[13.5px] font-medium leading-snug text-slate-800'>{product.name}</h3>

          <div className='mt-auto flex items-center gap-2 pt-1'>
            <RatingBadge value={product.rating} />
            <span className='text-[11px] text-slate-400'>({product.ratingCount.toLocaleString('en-IN')})</span>
          </div>

          <PriceBlock price={product.price} mrp={product.mrp} size='sm' />
        </div>
      </Link>
    </motion.article>
  )
}
