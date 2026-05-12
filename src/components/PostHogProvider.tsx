'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    if (!key) return
    posthog.init(key, {
      // Reverse-proxied via /ingest (configured in next.config.ts).
      // Bypasses ad-blockers that strip direct posthog.com requests.
      api_host: '/ingest',
      ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: true,
      capture_pageleave: true,
      // Session replay — captures full recordings of user activity
      disable_session_recording: false,
      session_recording: {
        // Mask password inputs but capture everything else
        maskAllInputs: false,
        maskInputOptions: { password: true },
      },
    })
  }, [])

  return <PHProvider client={posthog}>{children}</PHProvider>
}
