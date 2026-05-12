'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2, Mail, ArrowRight, CheckCircle, AlertCircle, Link as LinkIcon, Shield, Clock } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { ttqIdentify, ttqTrack } from '@/lib/ttq'

function Sparkle({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M16 2 L19.5 12.5 L30 16 L19.5 19.5 L16 30 L12.5 19.5 L2 16 L12.5 12.5 Z" fill="currentColor" />
    </svg>
  )
}

function SparkleOrb() {
  return (
    <div className="relative w-24 h-24 mx-auto mb-6">
      {/* Outer glow ring */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-500/30 via-amber-600/20 to-transparent blur-xl" />
      {/* Inner orb */}
      <div className="relative w-full h-full rounded-full bg-gradient-to-br from-amber-500/20 to-amber-700/10 border border-amber-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.25)]">
        <Sparkle className="w-10 h-10 text-amber-400" />
      </div>
      {/* Sparkle accents */}
      <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-300 rounded-full animate-pulse" />
      <div className="absolute top-3 -right-4 w-1 h-1 bg-amber-200 rounded-full animate-pulse delay-150" />
      <div className="absolute -bottom-1 left-2 w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse delay-300" />
    </div>
  )
}

function SignInInner() {
  const [email, setEmail] = useState('')
  const [mode, setMode] = useState<'choose' | 'magic-sent'>('choose')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const searchParams = useSearchParams()

  useEffect(() => {
    const e = searchParams.get('error')
    if (e === 'expired') setError('This magic link has expired or already been used. Please request a new one.')
    if (e === 'invalid') setError('Invalid sign-in link. Please request a new one.')
  }, [searchParams])

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError('')
    // Identify user to TikTok pixel (boosts EMQ across all future events on this device)
    try {
      await ttqIdentify({ email })
      ttqTrack('Lead', {
        contents: [{ content_id: 'magic_link_signin', content_type: 'product', content_name: 'Sign-in Lead' }],
        currency: 'USD',
      })
    } catch {}
    const res = await fetch('/api/auth/magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      const detail = data?.error ? ` (${data.error})` : ''
      setError(`Could not send email${detail}`)
    } else {
      setMode('magic-sent')
    }
  }

  if (mode === 'magic-sent') {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col relative overflow-hidden">
        <RadialBg />
        <div className="px-6 py-5 relative z-10">
          <Logo size="md" />
        </div>
        <div className="flex-1 flex items-center justify-center px-4 relative z-10">
          <div className="w-full max-w-md text-center">
            <SparkleOrb />
            <h1 className="text-4xl text-stone-100 mb-3" style={{ fontFamily: 'var(--font-serif)' }}>Check your inbox</h1>
            <p className="text-stone-400 text-sm mb-1">We sent a sign-in link to</p>
            <p className="text-amber-400 font-semibold mb-6">{email}</p>
            <p className="text-stone-600 text-xs leading-relaxed mb-8">
              Click the link in the email to sign in.<br />It expires in 15 minutes.
            </p>
            <button
              onClick={() => setMode('choose')}
              className="text-amber-500 hover:text-amber-400 text-sm transition-colors"
            >
              Use a different email
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col relative overflow-hidden">
      <RadialBg />

      {/* Top logo */}
      <div className="px-6 py-5 relative z-10">
        <Logo size="md" />
      </div>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center px-4 pb-12 relative z-10">
        <div className="w-full max-w-md">
          <div className="bg-stone-900/60 backdrop-blur-xl border border-stone-800/80 rounded-3xl px-8 py-10 shadow-[0_0_60px_-15px_rgba(245,158,11,0.15)]">
            <SparkleOrb />

            <div className="text-center mb-8">
              <h1 className="text-4xl text-stone-100 mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
                Welcome back
              </h1>
              <p className="text-stone-500 text-sm">Sign in to your account to continue</p>
            </div>

            {/* Divider with star */}
            <div className="flex items-center gap-3 mb-7">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-stone-800" />
              <Sparkle className="w-3 h-3 text-amber-500/60" />
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-stone-800" />
            </div>

            <form onSubmit={handleMagicLink} className="space-y-4">
              <div>
                <label className="block text-stone-300 text-sm font-medium mb-2">Enter your email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500/70 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="you@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    className="w-full h-14 pl-12 pr-4 bg-stone-950/80 border border-stone-800 rounded-xl text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 text-sm transition-all"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-3 bg-red-950/40 border border-red-900/60 text-red-400 text-xs rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full h-14 flex items-center justify-center gap-2 bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-bold text-base rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_-5px_rgba(245,158,11,0.4)]"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>Send sign-in link <ArrowRight className="w-5 h-5" /></>
                )}
              </button>
            </form>

            {/* Trust signals */}
            <div className="grid grid-cols-3 gap-3 mt-8 pt-6 border-t border-stone-800/60">
              <TrustItem icon={LinkIcon} text="No password needed" />
              <TrustItem icon={Shield} text="Secure magic link" />
              <TrustItem icon={Clock} text="Link expires in 15 minutes" />
            </div>
          </div>

          <p className="text-center text-stone-600 text-xs mt-6">
            By continuing, you agree to our{' '}
            <a href="/terms" className="text-amber-500/80 hover:text-amber-400 transition-colors">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" className="text-amber-500/80 hover:text-amber-400 transition-colors">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  )
}

function TrustItem({ icon: Icon, text }: { icon: React.ComponentType<{ className?: string }>; text: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
        <Icon className="w-3.5 h-3.5 text-amber-400" />
      </div>
      <span className="text-stone-500 text-[10px] leading-tight font-medium">{text}</span>
    </div>
  )
}

function RadialBg() {
  return (
    <>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-amber-500/10 via-amber-900/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-[300px] h-[300px] bg-amber-700/5 rounded-full blur-3xl pointer-events-none" />
    </>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-950" />}>
      <SignInInner />
    </Suspense>
  )
}
