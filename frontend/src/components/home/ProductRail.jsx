import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ProductCard from '../product/ProductCard'
import SectionHeader from '../ui/SectionHeader'
import Container from '../ui/Container'

/** Horizontal scroll rail with edge arrows. */
export default function ProductRail ({ kicker, title, products, to }) {
  const railRef = useRef(null)

  const scrollBy = dir => {
    railRef.current?.scrollBy({ left: dir * railRef.current.clientWidth * 0.75, behavior: 'smooth' })
  }

  if (!products.length) return null

  return (
    <Container className='relative py-8'>
      <SectionHeader kicker={kicker} title={title} to={to} />

      <div className='group/rail relative'>
        <div ref={railRef} className='no-scrollbar -mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-2 sm:gap-4'>
          {products.map((p, i) => (
            <div key={p.id} className='w-[46%] shrink-0 snap-start sm:w-60'>
              <ProductCard product={p} index={i} />
            </div>
          ))}
        </div>

        {[
          { dir: -1, Icon: ChevronLeft, cls: 'left-0 -translate-x-1/3' },
          { dir: 1, Icon: ChevronRight, cls: 'right-0 translate-x-1/3' }
        ].map(({ dir, Icon, cls }) => (
          <button
            key={dir}
            aria-label={dir === 1 ? 'Scroll right' : 'Scroll left'}
            onClick={() => scrollBy(dir)}
            className={`absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-slate-100 bg-white text-slate-700 shadow-card-hover transition-all hover:bg-royal-600 hover:text-white sm:grid ${cls} opacity-0 group-hover/rail:opacity-100`}
          >
            <Icon className='h-5 w-5' strokeWidth={2.2} />
          </button>
        ))}
      </div>
    </Container>
  )
}
