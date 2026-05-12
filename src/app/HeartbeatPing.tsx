'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Pings /api/heartbeat every 20 seconds with the visitor's anonymous
 * sessionId + current path. Powers the admin "live users / in checkout"
 * counters.
 */
export default function HeartbeatPing() {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined') return

    let sid = localStorage.getItem('rg_anon_id')
    if (!sid) {
      sid = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10)
      localStorage.setItem('rg_anon_id', sid)
    }

    function ping() {
      try {
        fetch('/api/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: sid, path: pathname }),
          keepalive: true,
        }).catch(() => {})
      } catch {}
    }
    ping()
    const t = setInterval(ping, 20_000)
    return () => clearInterval(t)
  }, [pathname])

  return null
}
