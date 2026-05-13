'use client'

import { useEffect, useState } from 'react'

/**
 * Client wrapper that renders the resume mockup OR hides it based on
 * URL query param. Used for A/B testing hero layout on mobile.
 *
 * URL overrides:
 *   ?mockup=off → hides the resume mockup (cleaner hero)
 *
 * Persists across navigation via sessionStorage so the test stays
 * consistent through the user's session.
 */
export default function HeroMockupSlot({ children }: { children: React.ReactNode }) {
  const [hide, setHide] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const param = params.get('mockup')
    if (param === 'off') {
      sessionStorage.setItem('hero_mockup', 'off')
      setHide(true)
    } else if (param === 'on') {
      sessionStorage.setItem('hero_mockup', 'on')
      setHide(false)
    } else {
      const stored = sessionStorage.getItem('hero_mockup')
      setHide(stored === 'off')
    }
    setReady(true)
  }, [])

  // Avoid hydration mismatch — render children server-side, then hide client-side if needed
  if (!ready) return <>{children}</>
  if (hide) return null
  return <>{children}</>
}
