import { motion } from 'framer-motion'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAddresses } from '../../context/AddressContext'
import { addressSchema } from '../../lib/schemas'
import { toast } from 'sonner'

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

/** Adds a delivery address and hands it back so checkout can select it. */
export default function AddressForm ({ onSaved, onCancel }) {
  const { addAddress } = useAddresses()

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: EMPTY,
    mode: 'onTouched'
  })

  // useWatch (not watch()) so only this subscription re-renders, and so the
  // React Compiler can still optimise the component.
  const type = useWatch({ control, name: 'type' })

  /* zod has already trimmed every string by the time this runs, so the
     submit handler only has to format the phone for display. */
  const submit = values => {
    const saved = addAddress({ ...values, phone: `+91 ${values.phone}` })
    toast.success('Address saved')
    reset(EMPTY)
    onSaved?.(saved)
  }

  /** Numeric fields strip non-digits as you type. */
  const fieldProps = field => {
    const { onChange, ...rest } = register(field.name)
    if (field.inputMode !== 'numeric') return { ...rest, onChange }
    return {
      ...rest,
      onChange: e => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, field.maxLength)
        return onChange(e)
      }
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit(submit)}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      noValidate
      className='rounded-2xl border border-slate-200 bg-white p-4 shadow-card'
    >
      <p className='mb-3 text-[11.5px] font-bold uppercase tracking-wide text-slate-400'>New delivery address</p>

      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
        {FIELDS.map(field => (
          <div key={field.name} className={field.span ? 'sm:col-span-2' : ''}>
            <input
              {...fieldProps(field)}
              inputMode={field.inputMode}
              maxLength={field.maxLength}
              placeholder={field.label}
              aria-label={field.label}
              aria-invalid={!!errors[field.name]}
              className='w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-[13px] outline-none transition-colors focus:border-royal-400 aria-invalid:border-rose-400 aria-invalid:bg-rose-50/40'
            />
            {errors[field.name] && (
              <p className='mt-1 text-[11px] font-semibold text-rose-500'>{errors[field.name].message}</p>
            )}
          </div>
        ))}
      </div>

      <div className='mt-3 flex items-center gap-2'>
        <span className='text-[12px] font-semibold text-slate-500'>Save as</span>
        {['HOME', 'WORK', 'OTHER'].map(option => (
          <button
            key={option}
            type='button'
            onClick={() => setValue('type', option, { shouldDirty: true })}
            className={`rounded-lg px-3 py-1.5 text-[11.5px] font-bold transition-colors ${
              type === option ? 'bg-royal-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <div className='mt-4 flex gap-2'>
        <button
          type='submit'
          disabled={isSubmitting}
          className='rounded-xl bg-royal-600 px-5 py-2.5 text-[12.5px] font-bold text-white shadow-glow-royal transition-colors hover:bg-royal-700 disabled:opacity-60'
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
