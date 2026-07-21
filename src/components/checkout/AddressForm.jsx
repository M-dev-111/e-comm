import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAddresses } from '../../context/AddressContext'
import { useToast } from '../../context/ToastContext'

const FIELDS = [
  { name: 'name', label: 'Full name', span: true },
  { name: 'phone', label: 'Phone number', inputMode: 'numeric', maxLength: 10 },
  { name: 'pincode', label: 'Pincode', inputMode: 'numeric', maxLength: 6 },
  { name: 'line1', label: 'Flat, house no., building', span: true },
  { name: 'line2', label: 'Area, street, locality', span: true },
  { name: 'city', label: 'City' },
  { name: 'state', label: 'State' }
]

const EMPTY = { name: '', phone: '', pincode: '', line1: '', line2: '', city: '', state: '', type: 'HOME' }

function validate (values) {
  const errors = {}
  if (values.name.trim().length < 3) errors.name = 'Enter the full name'
  if (!/^\d{10}$/.test(values.phone)) errors.phone = 'Enter a 10-digit phone number'
  if (!/^\d{6}$/.test(values.pincode)) errors.pincode = 'Enter a 6-digit pincode'
  if (values.line1.trim().length < 4) errors.line1 = 'Enter the flat or building'
  if (values.city.trim().length < 2) errors.city = 'Enter the city'
  if (values.state.trim().length < 2) errors.state = 'Enter the state'
  return errors
}

/** Adds a delivery address and hands it back so checkout can select it. */
export default function AddressForm ({ onSaved, onCancel }) {
  const { addAddress } = useAddresses()
  const toast = useToast()
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})

  const set = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }))
    setErrors(prev => (prev[name] ? { ...prev, [name]: undefined } : prev))
  }

  const submit = e => {
    e.preventDefault()
    const found = validate(values)
    setErrors(found)
    if (Object.keys(found).length) return

    const saved = addAddress({
      ...values,
      name: values.name.trim(),
      phone: `+91 ${values.phone}`,
      line1: values.line1.trim(),
      line2: values.line2.trim(),
      city: values.city.trim(),
      state: values.state.trim()
    })
    toast('Address saved')
    setValues(EMPTY)
    onSaved?.(saved)
  }

  return (
    <motion.form
      onSubmit={submit}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className='rounded-2xl border border-slate-200 bg-white p-4 shadow-card'
    >
      <p className='mb-3 text-[11.5px] font-bold uppercase tracking-wide text-slate-400'>New delivery address</p>

      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
        {FIELDS.map(field => (
          <div key={field.name} className={field.span ? 'sm:col-span-2' : ''}>
            <input
              value={values[field.name]}
              inputMode={field.inputMode}
              maxLength={field.maxLength}
              onChange={e =>
                set(field.name, field.inputMode === 'numeric' ? e.target.value.replace(/\D/g, '') : e.target.value)
              }
              placeholder={field.label}
              aria-label={field.label}
              className={`w-full rounded-xl border px-3.5 py-2.5 text-[13px] outline-none transition-colors ${
                errors[field.name] ? 'border-rose-400 bg-rose-50/40' : 'border-slate-200 focus:border-royal-400'
              }`}
            />
            {errors[field.name] && (
              <p className='mt-1 text-[11px] font-semibold text-rose-500'>{errors[field.name]}</p>
            )}
          </div>
        ))}
      </div>

      <div className='mt-3 flex items-center gap-2'>
        <span className='text-[12px] font-semibold text-slate-500'>Save as</span>
        {['HOME', 'WORK', 'OTHER'].map(type => (
          <button
            key={type}
            type='button'
            onClick={() => set('type', type)}
            className={`rounded-lg px-3 py-1.5 text-[11.5px] font-bold transition-colors ${
              values.type === type ? 'bg-royal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className='mt-4 flex gap-2'>
        <button
          type='submit'
          className='rounded-xl bg-royal-600 px-5 py-2.5 text-[12.5px] font-bold text-white shadow-glow-royal transition-colors hover:bg-royal-700'
        >
          Save and deliver here
        </button>
        <button
          type='button'
          onClick={onCancel}
          className='rounded-xl px-4 py-2.5 text-[12.5px] font-bold text-slate-500 transition-colors hover:bg-slate-100'
        >
          Cancel
        </button>
      </div>
    </motion.form>
  )
}
