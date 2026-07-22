import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { RotateCcw, SendHorizontal, Sparkles, X } from 'lucide-react'
import { budgetLabel, categoryLabel } from '../../utils/assistantEngine'
import { EASE } from '../../utils/motion'
import ChatMessage from './ChatMessage'
import TypingIndicator from './TypingIndicator'

/** Small pills in the header showing what the assistant has understood. */
function CriteriaPills ({ criteria }) {
  const pills = [
    criteria.category && categoryLabel(criteria.category),
    criteria.brand && criteria.brand !== 'any' && criteria.brand,
    criteria.budget && criteria.budget !== 'any' && budgetLabel(criteria.budget)
  ].filter(Boolean)

  if (!pills.length) return null

  return (
    <div className='flex flex-wrap gap-1 px-4 pb-2.5'>
      <AnimatePresence initial={false}>
        {pills.map(pill => (
          <motion.span
            key={pill}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            className='rounded-full bg-white/15 px-2.5 py-1 text-[10.5px] font-semibold text-white'
          >
            {pill}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default function AssistantPanel ({ assistant, onClose }) {
  const { messages, criteria, typing, draftExtras, offline, sendText, chooseChip, toggleExtra, confirmExtras, reset } = assistant
  const [draft, setDraft] = useState('')
  const scrollRef = useRef(null)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  // keep the newest turn in view
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages, typing])

  // focus the field on pointer devices only, so mobile keyboards stay closed
  useEffect(() => {
    if (window.matchMedia('(min-width: 640px)').matches) inputRef.current?.focus()
  }, [])

  const submit = e => {
    e.preventDefault()
    // one turn in flight at a time, so replies cannot arrive out of order
    if (!draft.trim() || typing) return
    sendText(draft)
    setDraft('')
  }

  const handlePick = chip => {
    if (chip.field === 'nav') {
      navigate(chip.value)
      onClose()
      return
    }
    chooseChip(chip)
  }

  const lastBotIndex = messages.map(m => m.from).lastIndexOf('bot')

  return (
    <motion.section
      role='dialog'
      aria-label='Shopping assistant'
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.97 }}
      transition={{ duration: 0.28, ease: EASE }}
      className='pointer-events-auto fixed inset-x-3 bottom-3 top-16 z-80 flex flex-col overflow-hidden rounded-3xl bg-slate-50 shadow-2xl ring-1 ring-royal-950/10 sm:inset-auto sm:bottom-6 sm:right-6 sm:top-auto sm:h-160 sm:max-h-[calc(100dvh-3rem)] sm:w-100'
    >
      {/* header */}
      <header className='shrink-0 bg-royal-950 text-white'>
        <div className='flex items-center gap-3 px-4 py-3.5'>
          <span className='relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-olive-500'>
            <Sparkles className='h-4.5 w-4.5' strokeWidth={2.2} />
            <span className='absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-royal-950 bg-olive-400' />
          </span>
          <div className='min-w-0 flex-1'>
            <p className='font-display text-[14px] font-bold leading-tight'>Shopping Assistant</p>
            <p className='text-[11px] text-white/50'>
              {offline ? 'Offline — using built-in search' : 'Ask me anything about the catalogue'}
            </p>
          </div>
          <button
            aria-label='Start over'
            onClick={reset}
            className='grid h-8 w-8 place-items-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white'
          >
            <RotateCcw className='h-4 w-4' strokeWidth={2} />
          </button>
          <button
            aria-label='Close assistant'
            onClick={onClose}
            className='grid h-8 w-8 place-items-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white'
          >
            <X className='h-4.5 w-4.5' strokeWidth={2.2} />
          </button>
        </div>
        <CriteriaPills criteria={criteria} />
      </header>

      {/* conversation */}
      <div ref={scrollRef} className='flex-1 space-y-3 overflow-y-auto px-3.5 py-4'>
        {messages.map((message, i) => (
          <ChatMessage
            key={message.id}
            message={message}
            isLast={i === lastBotIndex && !typing}
            onPick={handlePick}
            draftExtras={draftExtras}
            onToggleExtra={toggleExtra}
            onConfirmExtras={confirmExtras}
            onNavigate={onClose}
          />
        ))}
        <AnimatePresence>{typing && <TypingIndicator />}</AnimatePresence>
      </div>

      {/* composer */}
      <form onSubmit={submit} className='shrink-0 border-t border-slate-200 bg-white p-2.5'>
        <div className='flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1.5 pl-4 pr-1.5 transition-colors focus-within:border-royal-400 focus-within:bg-white'>
          <input
            ref={inputRef}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder={typing ? 'Thinking…' : 'Try "phone under 20000"'}
            aria-label='Message the shopping assistant'
            className='min-w-0 flex-1 bg-transparent text-[12.5px] text-slate-800 outline-none placeholder:text-slate-400'
          />
          <motion.button
            type='submit'
            whileTap={{ scale: 0.9 }}
            disabled={!draft.trim() || typing}
            aria-label='Send'
            className='grid h-8 w-8 shrink-0 place-items-center rounded-full bg-royal-600 text-white transition-colors hover:bg-royal-700 disabled:bg-slate-200 disabled:text-slate-400'
          >
            <SendHorizontal className='h-4 w-4' strokeWidth={2.2} />
          </motion.button>
        </div>
      </form>
    </motion.section>
  )
}
