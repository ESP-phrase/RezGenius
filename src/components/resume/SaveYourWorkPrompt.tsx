'use client'

import { useEffect, useState } from 'react'
import { X, Mail, Loader2, Save, CheckCircle } from 'lucide-react'
import type { Resume } from '@/types/resume'
import { ttqTrack, ttqIdentify } from '@/lib/ttq'
import { rdtTrack } from '@/lib/rdt'
import posthog from 'posthog-js'

/**
 * Slide-down banner that appears when an anonymous user has invested
 * meaningful time in the builder (filled name + at least 1 experience).
 *
 * Loss-aversion play: "Save your progress so you don't lose it"
 * → Email goes to /api/leads, fires Lead events, banner disappears.
 *
 * Only shows for anonymous users (no resumeId from DB).
 */
interface Props {
  resume: Resume
  isAnonymous: boolean
}

export default function SaveYourWorkPrompt({ resume, isAnonymous }: Props) {
  const [show, setShow] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [err, setErr] = useState('')

  // Detect when user has invested meaningful time/content
  useEffect(() => {
    if (!isAnonymous) return
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem('save_prompt_dismissed') === '1') return
    if (sessionStorage.getItem('save_prompt_submitted') === '1') return

    const hasName = resume.personalInfo.name.trim().length > 1
    const hasExp = resume.experience.some(e => e.company.trim() || e.title.trim() || e.bullets.some(b => b.trim()))

    if (hasName && hasExp) {
      const t = setTimeout(() => setShow(true), 2000) // 2s delay so it doesn't feel jarring
      return () => clearTimeout(t)
    }
  }, [resume.personalInfo.name, resume.experience, isAnonymous])

  function dismiss() {
    setShow(false)
    sessionStorage.setItem('save_prompt_dismissed', '1')
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setErr('')
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'save_your_work_prompt' }),
      })
      if (!res.ok) throw new Error('save_failed')

      try { await ttqIdentify({ email: email.trim() }) } catch {}
      try {
        ttqTrack('Lead', {
          contents: [{ content_id: 'save_prompt', content_type: 'product', content_name: 'Builder Save Prompt' }],
          currency: 'USD',
        })
        ttqTrack('CompleteRegistration', {
          contents: [{ content_id: 'save_prompt', content_type: 'product', content_name: 'Builder Save Prompt' }],
          currency: 'USD',
        })
      } catch {}
      try { rdtTrack('SignUp') } catch {}
      try { posthog.capture?.('save_your_work_submitted', { email: email.trim() }) } catch {}

      sessionStorage.setItem('save_prompt_submitted', '1')
      setSaved(true)
      setTimeout(() => setShow(false), 2500)
    } catch {
      setErr('Could not save. Try again.')
    }
    setLoading(false)
  }

  if (!show) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[55] animate-in slide-in-from-top-2 duration-300 pointer-events-none px-3 sm:px-4 pt-3 sm:pt-4">
      <div className="max-w-2xl mx-auto pointer-events-auto">
        <div className="relative bg-gradient-to-br from-stone-900 to-stone-950 border border-amber-500/40 rounded-2xl shadow-[0_25px_80px_-15px_rgba(245,158,11,0.4)] p-4 sm:p-5">
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="absolute top-3 right-3 text-stone-500 hover:text-stone-200 transition-colors p-1 rounded-md hover:bg-stone-800"
          >
            <X className="w-4 h-4" />
          </button>

          {saved ? (
            <div className="flex items-center gap-3 py-1">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="text-stone-100 font-bold text-sm">Saved!</div>
                <div className="text-stone-500 text-xs">We&apos;ll email you a link to come back to this resume.</div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 sm:gap-4 pr-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                <Save className="w-5 h-5 text-amber-400" />
              </div>
              <form onSubmit={submit} className="flex-1 min-w-0">
                <div className="text-stone-100 font-bold text-xs sm:text-sm mb-0.5">Don&apos;t lose your work</div>
                <div className="text-stone-500 text-[11px] sm:text-xs mb-2">Drop your email and we&apos;ll send you a link to pick this up later.</div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-amber-500/70 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="your@email.com"
                      className="w-full h-9 pl-9 pr-3 bg-stone-950/80 border border-stone-700 rounded-lg text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500/50 text-xs transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !email.trim()}
                    className="inline-flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs h-9 px-4 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    {loading ? 'Saving…' : 'Save'}
                  </button>
                </div>
                {err && <p className="text-red-400 text-[10px] mt-1">{err}</p>}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
