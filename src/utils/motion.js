/* Shared framer-motion presets — one easing language across the app */

export const EASE = [0.16, 1, 0.3, 1]

export const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } }
}

export const fade = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6, ease: EASE } }
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.94 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: EASE } }
}

export const stagger = (delay = 0.07, delayChildren = 0.05) => ({
  hidden: {},
  show: { transition: { staggerChildren: delay, delayChildren } }
})

export const pageTransition = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.25, ease: 'easeIn' } }
}

/* springy tap/hover for buttons & cards */
export const press = { whileTap: { scale: 0.96 } }
export const lift = { whileHover: { y: -6 }, transition: { type: 'spring', stiffness: 300, damping: 22 } }
