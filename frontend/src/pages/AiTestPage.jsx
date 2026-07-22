import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, CheckCircle2, XCircle, Loader2, Activity } from 'lucide-react'
import { toast } from 'sonner'
import Container from '../components/ui/Container'
import { useAskAi, useAiHealth } from '../hooks/useAi'
import { askSchema } from '../lib/schemas'
import { api } from '../lib/axios'
import { EASE } from '../utils/motion'

const SAMPLES = [
  'Write a 20-word product description for olive-green running shoes.',
  'Suggest 3 gift ideas under ₹1500.',
  'What is 17 * 23?'
]

/** Green/red result card shared by the ask mutation and the health query. */
function ResultCard ({ ok, title, body, meta }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4, ease: EASE }}
      className={`mt-5 rounded-2xl border p-4 sm:p-5 ${
        ok ? 'border-olive-300 bg-olive-50' : 'border-rose-300 bg-rose-50'
      }`}
    >
      <div className='flex items-center gap-2'>
        {ok
          ? <CheckCircle2 className='h-5 w-5 shrink-0 text-olive-700' />
          : <XCircle className='h-5 w-5 shrink-0 text-rose-600' />}
        <span className={`text-sm font-bold ${ok ? 'text-olive-900' : 'text-rose-800'}`}>{title}</span>
        {meta && <span className='ml-auto font-mono text-[11px] text-royal-900/50'>{meta}</span>}
      </div>
      <pre className='mt-3 max-h-80 overflow-auto whitespace-pre-wrap wrap-break-word font-sans text-sm leading-relaxed text-royal-950'>
        {body}
      </pre>
    </motion.div>
  )
}

export default function AiTestPage () {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(askSchema),
    defaultValues: { message: SAMPLES[0] },
    mode: 'onSubmit'
  })

  const ask = useAskAi({
    onSuccess: () => toast.success('Gemini replied'),
    onError: error => toast.error(error.message)
  })

  const health = useAiHealth()

  const runHealthCheck = async () => {
    ask.reset()
    const { data, error } = await health.refetch()
    if (error) toast.error(error.message)
    else if (data?.ok) toast.success(`Key is live — ${data.model}`)
  }

  const busy = ask.isPending || health.isFetching

  // Whichever action ran most recently owns the result card.
  const showing = ask.isSuccess || ask.isError
    ? 'ask'
    : (health.isSuccess || health.isError) && !health.isFetching
      ? 'health'
      : null

  const usage = ask.data?.usage
  const askMeta = ask.data
    ? [ask.data.model, usage ? `${usage.totalTokenCount} tok` : null].filter(Boolean).join(' · ')
    : null

  return (
    <Container className='py-10 sm:py-14'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className='mx-auto max-w-2xl'
      >
        <p className='inline-flex items-center gap-2 rounded-full border border-royal-200 bg-royal-50 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-royal-700'>
          <Sparkles className='h-3.5 w-3.5' /> Gemini key test
        </p>
        <h1 className='mt-4 font-display text-3xl font-extrabold tracking-tight text-royal-950 sm:text-4xl'>
          Is the API key alive?
        </h1>
        <p className='mt-2 text-sm text-royal-900/60'>
          Calls your Express backend at{' '}
          <code className='rounded bg-royal-50 px-1.5 py-0.5 font-mono text-[12px] text-royal-700'>
            {api.defaults.baseURL}
          </code>
          , which forwards to Gemini. The key never reaches the browser.
        </p>

        <form
          onSubmit={handleSubmit(values => ask.mutate(values.message))}
          noValidate
          className='mt-7 rounded-2xl border border-royal-100 bg-white p-4 shadow-card sm:p-5'
        >
          <label htmlFor='ai-prompt' className='text-xs font-bold uppercase tracking-wider text-royal-900/50'>
            Prompt
          </label>
          <textarea
            id='ai-prompt'
            rows={3}
            {...register('message')}
            aria-invalid={!!errors.message}
            className='mt-2 w-full resize-y rounded-xl border border-royal-200 bg-royal-50/40 px-3.5 py-2.5 text-sm text-royal-950 outline-none transition placeholder:text-royal-900/35 focus:border-royal-400 focus:bg-white focus:ring-4 focus:ring-royal-500/10 aria-invalid:border-rose-400'
            placeholder='Ask Gemini something…'
          />
          {errors.message && (
            <p className='mt-1.5 text-[12px] font-semibold text-rose-500'>{errors.message.message}</p>
          )}

          <div className='mt-3 flex flex-wrap gap-1.5'>
            {SAMPLES.map(sample => (
              <button
                key={sample}
                type='button'
                onClick={() => setValue('message', sample, { shouldValidate: true })}
                className='rounded-full border border-olive-300 bg-olive-50 px-3 py-1 text-[11px] font-semibold text-olive-800 transition hover:bg-olive-100'
              >
                {sample.length > 34 ? `${sample.slice(0, 34)}…` : sample}
              </button>
            ))}
          </div>

          <div className='mt-4 flex flex-wrap gap-2.5'>
            <button
              type='submit'
              disabled={busy}
              className='inline-flex items-center gap-2 rounded-xl bg-royal-600 px-4 py-2.5 text-sm font-bold text-white shadow-glow-royal transition hover:bg-royal-700 disabled:cursor-not-allowed disabled:opacity-50'
            >
              {ask.isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : <Send className='h-4 w-4' />}
              Send to Gemini
            </button>
            <button
              type='button'
              onClick={runHealthCheck}
              disabled={busy}
              className='inline-flex items-center gap-2 rounded-xl border border-olive-600 px-4 py-2.5 text-sm font-bold text-olive-800 transition hover:bg-olive-50 disabled:opacity-50'
            >
              {health.isFetching ? <Loader2 className='h-4 w-4 animate-spin' /> : <Activity className='h-4 w-4' />}
              Quick health check
            </button>
          </div>
        </form>

        <AnimatePresence mode='wait'>
          {showing === 'ask' && (
            <ResultCard
              key='ask'
              ok={ask.isSuccess}
              title={ask.isSuccess ? 'Key works' : 'Request failed'}
              body={ask.isSuccess ? ask.data.reply : ask.error.message}
              meta={ask.isSuccess ? askMeta : `HTTP ${ask.error.status ?? 'network'}`}
            />
          )}
          {showing === 'health' && (
            <ResultCard
              key='health'
              ok={health.isSuccess}
              title={health.isSuccess ? 'Key is live' : 'Health check failed'}
              body={health.isSuccess ? `Model replied: ${health.data.reply}` : health.error.message}
              meta={health.isSuccess ? health.data.model : `HTTP ${health.error.status ?? 'network'}`}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </Container>
  )
}
