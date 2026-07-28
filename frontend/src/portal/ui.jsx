import { forwardRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, X } from 'lucide-react'
import { formatINR } from '../utils/format'

/* Small, dependency-light building blocks shared across every portal page.
   Royal blue is the primary; olive green the accent. */

export function Button ({ variant = 'primary', size = 'md', loading, className = '', children, ...props }) {
  const variants = {
    primary: 'bg-royal-600 text-white hover:bg-royal-700 shadow-glow-royal disabled:opacity-60',
    olive: 'bg-olive-600 text-white hover:bg-olive-700 shadow-glow-olive disabled:opacity-60',
    outline: 'border border-royal-200 text-royal-700 hover:bg-royal-50 disabled:opacity-60',
    ghost: 'text-slate-600 hover:bg-slate-100 disabled:opacity-60',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-60'
  }
  const sizes = { sm: 'px-3 py-1.5 text-[12px]', md: 'px-4 py-2.5 text-[13px]', lg: 'px-5 py-3 text-sm' }
  return (
    <button
      disabled={loading || props.disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-colors disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className='h-4 w-4 animate-spin' />}
      {children}
    </button>
  )
}

export function StatCard ({ label, value, hint, accent = 'royal', icon: Icon, money }) {
  const ring = accent === 'olive' ? 'text-olive-700 bg-olive-100' : 'text-royal-700 bg-royal-100'
  return (
    <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:p-5'>
      <div className='flex items-start justify-between'>
        <p className='text-[11px] font-bold uppercase tracking-wider text-slate-400'>{label}</p>
        {Icon && <span className={`grid h-8 w-8 place-items-center rounded-full ${ring}`}><Icon className='h-4 w-4' /></span>}
      </div>
      <p className='mt-2 font-display text-2xl font-extrabold text-royal-950'>
        {money ? formatINR(value || 0) : (value ?? 0)}
      </p>
      {hint && <p className='mt-0.5 text-[11px] text-slate-400'>{hint}</p>}
    </div>
  )
}

