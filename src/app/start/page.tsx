'use client'

import { useRouter } from 'next/navigation'
import { Upload, PenLine, Sparkles, ArrowRight } from 'lucide-react'
import { Logo } from '@/components/Logo'

export default function StartPage() {
  const router = useRouter()

  function choose(type: 'prompt' | 'upload' | 'scratch') {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('resumeStartType', type)
    }
    // Skip sign-in for anonymous users — they can build straight away.
    // Auth happens only when they hit Download PDF (gated by Stripe checkout).
    router.push('/builder')
  }

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col">
      <nav className="px-6 py-5 border-b border-stone-800/60">
        <Logo size="md" />
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <h1 className="text-4xl text-stone-100 mb-3 text-center" style={{ fontFamily: 'var(--font-serif)' }}>
          How would you like to start?
        </h1>
        <p className="text-stone-500 text-sm mb-12 text-center max-w-md">
          Pick the path that's easiest for you. Everything's editable later.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-5xl">
          {/* PROMPT — recommended */}
          <button
            onClick={() => choose('prompt')}
            className="group bg-gradient-to-b from-amber-500/10 to-amber-500/5 border-2 border-amber-500/40 hover:border-amber-500/70 rounded-2xl p-8 text-left transition-all duration-200 relative overflow-hidden"
          >
            <span className="absolute top-3 right-3 bg-amber-500 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
              Fastest
            </span>
            <div className="w-14 h-14 bg-amber-500/20 border border-amber-500/40 rounded-2xl flex items-center justify-center mb-5">
              <Sparkles className="w-6 h-6 text-amber-400" />
            </div>
            <div className="font-bold text-stone-100 text-lg mb-2">Describe yourself</div>
            <div className="text-stone-400 text-sm leading-relaxed mb-5">
              Tell the AI about your background in a sentence or paragraph. It builds your full resume instantly.
            </div>
            <div className="inline-flex items-center gap-1.5 text-amber-400 text-sm font-medium">
              Generate with AI <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </button>

          {/* UPLOAD */}
          <button
            onClick={() => choose('upload')}
            className="group bg-stone-900 border border-stone-700 hover:border-amber-500/40 rounded-2xl p-8 text-left transition-all duration-200 hover:bg-stone-800/80"
          >
            <div className="w-14 h-14 bg-stone-800 border border-stone-700 rounded-2xl flex items-center justify-center mb-5 group-hover:border-amber-500/30 transition-colors">
              <Upload className="w-6 h-6 text-stone-400" />
            </div>
            <div className="font-bold text-stone-100 text-lg mb-2">I have a resume</div>
            <div className="text-stone-500 text-sm leading-relaxed mb-5">
              Upload your existing resume and let AI polish and improve every bullet.
            </div>
            <div className="inline-flex items-center gap-1.5 text-amber-500/80 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Upload resume <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* SCRATCH */}
          <button
            onClick={() => choose('scratch')}
            className="group bg-stone-900 border border-stone-700 hover:border-amber-500/40 rounded-2xl p-8 text-left transition-all duration-200 hover:bg-stone-800/80"
          >
            <div className="w-14 h-14 bg-stone-800 border border-stone-700 rounded-2xl flex items-center justify-center mb-5 group-hover:border-amber-500/30 transition-colors">
              <PenLine className="w-6 h-6 text-stone-400" />
            </div>
            <div className="font-bold text-stone-100 text-lg mb-2">Start from scratch</div>
            <div className="text-stone-500 text-sm leading-relaxed mb-5">
              Build it section by section with the AI helping you write each bullet.
            </div>
            <div className="inline-flex items-center gap-1.5 text-amber-500/80 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Start building <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>
        </div>

        <p className="text-stone-600 text-xs mt-12 text-center">
          Free to build · No credit card required · Pay only when you download
        </p>
      </div>
    </div>
  )
}
