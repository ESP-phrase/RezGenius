/**
 * In-memory presence tracker. Approximate live-user counts.
 *
 * NOTE: On Vercel each serverless function instance has its own memory,
 * so a user heartbeating against instance A won't be visible to admin
 * polling instance B. For an early-stage app this is good enough — the
 * number is directionally correct. For exact counts at scale, swap to
 * Vercel KV / Redis.
 */
type Entry = { path: string; lastSeen: number }

const presence = new Map<string, Entry>()
const TTL_MS = 60_000 // 60 seconds without heartbeat = considered gone

function prune() {
  const cutoff = Date.now() - TTL_MS
  for (const [id, e] of presence) {
    if (e.lastSeen < cutoff) presence.delete(id)
  }
}

export function heartbeat(sessionId: string, path: string) {
  presence.set(sessionId, { path, lastSeen: Date.now() })
}

export function snapshot(): { total: number; checkout: number; pricing: number; builder: number; byPath: Record<string, number> } {
  prune()
  let total = 0
  let checkout = 0
  let pricing = 0
  let builder = 0
  const byPath: Record<string, number> = {}
  for (const e of presence.values()) {
    total++
    byPath[e.path] = (byPath[e.path] ?? 0) + 1
    if (e.path.startsWith('/checkout') || e.path.startsWith('/download') || /\/api\/stripe\//.test(e.path)) checkout++
    if (e.path.startsWith('/pricing')) pricing++
    if (e.path.startsWith('/builder')) builder++
  }
  return { total, checkout, pricing, builder, byPath }
}
