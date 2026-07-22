/* ==================================================================
   Shopping assistant engine — pure functions, no React, no network.

   parseMessage()  free text  → whatever criteria it can confidently extract
   rankProducts()  criteria   → scored matches (relaxing filters if needed)
   reasonsFor()    product    → short human explanations of the match
   ================================================================== */

import { PRODUCTS, BRANDS, CATEGORIES, PRICE_BUCKETS } from '../data/data'
import { CATEGORY_SYNONYMS, GROCERY_WORDS, PRIORITIES, DEFAULT_PRIORITIES } from '../data/assistant'
import { discountPct, formatINR } from './format'

/* ------------------------------------------------------------------ */
/*  Free-text parsing                                                  */
/* ------------------------------------------------------------------ */

const normalise = text => ` ${String(text).toLowerCase().replace(/[₹,]/g, ' ').replace(/\s+/g, ' ')} `

const includesWord = (haystack, word) => haystack.includes(` ${word} `) || haystack.includes(` ${word}s `)

/** Pull every money-like number out of the text (handles "20k", "1.5 lakh"). */
function extractAmounts (text) {
  const amounts = []
  const re = /(\d+(?:\.\d+)?)\s*(k|l|lakh|lakhs|thousand)?/g
  let m
  while ((m = re.exec(text)) !== null) {
    let value = parseFloat(m[1])
    const unit = m[2]
    if (unit === 'k' || unit === 'thousand') value *= 1000
    else if (unit === 'l' || unit === 'lakh' || unit === 'lakhs') value *= 100000
    // ignore small bare numbers — they are usually "4 star", "5g", "12 gb"
    if (value >= 300) amounts.push(value)
  }
  return amounts
}

/**
 * Extract as much intent as possible from one message. Every field is
 * optional — the conversation fills in whatever is still missing.
 */
export function parseMessage (raw) {
  const text = normalise(raw)
  const found = {}

  // category (also covers "show me phones", "any good sneakers?")
  for (const entry of CATEGORY_SYNONYMS) {
    if (entry.words.some(w => (w.includes(' ') ? text.includes(` ${w} `) : includesWord(text, w)))) {
      found.category = entry.category
      break
    }
  }

  if (GROCERY_WORDS.some(w => includesWord(text, w))) found.grocery = true

  // brand — match against the real brand list
  const brand = BRANDS.find(b => text.includes(` ${b.toLowerCase()} `))
  if (brand) found.brand = brand

  // budget phrasing
  const amounts = extractAmounts(text)
  /* "nothing over 8000" and "no more than 8k" are ceilings even though they
     contain over/more — they must be tested before the wantsOver patterns. */
  const wantsUnder = /(under|below|less than|upto|up to|within|max|budget of|cheaper than|nothing over|nothing above|no more than|not more than|at most)/.test(text)
  const wantsOver = /(above|over|more than|minimum|at least|starting)/.test(text)
  const isRange = /(between|to|-|and)/.test(text) && amounts.length >= 2

  // a typed budget is kept as a true range — snapping it to a price band
  // would let through products above the stated ceiling
  if (isRange) {
    const [a, b] = [...amounts].sort((x, y) => x - y)
    found.budget = { min: a, max: b }
  } else if (amounts.length) {
    const amount = amounts[0]
    found.budget = wantsOver && !wantsUnder ? { min: amount, max: Infinity } : { min: 0, max: amount }
  } else if (/(cheap|affordable|budget|inexpensive|low cost|economical)/.test(text)) {
    found.tone = 'cheap'
  } else if (/(premium|flagship|high end|expensive|luxury|best money)/.test(text)) {
    found.tone = 'premium'
  }

  // priority, matched across every category's option list
  const allPriorities = [...Object.values(PRIORITIES).flat(), ...DEFAULT_PRIORITIES]
  const priority = allPriorities.find(
    p => includesWord(text, p.id) || text.includes(` ${p.label.toLowerCase()} `)
  )
  if (priority) found.priority = priority.id

  // explicit extras
  const extras = []
  if (/(deal|discount|offer|offers|sale|bargain)/.test(text)) extras.push('deals')
  if (/(top rated|best rated|highly rated|good rating|highest rated)/.test(text)) extras.push('toprated')
  if (/(fast delivery|quick delivery|urgent|tomorrow|asap|soon)/.test(text)) extras.push('fast')
  if (extras.length) found.extras = extras

  return found
}

