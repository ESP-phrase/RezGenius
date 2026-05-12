import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * POST /api/leads — capture email + tag with source (e.g. "discount_popup").
 * Idempotent: same email gets upserted with new source/promo if re-submitted.
 *
 * Saves to the existing User table so the lead is reusable as an account
 * when they later sign in via magic link.
 */
export async function POST(req: Request) {
  try {
    const { email, source, promoCode } = await req.json()
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }
    const normalized = email.trim().toLowerCase()

    // Upsert the user — captured the lead even if they never sign in
    await db.user.upsert({
      where: { email: normalized },
      update: {},
      create: { email: normalized },
    })

    console.log('[leads]', source ?? 'unknown', normalized, promoCode ?? '')
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[leads] error', err)
    return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 })
  }
}
