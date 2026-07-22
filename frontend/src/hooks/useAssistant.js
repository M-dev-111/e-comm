import { useCallback, useEffect, useRef, useState } from 'react'
import { CATEGORIES } from '../data/data'
import { COPY, EXTRAS, QUICK_STARTS } from '../data/assistant'
import {
  brandsFor, budgetLabel, bucketsFor, categoryLabel, listingUrl,
  parseMessage, prioritiesFor, rankProducts, summarise
} from '../utils/assistantEngine'

/* ==================================================================
   Conversation state machine for the shopping assistant.

   The bot fills one "slot" per turn (category → brand → budget →
   priority → extras) and then answers. A single free-text message can
   fill several slots at once, in which case those questions are skipped.
   ================================================================== */

let messageId = 0
const nextId = () => ++messageId

const CATEGORY_CHIPS = CATEGORIES.map(c => ({ label: c.label, value: c.id, field: 'category' }))

const bot = block => ({ id: nextId(), from: 'bot', ...block })
const user = text => ({ id: nextId(), from: 'user', text })

const initialMessages = () => [
  bot({ text: COPY.greeting }),
  bot({ text: COPY.greetingSub }),
  bot({
    text: COPY.askCategory,
    kind: 'chips',
    chips: [
      ...QUICK_STARTS.map(label => ({ label, value: label, field: 'freetext' })),
      ...CATEGORY_CHIPS
    ]
  })
]

const EMPTY = { category: undefined, brand: undefined, budget: undefined, priority: undefined, extras: undefined, tone: undefined }

/** Which slot still needs filling. */
function stepFor (c) {
  if (!c.category) return 'category'
  if (!c.brand) return 'brand'
  if (!c.budget) return 'budget'
  if (!c.priority) return 'priority'
  if (!c.extras) return 'extras'
  return 'results'
}

/** Bot turn(s) for the current state: an optional ack, then the next question. */
function buildTurn (criteria, ack) {
  const blocks = ack ? [bot({ text: ack })] : []
  const step = stepFor(criteria)

  if (step === 'category') {
    blocks.push(bot({ text: COPY.askCategory, kind: 'chips', chips: CATEGORY_CHIPS }))
    return blocks
  }

  if (step === 'brand') {
    const brands = brandsFor(criteria.category)
    const count = brands.length
    blocks.push(
      bot({
        text: `We stock ${count} brand${count === 1 ? '' : 's'} in ${categoryLabel(criteria.category)}. Any brand you lean towards?`,
        kind: 'chips',
        chips: [
          ...brands.map(b => ({ label: b, value: b, field: 'brand' })),
          { label: 'No preference', value: 'any', field: 'brand', subtle: true }
        ]
      })
    )
    return blocks
  }

  if (step === 'budget') {
    blocks.push(
      bot({
        text: 'What is your budget? You can also just type something like "under ₹20,000".',
        kind: 'chips',
        chips: [
          ...bucketsFor(criteria.category, criteria.brand).map(b => ({ label: b.short, value: b.id, field: 'budget' })),
          { label: 'Any budget', value: 'any', field: 'budget', subtle: true }
        ]
      })
    )
    return blocks
  }

  if (step === 'priority') {
    blocks.push(
      bot({
        text: `When it comes to ${categoryLabel(criteria.category)}, what matters most to you?`,
        kind: 'chips',
        chips: [
          ...prioritiesFor(criteria.category).map(p => ({ label: p.label, value: p.id, field: 'priority' })),
          { label: 'Not sure — best overall', value: 'any', field: 'priority', subtle: true }
        ]
      })
    )
    return blocks
  }

  if (step === 'extras') {
    blocks.push(
      bot({
        text: 'Last one — should I filter for any of these?',
        kind: 'extras',
        chips: EXTRAS
      })
    )
    return blocks
  }

  // results
  const { matches, total, relaxed } = rankProducts(criteria)

  if (!matches.length) {
    blocks.push(
      bot({
        text: `I could not find any ${summarise(criteria)} in stock right now. Want to widen the search?`,
        kind: 'chips',
        chips: [
          { label: 'Change budget', value: 'budget', field: 'refine' },
          { label: 'Change brand', value: 'brand', field: 'refine' },
          { label: 'Start over', value: 'all', field: 'refine' }
        ]
      })
    )
    return blocks
  }

  const relaxNote = {
    extras: 'Nothing matched every filter, so I loosened the extra filters.',
    budget: 'Nothing matched that budget, so I looked a little wider.',
    brand: 'That brand had no match here, so I included other brands.'
  }[relaxed]

  blocks.push(
    bot({
      text: relaxNote
        ? `${relaxNote} Here ${matches.length === 1 ? 'is the closest option' : `are the ${matches.length} closest options`}:`
        : `Found ${total} ${summarise(criteria)}. ${matches.length === 1 ? 'This is the best fit' : `These ${matches.length} are the best fit`}:`,
      kind: 'products',
      matches,
      total,
      url: listingUrl(criteria)
    })
  )

  blocks.push(
    bot({
      text: 'Want me to adjust anything?',
      kind: 'chips',
      chips: [
        { label: 'Change budget', value: 'budget', field: 'refine' },
        { label: 'Change brand', value: 'brand', field: 'refine' },
        { label: 'Different priority', value: 'priority', field: 'refine' },
        { label: 'Shop something else', value: 'all', field: 'refine' }
      ]
    })
  )

  return blocks
}

