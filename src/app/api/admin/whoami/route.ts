import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'

/**
 * GET /api/admin/whoami
 * Lightweight check used by AdminOptOut.tsx to silently exclude admin
 * sessions from analytics. Returns { isAdmin: true|false }.
 *
 * Always returns 200 — never leaks whether route exists.
 */
export async function GET() {
  const session = await auth()
  return NextResponse.json({ isAdmin: isAdmin(session?.user?.email) })
}
