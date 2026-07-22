import { BRANDS, CATEGORIES } from '../data/data'
import { EXTRAS, PRIORITIES, DEFAULT_PRIORITIES } from '../data/assistant'

/* ==================================================================
   The vocabulary sent to the model on every turn.

   The model is only allowed to answer using these ids, and the backend
   discards anything outside them. That is what stops it inventing a
   brand or category the store does not actually carry.
   ================================================================== */

const uniqueById = list => [...new Map(list.map(item => [item.id, item])).values()]

/** Priorities for one category, or every known priority if none is chosen. */
export function priorityOptions (category) {
  const list = category
    ? PRIORITIES[category] || DEFAULT_PRIORITIES
    : [...Object.values(PRIORITIES).flat(), ...DEFAULT_PRIORITIES]
  return uniqueById(list.map(p => ({ id: p.id, label: p.label })))
}

export function buildVocabulary (category) {
  return {
    categories: CATEGORIES.map(c => ({ id: c.id, label: c.label })),
    brands: BRANDS,
    priorities: priorityOptions(category),
    extras: EXTRAS.map(e => ({ id: e.id, label: e.label }))
  }
}

/** Local criteria → the flat shape the chat endpoint expects. */
export function toWireCriteria (criteria) {
  const wire = {}
  if (criteria.category) wire.category = criteria.category
  if (criteria.brand && criteria.brand !== 'any') wire.brand = criteria.brand
  if (criteria.priority && criteria.priority !== 'any') wire.priority = criteria.priority
  if (Array.isArray(criteria.extras) && criteria.extras.length) wire.extras = criteria.extras

  const budget = criteria.budget
  if (budget && budget !== 'any' && typeof budget === 'object') {
    if (budget.min) wire.budgetMin = budget.min
    if (Number.isFinite(budget.max)) wire.budgetMax = budget.max
  }
  return wire
}
