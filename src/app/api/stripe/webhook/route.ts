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

  // --- Checkout completed: fire Purchase events to ad pixels ---
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    console.log('Payment completed:', session.id, 'Resume:', session.metadata?.resumeId)

    const total = (session.amount_total ?? 0) / 100
    const email = session.customer_details?.email ?? undefined
    const phone = session.customer_details?.phone ?? undefined
    const currency = (session.currency ?? 'usd').toUpperCase()

    await Promise.allSettled([
      rdtCapiTrack({ eventName: 'Purchase', conversionId: session.id, email, value: total, currency }),
      ttqCapiTrack({ eventName: 'CompletePayment', eventId: session.id, email, phone, value: total, currency }),
      ttqCapiTrack({ eventName: 'PlaceAnOrder', eventId: session.id + '_order', email, phone, value: total, currency }),
    ])
  }

  // --- Lifetime trial: cancel subscription after first paid invoice ---
  // Stripe charges $149 after 7-day trial → we cancel so it doesn't renew next year.
  // User effectively gets a one-time $149 lifetime purchase with a 7-day free trial upfront.
  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object as Stripe.Invoice & { subscription?: string | Stripe.Subscription | null }
    const subscriptionRef = invoice.subscription
    if (!subscriptionRef) return NextResponse.json({ received: true })

    try {
      const sub = typeof subscriptionRef === 'string'
        ? await stripe().subscriptions.retrieve(subscriptionRef)
        : subscriptionRef
      const shouldCancel = sub.metadata?.cancel_after_first_charge === '1'
      if (shouldCancel && (invoice.billing_reason === 'subscription_cycle' || invoice.billing_reason === 'subscription_create')) {
        await stripe().subscriptions.cancel(sub.id)
        console.log('[lifetime-trial] cancelled subscription after first paid invoice:', sub.id)

        // Fire CompletePayment again here, since the post-trial invoice triggers the actual $149 charge
        const total = (invoice.amount_paid ?? 0) / 100
        if (total > 0) {
          await Promise.allSettled([
            rdtCapiTrack({ eventName: 'Purchase', conversionId: invoice.id ?? sub.id, email: invoice.customer_email ?? undefined, value: total, currency: (invoice.currency ?? 'usd').toUpperCase() }),
            ttqCapiTrack({ eventName: 'CompletePayment', eventId: invoice.id ?? sub.id, email: invoice.customer_email ?? undefined, value: total, currency: (invoice.currency ?? 'usd').toUpperCase() }),
          ])
        }
      }
    } catch (e) {
      console.error('[lifetime-trial] failed to cancel subscription:', e)
    }
  }

  return NextResponse.json({ received: true })
}
