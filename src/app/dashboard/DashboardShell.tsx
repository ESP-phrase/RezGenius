'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import {
  Plus, Trash2, FileText, LogOut, ChevronDown,
  MoreHorizontal, Pencil, Download, Clock, User, Sparkles, X, ArrowRight, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/Logo'
import TemplateThumbnail from '@/components/resume/TemplateThumbnail'
import type { TemplateId } from '@/types/resume'
import { ttqIdentify, ttqTrack } from '@/lib/ttq'

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
  // on first dashboard visit after sign-in
  useEffect(() => {
    if (!user.email) return
    ttqIdentify({ email: user.email, externalId: user.id })

    const firedKey = `tt_complete_reg_${user.id}`
    if (typeof window !== 'undefined' && !sessionStorage.getItem(firedKey)) {
      ttqTrack('CompleteRegistration', {
        contents: [{ content_id: 'user_signup', content_type: 'product', content_name: 'ResumeGenius Account' }],
        currency: 'USD',
      })
      sessionStorage.setItem(firedKey, '1')
    }
  }, [user.email, user.id])

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
      <header className="sticky top-0 z-40 bg-stone-950/90 backdrop-blur-md border-b border-stone-800/60 px-6 py-3 flex items-center justify-between">
        <Logo size="md" />
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowPrompt(true)}
            className="hidden sm:flex bg-stone-800 hover:bg-stone-700 text-stone-100 font-semibold h-9 px-4 gap-1.5 border border-stone-700"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            AI Generate
          </Button>
          <Button
            onClick={handleNew}
            disabled={creating}
            className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold h-9 px-4 gap-1.5"
          >
            <Plus className="w-4 h-4" />
            {creating ? 'Creating…' : 'New Resume'}
          </Button>
          <UserMenu user={user} />
        </div>
      </header>

      <main className="flex-1 px-6 py-10 max-w-6xl mx-auto w-full">
        {/* Welcome banner */}
        <div className="relative rounded-2xl overflow-hidden bg-stone-900 border border-stone-800 px-8 py-7 mb-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.06),transparent_60%)]" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-stone-500 text-sm mb-1">{greeting}</p>
              <h1 className="text-2xl text-stone-100 capitalize" style={{ fontFamily: 'var(--font-serif)' }}>{firstName}</h1>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-stone-500 text-xs">
                  <FileText className="w-3.5 h-3.5" />
                  <span>{resumes.length} resume{resumes.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-stone-700" />
                <div className="flex items-center gap-1.5 text-stone-500 text-xs">
                  <User className="w-3.5 h-3.5" />
                  <span>Free plan</span>
                </div>
                <Link href="/checkout" className="text-amber-500 text-xs hover:text-amber-400 transition-colors font-medium">
                  Upgrade →
                </Link>
              </div>
            </div>
            <Button
              onClick={handleNew}
              disabled={creating}
              className="hidden sm:flex bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold h-10 px-5 gap-2"
            >
              <Plus className="w-4 h-4" />
              {creating ? 'Creating…' : 'New Resume'}
            </Button>
          </div>
        </div>

        {/* Resume grid */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-stone-100 font-bold text-lg">My Resumes</h2>
            {resumes.length > 0 && (
              <span className="text-stone-600 text-sm">{resumes.length} total</span>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
      </main>

      {/* AI Generate modal */}
      {showPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm px-4">
          <div className="bg-stone-900 border border-stone-700 rounded-2xl p-6 max-w-lg w-full shadow-2xl">
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
          <div className="bg-stone-900 border border-stone-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
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
