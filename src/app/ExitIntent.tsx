'use client'

import { useEffect, useState } from 'react'
import { X, Sparkles, Mail, Loader2, ArrowRight, CheckCircle } from 'lucide-react'
import { ttqTrack, ttqIdentify } from '@/lib/ttq'
import { rdtTrack } from '@/lib/rdt'

/**
 * Non-blocking corner offer: $7.99 one-resume with email capture.
 * Trigger: exit-intent (cursor leaves toward browser bar) OR 20-second timer fallback.
 * Renders as bottom-right slide-in toast — NOT a fullscreen modal.
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
    function fire() {
      if (triggered) return
      triggered = true
      sessionStorage.setItem('exit_intent_shown', '1')
      setShow(true)
    }
    function handleMouseLeave(e: MouseEvent) {
      if (e.clientY > 50) return
      fire()
    }
    const mouseDelay = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave)
    }, 5000)
    // Fallback: if user hasn't moved cursor out after 20s, still show
    const fallbackDelay = setTimeout(fire, 20000)
    return () => {
      clearTimeout(mouseDelay)
      clearTimeout(fallbackDelay)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  function dismiss() {
    setShow(false)
  }

  async function claim(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setErr('')
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'exit_intent_7_99', promoCode: 'one-resume-7.99' }),
      })

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
    <div className="fixed bottom-5 right-5 z-[60] w-[360px] max-w-[calc(100vw-2.5rem)] animate-in slide-in-from-bottom-2 fade-in duration-300">
      <div className="relative bg-gradient-to-br from-stone-900 to-stone-950 border border-amber-500/40 rounded-2xl p-5 shadow-[0_25px_80px_-15px_rgba(245,158,11,0.4)]">
        <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="absolute top-3 right-3 text-stone-500 hover:text-stone-200 transition-colors p-1 rounded-md hover:bg-stone-800"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="inline-flex items-center gap-1.5 bg-amber-500 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider mb-3">
          <Sparkles className="w-3 h-3" /> 25% off
        </div>

        <h3 className="text-stone-100 font-bold text-base mb-1 leading-tight">
          Get your resume for <span className="text-amber-400">$7.99</span>
        </h3>
        <p className="text-stone-400 text-xs mb-3 leading-relaxed">
          One polished AI-rewritten PDF — <s>$9.99</s>. No subscription. 7-day money back.
        </p>

        <ul className="space-y-1 mb-3">
          {['AI rewrites every bullet', 'All 6 templates', 'Pay once, yours forever'].map(b => (
            <li key={b} className="flex items-center gap-1.5 text-[11px] text-stone-300">
              <CheckCircle className="w-3 h-3 text-amber-500 flex-shrink-0" /> {b}
            </li>
          ))}
        </ul>

        <form onSubmit={claim} className="space-y-2">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-amber-500/70 pointer-events-none" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              className="w-full h-10 pl-9 pr-3 bg-stone-950/80 border border-stone-700 rounded-lg text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500/50 text-xs transition-colors"
            />
          </div>
          {err && <p className="text-red-400 text-[11px]">{err}</p>}
          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            {loading ? 'Redirecting…' : 'Claim my $7.99 resume'}
            {!loading && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </form>

        <p className="text-stone-600 text-[10px] text-center mt-2">
          No spam · Unsubscribe anytime
        </p>
      </div>
    </div>
  )
}
