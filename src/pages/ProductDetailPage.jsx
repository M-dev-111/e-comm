import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BadgeCheck, ChevronRight, Heart, MapPin, PackageSearch, RotateCcw, ShieldCheck,
  Tag, Truck, Zap
} from 'lucide-react'
import { getProductById, getRelated, getReviewsFor, CATEGORIES, COUPONS } from '../data/data'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useToast } from '../context/ToastContext'
import { discountPct, deliveryDateLabel } from '../utils/format'
import { EASE } from '../utils/motion'
import Img from '../components/ui/Img'
import PriceBlock from '../components/ui/PriceBlock'
import { RatingBadge, RatingStars } from '../components/ui/Rating'
import AddToCartControl from '../components/product/AddToCartControl'
import ProductRail from '../components/home/ProductRail'
import EmptyState from '../components/ui/EmptyState'
import Container from '../components/ui/Container'

function Gallery ({ product }) {
  // remounted via key={product.id}, so `active` resets on product change
  const [active, setActive] = useState(0)

  return (
    <div className='flex flex-col-reverse gap-3 sm:flex-row'>
      {/* thumbnails */}
      <div className='flex gap-2.5 sm:flex-col'>
        {product.images.map((src, i) => (
          <button
            key={src}
            onMouseEnter={() => setActive(i)}
            onClick={() => setActive(i)}
            className={`overflow-hidden rounded-xl border-2 transition-all ${
              i === active ? 'border-royal-600 shadow-glow-royal' : 'border-transparent opacity-70 hover:opacity-100'
            }`}
          >
            <Img src={src} alt='' className='h-16 w-16 object-cover' />
          </button>
        ))}
      </div>

      {/* main image */}
      <div className='relative flex-1 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-card'>
        <AnimatePresence mode='popLayout'>
          <motion.div
            key={active}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <Img src={product.images[active]} alt={product.name} className='aspect-square w-full object-cover' />
          </motion.div>
        </AnimatePresence>
        <span className='absolute left-4 top-4 rounded-lg bg-olive-600 px-2.5 py-1 text-[11px] font-bold text-white'>
          {discountPct(product.mrp, product.price)}% OFF
        </span>
      </div>
    </div>
  )
}

