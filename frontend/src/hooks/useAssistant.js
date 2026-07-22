import { useCallback, useEffect, useRef, useState } from 'react'
import { CATEGORIES } from '../data/data'
import { COPY, EXTRAS, QUICK_STARTS } from '../data/assistant'
import {
  brandsFor, budgetLabel, bucketsFor, categoryLabel, listingUrl,
  parseMessage, prioritiesFor, rankProducts, summarise
} from '../utils/assistantEngine'
import { buildVocabulary, toWireCriteria } from '../utils/assistantVocabulary'
import { useShopChat } from './useAi'

/* ==================================================================
   Conversation state machine for the shopping assistant.

   Gemini does the understanding and the wording; it never sees the
   product list and never names a product. It returns the criteria it
   extracted, and rankProducts() below picks the actual items from the
   real catalogue — so the assistant cannot recommend something the
   store does not stock.

   If the model is unreachable (offline, backend down, free quota
   exhausted) every turn falls back to the original offline engine:
   the bot fills one "slot" per turn (category → brand → budget →
   priority → extras) using the synonym tables in data/assistant.js.
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

/* ------------------------------------------------------------------ */
/*  AI turn helpers                                                    */
/* ------------------------------------------------------------------ */

/** Only fields the model actually returned overwrite what we already know. */
function mergeAiCriteria (current, patch = {}) {
  const next = { ...current }
  if (patch.category) next.category = patch.category
  if (patch.brand) next.brand = patch.brand
  if (patch.priority) next.priority = patch.priority
  if (patch.extras?.length) next.extras = patch.extras
  if (patch.budget) next.budget = patch.budget
  return next
}

/** A chip the model produced → a criteria patch we can apply locally. */
function chipToPatch (chip) {
  const { field, value } = chip
  if (field === 'category') return { category: value }
  if (field === 'brand') return { brand: value }
  if (field === 'priority') return { priority: value }
  if (field === 'extra') return { extras: [value] }
  if (field === 'budget') {
    if (value === 'any') return { budget: 'any' }
    const amount = Number(value)
    // a bare number means "under X"; anything else is a price-band id
    return Number.isFinite(amount) && amount > 0
      ? { budget: { min: 0, max: amount } }
      : { budget: value }
  }
  return {}
}

/** Turn one model response into the message blocks the panel renders. */
function blocksFromAi (data, criteria) {
  const blocks = [bot({ text: data.reply })]

  if (data.intent === 'grocery') {
    blocks.push(
      bot({
        text: 'Shall I take you there?',
        kind: 'chips',
        chips: [
          { label: 'Open mCOM Dash', value: '/quick', field: 'nav' },
          { label: 'No, keep shopping here', value: 'all', field: 'refine', subtle: true }
        ]
      })
    )
    return blocks
  }

  /* The model only decides *whether* to show products. Which products is
     always decided here, from the real catalogue. */
  if (data.showProducts && criteria.category) {
    const { matches, total, relaxed } = rankProducts(criteria)
    if (matches.length) {
      blocks.push(
        bot({
          text: relaxed
            ? 'Closest matches I could find:'
            : `${total} ${summarise(criteria)} in stock — these fit best:`,
          kind: 'products',
          matches,
          total,
          url: listingUrl(criteria)
        })
      )
    }
  }

  if (data.chips?.length) {
    blocks.push(bot({ text: '', kind: 'chips', chips: data.chips }))
  }

  return blocks
}

/** Compact transcript for the model — text only, recent turns only. */
function historyFor (messages) {
  return messages
    .filter(m => m.text)
    .slice(-10)
    .map(m => ({ role: m.from === 'user' ? 'user' : 'bot', text: m.text.slice(0, 1200) }))
}