/* ------------------------------------------------------------------ */
/*  Options offered at each step, derived from real inventory          */
/* ------------------------------------------------------------------ */

const inCategory = category => PRODUCTS.filter(p => !category || p.category === category)

export const categoryLabel = id => CATEGORIES.find(c => c.id === id)?.label || id

/** A budget is either a price-band id (from a chip) or a typed {min,max} range. */
export function budgetRange (budget) {
  if (!budget || budget === 'any') return null
  if (typeof budget === 'object') return { min: budget.min ?? 0, max: budget.max ?? Infinity }
  const bucket = PRICE_BUCKETS.find(b => b.id === budget)
  return bucket ? { min: bucket.min, max: bucket.max } : null
}

export function budgetLabel (budget) {
  if (!budget || budget === 'any') return ''
  if (typeof budget === 'object') {
    if (!Number.isFinite(budget.max)) return `above ${formatINR(budget.min)}`
    if (!budget.min) return `under ${formatINR(budget.max)}`
    return `${formatINR(budget.min)} – ${formatINR(budget.max)}`
  }
  return PRICE_BUCKETS.find(b => b.id === budget)?.label || ''
}

/** Brands that actually have stock in this category, most listings first. */
export function brandsFor (category) {
  const counts = new Map()
  inCategory(category).forEach(p => counts.set(p.brand, (counts.get(p.brand) || 0) + 1))
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([brand]) => brand)
}

/** Only offer price bands that contain something. */
export function bucketsFor (category, brand) {
  const list = inCategory(category).filter(p => !brand || brand === 'any' || p.brand === brand)
  return PRICE_BUCKETS.filter(b => list.some(p => p.price >= b.min && p.price < b.max))
}

export function prioritiesFor (category) {
  return PRIORITIES[category] || DEFAULT_PRIORITIES
}

/* ------------------------------------------------------------------ */
/*  Scoring                                                            */
/* ------------------------------------------------------------------ */

/** Everything searchable about a product, lower-cased once per call. */
const blobOf = p =>
  `${p.name} ${p.description} ${p.highlights.join(' ')} ${Object.entries(p.specs)
    .map(([k, v]) => `${k} ${v}`)
    .join(' ')}`.toLowerCase()

const EXTRA_TESTS = {
  deals: p => discountPct(p.mrp, p.price) >= 40,
  toprated: p => p.rating >= 4.4,
  fast: p => p.deliveryDays <= 3,
  verified: p => p.assured
}

function priorityHits (product, criteria) {
  if (!criteria.priority || criteria.priority === 'any') return 0
  const option = prioritiesFor(criteria.category).find(o => o.id === criteria.priority)
  if (!option || !option.keywords.length) return 0
  const blob = blobOf(product)
  return option.keywords.filter(k => blob.includes(k)).length
}

/** Weighted score. Higher is a better fit for the stated criteria. */
function scoreProduct (product, criteria) {
  let score = 0
  score += (product.rating - 3.5) * 12 // 0 – 14
  score += Math.min(discountPct(product.mrp, product.price), 60) * 0.35 // 0 – 21
  score += Math.min(priorityHits(product, criteria), 2) * 8 // 0 – 16
  score += product.assured ? 5 : 0
  score += Math.max(0, 6 - product.deliveryDays) // 0 – 5
  if (criteria.brand && criteria.brand !== 'any' && product.brand === criteria.brand) score += 8
  if (criteria.tone === 'cheap') score += Math.max(0, 12 - product.price / 5000)
  if (criteria.tone === 'premium') score += Math.min(12, product.price / 8000)
  return score
}

/** Present the score as a friendly percentage without ever promising 100%. */
const toMatchPercent = score => Math.max(62, Math.min(98, Math.round(60 + (score / 70) * 38)))

function applyFilters (criteria, { useExtras = true, useBudget = true, useBrand = true } = {}) {
  let list = inCategory(criteria.category)

  if (useBrand && criteria.brand && criteria.brand !== 'any') {
    list = list.filter(p => p.brand === criteria.brand)
  }

  if (useBudget) {
    const range = budgetRange(criteria.budget)
    if (range) list = list.filter(p => p.price >= range.min && p.price <= range.max)
  }

  if (useExtras && criteria.extras?.length) {
    list = list.filter(p => criteria.extras.every(id => EXTRA_TESTS[id]?.(p) ?? true))
  }

  return list
}