function VariantPicker ({ label, options, value, onChange }) {
  return (
    <div>
      <p className='mb-2 text-[12px] font-bold uppercase tracking-wide text-slate-500'>
        {label}: <span className='text-slate-900'>{value}</span>
      </p>
      <div className='flex flex-wrap gap-2'>
        {options.map(opt => (
          <motion.button
            key={opt}
            whileTap={{ scale: 0.94 }}
            onClick={() => onChange(opt)}
            className={`rounded-xl border px-3.5 py-2 text-[12.5px] font-semibold transition-all ${
              value === opt
                ? 'border-royal-600 bg-royal-600 text-white shadow-glow-royal'
                : 'border-slate-200 bg-white text-slate-700 hover:border-royal-300'
            }`}
          >
            {opt}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

function PincodeCheck () {
  const [pin, setPin] = useState('')
  const [checked, setChecked] = useState(null)

  return (
    <div className='rounded-2xl border border-slate-100 bg-slate-50/60 p-4'>
      <div className='flex items-center gap-2 text-[12px] font-bold uppercase tracking-wide text-slate-500'>
        <MapPin className='h-4 w-4 text-royal-600' /> Deliver to
      </div>
      <div className='mt-2.5 flex gap-2'>
        <input
          value={pin}
          onChange={e => {
            setPin(e.target.value.replace(/\D/g, '').slice(0, 6))
            setChecked(null)
          }}
          placeholder='Enter pincode'
          className='w-36 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[13px] outline-none transition-colors focus:border-royal-400'
        />
        <button
          onClick={() => pin.length === 6 && setChecked(true)}
          className='rounded-xl px-3 text-[12.5px] font-bold text-royal-600 transition-colors hover:bg-royal-50'
        >
          Check
        </button>
      </div>
      <AnimatePresence>
        {checked && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className='mt-2 text-[12.5px] font-semibold text-olive-600'
          >
            ✓ Delivery by {deliveryDateLabel(3)} · Free above ₹499
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ProductDetailPage () {
  const { id } = useParams()
  const product = getProductById(id)
  const navigate = useNavigate()
  const cart = useCart()
  const wishlist = useWishlist()
  const toast = useToast()

  // the page remounts per-route (keyed <Routes>), so lazy init is enough
  const [size, setSize] = useState(() => product?.sizes?.[0] || null)
  const [color, setColor] = useState(() => product?.colors?.[0] || null)
  const [tab, setTab] = useState('description')

  const reviews = useMemo(() => (product ? getReviewsFor(product.id) : []), [product])

  if (!product || product.id.startsWith('q')) {
    return <EmptyState icon={PackageSearch} title='Product not found' sub='This product may have been removed from the catalogue.' to='/products' cta='Browse products' />
  }

  const liked = wishlist.has(product.id)
  const related = getRelated(product)
  const catLabel = CATEGORIES.find(c => c.id === product.category)?.label

  const buyNow = () => {
    cart.add(product.id, { size, color })
    navigate('/checkout')
  }

  return (
    <>
      <Container className='py-5'>
        {/* breadcrumb */}
        <nav className='mb-4 flex items-center gap-1 text-[12px] text-slate-400'>
          <Link to='/' className='transition-colors hover:text-royal-600'>Home</Link>
          <ChevronRight className='h-3 w-3' />
          <Link to={`/products?category=${product.category}`} className='transition-colors hover:text-royal-600'>{catLabel}</Link>
          <ChevronRight className='h-3 w-3' />
          <span className='clamp-1 max-w-48 text-slate-600'>{product.name}</span>
        </nav>

        <div className='grid grid-cols-1 gap-8 lg:grid-cols-2 xl:gap-14'>
          {/* left — gallery (sticky on desktop) */}
          <div className='lg:sticky lg:top-44 lg:self-start'>
            <Gallery key={product.id} product={product} />

            {/* desktop CTAs */}
            <div className='mt-4 hidden grid-cols-2 items-center gap-3 lg:grid'>
              <AddToCartControl product={product} size={size} color={color} variant='detail' />
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={buyNow}
                className='flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-olive-600 to-olive-500 py-4 text-[14px] font-bold text-white shadow-glow-olive transition-transform hover:-translate-y-0.5'
              >
                <Zap className='h-4.5 w-4.5' strokeWidth={2.2} /> Buy Now
              </motion.button>
            </div>
          </div>

          {/* right — details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className='min-w-0'
          >
            <div className='flex items-center gap-2 text-[12.5px] font-semibold uppercase tracking-wide text-slate-400'>
              {product.brand}
              {product.assured && (
                <span className='inline-flex items-center gap-1 rounded-md bg-royal-50 px-2 py-0.5 text-[10.5px] font-bold normal-case text-royal-600'>
                  <BadgeCheck className='h-3.5 w-3.5' /> mCOM Verified
                </span>
              )}
            </div>

            <h1 className='mt-1.5 font-display text-[clamp(20px,2.4vw,30px)] font-bold leading-tight tracking-tight text-slate-900'>
              {product.name}
            </h1>

            <div className='mt-3 flex items-center gap-2.5'>
              <RatingBadge value={product.rating} />
              <span className='text-[12.5px] text-slate-500'>
                {product.ratingCount.toLocaleString('en-IN')} ratings · {product.reviewCount.toLocaleString('en-IN')} reviews
              </span>
            </div>

            <div className='mt-5'>
              <PriceBlock price={product.price} mrp={product.mrp} size='lg' />
              <p className='mt-1 text-[12px] text-slate-400'>inclusive of all taxes</p>
            </div>

            {/* offers */}
            <div className='mt-5 space-y-2 rounded-2xl border border-olive-200 bg-olive-50/50 p-4'>
              <p className='flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-olive-700'>
                <Tag className='h-3.5 w-3.5' /> Available offers
              </p>
              {COUPONS.map(c => (
                <p key={c.code} className='text-[13px] text-slate-700'>
                  <span className='font-bold text-olive-700'>{c.code}</span> — {c.label}
                </p>
              ))}
              <p className='text-[13px] text-slate-700'>
                <span className='font-bold text-olive-700'>BANK OFFER</span> — 10% instant discount with partner bank cards
              </p>
            </div>

            {/* variants */}
            <div className='mt-6 space-y-5'>
              {product.colors && <VariantPicker label='Color' options={product.colors} value={color} onChange={setColor} />}
              {product.sizes && <VariantPicker label='Size' options={product.sizes} value={size} onChange={setSize} />}
            </div>

            {/* stock urgency */}
            {product.stock <= 10 && (
              <p className='mt-4 inline-block rounded-lg bg-rose-50 px-3 py-1.5 text-[12.5px] font-bold text-rose-600'>
                Only {product.stock} left in stock
              </p>
            )}

            <div className='mt-6 grid gap-4 sm:grid-cols-2'>
              <PincodeCheck />
              <div className='grid grid-cols-3 gap-2 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 text-center'>
                {[
                  { icon: Truck, label: `Delivery in ${product.deliveryDays} days` },
                  { icon: RotateCcw, label: '7-day easy returns' },
                  { icon: ShieldCheck, label: `${product.specs.Warranty || '1 year'} warranty` }
                ].map((f, i) => (
                  <div key={i} className='flex flex-col items-center gap-1.5'>
                    <span className='grid h-9 w-9 place-items-center rounded-full bg-white text-royal-600 shadow-sm'>
                      <f.icon className='h-4 w-4' strokeWidth={2} />
                    </span>
                    <span className='text-[10.5px] font-medium leading-tight text-slate-500'>{f.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* wishlist */}
            <button
              onClick={() => {
                wishlist.toggle(product.id)
                toast(liked ? 'Removed from wishlist' : 'Saved to wishlist', 'wishlist')
              }}
              className='mt-5 flex items-center gap-2 text-[13px] font-semibold text-slate-500 transition-colors hover:text-rose-500'
            >
              <Heart className={`h-4.5 w-4.5 ${liked ? 'fill-rose-500 text-rose-500' : ''}`} strokeWidth={2} />
              {liked ? 'Saved to wishlist' : 'Save to wishlist'}
            </button>

            {/* tabs: description / highlights / specs / reviews */}
            <div className='mt-8'>
              <div className='flex gap-1 border-b border-slate-200'>
                {['description', 'highlights', 'specs', 'reviews'].map(t => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`relative px-4 py-2.5 text-[13px] font-semibold capitalize transition-colors ${
                      tab === t ? 'text-royal-700' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {t}
                    {tab === t && (
                      <motion.span layoutId='pdp-tab' className='absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-royal-600' />
                    )}
                  </button>
                ))}
              </div>

              <AnimatePresence mode='wait'>
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className='py-5'
                >
                  {tab === 'description' && (
                    <p className='max-w-prose text-[14px] leading-relaxed text-slate-600'>{product.description}</p>
                  )}

                  {tab === 'highlights' && (
                    <ul className='space-y-2.5'>
                      {product.highlights.map(h => (
                        <li key={h} className='flex items-start gap-2.5 text-[13.5px] text-slate-600'>
                          <span className='mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-olive-500' />
                          {h}
                        </li>
                      ))}
                    </ul>
                  )}

                  {tab === 'specs' && (
                    <div className='overflow-hidden rounded-2xl border border-slate-100'>
                      {Object.entries(product.specs).map(([k, v], i) => (
                        <div key={k} className={`flex text-[13px] ${i % 2 ? 'bg-white' : 'bg-slate-50/70'}`}>
                          <span className='w-36 shrink-0 px-4 py-3 font-semibold text-slate-500'>{k}</span>
                          <span className='px-4 py-3 text-slate-800'>{v}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {tab === 'reviews' && (
                    <div className='space-y-4'>
                      <div className='flex items-center gap-4 rounded-2xl bg-slate-50 p-4'>
                        <span className='font-display text-4xl font-extrabold text-slate-900'>{product.rating}</span>
                        <div>
                          <RatingStars value={product.rating} />
                          <p className='mt-1 text-[12px] text-slate-400'>
                            {product.ratingCount.toLocaleString('en-IN')} verified ratings
                          </p>
                        </div>
                      </div>
                      {reviews.map(r => (
                        <div key={r.id} className='rounded-2xl border border-slate-100 p-4'>
                          <div className='flex items-center gap-2'>
                            <RatingBadge value={r.rating} />
                            <span className='text-[13.5px] font-bold text-slate-800'>{r.title}</span>
                          </div>
                          <p className='mt-2 text-[13px] leading-relaxed text-slate-600'>{r.body}</p>
                          <p className='mt-2.5 text-[11.5px] text-slate-400'>
                            {r.user} {r.verified && '· ✓ Certified buyer'} · {r.date} · {r.helpful} found helpful
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </Container>

      {/* related */}
      <ProductRail kicker='You may also like' title={`More in ${catLabel}`} products={related} to={`/products?category=${product.category}`} />

      {/* mobile sticky buy bar */}
      <div className='fixed inset-x-0 bottom-14.25 z-40 grid grid-cols-2 items-center gap-2 border-t border-slate-200 bg-white px-3 py-2.5 md:bottom-0 lg:hidden'>
        <AddToCartControl product={product} size={size} color={color} />
        <button
          onClick={buyNow}
          className='flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-olive-600 to-olive-500 py-2.5 text-[12.5px] font-bold text-white'
        >
          <Zap className='h-3.5 w-3.5' strokeWidth={2.4} /> Buy Now
        </button>
      </div>
    </>
  )
}
