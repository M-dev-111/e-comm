import { useEffect, useState } from 'react'

/** Counts down to the next midnight — returns { h, m, s } zero-padded. */
export default function useCountdown () {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const end = new Date()
  end.setHours(24, 0, 0, 0)
  const diff = Math.max(0, end.getTime() - now)

  const pad = n => String(n).padStart(2, '0')
  return {
    h: pad(Math.floor(diff / 3.6e6)),
    m: pad(Math.floor((diff % 3.6e6) / 6e4)),
    s: pad(Math.floor((diff % 6e4) / 1000))
  }
}
