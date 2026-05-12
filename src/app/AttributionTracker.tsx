'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'

/**
 * Captures the *first* referrer + UTM params for each visitor session.
 * Stored in localStorage so we know where they originally came from even
 * if they navigate around before converting.
 *
 * Tagged on every PostHog event going forward — filter your admin/PostHog
 * by `utm_source` to see which channel (TikTok, Reddit, articles, etc.)
 * drives signups + purchases.
 */
export default function AttributionTracker() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const KEY = 'rg_attribution'
    const existing = localStorage.getItem(KEY)
    if (existing) {
      // Already captured this visitor — register attribution on PostHog
      try {
        const attr = JSON.parse(existing)
        posthog.register(attr)
      } catch {}
      return
    }

    const params = new URLSearchParams(window.location.search)
    const ref = document.referrer
    const refHost = (() => {
      try { return ref ? new URL(ref).hostname : null } catch { return null }
    })()

    // Auto-detect channel from referrer if no explicit UTM
    let autoChannel: string | null = null
    if (refHost) {
      if (/tiktok|bytedance/i.test(refHost)) autoChannel = 'tiktok'
      else if (/reddit/i.test(refHost)) autoChannel = 'reddit'
      else if (/facebook|fb\.me/i.test(refHost)) autoChannel = 'facebook'
      else if (/instagram/i.test(refHost)) autoChannel = 'instagram'
      else if (/twitter|t\.co|x\.com/i.test(refHost)) autoChannel = 'twitter'
      else if (/google|goog/i.test(refHost)) autoChannel = 'google'
      else if (/bing/i.test(refHost)) autoChannel = 'bing'
      else if (/duckduckgo/i.test(refHost)) autoChannel = 'duckduckgo'
      else if (/youtube|youtu\.be/i.test(refHost)) autoChannel = 'youtube'
      else if (/linkedin/i.test(refHost)) autoChannel = 'linkedin'
    }

    const attr: Record<string, string> = {
      utm_source: params.get('utm_source') ?? autoChannel ?? (refHost ?? 'direct'),
      utm_medium: params.get('utm_medium') ?? (autoChannel ? (autoChannel === 'google' || autoChannel === 'bing' ? 'organic' : 'social') : 'direct'),
      utm_campaign: params.get('utm_campaign') ?? '',
      utm_content: params.get('utm_content') ?? '',
      utm_term: params.get('utm_term') ?? '',
      referrer: ref || 'direct',
      first_landing_path: window.location.pathname,
    }

    localStorage.setItem(KEY, JSON.stringify(attr))
    try {
      posthog.register(attr)
      posthog.capture('first_visit', attr)
    } catch {}
  }, [])

  return null
}
