/**
 * Admin email allow-list. Comma-separated in env var ADMIN_EMAILS.
 * Example: ADMIN_EMAILS=you@example.com,partner@example.com
 *
 * Falls back to a single dev email so the dashboard works locally.
 */
export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false
  // Hardcoded admin emails — always allowed regardless of env var
  const HARDCODED = ['aubreynicholsacc@gmail.com', 'aubreynicholsaccc@gmail.com']
  const fromEnv = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean)
  const list = [...HARDCODED.map(s => s.toLowerCase()), ...fromEnv]
  return list.includes(email.trim().toLowerCase())
}
