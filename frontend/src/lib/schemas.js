import { z } from 'zod'

/* One place for every form contract in the app. The AI schema mirrors
   backend/schemas/ai.schema.js — keep the two in sync. */

export const askSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, 'Please enter a prompt.')
    .max(2000, 'Keep it under 2000 characters.')
})

/* Auth is phone + OTP. Name is only required when signing up, so the
   schema is built per mode rather than branching inside the component. */
export const makeAuthSchema = mode =>
  z.object({
    name:
      mode === 'signup'
        ? z.string().trim().min(2, 'Please enter your full name.').max(60, 'That name is too long.')
        : z.string().trim().optional(),
    phone: z
      .string()
      .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number.')
  })

export const otpSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, 'Enter the 6-digit OTP.')
})

export const addressSchema = z.object({
  name: z.string().trim().min(3, 'Enter the full name.'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number.'),
  pincode: z.string().regex(/^\d{6}$/, 'Enter a 6-digit pincode.'),
  line1: z.string().trim().min(4, 'Enter the flat or building.'),
  line2: z.string().trim().default(''),
  city: z.string().trim().min(2, 'Enter the city.'),
  state: z.string().trim().min(2, 'Enter the state.'),
  type: z.enum(['HOME', 'WORK', 'OTHER']).default('HOME')
})
