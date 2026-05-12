'use client'

import { useEffect } from 'react'
import Clarity from '@microsoft/clarity'

/**
 * Microsoft Clarity client-side init.
 *
 * Project ID hardcoded so this works without env vars. The Clarity project
 * ID is a public identifier safe to commit (it ends up in browser JS regardless).
 *
 * NEXT_PUBLIC_CLARITY_ID env var, if set, overrides the hardcoded default.
 */
const CLARITY_PROJECT_ID = 'wpruxf6nt5'

export default function ClarityInit() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    // Skip admin sessions so my own visits don't pollute recordings
    if (localStorage.getItem('rg_admin_no_track') === '1') return

    const id = process.env.NEXT_PUBLIC_CLARITY_ID || CLARITY_PROJECT_ID
    if (!id) return

    try {
      Clarity.init(id)

      // Tie this session to our stable anonymous visitor id
      const anonId = localStorage.getItem('rg_anon_id')
      if (anonId) {
        Clarity.identify(anonId)
      }

      // Tag the session with current URL path for filtering
      Clarity.setTag('path', window.location.pathname)
    } catch (err) {
      console.error('[clarity] init failed', err)
    }
  }, [])

  return null
}
