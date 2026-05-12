import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const SUPPORT_TO = 'playingq123@gmail.com'

let _resend: Resend | null = null
function resend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY ?? 're_dummy')
  return _resend
}

/**
 * POST /api/support
 * Body: { email: string, message: string, page?: string }
 *
 * Forwards a user support message to playingq123@gmail.com via Resend.
 */
export async function POST(req: Request) {
  try {
    const { email, message, page } = await req.json()
    if (!email || !message) {
      return NextResponse.json({ error: 'Email and message required' }, { status: 400 })
    }
    if (typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const fromAddress = process.env.EMAIL_FROM ?? 'onboarding@resend.dev'
    const ua = req.headers.get('user-agent') ?? 'unknown'
    const referer = req.headers.get('referer') ?? page ?? 'unknown'

    const result = await resend().emails.send({
      from: `ResumeGenius Support <${fromAddress}>`,
      to: SUPPORT_TO,
      replyTo: email,
      subject: `New support request from ${email}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#fff;color:#111;">
          <h2 style="margin:0 0 16px;color:#0f172a;">Support Request</h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
            <tr><td style="padding:6px 0;color:#64748b;width:120px;">From:</td><td><strong>${escapeHtml(email)}</strong></td></tr>
            <tr><td style="padding:6px 0;color:#64748b;">Page:</td><td>${escapeHtml(referer)}</td></tr>
            <tr><td style="padding:6px 0;color:#64748b;">User Agent:</td><td style="color:#94a3b8;font-size:12px;">${escapeHtml(ua)}</td></tr>
          </table>
          <div style="background:#f8fafc;border-left:3px solid #f59e0b;padding:16px;border-radius:6px;">
            <p style="margin:0;color:#0f172a;white-space:pre-wrap;line-height:1.6;">${escapeHtml(message)}</p>
          </div>
          <p style="color:#94a3b8;font-size:12px;margin:20px 0 0;">Reply to this email to respond directly to the user.</p>
        </div>
      `,
    })

    if (result.error) {
      console.error('[support] resend error', result.error)
      return NextResponse.json({ error: result.error.message ?? 'Email send failed' }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[support] error', err)
    const message = err instanceof Error ? err.message : 'Failed to send'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
