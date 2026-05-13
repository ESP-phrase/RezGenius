'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import {
  Plus, Trash2, FileText, LogOut, ChevronDown,
  MoreHorizontal, Pencil, Download, Clock, Sparkles, X, ArrowRight, Loader2, Settings,
  Brain, Shield, LayoutTemplate, Lightbulb, Crown, LayoutGrid, List as ListIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'
import TemplateThumbnail from '@/components/resume/TemplateThumbnail'
import type { TemplateId } from '@/types/resume'
import { ttqIdentify, ttqTrack } from '@/lib/ttq'
import Clarity from '@microsoft/clarity'
import posthog from 'posthog-js'

type ResumeCard = {
  id: string
  title: string
  templateId: string
  updatedAt: string
  createdAt: string
}

type Props = {
  user: { id: string; name: string | null; email: string }
  initialResumes: ResumeCard[]
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function Initials({ name, email }: { name: string | null; email: string }) {
  const src = name ?? email
  const parts = src.split(/[\s@]/).filter(Boolean)
  const letters = parts.length >= 2 ? parts[0][0] + parts[1][0] : src.slice(0, 2)
  return <span className="text-sm font-bold text-stone-950 uppercase">{letters}</span>
}

function FeaturePill({ icon: Icon, title, sub }: { icon: React.ComponentType<{ className?: string }>; title: string; sub: string }) {
  return (
    <div className="flex items-start gap-2.5 bg-stone-950/40 border border-stone-800/60 rounded-xl px-3 py-2.5">
      <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-amber-400" />
      </div>
      <div className="min-w-0">
        <div className="text-stone-200 text-xs font-bold leading-tight">{title}</div>
        <div className="text-stone-500 text-[10px] leading-tight mt-0.5">{sub}</div>
      </div>
    </div>
  )
}

function CardMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function handle(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])
  return (
    <div ref={ref} className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o) }}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-500 hover:text-stone-100 hover:bg-stone-700 transition-all"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-8 z-50 w-40 bg-stone-800 border border-stone-700 rounded-xl shadow-xl overflow-hidden">
          <button onClick={() => { onEdit(); setOpen(false) }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-stone-200 hover:bg-stone-700 transition-colors">
            <Pencil className="w-3.5 h-3.5 text-stone-400" /> Edit Resume
          </button>
          <button onClick={() => { onDelete(); setOpen(false) }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      )}
    </div>
  )
}