const BADGE_TONES = {
  active: 'bg-olive-100 text-olive-800',
  paid: 'bg-olive-100 text-olive-800',
  delivered: 'bg-olive-100 text-olive-800',
  pro: 'bg-royal-100 text-royal-800',
  shipped: 'bg-royal-100 text-royal-800',
  pending: 'bg-amber-100 text-amber-800',
  trial: 'bg-amber-100 text-amber-800',
  draft: 'bg-slate-100 text-slate-600',
  basic: 'bg-slate-100 text-slate-600',
  suspended: 'bg-rose-100 text-rose-700',
  disabled: 'bg-rose-100 text-rose-700',
  cancelled: 'bg-rose-100 text-rose-700',
  archived: 'bg-slate-100 text-slate-500'
}
export function Badge ({ children }) {
  const tone = BADGE_TONES[String(children).toLowerCase()] || 'bg-slate-100 text-slate-600'
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${tone}`}>{children}</span>
}

export function Spinner ({ label = 'Loading…' }) {
  return (
    <div className='flex items-center justify-center gap-2 py-16 text-sm text-slate-400'>
      <Loader2 className='h-5 w-5 animate-spin' /> {label}
    </div>
  )
}

export function EmptyState ({ icon: Icon, title, hint, action }) {
  return (
    <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 py-14 text-center'>
      {Icon && <Icon className='h-9 w-9 text-slate-300' />}
      <p className='mt-3 font-display text-[15px] font-bold text-slate-700'>{title}</p>
      {hint && <p className='mt-1 max-w-sm text-[12.5px] text-slate-400'>{hint}</p>}
      {action && <div className='mt-4'>{action}</div>}
    </div>
  )
}

export function PageHeader ({ title, subtitle, action }) {
  return (
    <div className='mb-5 flex flex-wrap items-end justify-between gap-3'>
      <div>
        <h1 className='font-display text-xl font-extrabold tracking-tight text-royal-950 sm:text-2xl'>{title}</h1>
        {subtitle && <p className='mt-0.5 text-[13px] text-slate-500'>{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

/** Responsive card-table: a real table on desktop, stacked cards on mobile. */
export function Table ({ columns, rows, keyField = 'id', empty }) {
  if (!rows.length && empty) return empty
  return (
    <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card'>
      <div className='hidden overflow-x-auto md:block'>
        <table className='w-full text-left text-[13px]'>
          <thead>
            <tr className='border-b border-slate-200 bg-slate-50/70'>
              {columns.map(col => (
                <th key={col.key} className='px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400'>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row[keyField]} className='border-b border-slate-100 last:border-0 hover:bg-royal-50/30'>
                {columns.map(col => (
                  <td key={col.key} className='px-4 py-3 align-middle text-slate-700'>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* mobile stacked view */}
      <div className='divide-y divide-slate-100 md:hidden'>
        {rows.map(row => (
          <div key={row[keyField]} className='p-3.5'>
            {columns.map(col => (
              <div key={col.key} className='flex items-start justify-between gap-3 py-1'>
                <span className='text-[11px] font-bold uppercase tracking-wider text-slate-400'>{col.label}</span>
                <span className='text-right text-[13px] text-slate-700'>{col.render ? col.render(row) : row[col.key]}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/** Centered modal in a portal-free overlay (the whole app is one tree). */
export function Modal ({ open, onClose, title, children, wide }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className='fixed inset-0 z-90 bg-royal-950/50 backdrop-blur-sm'
          />
          <div className='fixed inset-0 z-95 grid place-items-center p-4'>
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.22 }}
              className={`max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6 ${wide ? 'max-w-2xl' : 'max-w-md'}`}
            >
              <div className='mb-4 flex items-center justify-between'>
                <h2 className='font-display text-lg font-bold text-royal-950'>{title}</h2>
                <button onClick={onClose} aria-label='Close' className='grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100'>
                  <X className='h-4.5 w-4.5' />
                </button>
              </div>
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

/** Labelled input wired for react-hook-form; forwards the ref from register(). */
export const Field = forwardRef(function Field ({ label, error, hint, ...props }, ref) {
  return (
    <label className='block'>
      {label && <span className='mb-1 block text-[12px] font-bold text-slate-600'>{label}</span>}
      <input
        ref={ref}
        aria-invalid={!!error}
        className='w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-[13px] text-slate-800 outline-none transition-colors focus:border-royal-400 focus:ring-4 focus:ring-royal-500/10 aria-invalid:border-rose-400'
        {...props}
      />
      {error ? <span className='mt-1 block text-[11px] font-semibold text-rose-500'>{error}</span>
        : hint ? <span className='mt-1 block text-[11px] text-slate-400'>{hint}</span> : null}
    </label>
  )
})

export const Select = forwardRef(function Select ({ label, error, children, ...props }, ref) {
  return (
    <label className='block'>
      {label && <span className='mb-1 block text-[12px] font-bold text-slate-600'>{label}</span>}
      <select
        ref={ref}
        className='w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[13px] text-slate-800 outline-none transition-colors focus:border-royal-400'
        {...props}
      >
        {children}
      </select>
      {error && <span className='mt-1 block text-[11px] font-semibold text-rose-500'>{error}</span>}
    </label>
  )
})

export const Textarea = forwardRef(function Textarea ({ label, error, ...props }, ref) {
  return (
    <label className='block'>
      {label && <span className='mb-1 block text-[12px] font-bold text-slate-600'>{label}</span>}
      <textarea
        ref={ref}
        className='w-full resize-y rounded-xl border border-slate-200 px-3.5 py-2.5 text-[13px] text-slate-800 outline-none transition-colors focus:border-royal-400'
        {...props}
      />
      {error && <span className='mt-1 block text-[11px] font-semibold text-rose-500'>{error}</span>}
    </label>
  )
})

// Re-exported so pages have one import surface for portal building blocks.
// eslint-disable-next-line react-refresh/only-export-components
export { formatINR }
