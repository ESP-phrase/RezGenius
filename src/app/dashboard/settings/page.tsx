import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import SettingsShell from './SettingsShell'

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.email) redirect('/sign-in')

  const user = await db.user.findUnique({ where: { email: session.user.email } })
  if (!user) redirect('/sign-in')

  const resumeCount = await db.savedResume.count({ where: { userId: user.id } })

  return (
    <SettingsShell
      user={{ id: user.id, name: user.name, email: user.email, createdAt: user.createdAt.toISOString() }}
      resumeCount={resumeCount}
    />
  )
}
