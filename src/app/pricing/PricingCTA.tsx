'use client'

import { useState } from 'react'
import { ArrowRight, Loader2, Sparkles } from 'lucide-react'
import { rdtTrack } from '@/lib/rdt'
import { ttqTrack } from '@/lib/ttq'
import posthog from 'posthog-js'
import Link from 'next/link'

async function goToCheckout(opts: { mode: 'payment' | 'subscription' | 'lifetime-trial' | 'one-resume'; value: number; trial?: boolean }) {
  let productId: string
  let productName: string
  if (opts.mode === 'one-resume') { productId = 'one_resume'; productName = 'ResumeGenius Single Resume' }
  else if (opts.mode === 'lifetime-trial') { productId = 'lifetime_trial'; productName = 'ResumeGenius Lifetime (7-day free trial)' }
  else if (opts.mode === 'subscription') { productId = opts.trial ? 'pro_trial' : 'pro_monthly'; productName = opts.trial ? 'ResumeGenius Pro (Free Trial)' : 'ResumeGenius Pro Monthly' }
  else { productId = 'lifetime'; productName = 'ResumeGenius Lifetime' }

  const contents = [{ content_id: productId, content_type: 'product' as const, content_name: productName }]
  // Reddit
  rdtTrack('AddToCart', { currency: 'USD', value: opts.value, itemCount: 1 })
  // TikTok — full conversion funnel
  ttqTrack('ClickButton', { contents, value: opts.value, currency: 'USD' })
  ttqTrack('AddToCart', { contents, value: opts.value, currency: 'USD' })
  ttqTrack('InitiateCheckout', { contents, value: opts.value, currency: 'USD' })
  ttqTrack('AddPaymentInfo', { contents, value: opts.value, currency: 'USD' })
  // PostHog — funnel + product analytics
  try {
    posthog.capture('pricing_cta_clicked', {
      product_id: productId,
      product_name: productName,
      value: opts.value,
      mode: opts.mode,
      trial: opts.trial ?? false,
    })
  } catch {}
  const res = await fetch('/api/stripe/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: opts.mode, resumeId: 'direct', trial: opts.trial ?? false }),
  })
  const data = await res.json()
  if (data.url) window.location.href = data.url
  else alert(data.error || 'Could not start checkout. Try again.')
}

export function FreeCTA() {
  return (
    <Link
      href="/start"
      onClick={() => {
        const contents = [{ content_id: 'free_signup', content_type: 'product' as const, content_name: 'ResumeGenius Free Signup' }]
        ttqTrack('ClickButton', { contents, currency: 'USD' })
        ttqTrack('CompleteRegistration', { contents, currency: 'USD' })
      }}
      className="w-full border border-stone-700 hover:border-stone-500 hover:bg-stone-800 text-stone-200 font-semibold text-sm py-3 rounded-xl transition-colors text-center block"
    >
      Get started free
    </Link>
  )
}

export function OneResumeCTA() {
  const [loading, setLoading] = useState(false)
  return (
    <button
      onClick={async () => { setLoading(true); await goToCheckout({ mode: 'one-resume', value: 7.99 }) }}
      disabled={loading}
      className="w-full bg-stone-800 hover:bg-stone-700 text-stone-100 font-semibold text-sm py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 border border-stone-700"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
      {loading ? 'Redirecting…' : 'Get one resume — $7.99'}
    </button>
  )
}

export function ProCTA() {
  const [loading, setLoading] = useState<'trial' | 'full' | null>(null)
  return (
    <div className="space-y-2">
      {/* Primary: free 7-day trial then $29 */}
      <button
        onClick={async () => { setLoading('trial'); await goToCheckout({ mode: 'subscription', value: 0, trial: true }) }}
        disabled={loading !== null}
        className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_0_30px_-8px_rgba(245,158,11,0.5)]"
      >
        {loading === 'trial' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        {loading === 'trial' ? 'Redirecting…' : 'Start 7-day free trial'}
      </button>

      <button
        onClick={async () => { setLoading('full'); await goToCheckout({ mode: 'subscription', value: 29 }) }}
        disabled={loading !== null}
        className="w-full text-stone-500 hover:text-stone-300 text-xs py-1 transition-colors disabled:opacity-50"
      >
        {loading === 'full' ? 'Redirecting…' : 'or skip the trial — $29/mo'}
      </button>
    </div>
  )
}

export function LifetimeCTA() {
  const [loading, setLoading] = useState<'trial' | 'instant' | null>(null)
  return (
    <div className="space-y-2">
      {/* Primary: free 7-day trial then $149 once */}
      <button
        onClick={async () => { setLoading('trial'); await goToCheckout({ mode: 'lifetime-trial', value: 0 }) }}
        disabled={loading !== null}
        className="w-full border-2 border-amber-500/60 hover:border-amber-500 hover:bg-amber-500/10 text-stone-100 font-semibold text-sm py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading === 'trial' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-400" />}
        {loading === 'trial' ? 'Redirecting…' : 'Try free for 7 days — then $149'}
      </button>

      <button
        onClick={async () => { setLoading('instant'); await goToCheckout({ mode: 'payment', value: 149 }) }}
        disabled={loading !== null}
        className="w-full text-stone-500 hover:text-stone-300 text-xs py-1 transition-colors disabled:opacity-50"
      >
        {loading === 'instant' ? 'Redirecting…' : 'or pay $149 today and skip the trial'}
      </button>
    </div>
  )
}

export function OneTimeCTA() {
  return <LifetimeCTA />
}
