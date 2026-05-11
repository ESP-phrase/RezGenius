'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Lock, Zap, ArrowLeft, Loader2, ShieldCheck, RefreshCw } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { rdtTrack } from '@/lib/rdt'
import { ttqTrack } from '@/lib/ttq'

const PLANS = [
  {
    id: 'one-time' as const,
    label: 'One-Time Download',
    price: '$149',
    originalPrice: '',
    badge: 'Lifetime',
    sub: 'one time · lifetime access',
    features: ['Unlimited PDF downloads', 'All AI bullet rewrites', 'All templates', 'ATS-optimized format', 'Lifetime access — pay once'],
    cta: 'Get Lifetime Access — $149',
  },
  {
    id: 'subscription' as const,
    label: 'Monthly Pro',
    price: '$29',
    originalPrice: '',
    badge: 'Most popular',
    sub: 'per month',
    features: ['Unlimited PDF downloads', 'Unlimited AI enhancements', 'All 6 templates', 'Priority support', 'ATS score checker (soon)', 'Cancel anytime'],
    cta: 'Start Pro · $29/mo',
  },
]

function CheckoutInner() {
  const params = useSearchParams()
  const resumeId = params.get('resumeId') ?? undefined
  const [selected, setSelected] = useState<'one-time' | 'subscription'>('subscription')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Fire ViewContent on checkout page load (mid-funnel signal for TikTok)
  useEffect(() => {
    ttqTrack('ViewContent', {
      contents: [
        { content_id: 'pro_monthly', content_type: 'product', content_name: 'ResumeGenius Pro Monthly' },
        { content_id: 'lifetime', content_type: 'product', content_name: 'ResumeGenius Lifetime' },
      ],
      currency: 'USD',
    })
  }, [])

  async function handlePay() {
    setLoading(true)
    setError('')
    const value = selected === 'subscription' ? 29 : 149
    const productId = selected === 'subscription' ? 'pro_monthly' : 'lifetime'
    const productName = selected === 'subscription' ? 'ResumeGenius Pro Monthly' : 'ResumeGenius Lifetime'
    rdtTrack('AddToCart', { currency: 'USD', value, itemCount: 1 })
    ttqTrack('AddToCart', {
      contents: [{ content_id: productId, content_type: 'product', content_name: productName }],
      value,
      currency: 'USD',
    })
    ttqTrack('InitiateCheckout', {
      contents: [{ content_id: productId, content_type: 'product', content_name: productName }],
      value,
      currency: 'USD',
    })
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: selected === 'subscription' ? 'subscription' : 'payment',
          resumeId: resumeId ?? 'direct',
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError('Could not start checkout. Please try again.')
        setLoading(false)
      }
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col">
      {/* Nav */}
      <nav className="px-6 py-5 flex items-center justify-between border-b border-stone-800/60">
        <Logo size="md" />
        <div className="flex items-center gap-1.5 text-stone-500 text-xs">
          <Lock className="w-3 h-3" />
          Secured by Stripe
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

          {/* Left — what you get */}
          <div className="space-y-8">
            <div>
              {resumeId ? (
                <Link href={`/builder?id=${resumeId}`} className="inline-flex items-center gap-1.5 text-stone-500 hover:text-stone-300 text-sm transition-colors mb-6">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to resume
                </Link>
              ) : (
                <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-stone-500 hover:text-stone-300 text-sm transition-colors mb-6">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to dashboard
                </Link>
              )}
              <h1 className="text-3xl text-stone-100 mb-3" style={{ fontFamily: 'var(--font-serif)' }}>
                Unlock your resume
              </h1>
              <p className="text-stone-500 text-sm leading-relaxed">
                Your resume is built and ready. Choose a plan to download your polished PDF.
              </p>
            </div>

            {/* Trust signals */}
            <div className="space-y-3">
              {[
                { icon: ShieldCheck, text: 'Payments processed securely by Stripe' },
                { icon: RefreshCw, text: 'Cancel your subscription anytime, instantly' },
                { icon: CheckCircle, text: 'Instant PDF download after payment' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-stone-400 text-sm">
                  <Icon className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  {text}
                </div>
              ))}
            </div>

            {/* Testimonial */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
              <p className="text-stone-400 text-sm leading-relaxed italic mb-3">
                &ldquo;Got three interview requests the week I updated my resume with ResumeGenius. Worth every penny.&rdquo;
              </p>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xs font-bold">M</div>
                <div>
                  <div className="text-stone-300 text-xs font-semibold">Marcus T.</div>
                  <div className="text-stone-600 text-xs">Product Manager</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right — plan selector + pay */}
          <div className="space-y-4">
            {PLANS.map((plan) => {
              const active = selected === plan.id
              return (
                <button
                  key={plan.id}
                  onClick={() => setSelected(plan.id)}
                  className={`w-full text-left rounded-2xl border-2 p-5 transition-all duration-150 relative ${
                    active
                      ? 'border-amber-500/60 bg-amber-500/5'
                      : 'border-stone-700 bg-stone-900 hover:border-stone-600'
                  }`}
                >
                  {plan.badge && (
                    <span className="absolute top-4 right-4 bg-amber-500 text-stone-950 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                      {plan.badge}
                    </span>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      active ? 'border-amber-500 bg-amber-500' : 'border-stone-600'
                    }`}>
                      {active && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-stone-100">{plan.label}</div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-baseline gap-1.5 justify-end">
                        <span className="text-stone-500 text-xs line-through">{plan.originalPrice}</span>
                        <span className="text-xl font-black text-stone-100">{plan.price}</span>
                      </div>
                      <span className="text-stone-500 text-xs">{plan.sub}</span>
                    </div>
                  </div>
                  <ul className="space-y-1.5 ml-7">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-stone-400">
                        <CheckCircle className={`w-3.5 h-3.5 flex-shrink-0 ${active ? 'text-amber-500' : 'text-stone-600'}`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </button>
              )
            })}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button
              onClick={handlePay}
              disabled={loading}
              className="w-full h-13 py-4 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-base rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  {PLANS.find(p => p.id === selected)?.cta}
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-stone-600 text-xs">
              <Lock className="w-3 h-3" />
              256-bit SSL encryption · Powered by Stripe
            </div>

            <div className="flex items-center justify-center gap-2 bg-stone-800/60 border border-stone-700 rounded-xl px-4 py-3">
              <span className="text-green-400 text-base">ðŸ›¡</span>
              <div className="text-center">
                <span className="text-stone-200 text-xs font-semibold">100% Money-Back Guarantee</span>
                <p className="text-stone-500 text-[11px] mt-0.5">Not satisfied? Email us within 7 days for a full refund.</p>
              </div>
            </div>

            {selected === 'subscription' && (
              <p className="text-center text-stone-600 text-xs">
                Cancel anytime from your account settings. No questions asked.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-950" />}>
      <CheckoutInner />
    </Suspense>
  )
}
