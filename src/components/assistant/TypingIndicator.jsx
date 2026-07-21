import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

/** Three bouncing dots shown while the assistant "thinks". */
export default function TypingIndicator () {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className='flex items-end gap-2'
    >
      <span className='grid h-7 w-7 shrink-0 place-items-center rounded-full bg-royal-600 text-white'>
        <Sparkles className='h-3.5 w-3.5' strokeWidth={2.2} />
      </span>
      <span className='flex items-center gap-1 rounded-2xl rounded-bl-md bg-white px-3.5 py-3 shadow-card'>
        {[0, 1, 2].map(i => (
          <motion.span
            key={i}
            animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
            className='h-1.5 w-1.5 rounded-full bg-royal-500'
          />
        ))}
      </span>
    </motion.div>
  )
}
