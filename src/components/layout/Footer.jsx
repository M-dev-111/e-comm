import { Link } from 'react-router-dom'
import { ShieldCheck, Truck, RotateCcw, BadgePercent, Star } from 'lucide-react'

const TRUST = [
  { icon: Truck, title: 'Free delivery', sub: 'On orders above ₹499' },
  { icon: RotateCcw, title: '7-day returns', sub: 'No questions asked' },
  { icon: ShieldCheck, title: '100% secure', sub: 'UPI · Cards · COD' },
  { icon: BadgePercent, title: 'Daily deals', sub: 'Up to 70% off' }
]

const LINKS = [
  ['Shop', ['Electronics', 'Fashion', 'Footwear', 'Home & Living', 'Beauty']],
  ['About', ['Company', 'Careers', 'Press', 'mCOM Stories', 'Corporate info']],
  ['Help', ['Payments', 'Shipping', 'Cancellations', 'Returns', 'FAQ']],
  ['Policy', ['Return policy', 'Terms of use', 'Security', 'Privacy', 'Sitemap']]
]

export default function Footer () {
  return (
    <footer className='mt-16 bg-royal-950 pb-24 text-white md:pb-0'>
      {/* trust strip */}
      <div className='mx-auto grid w-full max-w-7xl grid-cols-2 gap-px overflow-hidden bg-white/5 lg:grid-cols-4'>
        {TRUST.map(t => (
          <div key={t.title} className='flex items-center gap-3.5 bg-royal-950 px-4 py-6 sm:px-6'>
            <span className='grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-olive-500/15 text-olive-300'>
              <t.icon className='h-5 w-5' strokeWidth={1.8} />
            </span>
            <div>
              <p className='text-[13.5px] font-semibold'>{t.title}</p>
              <p className='text-[12px] text-white/45'>{t.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className='mx-auto w-full max-w-7xl px-3 py-12 sm:px-5 lg:px-6'>
        <div className='flex flex-col gap-10 lg:flex-row lg:justify-between'>
          <div className='max-w-sm'>
            <Link to='/' className='flex items-center gap-2'>
              <span className='grid h-9 w-9 place-items-center rounded-xl bg-linear-to-br from-royal-500 to-royal-700 font-display text-lg font-extrabold'>
                m
              </span>
              <span className='font-display text-xl font-extrabold tracking-tight'>
                <span className='text-olive-400'>m</span>COM
              </span>
            </Link>
            <p className='mt-4 text-[13px] leading-relaxed text-white/50'>
              A modern commerce platform — from flagship electronics and fashion to groceries
              delivered in minutes. Trusted by millions of customers across India.
            </p>
            <div className='mt-5 flex items-center gap-1.5 text-[12px] text-white/40'>
              <Star className='h-3.5 w-3.5 fill-amber-400 text-amber-400' strokeWidth={0} />
              4.6 · 2.1M ratings on the app
            </div>
          </div>

          <div className='grid flex-1 grid-cols-2 gap-8 sm:grid-cols-4 lg:max-w-2xl'>
            {LINKS.map(([title, items]) => (
              <div key={title}>
                <p className='mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white/35'>{title}</p>
                <ul className='space-y-2.5'>
                  {items.map(it => (
                    <li key={it}>
                      <a href='#' className='text-[13px] text-white/65 transition-colors hover:text-olive-300'>
                        {it}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className='mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-[12px] text-white/40 sm:flex-row sm:items-center sm:justify-between'>
          <span>© 2026 mCOM Internet Pvt. Ltd. All rights reserved. Demonstration build — orders are simulated.</span>
          <span>Registered office: Kolkata, India</span>
        </div>
      </div>
    </footer>
  )
}
