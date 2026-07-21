import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { EXTRAS } from '../../data/assistant'
import ChipGroup from './ChipGroup'
import ExtrasPicker from './ExtrasPicker'
import ProductSuggestion from './ProductSuggestion'

/**
 * Renders one turn of the conversation. Interactive controls (chips, the
 * extras picker) are only live on the most recent bot message.
 */
export default function ChatMessage ({ message, isLast, onPick, draftExtras, onToggleExtra, onConfirmExtras, onNavigate }) {
  const isBot = message.from === 'bot'

  if (!isBot) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className='flex justify-end'>
        <span className='max-w-[85%] rounded-2xl rounded-br-md bg-royal-600 px-3.5 py-2 text-[12.5px] font-medium text-white'>
          {message.text}
        </span>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className='flex items-start gap-2'>
      <span className='mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-royal-600 text-white'>
        <Sparkles className='h-3.5 w-3.5' strokeWidth={2.2} />
      </span>

      <div className='min-w-0 max-w-[88%] flex-1'>
        {message.text && (
          <p className='inline-block rounded-2xl rounded-bl-md bg-white px-3.5 py-2 text-[12.5px] leading-relaxed text-slate-700 shadow-card'>
            {message.text}
          </p>
        )}

        {message.kind === 'chips' && (
          <ChipGroup chips={message.chips} onPick={onPick} disabled={!isLast} />
        )}

        {message.kind === 'extras' && (
          <ExtrasPicker
            options={EXTRAS}
            selected={draftExtras}
            onToggle={onToggleExtra}
            onConfirm={onConfirmExtras}
            disabled={!isLast}
          />
        )}

        {message.kind === 'products' && (
          <div className='mt-2 space-y-2'>
            {message.matches.map(match => (
              <ProductSuggestion key={match.product.id} match={match} onNavigate={onNavigate} />
            ))}

            {message.total > message.matches.length && (
              <Link
                to={message.url}
                onClick={onNavigate}
                className='flex items-center justify-center gap-1.5 rounded-xl border border-royal-200 bg-royal-50 py-2.5 text-[12px] font-bold text-royal-700 transition-colors hover:bg-royal-600 hover:text-white'
              >
                See all {message.total} results
                <ArrowRight className='h-3.5 w-3.5' strokeWidth={2.4} />
              </Link>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
