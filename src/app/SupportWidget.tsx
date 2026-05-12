'use client'

import { useState } from 'react'
import { MessageCircle, X, Send, Loader2, Check, Mail } from 'lucide-react'

/**
 * Floating bottom-right support widget. Sends user messages to
 * playingq123@gmail.com via the /api/support Resend endpoint.
 *
 * Positioned bottom-LEFT so it doesn't collide with discount popups
 * (those use bottom-right).
 */
export default function SupportWidget() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [err, setErr] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !message.trim()) return
    setLoading(true)
    setErr('')
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          message: message.trim(),
          page: typeof window !== 'undefined' ? window.location.pathname : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setSent(true)
      setTimeout(() => {
        setOpen(false)
        setSent(false)
        setEmail('')
        setMessage('')
      }, 2500)
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : 'Could not send. Try again.'
      setErr(m)
    }
    setLoading(false)
  }

  return (
    <>
      {/* Floating launcher */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Get help"
          className="fixed bottom-5 left-5 z-[55] w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-[0_8px_30px_-5px_rgba(245,158,11,0.6)] flex items-center justify-center transition-all hover:scale-105"
        >
          <MessageCircle className="w-5 h-5" />
        </button>
      )}

      {/* Open panel */}
      {open && (
        <div className="fixed bottom-5 left-5 z-[55] w-[340px] max-w-[calc(100vw-2.5rem)] animate-in slide-in-from-bottom-2 fade-in duration-200">
          <div className="bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                <span className="font-bold text-sm">Need help?</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="hover:bg-stone-950/10 rounded p-1 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4">
              {sent ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-3">
                    <Check className="w-6 h-6 text-green-400" />
                  </div>
                  <p className="text-stone-100 font-bold text-sm mb-1">Message sent!</p>
                  <p className="text-stone-500 text-xs">We&apos;ll reply within a few hours.</p>
                </div>
              ) : (
                <>
                  <p className="text-stone-400 text-xs leading-relaxed mb-4">
                    Drop us a message — we usually reply within a few hours.
                  </p>
                  <form onSubmit={submit} className="space-y-2.5">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-600 pointer-events-none" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="your@email.com"
                        className="w-full h-10 pl-9 pr-3 bg-stone-950 border border-stone-700 rounded-lg text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500/50 text-xs transition-colors"
                      />
                    </div>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      rows={4}
                      placeholder="How can we help?"
                      className="w-full px-3 py-2.5 bg-stone-950 border border-stone-700 rounded-lg text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-amber-500/50 text-xs leading-relaxed resize-none transition-colors"
                    />
                    {err && <p className="text-red-400 text-[11px]">{err}</p>}
                    <button
                      type="submit"
                      disabled={loading || !email.trim() || !message.trim()}
                      className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      {loading ? 'Sending…' : 'Send message'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
