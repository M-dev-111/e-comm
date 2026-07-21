import { motion } from 'framer-motion'

/**
 * Tappable suggestion chips. Only the newest group stays interactive —
 * older ones fade out so the conversation reads as history.
 */
export default function ChipGroup ({ chips, onPick, disabled }) {
  return (
    <div className='mt-2 flex flex-wrap gap-1.5'>
      {chips.map((chip, i) => (
        <motion.button
          key={`${chip.field}-${chip.value}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03, duration: 0.25 }}
          whileTap={disabled ? undefined : { scale: 0.95 }}
          disabled={disabled}
          onClick={() => onPick(chip)}
          className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors ${
            disabled
              ? 'cursor-default border-slate-200 bg-white text-slate-300'
              : chip.subtle
                ? 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                : 'border-royal-200 bg-royal-50 text-royal-700 hover:border-royal-500 hover:bg-royal-600 hover:text-white'
          }`}
        >
          {chip.label}
        </motion.button>
      ))}
    </div>
  )
}
