import Stripe from 'stripe'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { isAdmin } from '@/lib/admin'
import { snapshot as presenceSnapshot } from '@/lib/presence'

// Admin emails to filter out of customer analytics so admin's own
// test sessions don't pollute the dashboard numbers.
const ADMIN_FILTER_EMAILS = [
  'aubreynicholsacc@gmail.com',
  'aubreynicholsaccc@gmail.com',
  ...(process.env.ADMIN_EMAILS ?? '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean),
]

let _stripe: Stripe | null = null
function stripe() {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '')
  return _stripe
}

/**
 * GET /api/admin/metrics
 * Admin-only. Returns:
 *   - Last 24h: AddToCart (Checkout sessions created), Purchases (succeeded), Revenue
 *   - Last 7d / 30d totals
 *   - Active subscriptions count
 *   - Recent purchases (last 20)
 *   - Lead count (users in DB with no resume = pure leads)
 */
export async function GET() {
  const session = await auth()
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const now = Math.floor(Date.now() / 1000)
  const dayAgo = now - 24 * 60 * 60
  const weekAgo = now - 7 * 24 * 60 * 60
  const monthAgo = now - 30 * 24 * 60 * 60

  const dayAgoDate = new Date(dayAgo * 1000)
  const weekAgoDate = new Date(weekAgo * 1000)

  try {
    // Exclude admin emails from all customer-facing counts
    const notAdminFilter = { email: { notIn: ADMIN_FILTER_EMAILS } }

    const [sessions24h, sessions7d, sessions30d, paymentsAll, subs, dbUserCount, dbResumeCount, logins24h, logins7d, recentLogins, newUsers24h, recentUsers] = await Promise.all([
      stripe().checkout.sessions.list({ created: { gte: dayAgo }, limit: 100 }),
      stripe().checkout.sessions.list({ created: { gte: weekAgo }, limit: 100 }),
      stripe().checkout.sessions.list({ created: { gte: monthAgo }, limit: 100 }),
      stripe().paymentIntents.list({ created: { gte: monthAgo }, limit: 100 }),
      stripe().subscriptions.list({ status: 'active', limit: 100 }),
      db.user.count({ where: notAdminFilter }),
      db.savedResume.count(),
      db.magicToken.count({ where: { usedAt: { gte: dayAgoDate }, email: { notIn: ADMIN_FILTER_EMAILS } } }),
      db.magicToken.count({ where: { usedAt: { gte: weekAgoDate }, email: { notIn: ADMIN_FILTER_EMAILS } } }),
      db.magicToken.findMany({
        where: { usedAt: { not: null }, email: { notIn: ADMIN_FILTER_EMAILS } },
        orderBy: { usedAt: 'desc' },
        take: 20,
        select: { email: true, usedAt: true },
      }),
      db.user.count({ where: { createdAt: { gte: dayAgoDate }, ...notAdminFilter } }),
      db.user.findMany({
        where: notAdminFilter,
        orderBy: { createdAt: 'desc' },
        take: 30,
        select: { email: true, name: true, createdAt: true },
      }),
    ])

    const sumPaid = (list: { data: Stripe.Checkout.Session[] }) =>
      list.data.filter(s => s.payment_status === 'paid' || s.status === 'complete')
        .reduce((acc, s) => acc + (s.amount_total ?? 0) / 100, 0)

    const countAtc = (list: { data: Stripe.Checkout.Session[] }) => list.data.length
    const countPaid = (list: { data: Stripe.Checkout.Session[] }) =>
      list.data.filter(s => s.payment_status === 'paid' || s.status === 'complete' || s.mode === 'subscription').length

    const recentPurchases = paymentsAll.data
      .filter(p => p.status === 'succeeded')
      .slice(0, 20)
      .map(p => ({
        id: p.id,
        amount: (p.amount_received ?? p.amount) / 100,
        currency: p.currency.toUpperCase(),
        created: p.created * 1000,
        email: typeof p.receipt_email === 'string' ? p.receipt_email : null,
        description: p.description ?? null,
      }))

    return NextResponse.json({
      atc: {
        last24h: countAtc(sessions24h),
        last7d: countAtc(sessions7d),
        last30d: countAtc(sessions30d),
      },
      purchases: {
        last24h: countPaid(sessions24h),
        last7d: countPaid(sessions7d),
        last30d: countPaid(sessions30d),
      },
      revenue: {
        last24h: sumPaid(sessions24h),
        last7d: sumPaid(sessions7d),
        last30d: sumPaid(sessions30d),
      },
      activeSubscriptions: subs.data.length,
      totals: {
        users: dbUserCount,
        resumes: dbResumeCount,
        leadsOnly: dbUserCount - dbResumeCount,
      },
      logins: {
        last24h: logins24h,
        last7d: logins7d,
        newSignupsLast24h: newUsers24h,
      },
      recentLogins: recentLogins.map(l => ({ email: l.email, at: l.usedAt?.getTime() ?? 0 })),
      recentUsers: recentUsers.map(u => ({
        email: u.email,
        name: u.name,
        at: u.createdAt.getTime(),
      })),
      recentPurchases,
      live: presenceSnapshot(),
      fetchedAt: Date.now(),
    })
  } catch (err) {
    console.error('[admin/metrics]', err)
    const message = err instanceof Error ? err.message : 'Failed to fetch metrics'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
