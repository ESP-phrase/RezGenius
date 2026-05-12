'use client'

import { useEffect, useState } from 'react'
import DiscountPopup from './DiscountPopup'
import ExitIntent from './ExitIntent'
import { ttqTrack } from '@/lib/ttq'
import posthog from 'posthog-js'

/**
 * A/B test wrapper for the offer popup.
 *
 * Variant A (coupon_save25): bottom-right popup at 12s, email gate,
 *                            reveals SAVE25 code for 25% off at Stripe checkout
 *
 * Variant B (instant_799): exit-intent modal, email gate,
 *                          sends user straight to Stripe for $7.99 one-time
 *
 * Variant is decided per visitor (stable in localStorage). Tagged on every
 * pixel + posthog event so conversion is attributable to the offer shown.
 */
type Variant = 'coupon_save25' | 'instant_799'

function pickVariant(): Variant {
  if (typeof window === 'undefined') return 'coupon_save25'
  const existing = localStorage.getItem('popup_variant') as Variant | null
  if (existing === 'coupon_save25' || existing === 'instant_799') return existing
  const v: Variant = Math.random() < 0.5 ? 'coupon_save25' : 'instant_799'
  localStorage.setItem('popup_variant', v)
  return v
}

export default function PopupAB() {
  const [variant, setVariant] = useState<Variant | null>(null)

  useEffect(() => {
    const v = pickVariant()
    setVariant(v)
    try {
      posthog.register({ popup_variant: v })
      posthog.capture('popup_variant_assigned', { variant: v })
    } catch {}
    try {
      ttqTrack('ViewContent', {
        contents: [{ content_id: `popup_variant_${v}`, content_type: 'product', content_name: `Popup variant: ${v}` }],
        currency: 'USD',
      })
    } catch {}
  }, [])

  if (!variant) return null
  if (variant === 'coupon_save25') return <DiscountPopup />
  return <ExitIntent />
}
