import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { rdtCapiTrack } from '@/lib/rdt-capi'

let _stripe: Stripe | null = null
function stripe() {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '')
  return _stripe
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET ?? '')
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    console.log('Payment completed:', session.id, 'Resume:', session.metadata?.resumeId)

    // Reddit Conversions API — server-side dedup with client-side pixel
    const total = (session.amount_total ?? 0) / 100
    await rdtCapiTrack({
      eventName: 'Purchase',
      conversionId: session.id, // matches client-side pixel conversionId
      email: session.customer_details?.email ?? undefined,
      value: total,
      currency: (session.currency ?? 'usd').toUpperCase(),
    })
  }

  return NextResponse.json({ received: true })
}
