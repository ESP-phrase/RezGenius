'use client'

import { useEffect, useState } from 'react'
import { Sparkles, X } from 'lucide-react'
import posthog from 'posthog-js'

/**
 * Idle re-engagement prompt.
 *
 * Clarity flagged: long sessions with repeated page hide/visible events
 * (user multitasking, never converts).
 *
 * Strategy: when user returns to the tab after 45+ seconds away, show
 * a gentle floating prompt that nudges them back into action without
 * being aggressive. One-time per session.
 */
export default function IdleReengage() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem('rg_idle_shown') === '1') return

    let hiddenAt: number | null = null

    function onVisibility() {
      if (document.hidden) {
        hiddenAt = Date.now()
      } else if (hiddenAt) {
        const awayMs = Date.now() - hiddenAt
        hiddenAt = null
        if (awayMs > 45_000 && !sessionStorage.getItem('rg_idle_shown')) {
          sessionStorage.setItem('rg_idle_shown', '1')
          setShow(true)
          try { posthog.capture?.('idle_reengage_shown', { away_ms: awayMs }) } catch {}
        }
      }
    }

    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  if (!show) return null

  return (
    <div
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm z-[60] animate-in slide-in-from-bottom-4 fade-in duration-500"
      role="status"
      aria-live="polite"
    >
      <div className="bg-stone-900 border border-amber-500/40 rounded-2xl p-4 shadow-[0_10px_50px_-10px_rgba(245,158,11,0.5)] flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-stone-100 font-semibold text-sm mb-1">Welcome back 👋</div>
          <div className="text-stone-400 text-xs leading-relaxed mb-2.5">
            Pick up where you left off — most resumes are done in under 5 minutes.
          </div>
          <a
            href="/builder"
            onClick={() => { try { posthog.capture?.('idle_reengage_clicked') } catch {} }}
            className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs px-3 py-1.5 rounded-lg transition-colors"
          >
            Continue building →
          </a>
        </div>
        <button
          type="button"
          onClick={() => setShow(false)}
          aria-label="Dismiss"
          className="text-stone-500 hover:text-stone-300 flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
