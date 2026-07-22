/** Boxed section wrapper — centered compact width, fluid to 320px. */
export default function Container ({ className = '', children }) {
  return <div className={`mx-auto w-full max-w-7xl px-3 sm:px-5 lg:px-6 ${className}`}>{children}</div>
}
