import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

/**
 * POST /api/account/delete
 * Deletes the signed-in user along with all their saved resumes
 * and magic tokens. Stripe subscriptions are NOT auto-cancelled —
 * users must cancel via the Billing Portal first if they want to
 * stop being charged.
 */
export async function POST() {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
    }

    const email = session.user.email
    // Magic tokens are indexed by email, not userId — clean those up too
    await db.magicToken.deleteMany({ where: { email } })
    // User → cascade deletes savedResume rows via Prisma relation
    await db.user.delete({ where: { email } })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[account/delete]', err)
    const message = err instanceof Error ? err.message : 'Could not delete account'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
