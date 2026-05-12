import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { rdtCapiTrack } from '@/lib/rdt-capi'
import { ttqCapiTrack } from '@/lib/ttq-capi'

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

    // Server-side conversion APIs — dedup with client-side pixels via session.id
    const total = (session.amount_total ?? 0) / 100
    const email = session.customer_details?.email ?? undefined
    const currency = (session.currency ?? 'usd').toUpperCase()

    await Promise.allSettled([
      rdtCapiTrack({
        eventName: 'Purchase',
        conversionId: session.id,
        email,
        value: total,
        currency,
      }),
      ttqCapiTrack({
        eventName: 'CompletePayment',
        eventId: session.id,
        email,
        value: total,
        currency,
      }),
      ttqCapiTrack({
        eventName: 'PlaceAnOrder',
        eventId: session.id + '_order',
        email,
        value: total,
        currency,
      }),
    ])
  }

  return NextResponse.json({ received: true })
}
