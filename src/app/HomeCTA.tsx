'use client'

import Link from 'next/link'
import { ArrowRight, Play, Sparkles } from 'lucide-react'
import { ttqTrack } from '@/lib/ttq'
import { rdtTrack } from '@/lib/rdt'

function fireSignupEvents(label: string) {
  const contents = [{ content_id: 'resumegenius_home', content_type: 'product' as const, content_name: 'ResumeGenius — ' + label }]
  ttqTrack('ClickButton', { contents, currency: 'USD' })
  ttqTrack('CompleteRegistration', { contents, currency: 'USD' })
  rdtTrack('SignUp')
}

export function BuildResumeButton({ size = 'md', label = 'Build My Resume' }: { size?: 'sm' | 'md' | 'lg'; label?: string }) {
  const sizes = {
    sm: 'text-xs px-3 py-2',
    md: 'text-sm px-4 sm:px-5 py-2.5',
    lg: 'text-base px-6 py-3.5',
  }
  return (
    <Link href="/builder" onClick={() => fireSignupEvents(label)}>
      <button className={`inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl transition-colors shadow-[0_0_40px_-10px_rgba(245,158,11,0.6)] whitespace-nowrap ${sizes[size]}`}>
        {label} <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </Link>
  )
}

export function SeeHowItWorksButton() {
  return (
    <a
      href="#how-it-works"
      onClick={() => {
        const contents = [{ content_id: 'resumegenius_home', content_type: 'product' as const, content_name: 'See How It Works' }]
        ttqTrack('ClickButton', { contents, currency: 'USD' })
      }}
      className="w-full sm:w-auto"
    >
      <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-stone-700 hover:border-stone-500 bg-stone-900/50 hover:bg-stone-800/60 text-stone-100 font-semibold text-base px-6 py-3.5 rounded-xl transition-colors">
        <Play className="w-4 h-4 fill-current" /> See How It Works
      </button>
    </a>
  )
}

export function NavBuildButton() {
  return (
    <Link href="/start" onClick={() => fireSignupEvents('Nav Button')}>
      <button className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap">
        Build My Resume <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </Link>
  )
}

// Star icon for end-of-page CTA
export function FinalCTAButton() {
  return (
    <Link href="/start" onClick={() => fireSignupEvents('Final CTA')}>
      <button className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-base px-8 sm:px-10 py-3.5 sm:py-4 rounded-lg transition-colors">
        Build My Resume for Free <ArrowRight className="w-5 h-5" />
      </button>
    </Link>
  )
}

export function SparkleCTAButton({ label }: { label: string }) {
  return (
    <Link href="/builder" onClick={() => fireSignupEvents(label)}>
      <button className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-7 py-3.5 rounded-lg transition-colors">
        <Sparkles className="w-4 h-4" /> {label} <ArrowRight className="w-4 h-4" />
      </button>
    </Link>
  )
}
