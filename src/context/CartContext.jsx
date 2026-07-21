import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { getProductById, COUPONS, DELIVERY } from '../data/data'

/**
 * Cart state — persisted to localStorage.
 * Items are stored as { key, id, qty, size, color } where `key` is a
 * composite of id + chosen variant so the same product in two sizes
 * lives as two separate cart lines.
 */

const CartContext = createContext(null)

const STORAGE_KEY = 'mcom.cart.v1'

const keyOf = (id, size, color) => `${id}::${size || '-'}::${color || '-'}`

function load () {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { items: [], coupon: null }
    const parsed = JSON.parse(raw)
    // drop items whose product no longer exists in data.js
    return {
      items: (parsed.items || []).filter(it => getProductById(it.id)),
      coupon: parsed.coupon || null
    }
  } catch {
    return { items: [], coupon: null }
  }
}

function reducer (state, action) {
  switch (action.type) {
    case 'ADD': {
      const { id, qty = 1, size = null, color = null } = action
      const key = keyOf(id, size, color)
      const existing = state.items.find(it => it.key === key)
      const items = existing
        ? state.items.map(it => (it.key === key ? { ...it, qty: Math.min(10, it.qty + qty) } : it))
        : [...state.items, { key, id, qty, size, color }]
      return { ...state, items }
    }
    case 'SET_QTY': {
      const items = state.items
        .map(it => (it.key === action.key ? { ...it, qty: action.qty } : it))
        .filter(it => it.qty > 0)
      return { ...state, items }
    }
    case 'REMOVE':
      return { ...state, items: state.items.filter(it => it.key !== action.key) }
    case 'APPLY_COUPON':
      return { ...state, coupon: action.code }
    case 'REMOVE_COUPON':
      return { ...state, coupon: null }
    case 'CLEAR':
      return { items: [], coupon: null }
    default:
      return state
  }
}

export function CartProvider ({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const value = useMemo(() => {
    const lines = state.items.map(it => ({ ...it, product: getProductById(it.id) }))
    const count = lines.reduce((a, l) => a + l.qty, 0)
    const mrpTotal = lines.reduce((a, l) => a + l.product.mrp * l.qty, 0)
    const priceTotal = lines.reduce((a, l) => a + l.product.price * l.qty, 0)
    const productDiscount = mrpTotal - priceTotal

    const coupon = COUPONS.find(c => c.code === state.coupon) || null
    let couponDiscount = 0
    if (coupon && priceTotal >= coupon.minOrder) {
      couponDiscount =
        coupon.type === 'flat'
          ? coupon.value
          : Math.min(Math.round((priceTotal * coupon.value) / 100), coupon.maxDiscount || Infinity)
    }

    const hasQuick = lines.some(l => l.id.startsWith('q'))
    const hasRegular = lines.some(l => !l.id.startsWith('q'))
    let deliveryFee = 0
    if (hasRegular && priceTotal < DELIVERY.freeAbove) deliveryFee += DELIVERY.fee
    if (hasQuick && priceTotal < DELIVERY.quickFreeAbove) deliveryFee += DELIVERY.quickFee

    const platformFee = lines.length ? DELIVERY.platformFee : 0
    const total = priceTotal - couponDiscount + deliveryFee + platformFee

    return {
      lines,
      count,
      mrpTotal,
      priceTotal,
      productDiscount,
      coupon,
      couponDiscount,
      deliveryFee,
      platformFee,
      total,
      savings: productDiscount + couponDiscount,
      add: (id, opts = {}) => dispatch({ type: 'ADD', id, ...opts }),
      setQty: (key, qty) => dispatch({ type: 'SET_QTY', key, qty }),
      remove: key => dispatch({ type: 'REMOVE', key }),
      applyCoupon: code => dispatch({ type: 'APPLY_COUPON', code }),
      removeCoupon: () => dispatch({ type: 'REMOVE_COUPON' }),
      clear: () => dispatch({ type: 'CLEAR' }),
      qtyOf: id => state.items.filter(it => it.id === id).reduce((a, it) => a + it.qty, 0),
      keyFor: (id, size, color) => keyOf(id, size, color)
    }
  }, [state])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