export default function useAssistant () {
  const [messages, setMessages] = useState(initialMessages)
  const [criteria, setCriteria] = useState(EMPTY)
  const [typing, setTyping] = useState(false)
  const [draftExtras, setDraftExtras] = useState([])
  const [offline, setOffline] = useState(false)
  const timers = useRef([])

  const chat = useShopChat()

  // read the transcript inside async callbacks without stale closures
  const messagesRef = useRef(messages)
  useEffect(() => { messagesRef.current = messages }, [messages])

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


  /* ---------------- the offline engine, used as a fallback ---------------- */

  /** The original slot-filling turn. Also drives every turn when offline. */
  const offlineTurn = useCallback(
    (text, base) => {
      const parsed = parseMessage(text)

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
        return base
      }

      const step = stepFor(base)
      const skipping = /^(any|anything|no preference|skip|doesn.?t matter|whatever|not sure)/i.test(text)

      const patch = { ...parsed }
      delete patch.grocery
      if (skipping && step !== 'category') patch[step] = 'any'

      if (!parsed.category && !base.category && !skipping) {
        say([bot({ text: COPY.noMatch, kind: 'chips', chips: CATEGORY_CHIPS })])
        return base
      }

      const next = applyTone({ ...base, ...patch })
      setCriteria(next)
      say(buildTurn(next, ackFor(base, next)))
      return next
    },
    [say]
  )

  /* ---------------- the AI turn ---------------- */

  /**
   * Ask the model to handle one turn. `patch` is anything we already know
   * locally (from a tapped chip) and is applied before the request so the
   * model sees it as established context.
   */
  const aiTurn = useCallback(
    async (text, patch = {}) => {
      const base = applyTone({ ...criteria, ...patch })
      setCriteria(base)
      setTyping(true)

      try {
        const data = await chat.mutateAsync({
          message: text,
          history: historyFor(messagesRef.current),
          criteria: toWireCriteria(base),
          vocabulary: buildVocabulary(base.category)
        })

        let merged = applyTone(mergeAiCriteria(base, data.criteria))

        /* The model occasionally words a budget ("keeping it under ₹8,000")
           without returning the numbers, which would leave the reply and the
           filter disagreeing. The offline parser is exact about amounts, so
           it fills that gap — for this message only. */
        const local = parseMessage(text)
        if (!data.criteria?.budget && local.budget) merged = { ...merged, budget: local.budget }
        if (!data.criteria?.brand && local.brand) merged = { ...merged, brand: local.brand }

        setCriteria(merged)
        setMessages(prev => [...prev, ...blocksFromAi(data, merged)])
        setOffline(false)
        setTyping(false)
      } catch {
        // Quota exhausted, backend down, or no network — degrade, never break.
        setTyping(false)
        if (!offline) {
          setOffline(true)
          setMessages(prev => [
            ...prev,
            bot({ text: 'I am offline right now, so I will match you using the built-in search instead.' })
          ])
        }
        // offlineTurn drives its own typing indicator through say()
        offlineTurn(text, base)
      }
    },
    [chat, criteria, offline, offlineTurn]
  )

  /* ---------------- public actions ---------------- */

  const sendText = useCallback(
    raw => {
      const text = raw.trim()
      if (!text) return
      clearTimers()
      echo(text)
      aiTurn(text)
    },
    [aiTurn, clearTimers, echo]
  )

  const chooseChip = useCallback(
    chip => {
      if (chip.field === 'nav') return // handled by the panel (router navigation)

      clearTimers()
      echo(chip.label)

      if (chip.field === 'refine') {
        const next =
          chip.value === 'all' ? { ...EMPTY } : { ...criteria, [chip.value]: undefined, extras: undefined }
        setCriteria(next)
        setDraftExtras([])
        // send the reset criteria as the new baseline, not the old one
        return aiTurn(chip.label, chip.value === 'all' ? EMPTY : next)
      }

      // A tapped chip is understood locally *and* sent to the model, so the
      // reply is worded conversationally instead of from a fixed template.
      aiTurn(chip.label, chip.field === 'freetext' ? {} : chipToPatch(chip))
    },
    [aiTurn, clearTimers, criteria, echo]
  )

  const toggleExtra = useCallback(id => {
    setDraftExtras(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
  }, [])

  const confirmExtras = useCallback(() => {
    const labels = draftExtras.length
      ? EXTRAS.filter(e => draftExtras.includes(e.id)).map(e => e.label).join(', ')
      : 'No extra filters'
    clearTimers()
    echo(labels)
    // an empty array is still truthy, so the slot counts as answered
    aiTurn(labels, { extras: draftExtras })
    setDraftExtras([])
  }, [aiTurn, clearTimers, draftExtras, echo])

  const reset = useCallback(() => {
    clearTimers()
    chat.reset()
    setCriteria(EMPTY)
    setDraftExtras([])
    setTyping(false)
    setOffline(false)
    setMessages(initialMessages())
  }, [chat, clearTimers])

  return {
    messages,
    criteria,
    typing,
    draftExtras,
    offline,
    sendText,
    chooseChip,
    toggleExtra,
    confirmExtras,
    reset
  }
}
