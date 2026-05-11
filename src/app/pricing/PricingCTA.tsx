'use client'

import { useState } from 'react'
import { ArrowRight, Loader2, Sparkles } from 'lucide-react'
import { rdtTrack } from '@/lib/rdt'
import { ttqTrack } from '@/lib/ttq'
import Link from 'next/link'

async function goToCheckout(opts: { mode: 'payment' | 'subscription'; value: number; trial?: boolean }) {
  const productId = opts.mode === 'subscription' ? (opts.trial ? 'pro_trial' : 'pro_monthly') : 'lifetime'
  const productName = opts.mode === 'subscription' ? (opts.trial ? 'ResumeGenius Pro ($1 Trial)' : 'ResumeGenius Pro Monthly') : 'ResumeGenius Lifetime'

  rdtTrack('AddToCart', { currency: 'USD', value: opts.value, itemCount: 1 })
  ttqTrack('AddToCart', {
    contents: [{ content_id: productId, content_type: 'product', content_name: productName }],
    value: opts.value,
    currency: 'USD',
  })
  ttqTrack('InitiateCheckout', {
    contents: [{ content_id: productId, content_type: 'product', content_name: productName }],
    value: opts.value,
    currency: 'USD',
  })
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
      className="w-full border border-stone-700 hover:border-stone-500 hover:bg-stone-800 text-stone-200 font-semibold text-sm py-3 rounded-xl transition-colors text-center block"
    >
      Get started free
    </Link>
  )
}

export function ProCTA() {
  const [loading, setLoading] = useState<'trial' | 'full' | null>(null)
  return (
    <div className="space-y-2">
      {/* Primary: $1 trial */}
      <button
        onClick={async () => { setLoading('trial'); await goToCheckout({ mode: 'subscription', value: 1, trial: true }) }}
        disabled={loading !== null}
        className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_0_30px_-8px_rgba(245,158,11,0.5)]"
      >
        {loading === 'trial' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        {loading === 'trial' ? 'Redirecting…' : 'Try $1 for 7 days'}
      </button>

      {/* Secondary: full price */}
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
  const [loading, setLoading] = useState(false)
  return (
    <button
      onClick={async () => { setLoading(true); await goToCheckout({ mode: 'payment', value: 149 }) }}
      disabled={loading}
      className="w-full border border-stone-700 hover:border-amber-500/50 hover:bg-stone-800 text-stone-100 font-semibold text-sm py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
      {loading ? 'Redirecting…' : 'Get Lifetime — $149'}
    </button>
  )
}

export function OneTimeCTA() {
  return <LifetimeCTA />
}
