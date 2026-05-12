/**
 * TikTok Events API (CAPI) — server-side conversion tracking.
 *
 * Mirrors client-side pixel events. TikTok dedupes by `event_id`
 * when the same value is sent from both pixel + Events API.
 *
 * Required env vars:
 *   TTQ_ACCESS_TOKEN  — long-lived token from Events Manager → Settings → Events API
 *   TTQ_PIXEL_ID      — your pixel id (default: D80TPOJC77UCEH8TAV3G)
 *
 * Optional:
 *   TTQ_TEST_EVENT_CODE — when set, events are sent to test endpoint
 *                          and visible in Events Manager → Test Events.
 *                          Remove for production traffic.
 *
 * Docs: https://business-api.tiktok.com/portal/docs?id=1771101303285761
 */

import crypto from 'crypto'

const ENDPOINT = 'https://business-api.tiktok.com/open_api/v1.3/event/track/'

type EventName =
  | 'ViewContent'
  | 'ClickButton'
  | 'Search'
  | 'AddToWishlist'
  | 'AddToCart'
  | 'AddPaymentInfo'
  | 'InitiateCheckout'
  | 'PlaceAnOrder'
  | 'CompleteRegistration'
  | 'CompletePayment'
  | 'Subscribe'

interface CapiEventInput {
  eventName: EventName
  eventId: string
  email?: string
  phone?: string
  externalId?: string
  ipAddress?: string
  userAgent?: string
  url?: string
  value?: number
  currency?: string
  contentId?: string
  contentName?: string
}

function sha256(input: string): string {
  return crypto.createHash('sha256').update(input.trim().toLowerCase()).digest('hex')
}

export async function ttqCapiTrack(input: CapiEventInput): Promise<void> {
  const token = process.env.TTQ_ACCESS_TOKEN
  const pixelCode = process.env.TTQ_PIXEL_ID ?? 'D80TPOJC77UCEH8TAV3G'
  const testEventCode = process.env.TTQ_TEST_EVENT_CODE

  if (!token) {
    console.warn('[ttq-capi] missing TTQ_ACCESS_TOKEN, skipping', input.eventName, {
      hasToken: false,
      hasPixelCode: !!pixelCode,
      hasTestCode: !!testEventCode,
    })
    return
  }

  const event: Record<string, unknown> = {
    event: input.eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: input.eventId,
    user: {
      ...(input.email ? { email: sha256(input.email) } : {}),
      ...(input.phone ? { phone: sha256(input.phone) } : {}),
      ...(input.externalId ? { external_id: sha256(input.externalId) } : {}),
      ...(input.ipAddress ? { ip: input.ipAddress } : {}),
      ...(input.userAgent ? { user_agent: input.userAgent } : {}),
    },
    properties: {
      ...(input.value !== undefined ? { value: input.value } : {}),
      ...(input.currency ? { currency: input.currency } : {}),
      contents: [
        {
          content_id: input.contentId ?? 'resumegenius_pro',
          content_type: 'product',
          content_name: input.contentName ?? 'ResumeGenius Pro',
          quantity: 1,
          price: input.value ?? 0,
          brand: 'ResumeGenius',
          content_category: 'Career',
        },
      ],
    },
    page: input.url ? { url: input.url } : undefined,
  }

  const body: Record<string, unknown> = {
    event_source: 'web',
    event_source_id: pixelCode,
    data: [event],
  }

  if (testEventCode) {
    body.test_event_code = testEventCode
  }

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': token,
      },
      body: JSON.stringify(body),
    })
    const text = await res.text()
    if (!res.ok) {
      console.error('[ttq-capi] error', res.status, text)
    } else {
      console.log('[ttq-capi] sent', input.eventName, input.eventId, testEventCode ? '(TEST)' : '')
    }
  } catch (err) {
    console.error('[ttq-capi] fetch failed', err)
  }
}
