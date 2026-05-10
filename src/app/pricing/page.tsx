import Link from 'next/link'
import { CheckCircle, ArrowRight, ShieldCheck, Star } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { ProCTA, LifetimeCTA, FreeCTA } from './PricingCTA'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Free to build. Pro at $29/month. Lifetime at $149. All plans include a 100% money-back guarantee.',
}

const FREE = [
  'Build & preview your resume',
  'Pick from 6 templates',
  'Export to text/clipboard',
  'No credit card required',
]

const PRO = [
  'Unlimited PDF downloads',
  'Unlimited AI bullet rewrites',
  'AI Generate from prompt',
  'All 6 premium templates',
  'ATS-optimized formatting',
  'Priority support',
  'Cancel anytime',
]

const LIFETIME = [
  'Everything in Pro',
  'Pay once, use forever',
  'No recurring charges',
  'All future updates included',
  'Lifetime priority support',
]

const FAQ = [
  {
    q: 'Is it really free to build?',
    a: 'Yes. You can build, edit, and preview your entire resume at no cost. You only pay when you want to download the PDF.',
  },
  {
    q: 'What happens after I pay?',
    a: "You get instant access. Pro gives you unlimited downloads as long as you're subscribed. Lifetime gives you unlimited downloads forever, no recurring charge.",
  },
  {
    q: 'Can I cancel the subscription?',
    a: 'Anytime, instantly, from your account settings. No cancellation fees, no waiting period.',
  },
  {
    q: 'How does the money-back guarantee work?',
    a: 'If you are not happy within 7 days of purchase, email support@resumegenius.guru and we will refund you in full, no questions asked.',
  },
  {
    q: "What if I'm not happy with the AI output?",
    a: 'Every bullet is fully editable. The AI gives you a strong starting point — you have complete control over the final version.',
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-stone-950 flex flex-col">
      {/* Nav */}
      <nav className="px-4 sm:px-6 py-4 sm:py-5 border-b border-stone-800/60 flex items-center justify-between">
        <Logo size="md" />
        <div className="flex items-center gap-3 sm:gap-6">
          <Link href="/sign-in" className="text-stone-400 hover:text-stone-100 text-sm transition-colors">Sign in</Link>
          <Link href="/start" className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg transition-colors whitespace-nowrap">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="flex-1">
        {/* Header */}
        <section className="pt-12 sm:pt-20 pb-10 px-4 sm:px-6 text-center">
          {/* Trustpilot-style review row */}
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-stone-400 text-[11px] sm:text-xs mb-6">
            <span>Our customers say</span>
            <span className="font-bold text-stone-200">Excellent</span>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-green-500 flex items-center justify-center rounded-sm">
                  <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white fill-white" />
                </div>
              ))}
            </div>
            <span className="text-stone-300"><strong className="text-stone-200">4.9</strong>/5 from <strong className="text-stone-200">2,100+ reviews</strong></span>
          </div>

          <h1 className="text-3xl sm:text-5xl text-stone-100 mb-4 leading-tight" style={{ fontFamily: 'var(--font-serif)' }}>
            All Plans Include A <em style={{ fontStyle: 'italic', color: '#FBBF24' }}>100% Money-Back Guarantee</em>
          </h1>
          <p className="text-stone-400 text-base sm:text-lg max-w-xl mx-auto">
            Pays for itself with the time you'll save creating one resume.
          </p>
        </section>

        {/* Plans — 3 columns */}
        <section className="px-4 sm:px-6 pb-16">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Free */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-7 flex flex-col">
              <div className="mb-5">
                <div className="text-stone-300 font-bold text-base mb-1">No card required</div>
                <p className="text-stone-500 text-sm">Get a feel for how it works. No payment required.</p>
              </div>
              <div className="border-t border-stone-800 pt-6 mb-6 flex-1">
                <div className="text-5xl font-black text-stone-100 mb-1" style={{ fontFamily: 'var(--font-serif)' }}>Free</div>
                <ul className="space-y-2.5 mt-6">
                  {FREE.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-stone-400">
                      <CheckCircle className="w-4 h-4 text-stone-600 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
              <FreeCTA />
            </div>

            {/* Pro — featured */}
            <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-2 border-amber-500/60 rounded-2xl p-7 flex flex-col relative shadow-[0_0_60px_-15px_rgba(245,158,11,0.3)]">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-amber-500 text-stone-950 text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
                  Most popular
                </span>
              </div>

              <div className="mb-5">
                <div className="text-stone-100 font-bold text-base mb-1">$29 Monthly</div>
                <p className="text-stone-300 text-sm">Access to all features plus unlimited AI &amp; free monthly review.</p>
              </div>
              <div className="border-t border-amber-500/20 pt-6 mb-6 flex-1">
                <div className="flex items-baseline gap-2 mb-1">
                  <div className="text-5xl font-black text-stone-100" style={{ fontFamily: 'var(--font-serif)' }}>Pro</div>
                </div>
                <ul className="space-y-2.5 mt-6">
                  {PRO.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-stone-200">
                      <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
              <ProCTA />
              <div className="flex items-center justify-center gap-1.5 text-stone-400 text-xs mt-3">
                <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                100% money-back guarantee
              </div>
            </div>

            {/* Lifetime */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-7 flex flex-col">
              <div className="mb-5">
                <div className="text-stone-300 font-bold text-base mb-1">$149 One-Time</div>
                <p className="text-stone-500 text-sm">Access to all features with a one-time payment.</p>
              </div>
              <div className="border-t border-stone-800 pt-6 mb-6 flex-1">
                <div className="text-5xl font-black text-stone-100 mb-1" style={{ fontFamily: 'var(--font-serif)' }}>Lifetime</div>
                <ul className="space-y-2.5 mt-6">
                  {LIFETIME.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-stone-300">
                      <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
              <LifetimeCTA />
              <div className="flex items-center justify-center gap-1.5 text-stone-400 text-xs mt-3">
                <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                100% money-back guarantee
              </div>
            </div>
          </div>

          <p className="text-center text-stone-600 text-xs mt-10 max-w-2xl mx-auto">
            Pro and Lifetime are personal plans. Subject to our <Link href="/terms" className="text-stone-500 hover:text-stone-300 underline">Cancellation Policy</Link>.
          </p>
        </section>

        {/* Comparison table */}
        <section className="px-4 sm:px-6 pb-16 sm:pb-20 pt-10 border-t border-stone-800/60">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl text-stone-100 mb-8 sm:mb-10 text-center" style={{ fontFamily: 'var(--font-serif)' }}>Everything compared</h2>
            <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-x-auto">
              <div className="min-w-[600px]">
                <div className="grid grid-cols-4 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-stone-500 border-b border-stone-800">
                  <div className="px-3 sm:px-5 py-3 sm:py-4">Feature</div>
                  <div className="px-3 sm:px-5 py-3 sm:py-4 text-center border-l border-stone-800">Free</div>
                  <div className="px-3 sm:px-5 py-3 sm:py-4 text-center border-l border-stone-800 text-amber-400">Pro · $29/mo</div>
                  <div className="px-3 sm:px-5 py-3 sm:py-4 text-center border-l border-stone-800">Lifetime · $149</div>
                </div>
                {[
                  ['Build & preview resume', true, true, true],
                  ['AI bullet rewriter', '3 free', 'Unlimited', 'Unlimited'],
                  ['AI Generate from prompt', false, true, true],
                  ['All 6 templates', true, true, true],
                  ['ATS-optimized format', true, true, true],
                  ['PDF downloads', false, 'Unlimited', 'Unlimited'],
                  ['Priority support', false, true, true],
                  ['Pay once, no recurring', false, false, true],
                ].map(([feature, free, pro, lifetime]) => (
                  <div key={String(feature)} className="grid grid-cols-4 border-b border-stone-800/60 last:border-0">
                    <div className="px-3 sm:px-5 py-3 sm:py-4 text-stone-400 text-xs sm:text-sm">{feature}</div>
                    <Cell value={free} />
                    <Cell value={pro} highlight />
                    <Cell value={lifetime} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-4 sm:px-6 pb-16 sm:pb-20">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl text-stone-100 mb-8 sm:mb-10 text-center" style={{ fontFamily: 'var(--font-serif)' }}>Common questions</h2>
            <div className="space-y-5 sm:space-y-6">
              {FAQ.map(({ q, a }) => (
                <div key={q} className="border-b border-stone-800/60 pb-5 sm:pb-6">
                  <div className="text-stone-100 font-semibold mb-2 text-sm sm:text-base">{q}</div>
                  <div className="text-stone-500 text-sm leading-relaxed">{a}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 sm:px-6 pb-20 sm:pb-24 text-center">
          <h2 className="text-3xl sm:text-4xl text-stone-100 mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
            Start for free.<br />Pay when you&apos;re ready.
          </h2>
          <p className="text-stone-500 mb-6 sm:mb-8 text-sm">No credit card required to build.</p>
          <Link href="/start" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl transition-colors text-sm sm:text-base">
            Build My Resume for Free <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-800/60 px-4 sm:px-6 py-6 sm:py-8 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 text-stone-600 text-xs">
        <Logo size="sm" />
        <div className="flex gap-5 sm:gap-6">
          <Link href="/privacy" className="hover:text-stone-400 transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-stone-400 transition-colors">Terms</Link>
          <a href="mailto:support@resumegenius.guru" className="hover:text-stone-400 transition-colors">Contact</a>
        </div>
      </footer>
    </div>
  )
}

function Cell({ value, highlight }: { value: boolean | string; highlight?: boolean }) {
  if (value === true) {
    return (
      <div className="px-3 sm:px-5 py-3 sm:py-4 text-center border-l border-stone-800">
        <CheckCircle className={`w-4 h-4 mx-auto ${highlight ? 'text-amber-500' : 'text-stone-400'}`} />
      </div>
    )
  }
  if (value === false) {
    return (
      <div className="px-3 sm:px-5 py-3 sm:py-4 text-center border-l border-stone-800">
        <span className="text-stone-700 text-base">—</span>
      </div>
    )
  }
  return (
    <div className="px-5 py-4 text-center border-l border-stone-800">
      <span className={`text-sm font-medium ${highlight ? 'text-amber-400' : 'text-stone-300'}`}>{value}</span>
    </div>
  )
}
