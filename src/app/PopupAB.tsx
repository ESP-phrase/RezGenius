'use client'

import { useEffect, useState } from 'react'
import DiscountPopup from './DiscountPopup'
import ExitIntent from './ExitIntent'
import TopBanner from './TopBanner'
import { ttqTrack } from '@/lib/ttq'
import posthog from 'posthog-js'

/**
 * Popup A/B test with URL-override test modes.
 *
 * Default (no query param) — 50/50 split between SAVE25 popup and $7.99 exit-intent
 *
 * Override modes via `?popup=` query param:
 *   off      → no popup at all (test base conversion)
 *   delay    → both popups delayed to 30s (only catches engaged users)
 *   banner   → no corner popup, instead a top sticky banner with SAVE25
 *   desktop  → corner popup desktop only, hidden on mobile
 *   coupon   → force SAVE25 variant (regardless of localStorage)
 *   instant  → force $7.99 exit-intent variant
 */
type Variant = 'coupon_save25' | 'instant_799'
type Mode = 'default' | 'off' | 'delay' | 'banner' | 'desktop' | 'coupon' | 'instant'

function pickVariant(): Variant {
  if (typeof window === 'undefined') return 'coupon_save25'
  const existing = localStorage.getItem('popup_variant') as Variant | null
  if (existing === 'coupon_save25' || existing === 'instant_799') return existing
  const v: Variant = Math.random() < 0.5 ? 'coupon_save25' : 'instant_799'
  localStorage.setItem('popup_variant', v)
  return v
}

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    function check() {
      if (typeof window !== 'undefined') setIsMobile(window.innerWidth < 768)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

export default function PopupAB() {
  const [modeParam, setModeParam] = useState<Mode>('default')
  const [variant, setVariant] = useState<Variant | null>(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const m = params.get('popup') as Mode | null
    if (m) {
      setModeParam(m)
      try { sessionStorage.setItem('popup_mode_override', m) } catch {}
    } else {
      // Persist override across navigation within the same session
      try {
        const stored = sessionStorage.getItem('popup_mode_override') as Mode | null
        if (stored) setModeParam(stored)
      } catch {}
    }
  }, [])

  useEffect(() => {
    const v = pickVariant()
    setVariant(v)
    try {
      posthog.register({ popup_variant: v, popup_mode: modeParam })
      posthog.capture('popup_variant_assigned', { variant: v, mode: modeParam })
    } catch {}
    try {
      ttqTrack('ViewContent', {
        contents: [{ content_id: `popup_${modeParam}_${v}`, content_type: 'product', content_name: `Popup test: ${modeParam} ${v}` }],
        currency: 'USD',
      })
    } catch {}
  }, [modeParam])

  if (!variant) return null

  // === TEST MODES ===
  if (modeParam === 'off') return null
  if (modeParam === 'banner') return <TopBanner />
  if (modeParam === 'desktop' && isMobile) return null
  if (modeParam === 'delay') {
    // Render a delayed variant — both popups, 30s wait minimum
    return <DelayedPopup variant={variant} />
  }
  if (modeParam === 'coupon') return <DiscountPopup />
  if (modeParam === 'instant') return <ExitIntent />

  // === DEFAULT: no popup. Less aggressive, higher mobile engagement.
  // Override via ?popup=coupon, ?popup=instant, ?popup=banner, or ?popup=delay
  return null
}

/** Variant that shows the assigned popup but only after 30s of dwell time */
function DelayedPopup({ variant }: { variant: Variant }) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 30_000)
    return () => clearTimeout(t)
  }, [])
  if (!show) return null
  return variant === 'coupon_save25' ? <DiscountPopup /> : <ExitIntent />
}
