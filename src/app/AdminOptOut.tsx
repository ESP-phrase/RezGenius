'use client'

import { useEffect } from 'react'

/**
 * Detects if the visitor is an admin (via API check) and sets a localStorage
 * flag `rg_admin_no_track`. All tracking modules (pixels, heartbeat, posthog,
 * clarity) read this flag and skip firing for admin sessions.
 *
 * Result: your own visits don't pollute the analytics dashboard or PostHog.
 */
export default function AdminOptOut() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    // Check once per session
    const checked = sessionStorage.getItem('rg_admin_checked')
    if (checked === '1') return

    fetch('/api/admin/whoami', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        sessionStorage.setItem('rg_admin_checked', '1')
        if (data.isAdmin) {
          localStorage.setItem('rg_admin_no_track', '1')
          // Also opt out of PostHog session capture immediately for this session
          try {
            const ph = (window as Window & { posthog?: { opt_out_capturing?: () => void } }).posthog
            ph?.opt_out_capturing?.()
          } catch {}
        } else {
          // If user is signed in as non-admin, ensure no_track flag is OFF
          localStorage.removeItem('rg_admin_no_track')
        }
      })
      .catch(() => {})
  }, [])

  return null
}
