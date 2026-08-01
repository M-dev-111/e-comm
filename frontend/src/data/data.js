/* ================================================================== */
/*  mCOM — static data layer                                           */
/*  Every piece of content in the app lives here. Swap freely.         */
/* ================================================================== */

const U = (id, w = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

/* ------------------------------------------------------------------ */
/*  Categories (e-commerce)                                            */
/* ------------------------------------------------------------------ */

export const CATEGORIES = [
  { id: 'mobiles', label: 'Mobiles', emoji: '📱', image: U('photo-1511707171634-5f897ff02aa9', 400), gradient: 'from-royal-700 to-royal-500' },
  { id: 'electronics', label: 'Electronics', emoji: '🎧', image: U('photo-1505740420928-5e560c06d30e', 400), gradient: 'from-royal-600 to-royal-400' },
  { id: 'fashion', label: 'Fashion', emoji: '👕', image: U('photo-1521572163474-6864f9cf17ab', 400), gradient: 'from-olive-600 to-olive-400' },
  { id: 'footwear', label: 'Footwear', emoji: '👟', image: U('photo-1542291026-7eec264c27ff', 400), gradient: 'from-royal-800 to-royal-600' },
  { id: 'home', label: 'Home & Living', emoji: '🛋️', image: U('photo-1555041469-a586c61ea9bc', 400), gradient: 'from-olive-700 to-olive-500' },
  { id: 'beauty', label: 'Beauty', emoji: '💄', image: U('photo-1556228720-195a672e8a03', 400), gradient: 'from-royal-500 to-olive-500' },
  { id: 'accessories', label: 'Accessories', emoji: '⌚', image: U('photo-1523275335684-37898b6baf30', 400), gradient: 'from-slate-700 to-royal-900' }
]

/* ------------------------------------------------------------------ */
/*  Quick commerce — mCOM Dash                                        */
/* ------------------------------------------------------------------ */

export const QUICK_CATEGORIES = [
  { id: 'all', label: 'All', emoji: '⚡' },
  { id: 'fruits', label: 'Fruits & Veggies', emoji: '🥑' },
  { id: 'dairy', label: 'Dairy & Eggs', emoji: '🥛' },
  { id: 'snacks', label: 'Snacks', emoji: '🍿' },
  { id: 'beverages', label: 'Beverages', emoji: '🧃' },
  { id: 'bakery', label: 'Bakery', emoji: '🥐' },
  { id: 'pantry', label: 'Pantry', emoji: '🍚' }
]

export const QUICK_PRODUCTS = [
  { id: 'q1', name: 'Hass Avocado', unit: '2 pcs', price: 149, mrp: 199, category: 'fruits', eta: 8, image: U('photo-1523049673857-eb18f1d7b578', 400), tag: 'Fresh' },
  { id: 'q2', name: 'Robusta Bananas', unit: '6 pcs', price: 48, mrp: 60, category: 'fruits', eta: 8, image: U('photo-1571771894821-ce9b6c11b08e', 400) },
  { id: 'q3', name: 'Sourdough Loaf', unit: '400 g', price: 165, mrp: 210, category: 'bakery', eta: 10, image: U('photo-1509440159596-0249088772ff', 400), tag: 'Baked today' },
  { id: 'q4', name: 'Toned Milk', unit: '1 L', price: 66, mrp: 70, category: 'dairy', eta: 8, image: U('photo-1550583724-b2692b85b150', 400) },
  { id: 'q5', name: 'Farm Eggs (Brown)', unit: '12 pcs', price: 108, mrp: 132, category: 'dairy', eta: 8, image: U('photo-1506976785307-8732e854ad03', 400) },
  { id: 'q6', name: 'Fresh Strawberries', unit: '200 g', price: 129, mrp: 179, category: 'fruits', eta: 9, image: U('photo-1464965911861-746a04b4bca6', 400), tag: 'In season' },
  { id: 'q7', name: 'Vine Tomatoes', unit: '500 g', price: 42, mrp: 55, category: 'fruits', eta: 8, image: U('photo-1546094096-0df4bcaaa337', 400) },
  { id: 'q8', name: 'Arabica Ground Coffee', unit: '250 g', price: 349, mrp: 449, category: 'beverages', eta: 10, image: U('photo-1447933601403-0c6688de566e', 400) },
  { id: 'q9', name: 'Cold-Pressed Orange Juice', unit: '1 L', price: 189, mrp: 240, category: 'beverages', eta: 9, image: U('photo-1600271886742-f049cd451bba', 400) },
  { id: 'q10', name: 'Salted Potato Chips', unit: '150 g', price: 55, mrp: 70, category: 'snacks', eta: 8, image: U('photo-1566478989037-eec170784d0b', 400) },
  { id: 'q11', name: '70% Dark Chocolate', unit: '100 g', price: 210, mrp: 275, category: 'snacks', eta: 9, image: U('photo-1549007994-cb92caebd54b', 400), tag: 'Bestseller' },
  { id: 'q12', name: 'Baby Spinach', unit: '150 g', price: 39, mrp: 52, category: 'fruits', eta: 8, image: U('photo-1576045057995-568f588f82fb', 400) },
  { id: 'q13', name: 'Shimla Apples', unit: '4 pcs', price: 132, mrp: 168, category: 'fruits', eta: 9, image: U('photo-1560806887-1e4cd0b6cbd6', 400) },
  { id: 'q14', name: 'Greek Yogurt (Plain)', unit: '400 g', price: 145, mrp: 180, category: 'dairy', eta: 8, image: U('photo-1488477181946-6428a0291777', 400) },
  { id: 'q15', name: 'Basmati Rice', unit: '1 kg', price: 168, mrp: 215, category: 'pantry', eta: 11, image: U('photo-1586201375761-83865001e31c', 400) },
  { id: 'q16', name: 'Durum Wheat Penne', unit: '500 g', price: 129, mrp: 165, category: 'pantry', eta: 11, image: U('photo-1551462147-ff29053bfc14', 400) },
  { id: 'q17', name: 'Belgian Choco Ice Cream', unit: '500 ml', price: 285, mrp: 350, category: 'snacks', eta: 9, image: U('photo-1497034825429-c343d7c6a68f', 400), tag: 'Frozen' },
  { id: 'q18', name: 'Sparkling Lemonade', unit: '330 ml × 4', price: 220, mrp: 280, category: 'beverages', eta: 9, image: U('photo-1581636625402-29b2a704ef13', 400) },
  { id: 'q19', name: 'Salted Butter', unit: '500 g', price: 275, mrp: 305, category: 'dairy', eta: 8, image: U('photo-1589985270826-4b7bb135bc9d', 400) },
  { id: 'q20', name: 'Oat & Raisin Cookies', unit: '300 g', price: 149, mrp: 199, category: 'bakery', eta: 10, image: U('photo-1499636136210-6f4ee915583e', 400) },
  { id: 'q21', name: 'California Almonds', unit: '500 g', price: 449, mrp: 599, category: 'pantry', eta: 11, image: U('photo-1508061253366-f7da158b6d46', 400) },
  { id: 'q22', name: 'Wildflower Honey', unit: '350 g', price: 259, mrp: 340, category: 'pantry', eta: 11, image: U('photo-1587049352846-4a222e784d38', 400), tag: 'Raw' },
  { id: 'q23', name: 'Watermelon (Whole)', unit: '~2.5 kg', price: 89, mrp: 120, category: 'fruits', eta: 10, image: U('photo-1571575173700-afb9492e6a50', 400) },
  { id: 'q24', name: 'Butter Croissants', unit: '4 pcs', price: 195, mrp: 260, category: 'bakery', eta: 10, image: U('photo-1555507036-ab1f4038808a', 400), tag: 'Baked today' }
]

/* ------------------------------------------------------------------ */
/*  Hero banners, promos, brands                                       */
/* ------------------------------------------------------------------ */

export const HERO_SLIDES = [
  {
    id: 'h1',
    kicker: 'MEGA SAVINGS WEEK',
    title: 'Up to 70% off\nheadphones & audio',
    sub: 'Sonicwave · Bose · boAt and more',
    cta: 'Shop Electronics',
    to: '/products?category=electronics',
    image: U('photo-1484704849700-f032a568e944', 1200),
    theme: 'from-royal-800 via-royal-700 to-royal-500'
  },
  {
    id: 'h2',
    kicker: 'NEW SEASON',
    title: 'The new collection\nis here — 40-60% off',
    sub: 'Latest styles from Drift and more',
    cta: 'Explore Fashion',
    to: '/products?category=fashion',
    image: U('photo-1483985988355-763728e1935b', 1200),
    theme: 'from-olive-800 via-olive-600 to-olive-500'
  },
  {
    id: 'h3',
    kicker: 'FOOTWEAR EVENT',
    title: 'Step forward.\nFlat 50% off footwear',
    sub: 'AeroStride Velocity from ₹3,299',
    cta: 'Grab a Pair',
    to: '/products?category=footwear',
    image: U('photo-1460353581641-37baddab0fa2', 1200),
    theme: 'from-royal-950 via-royal-800 to-royal-600'
  },
  {
    id: 'h4',
    kicker: 'HOME MAKEOVER',
    title: 'Living spaces,\nreimagined from ₹1,299',
    sub: 'Sofas · lamps · planters & more',
    cta: 'Style Your Home',
    to: '/products?category=home',
    image: U('photo-1555041469-a586c61ea9bc', 1200),
    theme: 'from-olive-900 via-olive-700 to-royal-800'
  }
]

export const PROMO_TILES = [
  { id: 'promo1', title: 'Dash', sub: 'Groceries in 8 minutes', cta: 'Order now', to: '/quick', image: U('photo-1542838132-92c53300491e', 700), badge: 'New' },
  { id: 'promo2', title: 'Premium Store', sub: 'Curated luxury picks', cta: 'Discover', to: '/products?tag=premium', image: U('photo-1441986300917-64674bd600d8', 700) },
  { id: 'promo3', title: 'Deal Zone', sub: 'Up to 70% off today', cta: 'View deals', to: '/products?tag=deal', image: U('photo-1607082348824-0a96f2a4b9da', 700), badge: 'Limited time' }
]

export const BRANDS = ['Sonicwave', 'AeroStride', 'Drift', 'HavenHome', 'Stellar', 'Lumière', 'GlowLab', 'Solstice', 'Pulse', 'TrekLite', 'Lumen', 'Nexa']

/* Price bands — shared by the listing page filters and the shopping assistant,
   so an assistant result can deep-link into an identical filtered listing. */
export const PRICE_BUCKETS = [
  { id: 'p1', label: 'Under ₹1,000', short: 'Under ₹1k', min: 0, max: 1000 },
  { id: 'p2', label: '₹1,000 – ₹5,000', short: '₹1k – ₹5k', min: 1000, max: 5000 },
  { id: 'p3', label: '₹5,000 – ₹20,000', short: '₹5k – ₹20k', min: 5000, max: 20000 },
  { id: 'p4', label: '₹20,000 – ₹50,000', short: '₹20k – ₹50k', min: 20000, max: 50000 },
  { id: 'p5', label: 'Above ₹50,000', short: 'Above ₹50k', min: 50000, max: Infinity }
]

/* ------------------------------------------------------------------ */
/*  Reviews (shared pool, mapped per product deterministically)        */
/* ------------------------------------------------------------------ */

export const REVIEWS = [
  { id: 'r1', user: 'Aarav M.', rating: 5, title: 'Worth every rupee', body: 'Build quality is honestly a level above the price. Packaging was premium, delivery a day early. Zero regrets.', date: '12 Jun 2026', helpful: 214, verified: true },
  { id: 'r2', user: 'Priya S.', rating: 4, title: 'Very good, minor nitpicks', body: 'Performs exactly as described. Knocking one star off only because the manual is useless — YouTube saved me.', date: '28 May 2026', helpful: 121, verified: true },
  { id: 'r3', user: 'Rohan K.', rating: 5, title: 'Second one I have bought', body: 'Bought one for myself last year, gifting this one. That should tell you everything about how good it is.', date: '3 Jul 2026', helpful: 89, verified: true },
  { id: 'r4', user: 'Sneha T.', rating: 4, title: 'Great value for money', body: 'Compared this against options double the price and it holds its own. Finish and feel are excellent.', date: '19 Apr 2026', helpful: 67, verified: false },
  { id: 'r5', user: 'Vikram D.', rating: 5, title: 'Exceeded expectations', body: 'Was skeptical about ordering this online but the photos undersell it. Real thing looks and feels premium.', date: '8 Jul 2026', helpful: 45, verified: true }
]

/* ------------------------------------------------------------------ */
/*  Coupons                                                            */
/* ------------------------------------------------------------------ */

export const COUPONS = [
  { code: 'WELCOME100', label: '₹100 off on orders above ₹999', type: 'flat', value: 100, minOrder: 999 },
  { code: 'SAVE10', label: '10% off up to ₹500', type: 'percent', value: 10, maxDiscount: 500, minOrder: 1499 },
  { code: 'MEGA20', label: '20% off up to ₹1,000 on orders above ₹4,999', type: 'percent', value: 20, maxDiscount: 1000, minOrder: 4999 }
]

/* ------------------------------------------------------------------ */
/*  Addresses & payment methods (checkout)                             */
/* ------------------------------------------------------------------ */

export const ADDRESSES = [
  { id: 'a1', name: 'Dibyendu Sarkar', type: 'HOME', phone: '+91 98300 12345', line1: '14/2 Lake View Road, Flat 3B', line2: 'Ballygunge', city: 'Kolkata', state: 'West Bengal', pincode: '700029', default: true },
  { id: 'a2', name: 'Dibyendu Sarkar', type: 'WORK', phone: '+91 98300 12345', line1: 'Tower B, 7th Floor, Infinity Benchmark', line2: 'Sector V, Salt Lake', city: 'Kolkata', state: 'West Bengal', pincode: '700091', default: false }
]

export const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI', sub: 'GPay, PhonePe, Paytm & more', icon: '📱', offer: '₹25 cashback on first UPI payment' },
  { id: 'card', label: 'Credit / Debit Card', sub: 'Visa, Mastercard, RuPay, Amex', icon: '💳', offer: '5% cashback with partner bank cards' },
  { id: 'netbanking', label: 'Net Banking', sub: 'All major banks supported', icon: '🏦' },
  { id: 'emi', label: 'EMI', sub: 'No-cost EMI from ₹500/month', icon: '📆' },
  { id: 'cod', label: 'Cash on Delivery', sub: 'Pay at your doorstep', icon: '💵' }
]

/* ------------------------------------------------------------------ */
/*  Delivery config                                                    */
/* ------------------------------------------------------------------ */

export const DELIVERY = {
  freeAbove: 499,
  fee: 40,
  platformFee: 3,
  quickFee: 25,
  quickFreeAbove: 199
}

/* ------------------------------------------------------------------ */
/*  Lookups                                                            */
/* ------------------------------------------------------------------ */

/* The main catalogue (PRODUCTS) now lives in the backend — see
   hooks/useProducts.js. These two only ever resolve quick-commerce (mCOM
   Dash) items, which stay static; the naming makes that scope explicit. */
const quickById = new Map(QUICK_PRODUCTS.map(p => [p.id, p]))

export const getQuickProductById = id => quickById.get(id)

export const getRelatedQuick = product =>
  QUICK_PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 8)

export const getReviewsFor = productId => {
  // deterministic slice of the shared pool so each product shows 3-5 reviews
  const n = productId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const start = n % 2
  return REVIEWS.slice(start, start + 3 + (n % 3))
}
