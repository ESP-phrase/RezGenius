'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, X } from 'lucide-react'

export default function StickyBar() {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    function onScroll() {
      // Show after scrolling 600px (past the hero)
      setVisible(window.scrollY > 600)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (dismissed || !visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-2 duration-300">
      <div className="bg-stone-900/95 backdrop-blur-md border-t border-stone-700 px-3 sm:px-4 py-2.5 sm:py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Left */}
          <div className="hidden sm:flex items-center gap-3 min-w-0">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
            <p className="text-stone-300 text-sm font-medium truncate">
              Free to build · Pay only when you download
            </p>
            <span className="hidden md:flex items-center gap-1.5 text-stone-600 text-xs">
              <span className="text-green-400">🛡</span> 7-day money-back guarantee
            </span>
          </div>
          {/* Mobile-only: simpler text */}
          <div className="flex sm:hidden items-center gap-2 min-w-0">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
            <p className="text-stone-300 text-xs font-medium">
              Try $1 for 7 days
            </p>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Link
              href="/start"
              className="inline-flex items-center gap-1.5 sm:gap-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm px-3 sm:px-5 py-2 rounded-lg transition-colors whitespace-nowrap"
            >
              Build Resume <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={() => setDismissed(true)}
              className="text-stone-600 hover:text-stone-400 transition-colors p-1"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
