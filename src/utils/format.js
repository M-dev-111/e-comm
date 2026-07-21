/* Currency + misc formatting helpers */

export const formatINR = n => '₹' + Math.round(n).toLocaleString('en-IN')

export const discountPct = (mrp, price) => Math.round(((mrp - price) / mrp) * 100)

export const pluralize = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`

export const orderIdFrom = seed =>
  'OD' + String(Math.abs(seed)).padStart(12, '4').slice(0, 12)

export const deliveryDateLabel = (daysFromNow = 3) => {
  const d = new Date()
  d.setDate(d.getDate() + daysFromNow)
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
}
