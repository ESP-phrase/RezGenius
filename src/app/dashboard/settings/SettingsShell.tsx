'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { ArrowLeft, CreditCard, LogOut, Trash2, User, Mail, Calendar, FileText, ExternalLink, Loader2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'

type Props = {
  user: { id: string; name: string | null; email: string; createdAt: string }
  resumeCount: number
}

export default function SettingsShell({ user, resumeCount }: Props) {
  const router = useRouter()
  const [openingPortal, setOpeningPortal] = useState(false)
  const [portalErr, setPortalErr] = useState('')
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function openBillingPortal() {
    setOpeningPortal(true)
    setPortalErr('')
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
        return
      }
      setPortalErr(data.error || 'Could not open billing portal.')
    } catch {
      setPortalErr('Could not open billing portal. Try again.')
    }
    setOpeningPortal(false)
  }

  async function deleteAccount() {
    setDeleting(true)
    try {
      const res = await fetch('/api/account/delete', { method: 'POST' })
      if (res.ok) {
        await signOut({ redirect: false })
        router.push('/')
      } else {
        const data = await res.json().catch(() => ({}))
        alert(data.error || 'Could not delete account.')
        setDeleting(false)
        setShowDelete(false)
      }
    } catch {
      alert('Could not delete account. Try again.')
      setDeleting(false)
      setShowDelete(false)
    }
  }

  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="min-h-screen bg-stone-950">
      {/* Nav */}
      <header className="sticky top-0 z-40 bg-stone-950/90 backdrop-blur-md border-b border-stone-800/60 px-4 sm:px-6 py-3 flex items-center justify-between">
        <Logo size="md" />
        <Link href="/dashboard" className="text-stone-400 hover:text-stone-100 text-sm transition-colors inline-flex items-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
        </Link>
      </header>

      <main className="px-4 sm:px-6 py-8 sm:py-12 max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl text-stone-100 mb-2" style={{ fontFamily: 'var(--font-serif)' }}>Settings</h1>
        <p className="text-stone-500 text-sm mb-8">Manage your account, subscription, and data.</p>

        {/* Account */}
        <Section title="Account" icon={User}>
          <div className="space-y-3">
            <Row label="Email" icon={Mail} value={user.email} />
            <Row label="Name" icon={User} value={user.name ?? 'Not set'} />
            <Row label="Member since" icon={Calendar} value={memberSince} />
            <Row label="Resumes saved" icon={FileText} value={`${resumeCount}`} />
          </div>
        </Section>

        {/* Billing */}
        <Section title="Billing & Subscription" icon={CreditCard}>
          <p className="text-stone-500 text-sm mb-4">
            Manage your subscription, update payment method, view invoices, or cancel anytime.
          </p>
          <Button
            onClick={openBillingPortal}
            disabled={openingPortal}
            className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold gap-2"
          >
            {openingPortal ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
            {openingPortal ? 'Opening…' : 'Open Billing Portal'}
          </Button>
          {portalErr && (
            <div className="mt-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg px-4 py-2.5">
              {portalErr}
            </div>
          )}
          <p className="text-stone-600 text-xs mt-3">
            Powered by Stripe. You&apos;ll be redirected to a secure billing page.
          </p>
        </Section>

        {/* Session */}
        <Section title="Session" icon={LogOut}>
          <p className="text-stone-500 text-sm mb-4">Sign out of all devices.</p>
          <Button
            onClick={() => signOut({ callbackUrl: '/' })}
            variant="outline"
            className="border-stone-700 text-stone-300 hover:bg-stone-800 hover:text-white gap-2"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </Section>

        {/* Danger zone */}
        <Section title="Danger Zone" icon={AlertTriangle} variant="danger">
          <p className="text-stone-500 text-sm mb-4">
            Permanently delete your account and all your resumes. This cannot be undone.
          </p>
          <Button
            onClick={() => setShowDelete(true)}
            variant="outline"
            className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 gap-2"
          >
            <Trash2 className="w-4 h-4" /> Delete Account
          </Button>
        </Section>
      </main>

      {/* Delete confirm modal */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm px-4">
          <div className="bg-stone-900 border border-red-500/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-red-400" />
            </div>
            <h3 className="text-stone-100 font-bold text-lg mb-1">Delete your account?</h3>
            <p className="text-stone-500 text-sm mb-6">
              This permanently deletes your account, all {resumeCount} saved resume{resumeCount === 1 ? '' : 's'}, and all your data. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDelete(false)}
                disabled={deleting}
                className="flex-1 border-stone-700 text-stone-300 hover:bg-stone-800 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={deleteAccount}
                disabled={deleting}
                className="flex-1 bg-red-500 hover:bg-red-400 text-white font-bold"
              >
                {deleting ? 'Deleting…' : 'Delete forever'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Section({
  title,
  icon: Icon,
  variant = 'default',
  children,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  variant?: 'default' | 'danger'
  children: React.ReactNode
}) {
  const danger = variant === 'danger'
  return (
    <section
      className={`mb-5 sm:mb-6 rounded-2xl border ${danger ? 'border-red-500/20 bg-red-500/[0.02]' : 'border-stone-800 bg-stone-900/40'} p-5 sm:p-6`}
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${danger ? 'bg-red-500/10 border border-red-500/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
          <Icon className={`w-4 h-4 ${danger ? 'text-red-400' : 'text-amber-400'}`} />
        </div>
        <h2 className={`font-bold text-base ${danger ? 'text-red-300' : 'text-stone-100'}`}>{title}</h2>
      </div>
      {children}
    </section>
  )
}

function Row({ label, icon: Icon, value }: { label: string; icon: React.ComponentType<{ className?: string }>; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-stone-800/50 last:border-0">
      <div className="flex items-center gap-2.5 text-stone-500 text-sm">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      <div className="text-stone-200 text-sm font-medium truncate ml-4">{value}</div>
    </div>
  )
}
