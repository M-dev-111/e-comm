import { AnimatePresence, motion } from 'framer-motion'
import { ShoppingCart } from 'lucide-react'
import QuantityStepper from '../ui/QuantityStepper'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../context/ToastContext'

/**
 * "Add to Cart" until the item is in the cart, then a − / + stepper.
 * Dropping the quantity to zero removes the line and restores the button.
 *
 * Tracks one exact variant, so a product added in two sizes shows the
 * right quantity on each. Safe to place inside a <Link>: pointer events
 * are stopped so tapping the stepper never navigates.
 */
export default function AddToCartControl ({ product, size, color, variant = 'card' }) {
  const cart = useCart()
  const toast = useToast()

  const chosenSize = size ?? product.sizes?.[0] ?? null
  const chosenColor = color ?? product.colors?.[0] ?? null

  const qty = cart.qtyOfVariant(product.id, chosenSize, chosenColor)
  const key = cart.keyFor(product.id, chosenSize, chosenColor)

  const stop = e => {
    e.preventDefault()
    e.stopPropagation()
  }

  const add = e => {
    stop(e)
    cart.add(product.id, { size: chosenSize, color: chosenColor })
    toast(`${product.brand} added to cart`)
  }

  const setQty = next => {
    cart.setQty(key, next)
    if (next === 0) toast('Removed from cart', 'remove')
  }

  const isLarge = variant === 'detail'

  return (
    <div onClick={stop} className={isLarge ? 'w-full' : ''}>
      <AnimatePresence mode='popLayout' initial={false}>
        {qty === 0 ? (
          <motion.button
            key='add'
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.18 }}
            whileTap={{ scale: 0.96 }}
            onClick={add}
            className={
              isLarge
                ? 'flex w-full items-center justify-center gap-2 rounded-2xl bg-royal-600 py-4 text-[14px] font-bold text-white shadow-glow-royal transition-colors hover:bg-royal-700'
                : 'flex w-full items-center justify-center gap-1.5 rounded-xl border border-royal-600 bg-royal-50 py-2 text-[12px] font-bold text-royal-700 transition-colors hover:bg-royal-600 hover:text-white'
            }
          >
            <ShoppingCart className={isLarge ? 'h-4.5 w-4.5' : 'h-3.5 w-3.5'} strokeWidth={2.4} />
            Add to Cart
          </motion.button>
        ) : (
          <motion.div
            key='stepper'
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.18 }}
            className={isLarge ? 'flex items-center justify-between gap-3 rounded-2xl border border-royal-200 bg-royal-50 px-4 py-2.5' : 'flex justify-center'}
          >
            {isLarge && (
              <span className='text-[13px] font-bold text-royal-800'>
                {qty} in cart
              </span>
            )}
            <QuantityStepper qty={qty} onChange={setQty} size={isLarge ? 'md' : 'sm'} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
