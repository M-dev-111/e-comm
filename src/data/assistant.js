/* ==================================================================
   Shopping assistant — static configuration.

   The assistant is fully offline: no model calls. "Understanding" comes
   from the synonym tables and phrase rules below, combined with the
   scoring in utils/assistantEngine.js.
   ================================================================== */

/* Free-text → category. Order matters: the first table whose word is
   found in the message wins, so put narrow terms before broad ones. */
export const CATEGORY_SYNONYMS = [
  {
    category: 'mobiles',
    words: ['phone', 'phones', 'mobile', 'mobiles', 'smartphone', 'smartphones', 'android', 'iphone', 'handset', 'cellphone', '5g']
  },
  {
    category: 'footwear',
    words: ['footwear', 'shoe', 'shoes', 'sneaker', 'sneakers', 'trainer', 'trainers', 'boot', 'boots', 'loafer', 'running shoes']
  },
  {
    category: 'beauty',
    words: ['beauty', 'makeup', 'cosmetic', 'cosmetics', 'skincare', 'skin care', 'lipstick', 'serum', 'perfume', 'fragrance', 'grooming']
  },
  {
    category: 'accessories',
    words: ['accessory', 'accessories', 'bag', 'bags', 'backpack', 'rucksack', 'tote', 'sunglass', 'sunglasses', 'shades', 'wallet']
  },
  {
    category: 'home',
    words: ['home', 'furniture', 'sofa', 'couch', 'chair', 'lamp', 'lighting', 'decor', 'planter', 'living room', 'bedroom', 'interior']
  },
  {
    category: 'fashion',
    words: ['fashion', 'clothes', 'clothing', 'apparel', 'shirt', 'tshirt', 't-shirt', 'tee', 'dress', 'jacket', 'denim', 'jeans', 'outfit', 'wear']
  },
  {
    category: 'electronics',
    words: ['electronic', 'electronics', 'gadget', 'gadgets', 'headphone', 'headphones', 'earphone', 'earphones', 'earbud', 'earbuds', 'audio', 'speaker', 'speakers', 'laptop', 'laptops', 'notebook', 'computer', 'camera', 'cameras', 'smartwatch', 'watch', 'keyboard', 'gaming', 'controller', 'tech']
  }
]

/* Groceries live in the Dash tab, not the catalogue — the assistant
   recognises them so it can point the customer to the right place. */
export const GROCERY_WORDS = [
  'grocery', 'groceries', 'vegetable', 'vegetables', 'veggies', 'fruit', 'fruits',
  'milk', 'bread', 'egg', 'eggs', 'snack', 'snacks', 'rice', 'dairy', 'butter', 'coffee'
]

/* What the customer cares about, per category. `keywords` are matched
   against a product's name, description, highlights and specs; hits are a
   soft ranking boost rather than a hard filter, so results never dry up. */
export const PRIORITIES = {
  mobiles: [
    { id: 'camera', label: 'Camera quality', keywords: ['camera', 'mp', 'ois', 'sensor', 'lens', 'video'] },
    { id: 'battery', label: 'Battery life', keywords: ['battery', 'mah', 'charging', 'charge'] },
    { id: 'performance', label: 'Gaming & speed', keywords: ['processor', 'gaming', 'flagship', 'chipset', 'ray tracing', '144hz'] },
    { id: 'display', label: 'Display', keywords: ['amoled', 'display', 'ltpo', 'nits', 'qhd', '120hz'] }
  ],
  electronics: [
    { id: 'sound', label: 'Sound quality', keywords: ['audio', 'driver', 'sound', 'ldac', 'stereo', 'speaker'] },
    { id: 'battery', label: 'Battery life', keywords: ['battery', 'hrs', 'mah', 'charge'] },
    { id: 'portable', label: 'Portability', keywords: ['compact', 'light', 'featherweight', 'g)', 'portable'] },
    { id: 'pro', label: 'Professional use', keywords: ['pro', '4k', 'stabilis', 'hi-res', 'colour', 'creator'] }
  ],
  footwear: [
    { id: 'running', label: 'Running & training', keywords: ['running', 'midsole', 'energy return', 'cushion'] },
    { id: 'casual', label: 'Everyday casual', keywords: ['leather', 'sneaker', 'everything', 'minimalist'] },
    { id: 'comfort', label: 'All-day comfort', keywords: ['cushion', 'insole', 'comfort', 'foam'] }
  ],
  fashion: [
    { id: 'everyday', label: 'Everyday basics', keywords: ['cotton', 'tee', 'basic', 'fit'] },
    { id: 'layering', label: 'Layering', keywords: ['jacket', 'denim', 'fleece'] },
    { id: 'occasion', label: 'Occasion wear', keywords: ['dress', 'floral', 'midi'] }
  ],
  home: [
    { id: 'seating', label: 'Seating', keywords: ['chair', 'sofa', 'seat', 'foam'] },
    { id: 'lighting', label: 'Lighting', keywords: ['lamp', 'led', 'light', 'bulb'] },
    { id: 'decor', label: 'Decor accents', keywords: ['planter', 'ceramic', 'glaze', 'decor'] }
  ],
  beauty: [
    { id: 'skincare', label: 'Skincare', keywords: ['serum', 'vitamin', 'skin', 'derma'] },
    { id: 'makeup', label: 'Makeup', keywords: ['lipstick', 'matte', 'shade', 'finish'] },
    { id: 'fragrance', label: 'Fragrance', keywords: ['perfume', 'eau', 'notes', 'oud'] }
  ],
  accessories: [
    { id: 'work', label: 'Work & commute', keywords: ['laptop', 'office', 'commute', 'work'] },
    { id: 'travel', label: 'Travel', keywords: ['travel', 'capacity', 'cabin', 'water'] },
    { id: 'style', label: 'Style statement', keywords: ['leather', 'polarized', 'patina', 'classic'] }
  ]
}

/* Fallback list for any category without a bespoke set. */
export const DEFAULT_PRIORITIES = [
  { id: 'value', label: 'Best value', keywords: [] },
  { id: 'premium', label: 'Premium quality', keywords: ['premium', 'full-grain', 'flagship'] }
]

/* Final refinement pass — multi-select. */
export const EXTRAS = [
  { id: 'deals', label: 'Big discounts only', hint: '40% off or more' },
  { id: 'toprated', label: 'Highly rated', hint: '4.4★ and above' },
  { id: 'fast', label: 'Fast delivery', hint: 'In 3 days or less' },
  { id: 'verified', label: 'Verified sellers', hint: 'mCOM Verified' }
]

/* Chips offered on the very first turn. */
export const QUICK_STARTS = ['Phones', 'Headphones', 'Running shoes', 'Gifts under ₹2,000']

export const COPY = {
  greeting: "Hi! I'm the mCOM shopping assistant.",
  greetingSub:
    'Tell me what you are looking for — a category like "phones", a brand, or even a budget like "under ₹20,000" — and I will narrow it down with you.',
  askCategory: 'What are you shopping for today?',
  noMatch:
    "I could not place that in our catalogue. Here are the departments I can search — or type something like \"phone under 20000\".",
  grocery:
    'Groceries are handled by mCOM Dash, our quick-commerce tab — everything there arrives in about 8 minutes.'
}
