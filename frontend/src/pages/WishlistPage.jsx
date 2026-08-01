import { motion, AnimatePresence } from 'framer-motion'
import { Heart } from 'lucide-react'
import { useWishlist } from '../context/WishlistContext'
import { useCatalogue } from '../hooks/useProducts'
import ProductCard from '../components/product/ProductCard'
import EmptyState from '../components/ui/EmptyState'
import Container from '../components/ui/Container'

export default function WishlistPage () {
  const wishlist = useWishlist()
  const { data: catalogue = [], isLoading } = useCatalogue()

  if (isLoading) return <div className='min-h-[60vh]' />

  const byId = new Map(catalogue.map(p => [p.id, p]))
  const products = wishlist.ids.map(id => byId.get(id)).filter(Boolean)

  if (products.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title='Your wishlist is empty'
        sub='Save products you like and find them here anytime.'
        cta='Discover products'
        to='/products'
      />
    )
  }

  return (
    <Container className='py-6'>
      <h1 className='font-display text-2xl font-bold tracking-tight text-slate-900'>
        My Wishlist <span className='text-[15px] font-semibold text-slate-400'>({products.length})</span>
      </h1>

      <motion.div layout className='mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 2xl:grid-cols-6'>
        <AnimatePresence mode='popLayout'>
          {products.map((p, i) => (
            <motion.div
              layout
              key={p.id}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.25 }}
            >
              <ProductCard product={p} index={i} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </Container>
  )
}
