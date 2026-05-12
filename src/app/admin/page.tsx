import { redirect, notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'
import AdminDashboard from './AdminDashboard'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user?.email) redirect('/sign-in?from=/admin')
  if (!isAdmin(session.user.email)) notFound()
  return <AdminDashboard adminEmail={session.user.email} />
}
