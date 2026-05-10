/**
 * Reddit Conversions API (CAPI) — server-side conversion tracking.
 *
 * Mirrors client-side pixel events. Reddit dedupes by `conversion_id`
 * when the same value is sent from both pixel + CAPI within ~24h.
 *
 * Required env vars:
 *   REDDIT_CAPI_ACCESS_TOKEN  — long-lived OAuth token from Reddit Ads
 *   REDDIT_AD_ACCOUNT_ID      — your ad account ID (e.g. "a2_abc123")
 *   REDDIT_PIXEL_ID           — your pixel id (e.g. "a2_izia4ip5nhgn")
 *
 * Optional:
 *   REDDIT_CAPI_TEST_ID       — when set, events are sent in test mode
 *                               and visible in the Test Conversions UI.
 *                               Remove for production traffic.
 */

import crypto from 'crypto'

const ENDPOINT = (adAccountId: string) =>
  `https://ads-api.reddit.com/api/v2.0/conversions/events/${adAccountId}`

type EventName = 'PageVisit' | 'AddToCart' | 'Purchase' | 'SignUp' | 'Lead' | 'ViewContent'

interface CapiEventInput {
  eventName: EventName
  conversionId: string
  email?: string
  externalId?: string
  ipAddress?: string
  userAgent?: string
  value?: number
  currency?: string
}

function sha256(input: string): string {
  return crypto.createHash('sha256').update(input.trim().toLowerCase()).digest('hex')
}

export async function rdtCapiTrack(input: CapiEventInput): Promise<void> {
  const token = process.env.REDDIT_CAPI_ACCESS_TOKEN
  const adAccountId = process.env.REDDIT_AD_ACCOUNT_ID
  const pixelId = process.env.REDDIT_PIXEL_ID
  const testId = process.env.REDDIT_CAPI_TEST_ID

  if (!token || !adAccountId || !pixelId) {
    console.warn('[rdt-capi] missing env vars, skipping', input.eventName, {
      hasAccessToken: !!token,
      hasAdAccountId: !!adAccountId,
      hasPixelId: !!pixelId,
      hasTestId: !!testId,
    })
    return
  }

  const event: Record<string, unknown> = {
    event_at: new Date().toISOString(),
    event_type: { tracking_type: input.eventName },
    event_metadata: {
      conversion_id: input.conversionId,
      ...(input.value !== undefined ? { value_decimal: input.value } : {}),
      ...(input.currency ? { currency: input.currency } : {}),
    },
    user: {
      ...(input.email ? { email: sha256(input.email) } : {}),
      ...(input.externalId ? { external_id: sha256(input.externalId) } : {}),
      ...(input.ipAddress ? { ip_address: input.ipAddress } : {}),
      ...(input.userAgent ? { user_agent: input.userAgent } : {}),
    },
  }

  if (testId) {
    event.test_id = testId
  }

  const body = {
    pixel_id: pixelId,
    test_mode: !!testId,
    events: [event],
  }

  try {
    const res = await fetch(ENDPOINT(adAccountId), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })
    const text = await res.text()
    if (!res.ok) {
      console.error('[rdt-capi] error', res.status, text)
    } else {
      console.log('[rdt-capi] sent', input.eventName, input.conversionId, testId ? '(TEST)' : '')
    }
  } catch (err) {
    console.error('[rdt-capi] fetch failed', err)
  }
}
