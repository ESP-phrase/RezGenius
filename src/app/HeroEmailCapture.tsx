'use client'

import { useState } from 'react'
import { Mail, ArrowRight, Loader2, CheckCircle } from 'lucide-react'
import { ttqTrack, ttqIdentify } from '@/lib/ttq'
import { rdtTrack } from '@/lib/rdt'
import posthog from 'posthog-js'

/**
 * Inline above-the-fold email capture that replaces the dual-CTA buttons.
 *
 * Flow:
 *   1. User types email + clicks "Get my resume"
 *   2. We save the lead to DB + fire Lead + CompleteRegistration pixel events
 *   3. We redirect to /start so they can build their resume
 *
 * Captures interested users immediately without requiring them to engage
 * with a popup. Most-impactful lead-capture position on a landing page.
 */
export default function HeroEmailCapture() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setErr('')

    try {
      // Save lead — non-blocking, don't fail the redirect if it errors
      fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'hero_email_capture' }),
      }).catch(() => {})

      // Pixel events (high EMQ with hashed email)
      try { await ttqIdentify({ email: email.trim() }) } catch {}
      try {
        ttqTrack('Lead', {
          contents: [{ content_id: 'hero_email', content_type: 'product', content_name: 'Hero Email Capture' }],
          currency: 'USD',
        })
        ttqTrack('CompleteRegistration', {
          contents: [{ content_id: 'hero_email', content_type: 'product', content_name: 'Hero Email Capture' }],
          currency: 'USD',
        })
      } catch {}
      try { rdtTrack('SignUp') } catch {}
      try { posthog.capture('hero_email_submitted', { email: email.trim() }) } catch {}

      // Persist email for the builder to prefill
      try { sessionStorage.setItem('captured_email', email.trim()) } catch {}

      // Send straight to builder — no sign-in friction
      window.location.href = '/builder'
    } catch {
      setErr('Could not submit. Try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="w-full md:max-w-lg mb-6">
      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <div className="relative flex-1">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500 pointer-events-none" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email to start"
            className="w-full h-12 sm:h-14 pl-11 pr-4 bg-stone-900/80 border border-stone-700 rounded-xl text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/10 text-sm sm:text-base transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="h-12 sm:h-14 inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm sm:text-base px-6 sm:px-7 rounded-xl transition-colors shadow-[0_0_40px_-10px_rgba(245,158,11,0.6)] disabled:opacity-50 whitespace-nowrap"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {loading ? 'Starting…' : <>Get My Resume <ArrowRight className="w-4 h-4" /></>}
        </button>
      </div>
      {err && <p className="text-red-400 text-xs mb-2">{err}</p>}
      <div className="flex items-center justify-center md:justify-start gap-4 text-stone-500 text-xs">
        <span className="inline-flex items-center gap-1"><CheckCircle className="w-3 h-3 text-amber-500" /> Free to build</span>
        <span className="inline-flex items-center gap-1"><CheckCircle className="w-3 h-3 text-amber-500" /> No card required</span>
        <span className="inline-flex items-center gap-1"><CheckCircle className="w-3 h-3 text-amber-500" /> 5 min</span>
      </div>
    </form>
  )
}