/**
 * Rank the catalogue against the criteria. If nothing satisfies every
 * constraint we relax them in order of how negotiable they are (extras →
 * budget → brand) and report what was dropped, so the assistant can say so
 * instead of showing an empty result.
 */
export function rankProducts (criteria, limit = 3) {
  const attempts = [
    { opts: {}, relaxed: null },
    { opts: { useExtras: false }, relaxed: 'extras' },
    { opts: { useExtras: false, useBudget: false }, relaxed: 'budget' },
    { opts: { useExtras: false, useBudget: false, useBrand: false }, relaxed: 'brand' }
  ]

  for (const attempt of attempts) {
    const list = applyFilters(criteria, attempt.opts)
    if (list.length) {
      const scored = list
        .map(product => ({ product, score: scoreProduct(product, criteria) }))
        .sort((a, b) => b.score - a.score)

      return {
        matches: scored.slice(0, limit).map(({ product, score }) => ({
          product,
          match: toMatchPercent(score),
          reasons: reasonsFor(product, criteria)
        })),
        total: list.length,
        relaxed: attempt.relaxed
      }
    }
  }

  return { matches: [], total: 0, relaxed: null }
}

/* ------------------------------------------------------------------ */
/*  Explanations                                                       */
/* ------------------------------------------------------------------ */

/** Up to three short reasons this product suits the stated criteria. */
export function reasonsFor (product, criteria) {
  const reasons = []

  if (criteria.brand && criteria.brand !== 'any' && product.brand === criteria.brand) {
    reasons.push(`${product.brand} — the brand you picked`)
  }

  if (priorityHits(product, criteria) > 0) {
    const option = prioritiesFor(criteria.category).find(o => o.id === criteria.priority)
    if (option) reasons.push(`Strong on ${option.label.toLowerCase()}`)
  }

  const off = discountPct(product.mrp, product.price)
  if (off >= 35) reasons.push(`${off}% off right now`)

  if (product.rating >= 4.4) {
    reasons.push(`${product.rating}★ from ${product.ratingCount.toLocaleString('en-IN')} ratings`)
  }

  if (criteria.budget && criteria.budget !== 'any' && reasons.length < 3) {
    reasons.push(`Fits your ${budgetLabel(criteria.budget)} budget`)
  }

  if (product.deliveryDays <= 2 && reasons.length < 3) reasons.push('Delivered in 2 days')

  if (!reasons.length) reasons.push(`Well reviewed at ${formatINR(product.price)}`)

  return reasons.slice(0, 3)
}

/** Human summary of everything gathered so far, e.g. "Pulse phones under ₹20,000". */
export function summarise (criteria) {
  const parts = []
  if (criteria.brand && criteria.brand !== 'any') parts.push(criteria.brand)
  if (criteria.category) parts.push(categoryLabel(criteria.category).toLowerCase())
  let summary = parts.join(' ') || 'products'
  const label = budgetLabel(criteria.budget)
  if (label) summary += label.startsWith('under') || label.startsWith('above') ? ` ${label}` : ` in the ${label} range`
  return summary
}

/** Deep link into the normal listing page with the same filters applied. */
export function listingUrl (criteria) {
  const params = new URLSearchParams()
  if (criteria.category) params.set('category', criteria.category)
  if (criteria.brand && criteria.brand !== 'any') params.append('brand', criteria.brand)

  // chip budgets map to a band; typed budgets send exact bounds so the
  // listing shows precisely what the assistant promised
  if (typeof criteria.budget === 'object' && criteria.budget) {
    const range = budgetRange(criteria.budget)
    if (range.min) params.set('min', String(range.min))
    if (Number.isFinite(range.max)) params.set('max', String(range.max))
  } else if (criteria.budget && criteria.budget !== 'any') {
    params.append('price', criteria.budget)
  }
  if (criteria.extras?.includes('toprated')) params.set('rating', '4')
  params.set('sort', criteria.extras?.includes('deals') ? 'discount' : 'popular')
  return `/products?${params.toString()}`
}
