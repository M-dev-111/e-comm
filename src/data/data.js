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
  { id: 'electronics', label: 'Electronics', emoji: '🎧', image: U('photo-1505740420928-5e560c06d30e', 400), gradient: 'from-royal-600 to-royal-400' },
  { id: 'fashion', label: 'Fashion', emoji: '👕', image: U('photo-1521572163474-6864f9cf17ab', 400), gradient: 'from-olive-600 to-olive-400' },
  { id: 'footwear', label: 'Footwear', emoji: '👟', image: U('photo-1542291026-7eec264c27ff', 400), gradient: 'from-royal-800 to-royal-600' },
  { id: 'home', label: 'Home & Living', emoji: '🛋️', image: U('photo-1555041469-a586c61ea9bc', 400), gradient: 'from-olive-700 to-olive-500' },
  { id: 'beauty', label: 'Beauty', emoji: '💄', image: U('photo-1556228720-195a672e8a03', 400), gradient: 'from-royal-500 to-olive-500' },
  { id: 'accessories', label: 'Accessories', emoji: '⌚', image: U('photo-1523275335684-37898b6baf30', 400), gradient: 'from-slate-700 to-royal-900' }
]

/* ------------------------------------------------------------------ */
/*  Products (e-commerce)                                              */
/* ------------------------------------------------------------------ */

