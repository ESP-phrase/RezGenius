'use client'

import { useState, useEffect, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Loader2, Mail, ArrowRight, CheckCircle, AlertCircle, Link as LinkIcon, Shield, Clock, Lock, User as UserIcon } from 'lucide-react'
import { Logo } from '@/components/Logo'
import Link from 'next/link'
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
    <div className="relative w-20 h-20 mx-auto mb-5">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-500/30 via-amber-600/20 to-transparent blur-xl" />
      <div className="relative w-full h-full rounded-full bg-gradient-to-br from-amber-500/20 to-amber-700/10 border border-amber-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.25)]">
        <Sparkle className="w-9 h-9 text-amber-400" />
      </div>
    </div>
  )
}

type Tab = 'signin' | 'signup'
type Mode = 'choose' | 'magic-sent' | 'password'

function SignInInner() {
  const [tab, setTab] = useState<Tab>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [mode, setMode] = useState<Mode>('choose')
  const [loading, setLoading] = useState<'magic' | 'password' | null>(null)
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
    setLoading('magic')
    setError('')
    try { await ttqIdentify({ email }) } catch {}
    try {
      ttqTrack('Lead', {
        contents: [{ content_id: 'magic_link_signin', content_type: 'product', content_name: 'Magic Link Sign-in Lead' }],
        currency: 'USD',
      })
    } catch {}
    const res = await fetch('/api/auth/magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setLoading(null)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(`Could not send email${data?.error ? ` (${data.error})` : ''}`)
    } else {
      setMode('magic-sent')
    }
  }

  async function handlePasswordSignIn(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return
    setLoading('password')
    setError('')
    const res = await signIn('credentials', { email, password, redirect: false })
    setLoading(null)
    if (!res || res.error) setError('Invalid email or password.')
    else window.location.href = '/dashboard'
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password || password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading('password')
    setError('')
    try {
      const reg = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name || undefined, email, password }),
      })
      if (!reg.ok) {
        const data = await reg.json().catch(() => ({}))
        setError(data.error || 'Could not create account.')
        setLoading(null)
        return
      }
      // Auto sign-in after successful registration
      const res = await signIn('credentials', { email, password, redirect: false })
      setLoading(null)
      if (!res || res.error) {
        setError('Account created but sign-in failed. Try logging in.')
        return
      }
      try { await ttqIdentify({ email }) } catch {}
      try { ttqTrack('CompleteRegistration', { contents: [{ content_id: 'password_signup', content_type: 'product', content_name: 'Password Sign-up' }], currency: 'USD' }) } catch {}
      window.location.href = '/dashboard'
    } catch {
      setError('Could not create account.')
      setLoading(null)
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
            <h1 className="text-3xl text-stone-100 mb-3" style={{ fontFamily: 'var(--font-serif)' }}>Check your inbox</h1>
            <p className="text-stone-400 text-sm mb-1">We sent a sign-in link to</p>
            <p className="text-amber-400 font-semibold mb-6">{email}</p>
            <p className="text-stone-600 text-xs leading-relaxed mb-8">
              Click the link in the email to sign in.<br />It expires in 15 minutes.
            </p>
            <button onClick={() => setMode('choose')} className="text-amber-500 hover:text-amber-400 text-sm transition-colors">
              Use a different email
            </button>
          </div>
        </div>
      </div>
    )
  }

  const isSignUp = tab === 'signup'

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col relative overflow-hidden">
      <RadialBg />

      <div className="px-6 py-5 relative z-10">
        <Logo size="md" />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-12 relative z-10">
        <div className="w-full max-w-md">
          <div className="bg-stone-900/60 backdrop-blur-xl border border-stone-800/80 rounded-3xl px-6 sm:px-8 py-8 shadow-[0_0_60px_-15px_rgba(245,158,11,0.15)]">
            <SparkleOrb />

            <div className="text-center mb-5">
              <h1 className="text-3xl text-stone-100 mb-1" style={{ fontFamily: 'var(--font-serif)' }}>
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </h1>
              <p className="text-stone-500 text-sm">
                {isSignUp ? 'Save your resumes and access them anywhere' : 'Sign in to your account to continue'}
              </p>
            </div>

            {/* Tabs */}
            <div className="grid grid-cols-2 bg-stone-950/60 border border-stone-800 rounded-xl p-1 mb-5">
              <button
                onClick={() => { setTab('signin'); setMode('choose'); setError('') }}
                className={`text-sm font-semibold py-2 rounded-lg transition-colors ${tab === 'signin' ? 'bg-stone-800 text-stone-100' : 'text-stone-500 hover:text-stone-300'}`}
              >
                Sign in
              </button>
              <button
                onClick={() => { setTab('signup'); setMode('choose'); setError('') }}
                className={`text-sm font-semibold py-2 rounded-lg transition-colors ${tab === 'signup' ? 'bg-stone-800 text-stone-100' : 'text-stone-500 hover:text-stone-300'}`}
              >
                Sign up
              </button>
            </div>

            {/* === SIGN IN VIEW === */}
            {tab === 'signin' && mode !== 'password' && (
              <>
                <form onSubmit={handleMagicLink} className="space-y-3">
                  <div>
                    <label className="block text-stone-400 text-xs font-medium mb-1.5">Enter your email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500/70 pointer-events-none" />
                      <input
                        type="email"
                        placeholder="you@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
                        className="w-full h-12 pl-10 pr-4 bg-stone-950/80 border border-stone-800 rounded-xl text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500/50 text-sm transition-all"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 bg-red-950/40 border border-red-900/60 text-red-400 text-xs rounded-xl px-3 py-2.5">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading !== null || !email}
                    className="w-full h-12 flex items-center justify-center gap-2 bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-bold text-sm rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_-5px_rgba(245,158,11,0.4)]"
                  >
                    {loading === 'magic' ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Send sign-in link <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>

                <button
                  type="button"
                  onClick={() => { setMode('password'); setError('') }}
                  className="w-full text-stone-500 hover:text-stone-300 text-xs py-2 mt-2 transition-colors"
                >
                  Use password instead
                </button>
              </>
            )}

            {/* === SIGN IN with password === */}
            {tab === 'signin' && mode === 'password' && (
              <form onSubmit={handlePasswordSignIn} className="space-y-3">
                <div>
                  <label className="block text-stone-400 text-xs font-medium mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500/70 pointer-events-none" />
                    <input
                      type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus
                      className="w-full h-11 pl-10 pr-4 bg-stone-950/80 border border-stone-800 rounded-xl text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500/50 text-sm transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-stone-400 text-xs font-medium mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500/70 pointer-events-none" />
                    <input
                      type="password" placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} required
                      className="w-full h-11 pl-10 pr-4 bg-stone-950/80 border border-stone-800 rounded-xl text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500/50 text-sm transition-all"
                    />
                  </div>
                </div>
                {error && (
                  <div className="flex items-start gap-2 bg-red-950/40 border border-red-900/60 text-red-400 text-xs rounded-xl px-3 py-2.5">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading !== null || !email || !password}
                  className="w-full h-12 flex items-center justify-center gap-2 bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-bold text-sm rounded-xl transition-all disabled:opacity-50"
                >
                  {loading === 'password' ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign in <ArrowRight className="w-4 h-4" /></>}
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('choose'); setError('') }}
                  className="w-full text-stone-500 hover:text-stone-300 text-xs py-2 transition-colors"
                >
                  Use magic link instead
                </button>
              </form>
            )}

            {/* === SIGN UP VIEW === */}
            {tab === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-3">
                <div>
                  <label className="block text-stone-400 text-xs font-medium mb-1.5">Name (optional)</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500/70 pointer-events-none" />
                    <input
                      type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} autoFocus
                      className="w-full h-11 pl-10 pr-4 bg-stone-950/80 border border-stone-800 rounded-xl text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500/50 text-sm transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-stone-400 text-xs font-medium mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500/70 pointer-events-none" />
                    <input
                      type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required
                      className="w-full h-11 pl-10 pr-4 bg-stone-950/80 border border-stone-800 rounded-xl text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500/50 text-sm transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-stone-400 text-xs font-medium mb-1.5">Password (8+ chars)</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500/70 pointer-events-none" />
                    <input
                      type="password" placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}
                      className="w-full h-11 pl-10 pr-4 bg-stone-950/80 border border-stone-800 rounded-xl text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500/50 text-sm transition-all"
                    />
                  </div>
                </div>
                {error && (
                  <div className="flex items-start gap-2 bg-red-950/40 border border-red-900/60 text-red-400 text-xs rounded-xl px-3 py-2.5">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading !== null || !email || !password || password.length < 8}
                  className="w-full h-12 flex items-center justify-center gap-2 bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-bold text-sm rounded-xl transition-all disabled:opacity-50"
                >
                  {loading === 'password' ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Create account <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            )}

            {/* Continue as guest */}
            <div className="mt-5 pt-5 border-t border-stone-800/60">
              <Link
                href="/builder"
                className="block text-center text-stone-500 hover:text-amber-400 text-sm font-medium py-2 transition-colors"
              >
                or continue as guest →
              </Link>
              <p className="text-stone-700 text-[10px] text-center mt-1">Build your resume without an account. Sign in later to save.</p>
            </div>

            {/* Trust signals — only on magic-link primary view */}
            {tab === 'signin' && mode === 'choose' && (
              <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-stone-800/60">
                <TrustItem icon={LinkIcon} text="No password needed" />
                <TrustItem icon={Shield} text="Secure magic link" />
                <TrustItem icon={Clock} text="15 min expiry" />
              </div>
            )}
          </div>

          <p className="text-center text-stone-700 text-xs mt-5">
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
    <div className="flex flex-col items-center text-center gap-1.5">
      <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
        <Icon className="w-3 h-3 text-amber-400" />
      </div>
      <span className="text-stone-500 text-[9px] leading-tight font-medium">{text}</span>
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
