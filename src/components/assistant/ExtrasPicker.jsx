import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

/** Multi-select refinement step — pick any number, then confirm. */
export default function ExtrasPicker ({ options, selected, onToggle, onConfirm, disabled }) {
  return (
    <div className='mt-2 space-y-1.5'>
      {options.map(option => {
        const active = selected.includes(option.id)
        return (
          <button
            key={option.id}
            disabled={disabled}
            onClick={() => onToggle(option.id)}
            className={`flex w-full items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition-colors ${
              disabled
                ? 'cursor-default border-slate-200 bg-white opacity-60'
                : active
                  ? 'border-royal-500 bg-royal-50'
                  : 'border-slate-200 bg-white hover:border-royal-300'
            }`}
          >
            <span
              className={`grid h-4.5 w-4.5 shrink-0 place-items-center rounded-md border transition-colors ${
                active ? 'border-royal-600 bg-royal-600' : 'border-slate-300'
              }`}
            >
              {active && <Check className='h-3 w-3 text-white' strokeWidth={3} />}
            </span>
            <span className='min-w-0'>
              <span className={`block text-[12.5px] font-semibold ${active ? 'text-royal-800' : 'text-slate-700'}`}>
                {option.label}
              </span>
              <span className='block text-[11px] text-slate-400'>{option.hint}</span>
            </span>
          </button>
        )
      })}

      {!disabled && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onConfirm}
          className='mt-1 w-full rounded-xl bg-royal-600 py-2.5 text-[12.5px] font-bold text-white shadow-glow-royal transition-colors hover:bg-royal-700'
        >
          {selected.length ? `Show matches (${selected.length} filter${selected.length > 1 ? 's' : ''})` : 'Skip — show matches'}
        </motion.button>
      )}
    </div>
  )
}
