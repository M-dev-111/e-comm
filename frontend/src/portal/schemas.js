import { z } from 'zod'

/* One place for every portal form contract — mirrors the pattern in
   src/lib/schemas.js for the storefront. Fields that mirror a backend zod
   schema (backend/schemas/*.js) are kept in sync with it by hand. */

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email.'),
  password: z.string().min(1, 'Password is required.')
})

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(80),
  email: z.string().trim().toLowerCase().email('Enter a valid email.'),
  password: z.string().min(8, 'Password must be at least 8 characters.')
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required.'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters.')
}).refine(v => v.currentPassword !== v.newPassword, {
  message: 'New password must differ from the current one.',
  path: ['newPassword']
})

export const vendorApplicationSchema = z.object({
  businessName: z.string().trim().min(1, 'Business name is required.').max(120),
  note: z.string().trim().max(500).optional()
})

export const createCompanySchema = z.object({
  name: z.string().trim().min(1, 'Company name is required.').max(120),
  email: z.string().trim().toLowerCase().email('Enter a valid email.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  logo: z.string().trim().url('Logo must be a URL.').optional().or(z.literal(''))
})

export const createUserSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(80),
  email: z.string().trim().toLowerCase().email('Enter a valid email.'),
  role: z.enum(['vendor', 'customer'])
})

export const createUserWithCompanySchema = createUserSchema.extend({
  companyId: z.string().trim().min(1, 'Select a company.')
})

/* Product form fields that hold a list are edited as one line/comma per
   item and transformed straight into the array the API expects — the
   resolver's output is already submit-ready. */
const urlLine = z.string().trim().url('Each image must be a valid URL.')
const linesToArray = v => (v ? v.split('\n').map(s => s.trim()).filter(Boolean) : [])
const csvToArray = v => (v ? v.split(',').map(s => s.trim()).filter(Boolean) : [])

export const productFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.').max(140),
  description: z.string().trim().min(1, 'Description is required.').max(4000),
  brand: z.string().trim().min(1, 'Brand is required.').max(60),
  category: z.string().trim().toLowerCase().min(1, 'Category is required.').max(40),
  price: z.coerce.number().positive('Price must be greater than 0.'),
  mrp: z.coerce.number().positive('MRP must be greater than 0.'),
  stock: z.coerce.number().int('Stock must be a whole number.').min(0, 'Stock cannot be negative.'),
  deliveryDays: z.coerce.number().int().min(0).max(30),
  images: z.string().trim().min(1, 'At least one image URL is required.')
    .transform(linesToArray)
    .pipe(z.array(urlLine).min(1, 'At least one image URL is required.')),
  tags: z.string().trim().optional().transform(csvToArray),
  colors: z.string().trim().optional().transform(csvToArray),
  sizes: z.string().trim().optional().transform(csvToArray),
  highlights: z.string().trim().optional().transform(linesToArray)
}).refine(v => v.mrp >= v.price, {
  message: 'MRP cannot be lower than the selling price.',
  path: ['mrp']
})

/** Reverse of productFormSchema's transforms — a fetched product back into editable text. */
export const productToFormValues = product => ({
  name: product.name,
  description: product.description,
  brand: product.brand,
  category: product.category,
  price: String(product.price),
  mrp: String(product.mrp),
  stock: String(product.stock),
  deliveryDays: String(product.deliveryDays ?? 3),
  images: (product.images || []).join('\n'),
  tags: (product.tags || []).join(', '),
  colors: (product.colors || []).join(', '),
  sizes: (product.sizes || []).join(', '),
  highlights: (product.highlights || []).join('\n')
})

export const EMPTY_PRODUCT_FORM = {
  name: '', description: '', brand: '', category: '',
  price: '', mrp: '', stock: '0', deliveryDays: '3',
  images: '', tags: '', colors: '', sizes: '', highlights: ''
}
