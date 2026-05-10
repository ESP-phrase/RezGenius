import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'

let _stripe: Stripe | null = null
function stripe() {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '')
  return _stripe
}

export async function POST(req: NextRequest) {
  try {
    const { mode, resumeId } = await req.json()
    const appUrl = new URL(req.url).origin

    const cancelUrl = resumeId ? `${appUrl}/builder?id=${resumeId}` : `${appUrl}/builder`

    if (mode === 'subscription') {
      const session = await stripe().checkout.sessions.create({
        mode: 'subscription',
        line_items: [{ price: process.env.STRIPE_PRICE_ID_SUBSCRIPTION, quantity: 1 }],
        metadata: { resumeId: resumeId ?? '' },
        success_url: `${appUrl}/download?session_id={CHECKOUT_SESSION_ID}&resume_id=${resumeId}`,
        cancel_url: cancelUrl,
      })
      return NextResponse.json({ url: session.url })
    }

    // pay-per-resume
    const session = await stripe().checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: Number(process.env.PRICE_PER_RESUME || 14900),
            product_data: { name: 'AI Resume Download', description: 'One-time PDF download' },
          },
          quantity: 1,
        },
      ],
      metadata: { resumeId: resumeId ?? '' },
      success_url: `${appUrl}/download?session_id={CHECKOUT_SESSION_ID}&resume_id=${resumeId}`,
      cancel_url: cancelUrl,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