function UserMenu({ user }: { user: Props['user'] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function handle(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2.5 pl-1 pr-2.5 py-1 rounded-xl hover:bg-stone-800 transition-all"
      >
        <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
          <Initials name={user.name} email={user.email} />
        </div>
        <div className="hidden sm:block text-left">
          <div className="text-stone-100 text-xs font-semibold leading-tight">{user.name ?? user.email.split('@')[0]}</div>
          <div className="text-stone-500 text-[10px] leading-tight truncate max-w-[140px]">{user.email}</div>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-stone-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-50 w-52 bg-stone-800 border border-stone-700 rounded-xl shadow-2xl overflow-hidden">
          <div className="px-3 py-3 border-b border-stone-700">
            <div className="text-stone-100 text-sm font-semibold">{user.name ?? 'My Account'}</div>
            <div className="text-stone-500 text-xs truncate">{user.email}</div>
          </div>
          <div className="py-1">
            <Link href="/dashboard/settings" className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-stone-200 hover:bg-stone-700 transition-colors">
              <Settings className="w-3.5 h-3.5 text-stone-400" /> Settings
            </Link>
            <Link href="/checkout" className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-stone-200 hover:bg-stone-700 transition-colors">
              <Download className="w-3.5 h-3.5 text-stone-400" /> Billing & Plans
            </Link>
          </div>
          <div className="border-t border-stone-700 py-1">
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DashboardShell({ user, initialResumes }: Props) {
  const router = useRouter()
  const [resumes, setResumes] = useState<ResumeCard[]>(initialResumes)
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState('')

  // Auto-open AI Generate modal when user picked "Describe yourself" on /start
  useEffect(() => {
    if (typeof window === 'undefined') return
    const startType = sessionStorage.getItem('resumeStartType')
    if (startType === 'prompt') {
      setShowPrompt(true)
      sessionStorage.removeItem('resumeStartType')
    }
  }, [])

  // Identify the user to TikTok pixel for higher EMQ scoring + fire CompleteRegistration
  // on first dashboard visit after sign-in. Also identify in Clarity for session filtering.
  useEffect(() => {
    if (!user.email) return
    ttqIdentify({ email: user.email, externalId: user.id })

    try {
      Clarity.identify(user.id, undefined, undefined, user.name ?? user.email)
      Clarity.setTag('plan', 'free')
    } catch {}

    try {
      posthog.identify(user.id, { email: user.email, name: user.name })
    } catch {}

    const firedKey = `tt_complete_reg_${user.id}`
    if (typeof window !== 'undefined' && !sessionStorage.getItem(firedKey)) {
      ttqTrack('CompleteRegistration', {
        contents: [{ content_id: 'user_signup', content_type: 'product', content_name: 'ResumeGenius Account' }],
        currency: 'USD',
      })
      sessionStorage.setItem(firedKey, '1')
    }
  }, [user.email, user.id, user.name])

  async function handleGenerate() {
    if (!prompt.trim()) return
    setGenerating(true)
    setGenError('')
    try {
      const res = await fetch('/api/resumes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      const data = await res.json()
      if (data.resume) {
        router.push(`/builder?id=${data.resume.id}`)
      } else {
        setGenError(data.error ?? 'Something went wrong. Try again.')
        setGenerating(false)
      }
    } catch {
      setGenError('Something went wrong. Try again.')
      setGenerating(false)
    }
  }

  async function handleNew() {
    setCreating(true)
    try {
      const res = await fetch('/api/resumes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'My Resume' }) })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      if (data.resume) router.push(`/builder?id=${data.resume.id}`)
      else setCreating(false)
    } catch {
      setCreating(false)
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/resumes/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      setResumes(rs => rs.filter(r => r.id !== id))
    } catch {
      // restore UI state on failure
    } finally {
      setDeletingId(null)
      setConfirmDelete(null)
    }
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = user.name?.split(' ')[0] ?? user.email.split('@')[0]

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-40 bg-stone-950/90 backdrop-blur-md border-b border-stone-800/60 px-3 sm:px-6 py-3 flex items-center justify-between gap-2">
        <Logo size="md" />
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/pricing" className="text-amber-400 hover:text-amber-300 text-xs sm:text-sm font-bold transition-colors whitespace-nowrap">
            Pricing
          </Link>
          {/* AI Generate — icon-only on mobile, full on desktop */}
          <button
            onClick={() => setShowPrompt(true)}
            aria-label="AI Generate"
            className="inline-flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 text-stone-100 font-semibold h-9 px-2.5 sm:px-4 rounded-lg border border-stone-700 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">AI Generate</span>
          </button>
          {/* New Resume — icon-only on mobile */}
          <button
            onClick={handleNew}
            disabled={creating}
            aria-label="New Resume"
            className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold h-9 px-2.5 sm:px-4 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{creating ? 'Creating…' : 'New Resume'}</span>
          </button>
          <UserMenu user={user} />
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 py-4 sm:py-5 max-w-6xl mx-auto w-full">
        {/* Welcome banner — compact */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-amber-950/40 via-stone-900 to-stone-950 border border-amber-500/20 mb-5">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.18),transparent_60%)] pointer-events-none" />

          <div className="relative grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 p-4 sm:p-5">
            <div>
              <p className="text-amber-400 text-xs font-semibold mb-0.5">{greeting},</p>
              <h1 className="text-2xl sm:text-3xl text-stone-100 capitalize mb-1 leading-tight font-bold tracking-tight">
                {firstName}
              </h1>
              <p className="text-stone-300 text-sm font-medium mb-0.5">Ready to land your next opportunity?</p>
              <p className="text-stone-500 text-xs mb-3">Create a standout resume in minutes with AI-powered suggestions.</p>

              <div className="hidden sm:grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                <FeaturePill icon={Brain} title="AI-Powered" sub="Smart suggestions" />
                <FeaturePill icon={Shield} title="ATS-Optimized" sub="Pass tracking" />
                <FeaturePill icon={LayoutTemplate} title="Pro Templates" sub="Designed to impress" />
                <FeaturePill icon={Lightbulb} title="Expert Tips" sub="Step by step" />
              </div>
              {/* Mobile: condensed inline list */}
              <div className="flex sm:hidden flex-wrap gap-1.5 mb-3 text-[10px]">
                <span className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-300 px-2 py-1 rounded-full"><Brain className="w-2.5 h-2.5" /> AI</span>
                <span className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-300 px-2 py-1 rounded-full"><Shield className="w-2.5 h-2.5" /> ATS</span>
                <span className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-300 px-2 py-1 rounded-full"><LayoutTemplate className="w-2.5 h-2.5" /> Templates</span>
                <span className="inline-flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-300 px-2 py-1 rounded-full"><Lightbulb className="w-2.5 h-2.5" /> Tips</span>
              </div>

              <Button
                onClick={handleNew}
                disabled={creating}
                className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold h-9 px-4 gap-1.5 text-sm shadow-[0_0_24px_-5px_rgba(245,158,11,0.5)]"
              >
                <Plus className="w-3.5 h-3.5" />
                {creating ? 'Creating…' : 'New Resume'}
              </Button>
            </div>

            {/* Right: Resume stack + ATS score — compact */}
            <div className="hidden md:flex items-center justify-center relative pr-6">
              <div className="relative w-[170px] h-[200px]">
                <div className="absolute top-2 left-3 w-[140px] h-[180px] bg-stone-200 rounded-md shadow-lg rotate-[-4deg] opacity-30" />
                <div className="absolute top-0 left-0 w-[140px] h-[180px] bg-stone-100 rounded-md shadow-xl" />
                <div className="absolute top-0 left-0 w-[140px] h-[180px] rounded-md overflow-hidden p-3 text-stone-700">
                  <div className="text-center mb-1.5 pb-1 border-b border-stone-300">
                    <div className="font-bold text-[8px] tracking-widest">ALEX JOHNSON</div>
                    <div className="text-[6px] text-stone-500 mt-0.5">Software Engineer</div>
                  </div>
                  <div className="space-y-1">
                    <div className="h-0.5 bg-stone-300 rounded-full w-3/4" />
                    <div className="h-0.5 bg-stone-300 rounded-full" />
                    <div className="h-0.5 bg-stone-300 rounded-full w-5/6" />
                    <div className="h-px bg-stone-300 my-1.5" />
                    <div className="h-0.5 bg-stone-300 rounded-full w-2/3" />
                    <div className="h-0.5 bg-stone-300 rounded-full" />
                    <div className="h-0.5 bg-stone-300 rounded-full w-4/5" />
                  </div>
                </div>
                {/* ATS Score gauge — smaller */}
                <div className="absolute -top-1 -right-4">
                  <div className="relative w-16 h-16">
                    <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
                      <circle cx="40" cy="40" r="34" fill="rgba(28,25,23,0.95)" stroke="rgba(55,55,55,0.5)" strokeWidth="4" />
                      <circle cx="40" cy="40" r="34" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round"
                        strokeDasharray={`${(98 / 100) * 2 * Math.PI * 34} ${2 * Math.PI * 34}`} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-stone-100 text-base font-bold leading-none">98</span>
                      <span className="text-stone-500 text-[7px] uppercase tracking-wider mt-0.5">ATS</span>
                      <span className="text-emerald-400 text-[7px] font-semibold">Excellent</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resume grid */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-3 gap-2">
            <div>
              <h2 className="text-stone-100 font-bold text-xl sm:text-2xl" style={{ fontFamily: 'var(--font-serif)' }}>My Resumes</h2>
              <p className="text-stone-500 text-xs mt-0.5">Manage and track your resumes all in one place.</p>
            </div>
            {resumes.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-stone-500 text-sm">{resumes.length} Total</span>
                <div className="inline-flex items-center gap-2 bg-stone-900 border border-stone-800 rounded-lg px-3 py-1.5 text-stone-400 text-xs">
                  Recently updated <ChevronDown className="w-3 h-3" />
                </div>
                <div className="inline-flex items-center bg-stone-900 border border-stone-800 rounded-lg overflow-hidden">
                  <button className="bg-amber-500/15 text-amber-400 p-1.5"><LayoutGrid className="w-3.5 h-3.5" /></button>
                  <button className="text-stone-600 hover:text-stone-300 p-1.5"><ListIcon className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            )}
          </div>

          {resumes.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center mb-5">
                <FileText className="w-9 h-9 text-stone-700" />
              </div>
              <h3 className="text-stone-100 font-bold text-lg mb-2">No resumes yet</h3>
              <p className="text-stone-500 text-sm max-w-xs leading-relaxed mb-7">
                Create your first AI-enhanced resume in under 5 minutes. Free to build, pay when you download.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => setShowPrompt(true)}
                  className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-7 h-11 gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate with AI
                </Button>
                <Button
                  onClick={handleNew}
                  disabled={creating}
                  variant="outline"
                  className="border-stone-700 text-stone-300 hover:bg-stone-800 h-11 gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {creating ? 'Creating…' : 'Start from scratch'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {resumes.map(resume => (
                <div
                  key={resume.id}
                  className="group bg-stone-900 border border-stone-800 hover:border-amber-500/40 rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer"
                  onClick={() => router.push(`/builder?id=${resume.id}`)}
                >
                  {/* Thumbnail */}
                  <div className="aspect-[3/4] bg-white overflow-hidden relative">
                    <div className="scale-[0.65] origin-top-left w-[154%] h-[154%]">
                      <TemplateThumbnail id={resume.templateId as TemplateId} />
                    </div>
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-stone-950/0 group-hover:bg-stone-950/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="bg-amber-500 text-stone-950 font-bold text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                        <Pencil className="w-3 h-3" /> Edit
                      </div>
                    </div>
                  </div>
                  {/* Footer */}
                  <div className="px-3.5 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-stone-100 text-sm font-semibold truncate">{resume.title}</div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-stone-600" />
                          <span className="text-stone-600 text-[11px]">{timeAgo(resume.updatedAt)}</span>
                        </div>
                      </div>
                      <CardMenu
                        onEdit={() => router.push(`/builder?id=${resume.id}`)}
                        onDelete={() => setConfirmDelete(resume.id)}
                      />
                    </div>
                    <div className="mt-2.5">
                      <span className="text-[10px] bg-stone-800 text-stone-400 px-2 py-0.5 rounded-md capitalize">{resume.templateId}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* New resume card */}
              <button
                onClick={handleNew}
                disabled={creating}
                className="group aspect-auto border-2 border-dashed border-stone-800 hover:border-amber-500/40 rounded-2xl flex flex-col items-center justify-center gap-3 py-14 transition-all duration-200 hover:bg-amber-500/5 disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-xl bg-stone-800 group-hover:bg-amber-500/10 border border-stone-700 group-hover:border-amber-500/30 flex items-center justify-center transition-all">
                  <Plus className="w-5 h-5 text-stone-500 group-hover:text-amber-400 transition-colors" />
                </div>
                <span className="text-stone-500 group-hover:text-stone-300 text-sm font-medium transition-colors">
                  {creating ? 'Creating…' : 'New Resume'}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Unlock Premium Features banner — compact but eye-catching */}
        <div className="relative mt-5 rounded-2xl overflow-hidden border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/15 via-stone-900 to-stone-900 shadow-[0_0_40px_-15px_rgba(245,158,11,0.4)]">
          <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(245,158,11,0.08),transparent)] bg-[length:200%_100%] animate-shimmer pointer-events-none" />

          <div className="relative p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-amber-400 blur-md opacity-60 animate-pulse" />
                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 flex items-center justify-center shadow-[0_0_24px_-3px_rgba(245,158,11,0.8)]">
                  <Crown className="w-5 h-5 text-stone-950" />
                </div>
              </div>
              <div>
                <div className="inline-flex items-center gap-1 bg-amber-500 text-stone-950 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider mb-0.5">
                  <Sparkles className="w-2.5 h-2.5" /> Limited time
                </div>
                <h3 className="text-stone-100 font-bold text-base">Unlock Premium Features</h3>
                <p className="text-stone-400 text-xs">Unlimited downloads · all templates · 7-day free trial</p>
              </div>
            </div>
            <Link href="/pricing" className="w-full md:w-auto">
              <button className="group w-full md:w-auto inline-flex items-center justify-center gap-1.5 bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-black text-sm h-10 px-5 rounded-xl transition-all shadow-[0_0_30px_-5px_rgba(245,158,11,0.7)] hover:shadow-[0_0_40px_-5px_rgba(245,158,11,0.9)] hover:scale-[1.03]">
                <Crown className="w-4 h-4" />
                Upgrade Now
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </Link>
          </div>
        </div>
      </main>

      {/* AI Generate modal */}
      {showPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm px-4">
          <div className="bg-stone-900 border border-stone-700 rounded-2xl p-5 sm:p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h3 className="text-stone-100 font-bold text-lg">Generate from prompt</h3>
                </div>
                <p className="text-stone-500 text-sm">Describe your background and AI will build your full resume in seconds.</p>
              </div>
              <button onClick={() => { setShowPrompt(false); setGenError('') }} className="text-stone-600 hover:text-stone-300 transition-colors ml-4">
                <X className="w-5 h-5" />
              </button>
            </div>

            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              disabled={generating}
              placeholder={`Examples:\n• "Software engineer, 5 years at Google and Meta, React/Python, Stanford CS degree"\n• "Marketing manager at Nike for 3 years, previously at an agency, expertise in paid social and brand campaigns"\n• Paste your LinkedIn bio, old resume text, or just describe yourself`}
              rows={7}
              className="w-full bg-stone-800 border border-stone-700 rounded-xl px-4 py-3 text-stone-100 placeholder:text-stone-600 text-sm focus:outline-none focus:border-amber-500/60 transition-colors resize-none"
            />

            {genError && (
              <div className="mt-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg px-4 py-2.5">
                {genError}
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => { setShowPrompt(false); setGenError('') }}
                disabled={generating}
                className="flex-1 border-stone-700 text-stone-300 hover:bg-stone-800 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={generating || !prompt.trim()}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold gap-2"
              >
                {generating ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Building resume…</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Generate Resume <ArrowRight className="w-4 h-4" /></>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm px-4">
          <div className="bg-stone-900 border border-stone-700 rounded-2xl p-5 sm:p-6 max-w-sm w-full shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="text-stone-100 font-bold text-lg mb-1">Delete resume?</h3>
            <p className="text-stone-500 text-sm mb-6">This can&apos;t be undone. The resume will be permanently removed.</p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setConfirmDelete(null)}
                className="flex-1 border-stone-700 text-stone-300 hover:bg-stone-800 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDelete(confirmDelete)}
                disabled={deletingId === confirmDelete}
                className="flex-1 bg-red-500 hover:bg-red-400 text-white font-bold"
              >
                {deletingId === confirmDelete ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
