/* TikTok Pixel helper — typed wrapper around window.ttq */
declare global {
  interface Window {
    ttq?: {
      track: (event: string, params?: Record<string, unknown>, options?: Record<string, unknown>) => void
      identify: (data: Record<string, unknown>) => void
      page: () => void
    }
  }
}

type ContentItem = {
  content_id: string
  content_type?: 'product' | 'product_group'
  content_name?: string
}

type TtqParams = {
  contents?: ContentItem[]
  value?: number
  currency?: string
  search_string?: string
  /** Used internally — pulled into options. */
  event_id?: string
}

/**
 * Fire a TikTok Pixel event with the official rich format.
 *
 * Standard events: ViewContent, AddToWishlist, Search, AddPaymentInfo,
 * AddToCart, InitiateCheckout, PlaceAnOrder, CompleteRegistration, Purchase.
 */
export function ttqTrack(event: string, params: TtqParams = {}) {
  if (typeof window === 'undefined' || !window.ttq?.track) return

  const { event_id, ...rest } = params
  const id = event_id ?? generateId()

  // TikTok wants a populated contents array per event spec.
  // Default to a single product entry tied to ResumeGenius if not given.
  const trackParams: Record<string, unknown> = { ...rest }
  if (!trackParams.contents) {
    trackParams.contents = [
      {
        content_id: 'resumegenius_pro',
        content_type: 'product',
        content_name: 'ResumeGenius',
      },
    ]
  }
  if (trackParams.currency === undefined) trackParams.currency = 'USD'

  window.ttq.track(event, trackParams, { event_id: id })
}

/**
 * Identify the current user for advanced matching.
 * Email + phone must be SHA-256 hashed before passing.
 */
export async function ttqIdentify(input: { email?: string; phone?: string; externalId?: string }) {
  if (typeof window === 'undefined' || !window.ttq?.identify) return
  const data: Record<string, string> = {}
  if (input.email) data.email = await sha256(input.email.trim().toLowerCase())
  if (input.phone) data.phone_number = await sha256(input.phone.trim())
  if (input.externalId) data.external_id = await sha256(input.externalId.trim())
  window.ttq.identify(data)
}

async function sha256(input: string): Promise<string> {
  if (typeof crypto === 'undefined' || !crypto.subtle) return input
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `ttq_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
}
