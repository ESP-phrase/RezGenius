'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { X, Sparkles, ArrowRight } from 'lucide-react'

/**
 * Minimal dismissable top banner — less invasive alternative to corner popups.
 * Used in popup-test variant `?popup=banner`.
 */
export default function TopBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem('top_banner_dismissed') === '1') return
    // Tiny delay so it slides in after page paint
    const t = setTimeout(() => setShow(true), 800)
    return () => clearTimeout(t)
  }, [])

  function dismiss() {
    setShow(false)
    sessionStorage.setItem('top_banner_dismissed', '1')
  }

  if (!show) return null

  return (
    <div className="sticky top-0 z-[55] bg-gradient-to-r from-amber-500 to-amber-400 text-stone-950 animate-in slide-in-from-top-2 duration-300">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 px-3 sm:px-4 py-2">
        <div className="flex items-center gap-2 min-w-0 text-xs sm:text-sm font-bold">
          <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">25% off Pro &amp; Lifetime — code <span className="font-mono bg-stone-950/15 px-1.5 py-0.5 rounded">SAVE25</span></span>
        </div>
        <Link href="/pricing" className="hidden sm:inline-flex items-center gap-1 text-xs font-bold underline underline-offset-2 whitespace-nowrap">
          Claim <ArrowRight className="w-3 h-3" />
        </Link>
        <button onClick={dismiss} aria-label="Dismiss" className="flex-shrink-0 p-1 hover:bg-stone-950/10 rounded">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
