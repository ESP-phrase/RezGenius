'use client'

import { useEffect } from 'react'
import { ttqTrack } from '@/lib/ttq'

/**
 * Fires TikTok ViewContent event when user lands on pricing.
 * Pricing-page visits are a strong intent signal for ad optimization.
 */
export default function PricingPageView() {
  useEffect(() => {
    ttqTrack('ViewContent', {
      contents: [
        { content_id: 'pro_monthly', content_type: 'product', content_name: 'ResumeGenius Pro Monthly' },
        { content_id: 'lifetime', content_type: 'product', content_name: 'ResumeGenius Lifetime' },
      ],
      currency: 'USD',
    })
  }, [])
  return null
}
