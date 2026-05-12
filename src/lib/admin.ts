/**
 * Admin email allow-list. Comma-separated in env var ADMIN_EMAILS.
 * Example: ADMIN_EMAILS=you@example.com,partner@example.com
 *
 * Falls back to a single dev email so the dashboard works locally.
 */
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  const list = (process.env.ADMIN_EMAILS ?? 'aubreynicholsaccc@gmail.com')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean)
  return list.includes(email.trim().toLowerCase())
}
