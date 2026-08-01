import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ADDRESSES } from '../data/data'

/** Placed orders — persisted, with a little demo history seeded in. */

const OrdersContext = createContext(null)
const STORAGE_KEY = 'mcom.orders.v1'

const daysAgo = n => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(11, 30, 0, 0)
  return d.toISOString()
}

/* Demo order history is illustrative only, so its lines are inlined rather
   than resolved from the live catalogue — that keeps it independent of
   whatever a vendor has actually listed. */
function seedOrders () {
  const home = ADDRESSES[0]
  const delivered = [
    {
      id: 'seed-1', qty: 1, size: 'UK 9', color: null,
      name: 'AeroStride Velocity Running Shoes', brand: 'AeroStride',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
      price: 3299
    },
    {
      id: 'seed-2', qty: 2, size: 'L', color: null,
      name: 'Essential Oversized Cotton Tee', brand: 'Drift',
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
      price: 799
    }
  ]
  const shipped = [
    {
      id: 'seed-3', qty: 1, size: null, color: 'Midnight Black',
      name: 'Sonicwave Pro ANC Wireless Headphones', brand: 'Sonicwave',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      price: 4999
    }
  ]

  const sum = items => items.reduce((a, i) => a + i.price * i.qty, 0)

  return [
    {
      id: 'OD408217364590',
      placedAt: daysAgo(2),
      status: 'shipped',
      items: shipped,
      total: sum(shipped) + 3,
      savings: 5000,
      payment: 'UPI',
      address: home,
      etaDays: 1
    },
    {
      id: 'OD408112907745',
      placedAt: daysAgo(14),
      status: 'delivered',
      items: delivered,
      total: sum(delivered) + 3,
      savings: 4900,
      payment: 'Credit / Debit Card',
      address: home,
      etaDays: 0
    }
  ]
}

function load () {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (Array.isArray(stored)) return stored
  } catch { /* fall through to the seed */ }
  return seedOrders()
}

export function OrdersProvider ({ children }) {
  const [orders, setOrders] = useState(load)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
  }, [orders])

  /** Newest first. */
  const placeOrder = useCallback(order => {
    setOrders(prev => [order, ...prev])
  }, [])

  const cancelOrder = useCallback(id => {
    setOrders(prev => prev.map(o => (o.id === id ? { ...o, status: 'cancelled' } : o)))
  }, [])

  const value = useMemo(
    () => ({
      orders,
      placeOrder,
      cancelOrder,
      getOrder: id => orders.find(o => o.id === id)
    }),
    [orders, placeOrder, cancelOrder]
  )

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useOrders = () => {
  const ctx = useContext(OrdersContext)
  if (!ctx) throw new Error('useOrders must be used inside <OrdersProvider>')
  return ctx
}
