import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'

let _stripe: Stripe | null = null
function stripe() {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '')
  return _stripe
}

export async function POST(req: NextRequest) {
  try {
    const { mode, resumeId, trial } = await req.json()
    const appUrl = new URL(req.url).origin

    const cancelUrl = resumeId ? `${appUrl}/builder?id=${resumeId}` : `${appUrl}/builder`
    const successUrl = `${appUrl}/download?session_id={CHECKOUT_SESSION_ID}&resume_id=${resumeId}`

    if (mode === 'subscription') {
      const params: Stripe.Checkout.SessionCreateParams = {
        mode: 'subscription',
        line_items: [{ price: process.env.STRIPE_PRICE_ID_SUBSCRIPTION, quantity: 1 }],
        metadata: { resumeId: resumeId ?? '', trial: trial ? '1' : '0' },
        success_url: successUrl,
        cancel_url: cancelUrl,
      }

      // $1 trial: apply $28 discount on first month so user pays $1, then full $29/mo.
      // Coupon must be created in Stripe dashboard with id "FIRST_MONTH_DOLLAR"
      // (amount_off: 2800, currency: usd, duration: once)
      if (trial) {
        params.discounts = [{ coupon: process.env.STRIPE_TRIAL_COUPON_ID || 'FIRST_MONTH_DOLLAR' }]
      }

      const session = await stripe().checkout.sessions.create(params)
      return NextResponse.json({ url: session.url })
    }

    // Lifetime / pay-per-resume
    const session = await stripe().checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: Number(process.env.PRICE_PER_RESUME || 14900),
            product_data: { name: 'ResumeGenius Lifetime', description: 'Lifetime access · pay once' },
          },
          quantity: 1,
        },
      ],
      metadata: { resumeId: resumeId ?? '' },
      success_url: successUrl,
      cancel_url: cancelUrl,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    const message = err instanceof Error ? err.message : 'Failed to create checkout session'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
