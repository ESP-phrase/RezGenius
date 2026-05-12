'use client'

import { useEffect } from 'react'
import Clarity from '@microsoft/clarity'

/**
 * Microsoft Clarity client-side init.
 * Set NEXT_PUBLIC_CLARITY_ID in Vercel env vars to enable.
 *
 * Pulls a stable anonymous ID from localStorage so session replays can be
 * filtered per visitor in Clarity.
 */
export default function ClarityInit() {
  useEffect(() => {
    const id = process.env.NEXT_PUBLIC_CLARITY_ID
    if (!id) return

    try {
      Clarity.init(id)

      // Tie the session to our stable anonymous id (created in PixelIdentify)
      const anonId = typeof window !== 'undefined' ? localStorage.getItem('rg_anon_id') : null
      if (anonId) {
        Clarity.identify(anonId)
      }

      // Tag the session with current URL path for easier filtering
      if (typeof window !== 'undefined') {
        Clarity.setTag('path', window.location.pathname)
      }
    } catch (err) {
      console.error('[clarity] init failed', err)
    }
  }, [])

  return null
}
