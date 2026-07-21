import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, X, ChevronDown, Check, SearchX } from 'lucide-react'
import { PRODUCTS, CATEGORIES, BRANDS } from '../data/data'
import ProductCard from '../components/product/ProductCard'
import EmptyState from '../components/ui/EmptyState'
import Container from '../components/ui/Container'
import { formatINR } from '../utils/format'

const SORTS = [
  { id: 'popular', label: 'Popularity', fn: (a, b) => b.ratingCount - a.ratingCount },
  { id: 'price-asc', label: 'Price — Low to High', fn: (a, b) => a.price - b.price },
  { id: 'price-desc', label: 'Price — High to Low', fn: (a, b) => b.price - a.price },
  { id: 'rating', label: 'Customer Rating', fn: (a, b) => b.rating - a.rating },
  { id: 'discount', label: 'Discount', fn: (a, b) => (b.mrp - b.price) / b.mrp - (a.mrp - a.price) / a.mrp }
]

const PRICE_BUCKETS = [
  { id: 'p1', label: 'Under ₹1,000', min: 0, max: 1000 },
  { id: 'p2', label: '₹1,000 – ₹5,000', min: 1000, max: 5000 },
  { id: 'p3', label: '₹5,000 – ₹20,000', min: 5000, max: 20000 },
  { id: 'p4', label: 'Above ₹20,000', min: 20000, max: Infinity }
]

const RATING_FILTERS = [4.5, 4, 3.5]

