'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Loader2, Download, XCircle } from 'lucide-react'
import { Logo } from '@/components/Logo'
import type { Resume } from '@/types/resume'
import { rdtTrack } from '@/lib/rdt'
import { ttqTrack } from '@/lib/ttq'
import posthog from 'posthog-js'

const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then((m) => m.PDFDownloadLink),
  { ssr: false }
)
const ResumeDocument = dynamic(() => import('@/components/pdf/ResumeDocument'), { ssr: false })

function DownloadInner() {
  const params = useSearchParams()
  const resumeId = params.get('resume_id')
  const sessionId = params.get('session_id')
  const [resume, setResume] = useState<Resume | null>(null)
  const [templateId, setTemplateId] = useState<string>('classic')
  const [templateConfig, setTemplateConfig] = useState<Record<string, string>>({})
  const [verified, setVerified] = useState<boolean | null>(null)
  const [ready, setReady] = useState(false)

  // Verify payment with Stripe before showing download
  useEffect(() => {
    if (!sessionId) { setVerified(false); return }
    fetch(`/api/stripe/verify-session?session_id=${encodeURIComponent(sessionId)}`)
      .then(r => r.json())
      .then(data => {
        setVerified(!!data.valid)
        if (data.valid) {
          try {
            posthog.capture('purchase_completed', {
              session_id: sessionId,
              currency: 'USD',
            })
          } catch {}
          rdtTrack('Purchase', { currency: 'USD', conversionId: sessionId })
          ttqTrack('Purchase', {
            contents: [{ content_id: 'resumegenius_pro', content_type: 'product', content_name: 'ResumeGenius' }],
            value: 0, // value unknown client-side; server CAPI uses real Stripe amount
            currency: 'USD',
            event_id: sessionId ?? undefined,
          })
          ttqTrack('PlaceAnOrder', {
            contents: [{ content_id: 'resumegenius_pro', content_type: 'product', content_name: 'ResumeGenius' }],
            currency: 'USD',
            event_id: sessionId ?? undefined,
          })
        }
      })
      .catch(() => setVerified(false))
  }, [sessionId])

  // Load resume data from localStorage (only after payment verified)
  useEffect(() => {
    if (!resumeId || verified !== true) return
    const saved = localStorage.getItem(`resume_${resumeId}`)
    if (saved) {
      const parsed = JSON.parse(saved)
      const { templateId: tid, templateConfig: tcfg, ...resumeData } = parsed
      setResume(resumeData)
      if (tid) setTemplateId(tid)
      if (tcfg) setTemplateConfig(tcfg)
      setReady(true)
    }
  }, [resumeId, verified])

  // Checking payment
  if (verified === null) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
      </div>
    )
  }

  // Payment invalid
  if (verified === false) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4">
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-8 max-w-sm w-full text-center space-y-4">
          <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center mx-auto">
            <XCircle className="w-6 h-6 text-red-400" />
          </div>
          <h1 className="text-xl text-stone-100" style={{ fontFamily: 'var(--font-serif)' }}>Payment not found</h1>
          <p className="text-stone-500 text-sm">This download link is invalid or has expired. Please complete checkout to download your resume.</p>
          <Button className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold" onClick={() => (window.location.href = '/builder')}>
            Back to Builder
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col">
      <div className="px-6 py-5 border-b border-stone-800/60">
        <Logo size="md" />
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-8 max-w-sm w-full text-center space-y-4">
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center mx-auto">
            <Download className="w-6 h-6 text-amber-400" />
          </div>
          <h1 className="text-xl text-stone-100" style={{ fontFamily: 'var(--font-serif)' }}>Payment confirmed!</h1>
          <p className="text-stone-500 text-sm">Your AI-enhanced resume is ready to download.</p>

          {!ready && (
            <div className="flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
            </div>
          )}

          {ready && resume && (
            <PDFDownloadLink
              document={<ResumeDocument resume={resume} templateId={templateId as import('@/types/resume').TemplateId} config={templateConfig as Partial<import('@/types/resume').TemplateConfig>} />}
              fileName={`${resume.personalInfo.name?.replace(/\s+/g, '_') || 'resume'}_resume.pdf`}
            >
              {({ loading }) => (
                <Button className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {loading ? 'Preparing PDF...' : 'Download PDF'}
                </Button>
              )}
            </PDFDownloadLink>
          )}

          <Button variant="ghost" size="sm" className="text-stone-500 hover:text-stone-300" onClick={() => (window.location.href = '/builder')}>
            Build another resume
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function DownloadPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-stone-950" />}>
      <DownloadInner />
    </Suspense>
  )
}
