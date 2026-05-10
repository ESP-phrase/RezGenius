import Stripe from 'stripe'
import { NextResponse } from 'next/server'

let _stripe: Stripe | null = null
function stripe() {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '')
  return _stripe
}

export async function GET(req: Request) {
  const sessionId = new URL(req.url).searchParams.get('session_id')
  if (!sessionId) return NextResponse.json({ valid: false }, { status: 400 })

  try {
    const session = await stripe().checkout.sessions.retrieve(sessionId)
    const paid =
      session.payment_status === 'paid' ||
      session.status === 'complete' ||
      session.mode === 'subscription'

    return NextResponse.json({
      valid: paid,
      resumeId: session.metadata?.resumeId ?? null,
    })
  } catch {
    return NextResponse.json({ valid: false }, { status: 400 })
  }
}
