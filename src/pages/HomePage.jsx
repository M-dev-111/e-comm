import { PRODUCTS } from '../data/data'
import HeroCarousel from '../components/home/HeroCarousel'
import OfferStrip from '../components/home/OfferStrip'
import DealOfTheDay from '../components/home/DealOfTheDay'
import ProductRail from '../components/home/ProductRail'
import BrandMarquee from '../components/home/BrandMarquee'

export default function HomePage () {
  const bestsellers = PRODUCTS.filter(p => p.tags.includes('bestseller'))
  const trending = PRODUCTS.filter(p => p.tags.includes('trending'))
  const premium = PRODUCTS.filter(p => p.tags.includes('premium'))
  const electronics = PRODUCTS.filter(p => p.category === 'electronics')

  return (
    <>
      <HeroCarousel />
      <OfferStrip />
      <ProductRail kicker='Suggested for you' title='Bestsellers' products={bestsellers} to='/products?tag=bestseller' />
      <DealOfTheDay />
      <ProductRail kicker='Trending this week' title='Trending Now' products={trending} to='/products?tag=trending' />
      <BrandMarquee />
      <ProductRail kicker='Gadgets & accessories' title='Top Picks in Electronics' products={electronics} to='/products?category=electronics' />
      <ProductRail kicker='Curated selection' title='Premium Store' products={premium} to='/products?tag=premium' />
    </>
  )
}
