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

/**
 * Fire a TikTok pixel conversion event.
 *
 * Standard TikTok events: AddToCart, AddPaymentInfo, CompletePayment,
 * InitiateCheckout, PlaceAnOrder, ViewContent, Subscribe, Contact, etc.
 *
 * Pass `event_id` to dedupe with server-side Events API.
 */
export function ttqTrack(
  event: string,
  params?: Record<string, unknown> & { event_id?: string }
) {
  if (typeof window === 'undefined' || !window.ttq?.track) return

  const eventId = params?.event_id ?? generateId()
  const { event_id: _ignore, ...rest } = params ?? {}

  window.ttq.track(event, rest, { event_id: eventId })
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `ttq_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
}
