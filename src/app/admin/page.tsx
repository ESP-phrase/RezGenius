import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'
import AdminDashboard from './AdminDashboard'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user?.email) redirect('/sign-in?from=/admin')

  if (!isAdmin(session.user.email)) {
    // Friendly "not authorized" page instead of bare 404 — tells admin which
    // email they're signed in as so they can fix the ADMIN_EMAILS allow-list.
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold mb-2">Admin access required</h1>
          <p className="text-stone-400 text-sm mb-1">You&apos;re signed in as:</p>
          <p className="text-amber-400 font-mono text-sm mb-6">{session.user.email}</p>
          <p className="text-stone-500 text-sm mb-8 leading-relaxed">
            This email isn&apos;t on the admin allow-list. Add it to the{' '}
            <code className="bg-stone-800 px-1.5 py-0.5 rounded text-stone-300">ADMIN_EMAILS</code>{' '}
            env var in Vercel and redeploy.
          </p>
          <Link href="/dashboard" className="inline-flex items-center gap-2 bg-stone-800 hover:bg-stone-700 text-stone-100 font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm">
            ← Back to dashboard
          </Link>
        </div>
      </div>
    )
  }

  return <AdminDashboard adminEmail={session.user.email} />
}
