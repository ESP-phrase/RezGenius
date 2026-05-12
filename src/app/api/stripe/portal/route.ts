import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

let _stripe: Stripe | null = null
function stripe() {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '')
  return _stripe
}

/**
 * POST /api/stripe/portal
 * Creates a Stripe Customer Portal session for the signed-in user and
 * returns the redirect URL. Users land in Stripe's hosted UI to manage
 * subscriptions, update payment method, view invoices, and cancel.
 *
 * Looks up the Stripe customer by email (set when they first checked out).
 */
export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
    }

    const email = session.user.email
    const customers = await stripe().customers.list({ email, limit: 1 })
    const customer = customers.data[0]
    if (!customer) {
      return NextResponse.json({
        error: 'No active subscription or purchases on this email. Buy a plan first.',
      }, { status: 404 })
    }

    const origin = new URL(req.url).origin
    const portal = await stripe().billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${origin}/dashboard/settings`,
    })

    return NextResponse.json({ url: portal.url })
  } catch (err) {
    console.error('[stripe/portal]', err)
    const message = err instanceof Error ? err.message : 'Could not open billing portal'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
