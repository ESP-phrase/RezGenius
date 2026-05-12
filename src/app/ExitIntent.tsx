'use client'

import { useEffect, useState } from 'react'
import { X, Sparkles, Mail, Loader2, ArrowRight, Clock, CheckCircle } from 'lucide-react'
import { ttqTrack, ttqIdentify } from '@/lib/ttq'
import { rdtTrack } from '@/lib/rdt'

/**
 * Exit-intent popup with $7.99 one-resume offer + email capture.
 * Triggered when cursor leaves the viewport (going for back button / address bar).
 *
 * Captures email -> saves to leads DB -> immediately redirects to Stripe checkout.
 */
export default function ExitIntent() {
  const [show, setShow] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem('exit_intent_shown')) return

    let triggered = false
    function handleMouseLeave(e: MouseEvent) {
      if (triggered || e.clientY > 50) return
      triggered = true
      sessionStorage.setItem('exit_intent_shown', '1')
      setTimeout(() => setShow(true), 200)
    }
    const timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave)
    }, 5000)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  async function claim(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setErr('')
    try {
      // Save email lead
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'exit_intent_7_99', promoCode: 'one-resume-7.99' }),
      })

      // Pixel events
      try { await ttqIdentify({ email: email.trim() }) } catch {}
      try {
        ttqTrack('Lead', {
          contents: [{ content_id: 'exit_intent_lead', content_type: 'product', content_name: 'Exit Intent Lead' }],
          currency: 'USD',
        })
        ttqTrack('CompleteRegistration', {
          contents: [{ content_id: 'exit_intent_lead', content_type: 'product', content_name: 'Exit Intent Lead' }],
          currency: 'USD',
        })
      } catch {}
      try { rdtTrack('SignUp') } catch {}

      // Send straight to Stripe — $7.99 one-time
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'one-resume', resumeId: 'direct' }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
        return
      }
      setErr(data.error || 'Could not start checkout. Try again.')
    } catch {
      setErr('Something went wrong. Try again.')
    }
    setLoading(false)
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-stone-950/85 backdrop-blur-sm px-4 animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-amber-500/40 rounded-2xl p-7 max-w-md w-full shadow-[0_30px_90px_-15px_rgba(245,158,11,0.5)] relative animate-in zoom-in-95 duration-200">
        <button
          onClick={() => setShow(false)}
          aria-label="Dismiss"
          className="absolute top-4 right-4 text-stone-600 hover:text-stone-300 transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Discount badge */}
        <div className="inline-flex items-center gap-1.5 bg-amber-500 text-stone-950 text-[11px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider mb-4">
          <Sparkles className="w-3 h-3" /> Limited offer — 25% off
        </div>

        <h2 className="text-3xl text-stone-100 mb-2 leading-tight font-bold">
          Wait — your resume for{' '}
          <span style={{ background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>$7.99</span>
        </h2>
        <p className="text-stone-400 text-sm leading-relaxed mb-5">
          One polished, AI-rewritten resume — yours forever for less than a coffee.
          <span className="block mt-1 text-stone-500"><s>$9.99</s> · No subscription · 7-day money back.</span>
        </p>

        {/* Value bullets */}
        <ul className="space-y-1.5 mb-5">
          {[
            'Instant PDF — pay once, download forever',
            'AI rewrites every bullet into achievements',
            'All 6 professional templates included',
            'No subscription, no recurring charges',
          ].map(b => (
            <li key={b} className="flex items-center gap-2 text-sm text-stone-300">
              <CheckCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" /> {b}
            </li>
          ))}
        </ul>

        {/* Email capture + buy */}
        <form onSubmit={claim} className="space-y-2.5">
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500/70 pointer-events-none" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              placeholder="Enter your email to claim"
              className="w-full h-11 pl-10 pr-3 bg-stone-950/80 border border-stone-700 rounded-lg text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500/50 text-sm transition-colors"
            />
          </div>
          {err && <p className="text-red-400 text-xs">{err}</p>}
          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_0_30px_-5px_rgba(245,158,11,0.5)]"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? 'Redirecting…' : 'Claim my $7.99 resume'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="flex items-center justify-center gap-1.5 mt-4 text-stone-600 text-[10px]">
          <Clock className="w-3 h-3" /> This offer disappears when you close this window
        </div>

        <button
          onClick={() => setShow(false)}
          className="block w-full text-center text-stone-600 hover:text-stone-400 text-xs mt-3 transition-colors"
        >
          No thanks, I&apos;ll pay full price later
        </button>
      </div>
    </div>
  )
}
