'use client'

import { useState, useEffect, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Loader2, Mail, ArrowRight, CheckCircle } from 'lucide-react'
import { Logo } from '@/components/Logo'

type Mode = 'choose' | 'magic-sent'

function SignInInner() {
  const [email, setEmail] = useState('')
  const [mode, setMode] = useState<Mode>('choose')
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
      <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-7 h-7 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-stone-100 mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
            Check your inbox
          </h1>
          <p className="text-stone-500 text-sm mb-1">We sent a sign-in link to</p>
          <p className="text-stone-200 font-semibold mb-5">{email}</p>
          <p className="text-stone-600 text-xs leading-relaxed">
            Click the link in the email to sign in.<br />It expires in 10 minutes.
          </p>
          <button
            onClick={() => setMode('choose')}
            className="mt-8 text-amber-500 hover:text-amber-400 text-sm transition-colors"
          >
            Use a different email
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col">
      <div className="px-6 py-5 border-b border-stone-800/60">
        <Logo size="md" />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-3xl text-stone-100 mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
              Sign in
            </h1>
            <p className="text-stone-500 text-sm">Enter your email and we'll send you a sign-in link — no password needed.</p>
          </div>

          <form onSubmit={handleMagicLink} className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-600 pointer-events-none" />
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="w-full h-12 pl-10 pr-4 bg-stone-900 border border-stone-700 rounded-xl text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500/60 text-sm transition-colors"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl px-4 py-2.5">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full h-12 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>Send sign-in link <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-stone-700 text-xs mt-8">
            By continuing, you agree to our{' '}
            <a href="/terms" className="text-stone-500 hover:text-stone-300 transition-colors">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" className="text-stone-500 hover:text-stone-300 transition-colors">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-950" />}>
      <SignInInner />
    </Suspense>
  )
}
