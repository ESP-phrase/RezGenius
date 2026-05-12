'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { ShoppingCart, DollarSign, Users, FileText, RefreshCw, TrendingUp, Loader2, LogOut, Crown } from 'lucide-react'
import { Logo } from '@/components/Logo'

type Metrics = {
  atc: { last24h: number; last7d: number; last30d: number }
  purchases: { last24h: number; last7d: number; last30d: number }
  revenue: { last24h: number; last7d: number; last30d: number }
  activeSubscriptions: number
  totals: { users: number; resumes: number; leadsOnly: number }
  recentPurchases: { id: string; amount: number; currency: string; created: number; email: string | null; description: string | null }[]
  fetchedAt: number
}

export default function AdminDashboard({ adminEmail }: { adminEmail: string }) {
  const [data, setData] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  const load = useCallback(async () => {
    setErr('')
    try {
      const res = await fetch('/api/admin/metrics', { cache: 'no-store' })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || 'Failed')
      setData(d)
    } catch (e) {
      const m = e instanceof Error ? e.message : 'Could not load'
      setErr(m)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    const t = setInterval(load, 30_000) // auto-refresh every 30s
    return () => clearInterval(t)
  }, [load])

  const conv = data ? safeRate(data.purchases.last7d, data.atc.last7d) : 0

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-stone-950/95 backdrop-blur-md border-b border-stone-800/60 px-4 sm:px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="md" />
            <span className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              <Crown className="w-3 h-3" /> Admin
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/dashboard" className="text-stone-400 hover:text-stone-100 text-sm">Dashboard</Link>
            <button
              onClick={load}
              disabled={loading}
              className="inline-flex items-center gap-1.5 text-stone-400 hover:text-stone-100 text-sm transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              Refresh
            </button>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="inline-flex items-center gap-1.5 text-stone-500 hover:text-stone-200 text-sm transition-colors"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="flex items-baseline justify-between mb-1">
          <h1 className="text-2xl sm:text-3xl font-bold">Metrics</h1>
          <span className="text-stone-600 text-xs">{adminEmail}</span>
        </div>
        <p className="text-stone-500 text-sm mb-6 sm:mb-8">
          Live Stripe data · Auto-refreshes every 30s {data ? `· Last fetched ${new Date(data.fetchedAt).toLocaleTimeString()}` : ''}
        </p>

        {err && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-6">
            {err}
          </div>
        )}

        {!data && loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
          </div>
        )}

        {data && (
          <>
            {/* Headline stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <Stat icon={ShoppingCart} label="ATC (24h)" value={`${data.atc.last24h}`} sub={`${data.atc.last7d} this week`} />
              <Stat icon={TrendingUp} label="Purchases (24h)" value={`${data.purchases.last24h}`} sub={`${data.purchases.last7d} this week`} accent />
              <Stat icon={DollarSign} label="Revenue (24h)" value={`$${data.revenue.last24h.toFixed(2)}`} sub={`$${data.revenue.last7d.toFixed(2)} this week`} accent />
              <Stat icon={Users} label="Active subs" value={`${data.activeSubscriptions}`} sub={`${data.totals.users} total users`} />
            </div>

            {/* Funnel */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6 mb-6 sm:mb-8">
              <h2 className="font-bold text-base mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" /> Funnel (last 7 days)
              </h2>
              <div className="space-y-3">
                <FunnelRow label="Add to Cart" value={data.atc.last7d} max={Math.max(data.atc.last7d, 1)} />
                <FunnelRow label="Purchase" value={data.purchases.last7d} max={Math.max(data.atc.last7d, 1)} accent />
              </div>
              <div className="mt-4 pt-4 border-t border-stone-800 flex items-center justify-between text-sm">
                <span className="text-stone-500">ATC → Purchase rate</span>
                <span className="text-stone-100 font-bold">{conv.toFixed(1)}%</span>
              </div>
            </div>

            {/* Totals */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <SmallStat icon={Users} label="Total signups" value={data.totals.users} />
              <SmallStat icon={FileText} label="Resumes built" value={data.totals.resumes} />
              <SmallStat icon={Users} label="Email-only leads" value={data.totals.leadsOnly} />
            </div>

            {/* Recent purchases */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 sm:p-6">
              <h2 className="font-bold text-base mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-400" /> Recent purchases
              </h2>
              {data.recentPurchases.length === 0 ? (
                <p className="text-stone-500 text-sm py-6 text-center">No purchases yet.</p>
              ) : (
                <div className="divide-y divide-stone-800/60">
                  {data.recentPurchases.map(p => (
                    <div key={p.id} className="flex items-center justify-between py-3 gap-3">
                      <div className="min-w-0">
                        <div className="text-stone-100 font-medium text-sm truncate">{p.email ?? p.description ?? p.id}</div>
                        <div className="text-stone-600 text-xs">{new Date(p.created).toLocaleString()}</div>
                      </div>
                      <div className="text-amber-400 font-bold text-sm whitespace-nowrap">
                        ${p.amount.toFixed(2)} {p.currency !== 'USD' && p.currency}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function Stat({ icon: Icon, label, value, sub, accent }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 sm:p-5 ${accent ? 'bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/30' : 'bg-stone-900 border-stone-800'}`}>
      <div className="flex items-center gap-1.5 text-stone-500 text-[11px] uppercase tracking-wider mb-2">
        <Icon className={`w-3.5 h-3.5 ${accent ? 'text-amber-400' : 'text-stone-500'}`} />
        {label}
      </div>
      <div className={`text-2xl sm:text-3xl font-extrabold ${accent ? 'text-amber-300' : 'text-stone-100'}`}>{value}</div>
      <div className="text-stone-600 text-xs mt-1">{sub}</div>
    </div>
  )
}

function SmallStat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number }) {
  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl px-4 py-3">
      <div className="flex items-center gap-1.5 text-stone-500 text-[10px] uppercase tracking-wider mb-1">
        <Icon className="w-3 h-3" /> {label}
      </div>
      <div className="text-stone-100 font-bold text-lg">{value}</div>
    </div>
  )
}

function FunnelRow({ label, value, max, accent }: { label: string; value: number; max: number; accent?: boolean }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-stone-300">{label}</span>
        <span className={`font-bold ${accent ? 'text-amber-400' : 'text-stone-100'}`}>{value}</span>
      </div>
      <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${accent ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-stone-600'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function safeRate(n: number, d: number): number {
  if (!d) return 0
  return (n / d) * 100
}
