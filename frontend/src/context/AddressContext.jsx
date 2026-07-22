import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ADDRESSES } from '../data/data'

/** Saved delivery addresses — seeded from the demo data, then persisted. */

const AddressContext = createContext(null)
const STORAGE_KEY = 'mcom.addresses.v1'

let addressSeq = 0
const newAddressId = () => `addr-${Date.now()}-${++addressSeq}`

function load () {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (Array.isArray(stored) && stored.length) return stored
  } catch { /* fall through to the seeded list */ }
  return ADDRESSES
}

export function AddressProvider ({ children }) {
  const [addresses, setAddresses] = useState(load)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses))
  }, [addresses])

  const addAddress = useCallback(draft => {
    const address = { ...draft, id: newAddressId(), default: false }
    setAddresses(prev => [...prev, address])
    return address
  }, [])

  const removeAddress = useCallback(id => {
    setAddresses(prev => (prev.length > 1 ? prev.filter(a => a.id !== id) : prev))
  }, [])

  const value = useMemo(
    () => ({ addresses, addAddress, removeAddress }),
    [addresses, addAddress, removeAddress]
  )

  return <AddressContext.Provider value={value}>{children}</AddressContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAddresses = () => {
  const ctx = useContext(AddressContext)
  if (!ctx) throw new Error('useAddresses must be used inside <AddressProvider>')
  return ctx
}
