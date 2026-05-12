import { NextResponse } from 'next/server'
import { heartbeat } from '@/lib/presence'

/**
 * POST /api/heartbeat
 * Body: { sessionId: string, path: string }
 *
 * Client pings every ~20 seconds while on the page. Server records the
 * sessionId + path for the admin live-users counter.
 */
export async function POST(req: Request) {
  try {
    const { sessionId, path } = await req.json()
    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ error: 'sessionId required' }, { status: 400 })
    }
    heartbeat(sessionId, typeof path === 'string' ? path : '/')
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'bad request' }, { status: 400 })
  }
}