function CheckRow ({ checked, label, onToggle }) {
  return (
    <button onClick={onToggle} className='group flex w-full items-center gap-2.5 py-1.5 text-left'>
      <span
        className={`grid h-4.5 w-4.5 place-items-center rounded-md border transition-all ${
          checked ? 'border-royal-600 bg-royal-600' : 'border-slate-300 bg-white group-hover:border-royal-400'
        }`}
      >
        {checked && <Check className='h-3 w-3 text-white' strokeWidth={3} />}
      </span>
      <span className={`text-[13px] ${checked ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>{label}</span>
    </button>
  )
}

function FilterSection ({ title, children }) {
  const [open, setOpen] = useState(true)
  return (
    <div className='border-b border-slate-100 py-4'>
      <button onClick={() => setOpen(v => !v)} className='flex w-full items-center justify-between'>
        <span className='text-[11.5px] font-bold uppercase tracking-[0.14em] text-slate-800'>{title}</span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className='overflow-hidden'
          >
            <div className='pt-2.5'>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ProductListPage () {
  const [params, setParams] = useSearchParams()
  const [mobileFilters, setMobileFilters] = useState(false)

  const q = params.get('q') || ''
  const category = params.get('category') || ''
  const tag = params.get('tag') || ''
  const sort = params.get('sort') || 'popular'
  const brands = params.getAll('brand')
  const prices = params.getAll('price')
  const minRating = Number(params.get('rating')) || 0

  const patch = updates => {
    const next = new URLSearchParams(params)
    Object.entries(updates).forEach(([k, v]) => {
      next.delete(k)
      if (Array.isArray(v)) v.forEach(x => next.append(k, x))
      else if (v) next.set(k, v)
    })
    setParams(next, { replace: true })
  }

  const toggleIn = (key, list, value) =>
    patch({ [key]: list.includes(value) ? list.filter(x => x !== value) : [...list, value] })

  const brandKey = brands.join('|')
  const priceKey = prices.join('|')

  const results = useMemo(() => {
    let list = [...PRODUCTS]
    if (category) list = list.filter(p => p.category === category)
    if (tag) list = list.filter(p => p.tags.includes(tag))
    if (q) {
      const s = q.toLowerCase()
      list = list.filter(
        p => p.name.toLowerCase().includes(s) || p.brand.toLowerCase().includes(s) || p.category.includes(s)
      )
    }
    if (brands.length) list = list.filter(p => brands.includes(p.brand))
    if (prices.length) {
      const buckets = PRICE_BUCKETS.filter(b => prices.includes(b.id))
      list = list.filter(p => buckets.some(b => p.price >= b.min && p.price < b.max))
    }
    if (minRating) list = list.filter(p => p.rating >= minRating)
    return list.sort(SORTS.find(s => s.id === sort)?.fn || SORTS[0].fn)
  }, [q, category, tag, sort, brandKey, priceKey, minRating]) // eslint-disable-line react-hooks/exhaustive-deps

  const activeCount = brands.length + prices.length + (minRating ? 1 : 0)
  const catLabel = CATEGORIES.find(c => c.id === category)?.label

  const heading = q
    ? `Results for “${q}”`
    : catLabel || (tag ? tag[0].toUpperCase() + tag.slice(1) + ' picks' : 'All Products')

  const filtersPanel = (
    <>
      <FilterSection title='Category'>
        {CATEGORIES.map(c => (
          <CheckRow
            key={c.id}
            checked={category === c.id}
            label={c.label}
            onToggle={() => patch({ category: category === c.id ? '' : c.id })}
          />
        ))}
      </FilterSection>

      <FilterSection title='Price'>
        {PRICE_BUCKETS.map(b => (
          <CheckRow key={b.id} checked={prices.includes(b.id)} label={b.label} onToggle={() => toggleIn('price', prices, b.id)} />
        ))}
      </FilterSection>

      <FilterSection title='Brand'>
        {BRANDS.map(b => (
          <CheckRow key={b} checked={brands.includes(b)} label={b} onToggle={() => toggleIn('brand', brands, b)} />
        ))}
      </FilterSection>

      <FilterSection title='Customer Rating'>
        {RATING_FILTERS.map(r => (
          <CheckRow
            key={r}
            checked={minRating === r}
            label={`${r}★ & above`}
            onToggle={() => patch({ rating: minRating === r ? '' : String(r) })}
          />
        ))}
      </FilterSection>

      {activeCount > 0 && (
        <button
          onClick={() => patch({ brand: [], price: [], rating: '' })}
          className='mt-4 w-full rounded-xl border border-royal-200 py-2.5 text-[12.5px] font-bold text-royal-600 transition-colors hover:bg-royal-50'
        >
          Clear all filters ({activeCount})
        </button>
      )}
    </>
  )

  return (
    <Container className='py-6'>
      <div className='flex gap-6'>
        {/* desktop sidebar */}
        <aside className='sticky top-44 hidden h-max w-64 shrink-0 self-start rounded-2xl border border-slate-100 bg-white p-5 shadow-card lg:block'>
          <div className='flex items-center gap-2 border-b border-slate-100 pb-3'>
            <SlidersHorizontal className='h-4 w-4 text-royal-600' strokeWidth={2.2} />
            <span className='font-display text-[15px] font-bold text-slate-900'>Filters</span>
          </div>
          {filtersPanel}
        </aside>

        {/* results */}
        <div className='min-w-0 flex-1'>
          <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
            <div>
              <h1 className='font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl'>{heading}</h1>
              <p className='mt-0.5 text-[12.5px] text-slate-400'>
                {results.length} products
                {results.length > 0 && ` · from ${formatINR(Math.min(...results.map(p => p.price)))}`}
              </p>
            </div>

            <div className='flex items-center gap-2'>
              <button
                onClick={() => setMobileFilters(true)}
                className='flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[12.5px] font-semibold text-slate-700 lg:hidden'
              >
                <SlidersHorizontal className='h-3.5 w-3.5' />
                Filters {activeCount > 0 && <span className='grid h-4.5 w-4.5 place-items-center rounded-full bg-royal-600 text-[10px] text-white'>{activeCount}</span>}
              </button>

              <div className='relative'>
                <select
                  value={sort}
                  onChange={e => patch({ sort: e.target.value })}
                  className='appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3.5 pr-9 text-[12.5px] font-semibold text-slate-700 outline-none transition-colors focus:border-royal-400'
                >
                  {SORTS.map(s => (
                    <option key={s.id} value={s.id}>
                      Sort: {s.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className='pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400' />
              </div>
            </div>
          </div>

          {results.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title='No products found'
              sub='Try adjusting your filters or searching with a different term.'
              cta='Browse all products'
              to='/products'
            />
          ) : (
            <motion.div layout className='grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4 2xl:grid-cols-5'>
              <AnimatePresence mode='popLayout'>
                {results.map((p, i) => (
                  <motion.div
                    layout
                    key={p.id}
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ProductCard product={p} index={i} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* mobile filter drawer */}
      <AnimatePresence>
        {mobileFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFilters(false)}
              className='fixed inset-0 z-70 bg-royal-950/50 backdrop-blur-sm lg:hidden'
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              className='fixed inset-y-0 left-0 z-80 w-[86%] max-w-sm overflow-y-auto bg-white p-5 lg:hidden'
            >
              <div className='flex items-center justify-between border-b border-slate-100 pb-3'>
                <span className='font-display text-[16px] font-bold'>Filters</span>
                <button onClick={() => setMobileFilters(false)} className='grid h-8 w-8 place-items-center rounded-full bg-slate-100'>
                  <X className='h-4 w-4' />
                </button>
              </div>
              {filtersPanel}
              <button
                onClick={() => setMobileFilters(false)}
                className='mt-6 w-full rounded-xl bg-royal-600 py-3 text-[13px] font-bold text-white shadow-glow-royal'
              >
                Show {results.length} results
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </Container>
  )
}
