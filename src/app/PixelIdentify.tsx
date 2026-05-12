'use client'

import { useEffect } from 'react'
import { ttqIdentify } from '@/lib/ttq'

/**
 * Mounted in root layout. On every page load, sends ttq.identify with a stable
 * anonymous external_id (persisted in localStorage) — boosts EMQ even before
 * user signs in. Once they sign in, DashboardShell calls ttqIdentify again
 * with their real email + user.id.
 */
export default function PixelIdentify() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    let anonId = localStorage.getItem('rg_anon_id')
    if (!anonId) {
      anonId =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : 'anon_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10)
      localStorage.setItem('rg_anon_id', anonId)
    }

    // Fire identify slightly delayed so ttq script has time to load
    const t = setTimeout(() => {
      ttqIdentify({ externalId: anonId })
    }, 800)
    return () => clearTimeout(t)
  }, [])

  return null
}
