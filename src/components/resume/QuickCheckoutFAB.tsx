'use client'

import { useState } from 'react'
import { Download, X, Loader2, Sparkles, Crown } from 'lucide-react'
import Link from 'next/link'
import { ttqTrack } from '@/lib/ttq'
import { rdtTrack } from '@/lib/rdt'

/**
 * Sticky checkout FAB in the builder. Anchors a price + "Download" CTA
 * always visible. Tap → opens compact pricing sheet → tap any plan → Stripe.
 *
 * Mobile: bottom-center pill above the Preview button
 * Desktop: bottom-right
 */
export default function QuickCheckoutFAB() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)

  async function checkout(mode: 'one-resume' | 'subscription' | 'lifetime-trial' | 'payment', trial = false, value: number, label: string) {
    setLoading(label)
    try {
      const contents = [{ content_id: label, content_type: 'product' as const, content_name: label }]
      try {
        rdtTrack('AddToCart', { currency: 'USD', value, itemCount: 1 })
        ttqTrack('ClickButton', { contents, value, currency: 'USD' })
        ttqTrack('AddToCart', { contents, value, currency: 'USD' })
        ttqTrack('InitiateCheckout', { contents, value, currency: 'USD' })
      } catch {}
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, trial, resumeId: 'direct' }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert(data.error || 'Could not start checkout.')
    } catch {
      alert('Something went wrong. Try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <>
      {/* Floating CTA pill — always visible while building */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Get my resume"
          className="fixed bottom-5 left-1/2 -translate-x-1/2 lg:left-auto lg:right-5 lg:translate-x-0 z-40 inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm h-12 px-5 rounded-full shadow-[0_8px_30px_-5px_rgba(245,158,11,0.7)] transition-transform active:scale-95"
        >
          <Download className="w-4 h-4" />
          Get my resume — from $7.99
        </button>
      )}

      {/* Pricing sheet */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-950/80 backdrop-blur-sm">
          <div className="w-full sm:max-w-md bg-stone-900 border-t sm:border border-stone-700 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl animate-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-stone-100 font-bold text-lg flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-400" /> Choose your plan
                </h2>
                <p className="text-stone-500 text-xs mt-0.5">7-day money-back guarantee</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-stone-500 hover:text-stone-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {/* $7.99 one-time */}
              <button
                onClick={() => checkout('one-resume', false, 7.99, 'one_resume')}
                disabled={loading !== null}
                className="w-full bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-xl p-3 text-left transition-colors disabled:opacity-50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-stone-100 font-bold text-sm">One resume</div>
                    <div className="text-stone-500 text-xs">Single PDF, yours forever</div>
                  </div>
                  <div className="text-right">
                    <div className="text-stone-100 font-black text-base">$7.99</div>
                    {loading === 'one_resume' && <Loader2 className="w-3 h-3 animate-spin text-amber-400 ml-auto mt-0.5" />}
                  </div>
                </div>
              </button>

              {/* Pro trial — primary */}
              <button
                onClick={() => checkout('subscription', true, 0, 'pro_trial')}
                disabled={loading !== null}
                className="w-full bg-gradient-to-br from-amber-500/20 to-amber-600/10 hover:from-amber-500/30 hover:to-amber-600/20 border-2 border-amber-500/60 rounded-xl p-3 text-left transition-colors disabled:opacity-50 relative shadow-[0_0_30px_-8px_rgba(245,158,11,0.5)]"
              >
                <div className="absolute -top-2 left-3 bg-amber-500 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Most popular</div>
                <div className="flex items-center justify-between mt-1">
                  <div>
                    <div className="text-stone-100 font-bold text-sm flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Pro — 7 day free trial
                    </div>
                    <div className="text-stone-300 text-xs">Unlimited downloads · $29/mo after</div>
                  </div>
                  <div className="text-right">
                    <div className="text-amber-400 font-black text-base">$0</div>
                    <div className="text-stone-500 text-[10px]">today</div>
                    {loading === 'pro_trial' && <Loader2 className="w-3 h-3 animate-spin text-amber-400 ml-auto mt-0.5" />}
                  </div>
                </div>
              </button>

              {/* Lifetime */}
              <button
                onClick={() => checkout('payment', false, 149, 'lifetime')}
                disabled={loading !== null}
                className="w-full bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-xl p-3 text-left transition-colors disabled:opacity-50"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-stone-100 font-bold text-sm">Lifetime</div>
                    <div className="text-stone-500 text-xs">Pay once, use forever</div>
                  </div>
                  <div className="text-right">
                    <div className="text-stone-100 font-black text-base">$149</div>
                    {loading === 'lifetime' && <Loader2 className="w-3 h-3 animate-spin text-amber-400 ml-auto mt-0.5" />}
                  </div>
                </div>
              </button>
            </div>

            <Link
              href="/pricing"
              onClick={() => setOpen(false)}
              className="block text-center text-stone-500 hover:text-amber-400 text-xs mt-4 transition-colors"
            >
              Compare all plans →
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
