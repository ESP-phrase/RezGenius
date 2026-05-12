import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import ResumeBuilder from '@/components/resume/ResumeBuilder'

// No auth check — anonymous users can build & preview a resume.
// Auth is only required at the "Save to account" or "Download PDF" steps.
export default function BuilderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
      </div>
    }>
      <ResumeBuilder />
    </Suspense>
  )
}