export const PRODUCTS = [
  {
    id: 'p1',
    name: 'Sonicwave Pro ANC Wireless Headphones',
    brand: 'Sonicwave',
    category: 'electronics',
    price: 4999,
    mrp: 9999,
    rating: 4.5,
    ratingCount: 12840,
    reviewCount: 1543,
    assured: true,
    tags: ['bestseller', 'deal'],
    stock: 14,
    deliveryDays: 2,
    colors: ['Midnight Black', 'Arctic Silver', 'Navy Blue'],
    images: [U('photo-1505740420928-5e560c06d30e'), U('photo-1484704849700-f032a568e944'), U('photo-1583394838336-acd977736f90')],
    highlights: ['42dB Hybrid Active Noise Cancellation', '60-hour battery with 10-min fast charge', 'Hi-Res LDAC audio · 40mm drivers', 'Multipoint pairing across 2 devices'],
    specs: { 'Driver Size': '40mm dynamic', 'Battery Life': '60 hrs (ANC off)', Bluetooth: 'v5.3, LDAC', Weight: '254 g', Warranty: '1 year' },
    description: 'Immersive studio-grade sound with adaptive noise cancellation that tunes itself to your surroundings. Plush memory-foam earcups for all-day comfort.'
  },
  {
    id: 'p2',
    name: 'Pulse X2 Smartwatch AMOLED 46mm',
    brand: 'Pulse',
    category: 'electronics',
    price: 6499,
    mrp: 11999,
    rating: 4.3,
    ratingCount: 8932,
    reviewCount: 976,
    assured: true,
    tags: ['trending'],
    stock: 22,
    deliveryDays: 2,
    colors: ['Obsidian', 'Rose Gold'],
    images: [U('photo-1523275335684-37898b6baf30'), U('photo-1524592094714-0f0654e20314'), U('photo-1508685096489-7aacd43bd3b1')],
    highlights: ['1.43" AMOLED always-on display', 'Bluetooth calling with AI voice', '120+ sports modes · SpO₂ + HRV', '10-day typical battery life'],
    specs: { Display: '1.43" AMOLED, 466×466', Battery: '10 days typical', Sensors: 'HR, SpO₂, Compass', 'Water Resist': '5 ATM', Warranty: '1 year' },
    description: 'A flagship-grade smartwatch with a razor-sharp AMOLED display, precision health tracking and a battery that simply refuses to quit.'
  },
  {
    id: 'p3',
    name: 'AeroStride Velocity Running Shoes',
    brand: 'AeroStride',
    category: 'footwear',
    price: 3299,
    mrp: 6599,
    rating: 4.6,
    ratingCount: 21430,
    reviewCount: 2811,
    assured: true,
    tags: ['bestseller', 'deal'],
    stock: 9,
    deliveryDays: 3,
    sizes: ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10'],
    colors: ['Crimson Red', 'Triple White'],
    images: [U('photo-1542291026-7eec264c27ff'), U('photo-1460353581641-37baddab0fa2'), U('photo-1595950653106-6c9ebd614d3a')],
    highlights: ['NitroFoam™ midsole — 68% energy return', 'Engineered mesh upper, zero break-in', '232 g featherweight build', 'Carbon-rubber outsole grip'],
    specs: { Type: 'Neutral road running', Drop: '8 mm', Weight: '232 g (UK 8)', Upper: 'Engineered mesh', Warranty: '90 days' },
    description: 'Race-day speed for everyday miles. The Velocity pairs a propulsive NitroFoam midsole with a breathable knit that disappears on your foot.'
  },
  {
    id: 'p4',
    name: 'Lumen 4K Mirrorless Camera Kit',
    brand: 'Lumen',
    category: 'electronics',
    price: 58990,
    mrp: 72990,
    rating: 4.7,
    ratingCount: 3211,
    reviewCount: 458,
    assured: true,
    tags: ['premium'],
    stock: 5,
    deliveryDays: 4,
    images: [U('photo-1526170375885-4d8ecf77b99f'), U('photo-1502920917128-1aa500764cbd'), U('photo-1516035069371-29a1b244cc32')],
    highlights: ['26MP APS-C sensor · 4K 60fps', '5-axis in-body stabilisation', '18-55mm f/2.8 kit lens included', 'Dual UHS-II card slots'],
    specs: { Sensor: '26MP APS-C BSI', Video: '4K 60p 10-bit', IBIS: '5-axis, 7 stops', Mount: 'L-mount', Warranty: '2 years' },
    description: 'A creator-first mirrorless kit that shoots buttery 4K and razor-sharp stills, stabilised by a 7-stop IBIS system.'
  },
  {
    id: 'p5',
    name: 'Nordic Oak Lounge Chair',
    brand: 'HavenHome',
    category: 'home',
    price: 12499,
    mrp: 19999,
    rating: 4.4,
    ratingCount: 1870,
    reviewCount: 312,
    assured: false,
    tags: ['premium'],
    stock: 7,
    deliveryDays: 6,
    colors: ['Sand Beige', 'Charcoal'],
    images: [U('photo-1592078615290-033ee584e267'), U('photo-1567538096630-e0c55bd6374c'), U('photo-1586023492125-27b2c045efd7')],
    highlights: ['Solid oak frame, hand-finished', 'High-density moulded foam', 'Stain-resistant bouclé fabric', 'Assembles in 10 minutes'],
    specs: { Material: 'Solid oak + bouclé', Dimensions: '72 × 80 × 84 cm', 'Max Load': '150 kg', Assembly: 'DIY, 10 min', Warranty: '3 years' },
    description: 'Scandinavian silhouette, cloud-soft seat. The Nordic lounge chair turns any corner into the best seat in the house.'
  },
  {
    id: 'p6',
    name: 'Essential Oversized Cotton Tee',
    brand: 'Drift',
    category: 'fashion',
    price: 799,
    mrp: 1599,
    rating: 4.2,
    ratingCount: 15320,
    reviewCount: 1893,
    assured: true,
    tags: ['bestseller'],
    stock: 48,
    deliveryDays: 2,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Off White', 'Washed Black', 'Sage'],
    images: [U('photo-1521572163474-6864f9cf17ab'), U('photo-1576566588028-4147f3842f27'), U('photo-1503341504253-dff4815485f1')],
    highlights: ['240 GSM heavyweight combed cotton', 'Drop-shoulder oversized fit', 'Pre-shrunk, bio-washed', 'No-curl ribbed collar'],
    specs: { Fabric: '100% combed cotton, 240 GSM', Fit: 'Oversized drop-shoulder', Care: 'Machine wash cold', Origin: 'India', Warranty: 'NA' },
    description: 'The only tee you will reach for. Heavyweight cotton that drapes, a collar that never curls, and a fit borrowed from the streets of Seoul.'
  },
  {
    id: 'p7',
    name: 'Voyager 35L Anti-Theft Backpack',
    brand: 'TrekLite',
    category: 'accessories',
    price: 2199,
    mrp: 4499,
    rating: 4.5,
    ratingCount: 9877,
    reviewCount: 1204,
    assured: true,
    tags: ['deal'],
    stock: 18,
    deliveryDays: 3,
    colors: ['Graphite', 'Olive'],
    images: [U('photo-1553062407-98eeb64c6a62'), U('photo-1622560480605-d83c853bc5c3'), U('photo-1547949003-9792a18a2601')],
    highlights: ['Hidden zippers + RFID pocket', 'Fits 16" laptop, padded sleeve', 'USB charging pass-through port', 'Water-repellent 900D fabric'],
    specs: { Capacity: '35 L', Laptop: 'Up to 16"', Material: '900D polyester', Weight: '890 g', Warranty: '1 year' },
    description: 'Commute, cabin or campus — the Voyager swallows a week of gear while keeping pickpockets locked out.'
  },
  {
    id: 'p8',
    name: 'Aura Ceramic Table Lamp',
    brand: 'HavenHome',
    category: 'home',
    price: 1899,
    mrp: 3299,
    rating: 4.3,
    ratingCount: 2311,
    reviewCount: 289,
    assured: false,
    tags: [],
    stock: 11,
    deliveryDays: 4,
    images: [U('photo-1507473885765-e6ed057f782c'), U('photo-1513506003901-1e6a229e2d15'), U('photo-1540932239986-30128078f3c5')],
    highlights: ['Hand-glazed ceramic base', 'Warm 2700K dimmable LED', 'Linen drum shade', 'Touch dimmer switch'],
    specs: { Material: 'Ceramic + linen', Bulb: 'E27 LED (included)', Height: '42 cm', Cord: '1.8 m', Warranty: '1 year' },
    description: 'A sculptural glow for bedside tables and reading nooks — hand-glazed so no two lamps are exactly alike.'
  },
  {
    id: 'p9',
    name: 'Stellar 15 OLED Ultrabook i7 · 16GB',
    brand: 'Stellar',
    category: 'electronics',
    price: 82990,
    mrp: 104990,
    rating: 4.6,
    ratingCount: 4102,
    reviewCount: 612,
    assured: true,
    tags: ['premium', 'trending'],
    stock: 6,
    deliveryDays: 3,
    images: [U('photo-1496181133206-80ce9b88a853'), U('photo-1531297484001-80022131f5a1'), U('photo-1611186871348-b1ce696e52c9')],
    highlights: ['15.6" 2.8K OLED 120Hz display', 'Intel Core i7 · 16GB · 1TB SSD', '70Wh — 14 hr real-world battery', 'Thunderbolt 4 × 2, Wi-Fi 6E'],
    specs: { Display: '15.6" 2.8K OLED 120Hz', CPU: 'Intel Core i7-13700H', RAM: '16GB LPDDR5', Storage: '1TB NVMe SSD', Warranty: '2 years onsite' },
    description: 'Cinema-grade OLED in a 1.6 kg chassis. The Stellar 15 renders, compiles and streams without breaking a sweat — or the 14-hour battery.'
  },
  {
    id: 'p10',
    name: 'Indigo Slim-Fit Denim Jacket',
    brand: 'Drift',
    category: 'fashion',
    price: 2499,
    mrp: 4999,
    rating: 4.4,
    ratingCount: 6540,
    reviewCount: 731,
    assured: true,
    tags: ['trending'],
    stock: 16,
    deliveryDays: 3,
    sizes: ['S', 'M', 'L', 'XL'],
    images: [U('photo-1551028719-00167b16eac5'), U('photo-1543076447-215ad9ba6923'), U('photo-1523205771623-e0faa4d2813d')],
    highlights: ['13 oz stonewashed denim', 'YKK copper hardware', 'Tailored slim silhouette', 'Softens beautifully with age'],
    specs: { Fabric: '99% cotton, 1% elastane', Wash: 'Stonewashed indigo', Fit: 'Slim', Pockets: '4 external, 1 internal', Warranty: 'NA' },
    description: 'The forever jacket. Cut slim, built from 13 oz denim that moulds to you and only looks better every year.'
  },
  {
    id: 'p11',
    name: 'Solstice Polarized Aviators',
    brand: 'Solstice',
    category: 'accessories',
    price: 1499,
    mrp: 2999,
    rating: 4.1,
    ratingCount: 5211,
    reviewCount: 640,
    assured: false,
    tags: ['deal'],
    stock: 27,
    deliveryDays: 2,
    images: [U('photo-1572635196237-14b3f281503f'), U('photo-1511499767150-a48a237f0083'), U('photo-1473496169904-658ba7c44d8a')],
    highlights: ['HD polarized UV400 lenses', 'Featherlight titanium-alloy frame', 'Anti-glare + scratch coating', 'Hard case + microfibre included'],
    specs: { Lens: 'Polarized UV400', Frame: 'Titanium alloy', Weight: '18 g', 'Lens Width': '58 mm', Warranty: '6 months' },
    description: 'Classic aviators with modern optics — glare-killing polarized lenses in a frame you will forget you are wearing.'
  },
  {
    id: 'p12',
    name: 'CloudNest Fabric 3-Seater Sofa',
    brand: 'HavenHome',
    category: 'home',
    price: 32999,
    mrp: 54999,
    rating: 4.5,
    ratingCount: 943,
    reviewCount: 187,
    assured: true,
    tags: ['premium'],
    stock: 3,
    deliveryDays: 8,
    colors: ['Stone Grey', 'Forest Green'],
    images: [U('photo-1555041469-a586c61ea9bc'), U('photo-1493663284031-b7e3aefcae8e'), U('photo-1550254478-ead40cc54513')],
    highlights: ['Kiln-dried hardwood frame', '40-density PU + memory foam seats', 'Removable, washable covers', 'Free white-glove installation'],
    specs: { Seating: '3-seater', Dimensions: '210 × 92 × 85 cm', Frame: 'Kiln-dried hardwood', Fabric: 'Premium chenille', Warranty: '5 years frame' },
    description: 'Sink-in comfort engineered to last a decade. The CloudNest arrives with white-glove setup and covers you can actually wash.'
  },
  {
    id: 'p13',
    name: 'Velvet Matte Lipstick Trio',
    brand: 'Lumière',
    category: 'beauty',
    price: 999,
    mrp: 1799,
    rating: 4.3,
    ratingCount: 7822,
    reviewCount: 1011,
    assured: true,
    tags: ['bestseller'],
    stock: 34,
    deliveryDays: 2,
    images: [U('photo-1586495777744-4413f21062fa'), U('photo-1512496015851-a90fb38ba796'), U('photo-1596462502278-27bfdc403348')],
    highlights: ['3 curated everyday shades', '12-hour transfer-proof wear', 'Shea butter — zero drying', 'Cruelty-free & vegan'],
    specs: { Shades: 'Rosewood, Brick, Mauve', Finish: 'Velvet matte', Wear: 'Up to 12 hrs', Vegan: 'Yes', Expiry: '30 months' },
    description: 'Three universally flattering mattes that glide like silk and stay put through coffee, calls and dinner.'
  },
  {
    id: 'p14',
    name: 'GlowLab Vitamin C Serum 30ml',
    brand: 'GlowLab',
    category: 'beauty',
    price: 699,
    mrp: 1299,
    rating: 4.4,
    ratingCount: 11230,
    reviewCount: 1677,
    assured: true,
    tags: ['trending', 'deal'],
    stock: 41,
    deliveryDays: 2,
    images: [U('photo-1556228720-195a672e8a03'), U('photo-1570172619644-dfd03ed5d881'), U('photo-1620916566398-39f1143ab7be')],
    highlights: ['15% ethylated Vitamin C', 'Hyaluronic acid + Vitamin E', 'Visibly brighter in 2 weeks', 'Dermatologically tested'],
    specs: { 'Active %': '15% Vitamin C', Volume: '30 ml', 'Skin Type': 'All', Fragrance: 'None', Expiry: '24 months' },
    description: 'A featherweight daily serum that fades dark spots and brings back glass-skin radiance — without the sting.'
  },
  {
    id: 'p15',
    name: 'Boulevard White Leather Sneakers',
    brand: 'AeroStride',
    category: 'footwear',
    price: 2799,
    mrp: 4999,
    rating: 4.5,
    ratingCount: 8433,
    reviewCount: 921,
    assured: true,
    tags: ['bestseller'],
    stock: 13,
    deliveryDays: 3,
    sizes: ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'],
    images: [U('photo-1600185365483-26d7a4cc7519'), U('photo-1560769629-975ec94e6a86'), U('photo-1549298916-b41d501d3772')],
    highlights: ['Full-grain leather upper', 'Cushioned ortho-lite insole', 'Stitched (not glued) cupsole', 'Goes with literally everything'],
    specs: { Upper: 'Full-grain leather', Sole: 'Rubber cupsole', Insole: 'Ortho-lite foam', Weight: '340 g', Warranty: '6 months' },
    description: 'The minimalist white sneaker done right — buttery leather, real stitching and cushioning made for 20,000-step days.'
  },
  {
    id: 'p16',
    name: 'Echo Mini Smart Speaker',
    brand: 'Sonicwave',
    category: 'electronics',
    price: 3499,
    mrp: 5999,
    rating: 4.2,
    ratingCount: 6100,
    reviewCount: 733,
    assured: true,
    tags: [],
    stock: 25,
    deliveryDays: 2,
    colors: ['Charcoal', 'Glacier'],
    images: [U('photo-1608043152269-423dbba4e7e1'), U('photo-1589003077984-894e133dabab'), U('photo-1545454675-3531b543be5d')],
    highlights: ['360° room-filling audio', 'Built-in voice assistant', 'Stereo-pair two speakers', 'Fabric-wrapped compact design'],
    specs: { Output: '360° full-range driver', Connectivity: 'Wi-Fi + BT 5.0', Assistant: 'Built-in', Power: 'USB-C', Warranty: '1 year' },
    description: 'Small enough for a shelf, loud enough for a party. Ask it anything, or pair two for true stereo.'
  },
  {
    id: 'p17',
    name: 'Midnight Bloom Eau de Parfum 100ml',
    brand: 'Lumière',
    category: 'beauty',
    price: 1899,
    mrp: 3499,
    rating: 4.6,
    ratingCount: 4310,
    reviewCount: 502,
    assured: true,
    tags: ['premium'],
    stock: 19,
    deliveryDays: 2,
    images: [U('photo-1541643600914-78b084683601'), U('photo-1592945403244-b3fbafd7f539'), U('photo-1523293182086-7651a899d37f')],
    highlights: ['Notes: jasmine, oud, amber', '10-hour longevity EDP', 'IFRA-certified ingredients', 'Hand-polished glass flacon'],
    specs: { Type: 'Eau de Parfum', Volume: '100 ml', 'Top Notes': 'Bergamot, pink pepper', 'Base Notes': 'Oud, amber, musk', Expiry: '36 months' },
    description: 'A magnetic evening scent that opens bright and settles into smoked amber warmth. Compliments guaranteed.'
  },
  {
    id: 'p18',
    name: 'Terra Ceramic Planter Set (3)',
    brand: 'HavenHome',
    category: 'home',
    price: 1299,
    mrp: 2499,
    rating: 4.2,
    ratingCount: 1922,
    reviewCount: 214,
    assured: false,
    tags: [],
    stock: 30,
    deliveryDays: 4,
    images: [U('photo-1485955900006-10f4d324d411'), U('photo-1463320726281-696a485928c7'), U('photo-1416879595882-3373a0480b5b')],
    highlights: ['3 graduated sizes', 'Drainage holes + bamboo trays', 'Frost-proof stoneware', 'Matte hand-dipped glaze'],
    specs: { Material: 'Stoneware ceramic', Sizes: '10 / 13 / 16 cm', Drainage: 'Yes, with trays', Finish: 'Matte glaze', Warranty: 'NA' },
    description: 'Give your greens a glow-up. Three matte ceramic planters that make even a money plant look designer.'
  },
  {
    id: 'p19',
    name: 'Nimbus Mechanical Keyboard TKL',
    brand: 'Stellar',
    category: 'electronics',
    price: 4299,
    mrp: 6999,
    rating: 4.7,
    ratingCount: 3877,
    reviewCount: 590,
    assured: true,
    tags: ['trending'],
    stock: 12,
    deliveryDays: 2,
    images: [U('photo-1587829741301-dc798b83add3'), U('photo-1618384887929-16ec33fab9ef'), U('photo-1595044426077-d36d9236d54a')],
    highlights: ['Hot-swappable tactile switches', 'Tri-mode: BT / 2.4G / USB-C', 'South-facing RGB, PBT caps', 'Gasket-mounted, thocky sound'],
    specs: { Layout: '87-key TKL', Switches: 'Tactile, hot-swap', Battery: '4000 mAh', Keycaps: 'Double-shot PBT', Warranty: '1 year' },
    description: 'The keyboard your desk deserves — gasket-mounted acoustics, buttery tactile switches and RGB that glows, never screams.'
  },
  {
    id: 'p20',
    name: 'Meridian Floral Midi Dress',
    brand: 'Drift',
    category: 'fashion',
    price: 1699,
    mrp: 3399,
    rating: 4.3,
    ratingCount: 4211,
    reviewCount: 489,
    assured: true,
    tags: ['deal'],
    stock: 21,
    deliveryDays: 3,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    images: [U('photo-1595777457583-95e059d581b8'), U('photo-1572804013309-59a88b7e92f1'), U('photo-1515372039744-b8f02a3ae446')],
    highlights: ['Breathable viscose crepe', 'Smocked back — perfect fit', 'Side pockets (yes, really)', 'Wrinkle-resistant travel fabric'],
    specs: { Fabric: '100% viscose crepe', Length: 'Midi, 112 cm', Sleeve: 'Flutter', Care: 'Gentle machine wash', Warranty: 'NA' },
    description: 'Brunch to beach to boarding gate — a swishy floral midi with pockets deep enough for your phone.'
  },
  {
    id: 'p21',
    name: 'Apex Pro Wireless Gaming Controller',
    brand: 'Stellar',
    category: 'electronics',
    price: 3799,
    mrp: 5499,
    rating: 4.4,
    ratingCount: 5630,
    reviewCount: 812,
    assured: true,
    tags: [],
    stock: 17,
    deliveryDays: 2,
    images: [U('photo-1606144042614-b2417e99c4e3'), U('photo-1592840496694-26d035b52b48'), U('photo-1552820728-8b83bb6b773f')],
    highlights: ['Hall-effect anti-drift sticks', '1000Hz polling, 20ms latency', 'Works on PC / mobile / TV', '40-hour battery, USB-C'],
    specs: { Sticks: 'Hall-effect', Polling: '1000 Hz wired', Battery: '40 hrs', Platforms: 'PC, Android, iOS', Warranty: '1 year' },
    description: 'Tournament-grade response with hall-effect sticks that will never drift. Your rank has no excuses now.'
  },
  {
    id: 'p22',
    name: 'Sierra Tan Leather Tote',
    brand: 'Solstice',
    category: 'accessories',
    price: 3999,
    mrp: 7999,
    rating: 4.5,
    ratingCount: 2988,
    reviewCount: 344,
    assured: true,
    tags: ['premium'],
    stock: 8,
    deliveryDays: 3,
    images: [U('photo-1584917865442-de89df76afd3'), U('photo-1548036328-c9fa89d128fa'), U('photo-1590874103328-eac38a683ce7')],
    highlights: ['Full-grain vegetable-tanned leather', 'Fits 14" laptop + A4 files', 'Magnetic snap + zip pocket', 'Ages into a rich patina'],
    specs: { Material: 'Full-grain leather', Dimensions: '38 × 30 × 12 cm', Laptop: 'Up to 14"', Lining: 'Cotton canvas', Warranty: '1 year' },
    description: 'The workbag that outlives trends — vegetable-tanned leather that grows more beautiful with every commute.'
  }
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

export const BRANDS = ['Sonicwave', 'AeroStride', 'Drift', 'HavenHome', 'Stellar', 'Lumière', 'GlowLab', 'Solstice', 'Pulse', 'TrekLite', 'Lumen']

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

const byId = new Map([...PRODUCTS, ...QUICK_PRODUCTS].map(p => [p.id, p]))

export const getProductById = id => byId.get(id)

export const getRelated = product =>
  PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 8)

export const getReviewsFor = productId => {
  // deterministic slice of the shared pool so each product shows 3-5 reviews
  const n = productId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const start = n % 2
  return REVIEWS.slice(start, start + 3 + (n % 3))
}
