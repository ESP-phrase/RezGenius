'use client'

import { useRef, useState } from 'react'
import { Sparkles, Loader2, ArrowRight, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { ttqTrack } from '@/lib/ttq'
import { rdtTrack } from '@/lib/rdt'
import posthog from 'posthog-js'

/**
 * Hero AI demo — shows users the magic before asking for anything.
 *
 * Flow:
 * 1. Pre-filled weak bullet point
 * 2. User taps "Rewrite with AI" → API call to /api/resume/enhance
 * 3. After result shows → CTA to build full resume
 *
 * No email required. Pure "Show > Tell" conversion play.
 */
const SAMPLE_BULLETS = [
  'Managed a team and worked on improving the product',
  'Helped with marketing campaigns and social media',
  'Worked on customer support and improving satisfaction',
]

export default function HeroAIDemo() {
  const [bullet, setBullet] = useState(SAMPLE_BULLETS[0])
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasTriedDemo, setHasTriedDemo] = useState(false)
  const [error, setError] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  async function rewrite() {
    if (!bullet.trim() || loading) return
    setLoading(true)
    setResult('')
    setError('')
    try {
      posthog.capture?.('hero_ai_demo_clicked', { bullet_length: bullet.length })
      ttqTrack('ViewContent', {
        contents: [{ content_id: 'hero_ai_demo', content_type: 'product', content_name: 'Hero AI Demo' }],
        currency: 'USD',
      })
    } catch {}
    try {
      const res = await fetch('/api/resume/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bullet }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.enhanced) {
        setResult(data.enhanced)
        setHasTriedDemo(true)
        try {
          posthog.capture?.('hero_ai_demo_succeeded', {})
          ttqTrack('CompleteRegistration', {
            contents: [{ content_id: 'hero_ai_demo_success', content_type: 'product', content_name: 'Demo Success' }],
            currency: 'USD',
          })
          rdtTrack('Lead')
        } catch {}
      } else {
        setError(data?.error || 'Could not reach the AI right now — try again in a sec.')
        try { posthog.capture?.('hero_ai_demo_failed', { status: res.status }) } catch {}
      }
    } catch {
      setError('Network hiccup — check your connection and try again.')
      try { posthog.capture?.('hero_ai_demo_failed', { status: 'network' }) } catch {}
    }
    setLoading(false)
  }

  function focusTextarea() {
    textareaRef.current?.focus()
    textareaRef.current?.select()
  }

  function tryAnother() {
    const idx = SAMPLE_BULLETS.indexOf(bullet)
    setBullet(SAMPLE_BULLETS[(idx + 1) % SAMPLE_BULLETS.length])
    setResult('')
  }

  return (
    <div className="w-full md:max-w-lg mb-6">
      <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-4 sm:p-5 backdrop-blur-sm">
        <button
          type="button"
          onClick={focusTextarea}
          className="flex items-center gap-2 mb-3 cursor-pointer hover:opacity-80 transition-opacity"
          aria-label="Focus the bullet field to try the AI"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">Try the AI — Free</span>
        </button>

        {/* Quick sample picker */}
        {!result && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {SAMPLE_BULLETS.map((b, i) => (
              <button
                key={i}
                onClick={() => setBullet(b)}
                className={`text-[10px] sm:text-xs px-2 py-1 rounded-full transition-colors ${
                  bullet === b
                    ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                    : 'bg-stone-800/60 border border-stone-700 text-stone-400 hover:text-stone-200'
                }`}
              >
                Sample {i + 1}
              </button>
            ))}
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={bullet}
          onChange={(e) => { setBullet(e.target.value); setResult(''); setError('') }}
          rows={2}
          placeholder="Paste a weak resume bullet…"
          className="w-full bg-stone-950/60 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 placeholder:text-stone-600 text-xs sm:text-sm leading-relaxed focus:outline-none focus:border-amber-500/50 resize-none transition-colors"
          disabled={loading}
        />

        {/* Error state — fixes silent dead-click failure */}
        {error && (
          <div className="mt-2 flex items-start gap-1.5 text-[11px] text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-2.5 py-1.5">
            <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="mt-3 bg-amber-500/5 border border-amber-500/30 rounded-lg p-3 animate-in fade-in slide-in-from-bottom-1 duration-300">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-1.5">
              <Sparkles className="w-3 h-3" /> After AI rewrite
            </div>
            <p className="text-stone-100 text-xs sm:text-sm leading-relaxed font-medium">{result}</p>
          </div>
        )}

        {/* Action buttons */}
        {!result ? (
          <button
            onClick={rewrite}
            disabled={loading || !bullet.trim()}
            className="w-full mt-3 inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm h-11 sm:h-12 rounded-lg transition-colors disabled:opacity-50 shadow-[0_0_30px_-8px_rgba(245,158,11,0.5)]"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Rewriting…</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Rewrite with AI</>
            )}
          </button>
        ) : (
          <div className="flex gap-2 mt-3">
            <button
              onClick={tryAnother}
              className="flex-shrink-0 inline-flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold h-11 px-3 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Try another
            </button>
            <Link href="/builder" className="flex-1">
              <button className="w-full inline-flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm h-11 rounded-lg transition-colors shadow-[0_0_30px_-8px_rgba(245,158,11,0.6)]">
                Do this for my whole resume <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        )}

        {hasTriedDemo && !result && (
          <div className="mt-2 text-[10px] text-stone-500 text-center">
            ✨ You just saw it work — imagine your whole resume rewritten
          </div>
        )}
      </div>

      <div className="flex items-center justify-center md:justify-start gap-3 mt-3 text-stone-500 text-[10px] sm:text-xs">
        <span className="inline-flex items-center gap-1"><CheckCircle className="w-3 h-3 text-amber-500" /> Free to try</span>
        <span className="inline-flex items-center gap-1"><CheckCircle className="w-3 h-3 text-amber-500" /> No email needed</span>
        <span className="inline-flex items-center gap-1"><CheckCircle className="w-3 h-3 text-amber-500" /> 5 sec</span>
      </div>
    </div>
  )
}
