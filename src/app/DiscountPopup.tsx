'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { X, Sparkles, Copy, Check, ArrowRight, Mail, Loader2 } from 'lucide-react'
import { ttqTrack, ttqIdentify } from '@/lib/ttq'
import { rdtTrack } from '@/lib/rdt'

const PROMO_CODE = 'SAVE25'

type Stage = 'email' | 'code'

export default function DiscountPopup() {
  const [open, setOpen] = useState(false)
  const [stage, setStage] = useState<Stage>('email')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem('discount_popup_dismissed')) return

    // If they already submitted email earlier this session, jump straight to code
    if (sessionStorage.getItem('discount_lead_captured')) {
      setStage('code')
    }

    // Show after 5s (was 12s — faster capture for TikTok users)
    const t = setTimeout(() => {
      setOpen(true)
      try {
        ttqTrack('ViewContent', {
          contents: [{ content_id: 'promo_save25', content_type: 'product', content_name: '25% off promo popup' }],
          currency: 'USD',
        })
      } catch {}
    }, 5000)
    return () => clearTimeout(t)
  }, [])

  function dismiss() {
    setOpen(false)
    sessionStorage.setItem('discount_popup_dismissed', '1')
  }

  async function submitEmail(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setErr('')
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'discount_popup', promoCode: PROMO_CODE }),
      })
      if (!res.ok) throw new Error('save_failed')

      // Pixel events with hashed PII for high EMQ
      try { await ttqIdentify({ email: email.trim() }) } catch {}
      try {
        ttqTrack('Lead', {
          contents: [{ content_id: 'discount_popup', content_type: 'product', content_name: 'Discount Popup Lead' }],
          currency: 'USD',
        })
        ttqTrack('CompleteRegistration', {
          contents: [{ content_id: 'discount_popup', content_type: 'product', content_name: 'Discount Popup Lead' }],
          currency: 'USD',
        })
      } catch {}
      try { rdtTrack('SignUp') } catch {}

      sessionStorage.setItem('discount_lead_captured', '1')
      setStage('code')
    } catch {
      setErr('Could not save email. Try again.')
    }
    setLoading(false)
  }

  function copyCode() {
    navigator.clipboard.writeText(PROMO_CODE)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!open) return null

  return (
    <div className="fixed bottom-20 sm:bottom-5 right-3 sm:right-5 z-[60] w-[340px] max-w-[calc(100vw-1.5rem)] animate-in slide-in-from-bottom-2 fade-in duration-300">
      <div className="relative bg-gradient-to-br from-stone-900 to-stone-950 border border-amber-500/40 rounded-2xl p-5 shadow-[0_25px_80px_-15px_rgba(245,158,11,0.4)]">
        <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="absolute top-3 right-3 text-stone-500 hover:text-stone-200 transition-colors p-1 rounded-md hover:bg-stone-800"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mb-3">
          <Sparkles className="w-5 h-5 text-amber-400" />
        </div>

        {stage === 'email' ? (
          <>
            <h3 className="text-stone-100 font-bold text-base mb-1 leading-tight">
              Get 25% off Pro &amp; Lifetime
            </h3>
            <p className="text-stone-400 text-xs mb-4 leading-relaxed">
              Drop your email and we&apos;ll send you the discount code instantly.
            </p>

            <form onSubmit={submitEmail} className="space-y-2.5">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-600 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  autoFocus
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
                {loading ? 'Saving…' : 'Get my 25% off code'}
              </button>
            </form>

            <p className="text-stone-600 text-[10px] text-center mt-3">
              No spam · Unsubscribe anytime
            </p>
          </>
        ) : (
          <>
            <h3 className="text-stone-100 font-bold text-base mb-1 leading-tight">
              Your 25% off code 🎉
            </h3>
            <p className="text-stone-400 text-xs mb-4 leading-relaxed">
              Use this code at Stripe checkout. Works on Pro &amp; Lifetime.
            </p>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 bg-stone-950/60 border border-amber-500/30 rounded-lg px-3 py-2.5 font-mono text-amber-400 font-bold tracking-widest text-sm text-center">
                {PROMO_CODE}
              </div>
              <button
                onClick={copyCode}
                className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg px-3 py-2.5 text-xs transition-colors inline-flex items-center gap-1.5 whitespace-nowrap"
              >
                {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
              </button>
            </div>

            <Link
              href="/pricing"
              onClick={dismiss}
              className="w-full inline-flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold py-2.5 rounded-lg transition-colors"
            >
              Apply at checkout <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
