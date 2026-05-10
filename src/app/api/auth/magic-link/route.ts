import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { db } from '@/lib/db'

let _resend: Resend | null = null
function resend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY ?? 're_dummy')
  return _resend
}

export async function POST(req: Request) {
  let stage = 'init'
  try {
    console.log('[magic-link] start', {
      hasResendKey: !!process.env.RESEND_API_KEY,
      resendKeyPrefix: process.env.RESEND_API_KEY?.slice(0, 5) ?? 'none',
      emailFrom: process.env.EMAIL_FROM ?? 'missing',
    })

    stage = 'parse-body'
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    console.log('[magic-link] email received', email)

    stage = 'db-upsert-user'
    await db.user.upsert({
      where: { email },
      update: {},
      create: { email },
    })

    stage = 'db-create-token'
    const token = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
    await db.magicToken.create({ data: { email, token, expiresAt } })

    const baseUrl = new URL(req.url).origin
    const link = `${baseUrl}/api/auth/magic-link/verify?token=${token}`
    const fromAddress = process.env.EMAIL_FROM ?? 'onboarding@resend.dev'

    stage = 'resend-send'
    console.log('[magic-link] sending via resend', { from: fromAddress, to: email })
    const result = await resend().emails.send({
      from: `ResumeGenius <${fromAddress}>`,
      to: email,
      subject: 'Your sign-in link for ResumeGenius',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:40px 24px;background:#fff;">
          <div style="margin-bottom:32px;">
            <span style="font-size:22px;font-weight:800;color:#0f172a;letter-spacing:-0.5px;">ResumeGenius</span>
          </div>
          <h1 style="font-size:20px;font-weight:700;color:#0f172a;margin:0 0 8px;">Your magic sign-in link</h1>
          <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0 0 28px;">
            Click the button below to sign in. This link expires in <strong>10 minutes</strong> and can only be used once.
          </p>
          <a href="${link}" style="display:inline-block;background:#10b981;color:#fff;font-weight:700;font-size:15px;padding:14px 28px;border-radius:10px;text-decoration:none;">
            Sign in to ResumeGenius
          </a>
          <p style="color:#94a3b8;font-size:12px;margin:28px 0 0;line-height:1.5;">
            If you didn't request this, you can safely ignore this email.<br/>
            Or copy this link: <span style="color:#64748b;">${link}</span>
          </p>
        </div>
      `,
    })

    console.log('[magic-link] resend result', JSON.stringify(result))
    if (result.error) {
      return NextResponse.json({ error: result.error.message ?? 'Resend error', detail: result.error }, { status: 500 })
    }

    return NextResponse.json({ ok: true, id: result.data?.id })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[magic-link] FAILED at stage:', stage, '— error:', message, err)
    return NextResponse.json({ error: message, stage }, { status: 500 })
  }
}