/** Short confirmation of whatever the customer just told us. */
function ackFor (previous, next) {
  const bits = []
  if (next.category && next.category !== previous.category) {
    bits.push(`${categoryLabel(next.category)} — good choice.`)
  }
  if (next.brand && next.brand !== previous.brand) {
    bits.push(next.brand === 'any' ? 'Open to any brand, noted.' : `${next.brand} it is.`)
  }
  if (next.budget && next.budget !== previous.budget) {
    bits.push(next.budget === 'any' ? 'No budget limit, got it.' : `Budget noted: ${budgetLabel(next.budget)}.`)
  }
  if (next.priority && next.priority !== previous.priority && next.priority !== 'any') {
    const option = prioritiesFor(next.category).find(p => p.id === next.priority)
    if (option) bits.push(`Got it — ${option.label.toLowerCase()} is the priority.`)
  }
  return bits.join(' ')
}

/** Map "cheap"/"premium" onto a real price band once the category is known. */
function applyTone (criteria) {
  if (!criteria.tone || criteria.budget || !criteria.category) return criteria
  const buckets = bucketsFor(criteria.category, criteria.brand)
  if (!buckets.length) return criteria
  const bucket = criteria.tone === 'cheap' ? buckets[0] : buckets[buckets.length - 1]
  return { ...criteria, budget: bucket.id }
}

export default function useAssistant () {
  const [messages, setMessages] = useState(initialMessages)
  const [criteria, setCriteria] = useState(EMPTY)
  const [typing, setTyping] = useState(false)
  const [draftExtras, setDraftExtras] = useState([])
  const timers = useRef([])

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }, [])

  useEffect(() => clearTimers, [clearTimers])

  /** Post bot blocks one after another behind a typing indicator. */
  const say = useCallback(
    blocks => {
      if (!blocks.length) return
      setTyping(true)
      let delay = 500
      blocks.forEach((block, i) => {
        const id = setTimeout(() => {
          setMessages(prev => [...prev, block])
          if (i === blocks.length - 1) setTyping(false)
        }, delay)
        timers.current.push(id)
        delay += 480
      })
    },
    []
  )

  /** Append a customer message. Built outside the updater so it stays pure. */
  const echo = useCallback(text => {
    const message = user(text)
    setMessages(prev => [...prev, message])
  }, [])

  /** Merge new criteria, echo the customer, then ask the next question. */
  const advance = useCallback(
    (patch, echoText) => {
      clearTimers()
      const next = applyTone({ ...criteria, ...patch })
      if (echoText) echo(echoText)
      setCriteria(next)
      say(buildTurn(next, ackFor(criteria, next)))
    },
    [clearTimers, criteria, echo, say]
  )

  /* ---------------- public actions ---------------- */

  const sendText = useCallback(
    raw => {
      const text = raw.trim()
      if (!text) return

      clearTimers()
      echo(text)

      const parsed = parseMessage(text)

      // groceries live in the Dash tab, not this catalogue
      if (parsed.grocery && !parsed.category) {
        say([
          bot({ text: COPY.grocery }),
          bot({
            text: 'Shall I take you there?',
            kind: 'chips',
            chips: [
              { label: 'Open mCOM Dash', value: '/quick', field: 'nav' },
              { label: 'No, keep shopping here', value: 'all', field: 'refine', subtle: true }
            ]
          })
        ])
        return
      }

      const step = stepFor(criteria)
      const skipping = /^(any|anything|no preference|skip|doesn.?t matter|whatever|not sure)/i.test(text)

      const patch = { ...parsed }
      delete patch.grocery
      if (skipping && step !== 'category') patch[step] = 'any'

      // nothing recognised while we still do not know the department
      if (!parsed.category && !criteria.category && !skipping) {
        say([bot({ text: COPY.noMatch, kind: 'chips', chips: CATEGORY_CHIPS })])
        return
      }

      const next = applyTone({ ...criteria, ...patch })
      setCriteria(next)
      say(buildTurn(next, ackFor(criteria, next)))
    },
    [clearTimers, criteria, echo, say]
  )

  const chooseChip = useCallback(
    chip => {
      if (chip.field === 'nav') return // handled by the panel (router navigation)
      if (chip.field === 'freetext') return sendText(chip.value)

      if (chip.field === 'refine') {
        clearTimers()
        echo(chip.label)
        const next =
          chip.value === 'all' ? { ...EMPTY } : { ...criteria, [chip.value]: undefined, extras: undefined }
        setCriteria(next)
        setDraftExtras([])
        say(buildTurn(next, chip.value === 'all' ? 'Sure — let us start fresh.' : 'No problem.'))
        return
      }

      advance({ [chip.field]: chip.value }, chip.label)
    },
    [advance, clearTimers, criteria, echo, say, sendText]
  )

  const toggleExtra = useCallback(id => {
    setDraftExtras(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
  }, [])

  const confirmExtras = useCallback(() => {
    const labels = draftExtras.length
      ? EXTRAS.filter(e => draftExtras.includes(e.id)).map(e => e.label).join(', ')
      : 'No extra filters'
    // an empty array is still truthy, so the slot counts as answered
    advance({ extras: draftExtras }, labels)
    setDraftExtras([])
  }, [advance, draftExtras])

  const reset = useCallback(() => {
    clearTimers()
    setCriteria(EMPTY)
    setDraftExtras([])
    setTyping(false)
    setMessages(initialMessages())
  }, [clearTimers])

  return {
    messages,
    criteria,
    typing,
    draftExtras,
    sendText,
    chooseChip,
    toggleExtra,
    confirmExtras,
    reset
  }
}
