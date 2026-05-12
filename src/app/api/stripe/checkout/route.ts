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
  try {
    const { mode, resumeId, trial } = await req.json()
    const appUrl = new URL(req.url).origin
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? undefined
    const userAgent = req.headers.get('user-agent') ?? undefined

    const cancelUrl = resumeId ? `${appUrl}/builder?id=${resumeId}` : `${appUrl}/builder`
    const successUrl = `${appUrl}/download?session_id={CHECKOUT_SESSION_ID}&resume_id=${resumeId}`

    // Shared base — collect customer details for high EMQ on conversion events.
    // NOTE: customer_creation is only valid in 'payment' mode. Subscriptions auto-create customers.
    const commonParams = {
      success_url: successUrl,
      cancel_url: cancelUrl,
      phone_number_collection: { enabled: true },
      allow_promotion_codes: true,
    }

    if (mode === 'subscription') {
      const params: Stripe.Checkout.SessionCreateParams = {
        ...commonParams,
        mode: 'subscription',
        line_items: [{ price: process.env.STRIPE_PRICE_ID_SUBSCRIPTION, quantity: 1 }],
        metadata: { resumeId: resumeId ?? '', trial: trial ? '1' : '0' },
      }

      if (trial) {
        // 7-day free trial — Stripe charges $0 today, full $29 after trial.
        // Beats the coupon approach: no Stripe coupon required.
        params.subscription_data = {
          trial_period_days: 7,
          metadata: { plan: 'pro_trial' },
        }
      }

      const session = await stripe().checkout.sessions.create(params)

      const value = trial ? 0 : 29
      await Promise.allSettled([
        rdtCapiTrack({ eventName: 'AddToCart', conversionId: session.id, value, currency: 'USD', ipAddress, userAgent }),
        ttqCapiTrack({ eventName: 'AddToCart', eventId: session.id, value, currency: 'USD', ipAddress, userAgent, contentId: trial ? 'pro_trial' : 'pro_monthly', contentName: trial ? 'ResumeGenius Pro Trial' : 'ResumeGenius Pro Monthly' }),
        ttqCapiTrack({ eventName: 'InitiateCheckout', eventId: session.id + '_ic', value, currency: 'USD', ipAddress, userAgent, contentId: trial ? 'pro_trial' : 'pro_monthly' }),
      ])

      return NextResponse.json({ url: session.url })
    }

    // Lifetime — free 7-day trial → $149 charged after trial via a subscription
    // that we cancel right after the first invoice succeeds (in webhook).
    // Requires STRIPE_PRICE_ID_LIFETIME_TRIAL ($149/year price). Without it, the
    // request still returns gracefully with a helpful error message.
    if (mode === 'lifetime-trial') {
      if (!process.env.STRIPE_PRICE_ID_LIFETIME_TRIAL) {
        return NextResponse.json({
          error: 'Lifetime trial not yet available. Use the instant-pay option for now.',
        }, { status: 400 })
      }
      const session = await stripe().checkout.sessions.create({
        ...commonParams,
        mode: 'subscription',
        line_items: [{ price: process.env.STRIPE_PRICE_ID_LIFETIME_TRIAL, quantity: 1 }],
        subscription_data: {
          trial_period_days: 7,
          metadata: { plan: 'lifetime_trial', cancel_after_first_charge: '1' },
        },
        metadata: { resumeId: resumeId ?? '', plan: 'lifetime_trial' },
      })

      await Promise.allSettled([
        rdtCapiTrack({ eventName: 'AddToCart', conversionId: session.id, value: 0, currency: 'USD', ipAddress, userAgent }),
        ttqCapiTrack({ eventName: 'AddToCart', eventId: session.id, value: 0, currency: 'USD', ipAddress, userAgent, contentId: 'lifetime_trial', contentName: 'ResumeGenius Lifetime (7-day free trial)' }),
        ttqCapiTrack({ eventName: 'InitiateCheckout', eventId: session.id + '_ic', value: 0, currency: 'USD', ipAddress, userAgent, contentId: 'lifetime_trial' }),
      ])

      return NextResponse.json({ url: session.url })
    }

    // Lifetime instant pay (one-time $149, no trial) — payment mode CAN use customer_creation
    const session = await stripe().checkout.sessions.create({
      ...commonParams,
      mode: 'payment',
      customer_creation: 'always',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: 14900, // $149.00 Lifetime
            product_data: { name: 'ResumeGenius Lifetime', description: 'Lifetime access · pay once' },
          },
          quantity: 1,
        },
      ],
      metadata: { resumeId: resumeId ?? '', plan: 'lifetime' },
    })

    await Promise.allSettled([
      rdtCapiTrack({ eventName: 'AddToCart', conversionId: session.id, value: 149, currency: 'USD', ipAddress, userAgent }),
      ttqCapiTrack({ eventName: 'AddToCart', eventId: session.id, value: 149, currency: 'USD', ipAddress, userAgent, contentId: 'lifetime', contentName: 'ResumeGenius Lifetime' }),
      ttqCapiTrack({ eventName: 'InitiateCheckout', eventId: session.id + '_ic', value: 149, currency: 'USD', ipAddress, userAgent, contentId: 'lifetime' }),
    ])

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    const message = err instanceof Error ? err.message : 'Failed to create checkout session'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
