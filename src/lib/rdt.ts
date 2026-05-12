/* Reddit Pixel helper — typed wrapper around window.rdt */
declare global {
  interface Window {
    rdt?: (event: string, name: string, data?: Record<string, unknown>) => void
  }
}

/**
 * Fire a Reddit pixel conversion event.
 *
 * Pass a stable `conversionId` (e.g. Stripe session id, UUID) to dedupe
 * with server-side CAPI events.
 *
 * If conversionId is omitted, a unique UUID is generated automatically
 * so each event is still trackable individually.
 */
export function rdtTrack(
  event: string,
  data?: Record<string, unknown> & { conversionId?: string }
) {
  if (typeof window === 'undefined' || typeof window.rdt !== 'function') return
  if (localStorage.getItem('rg_admin_no_track') === '1') return // Admin sessions excluded

  const payload = {
    ...data,
    conversionId: data?.conversionId ?? generateId(),
  }
  window.rdt('track', event, payload)
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // Fallback for older browsers
  return `rdt_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
}
