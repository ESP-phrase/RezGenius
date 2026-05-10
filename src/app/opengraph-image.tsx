import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'
export const alt = 'ResumeGenius — Build a Resume That Gets You Hired'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0C0A09',
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Background glow */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)',
        }} />

        {/* Logo mark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
          <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="15" fill="rgba(245,158,11,0.15)" />
            <path d="M16 4 L19.5 13.5 L29 16 L19.5 18.5 L16 28 L12.5 18.5 L3 16 L12.5 13.5 Z" fill="#F59E0B" />
          </svg>
          <span style={{ fontSize: '28px', fontWeight: '800', color: '#F5F5F4', letterSpacing: '-0.5px' }}>
            ResumeGenius
          </span>
        </div>

        {/* Headline */}
        <div style={{
          fontSize: '64px',
          fontWeight: '800',
          color: '#F5F5F4',
          lineHeight: 1.05,
          letterSpacing: '-2px',
          maxWidth: '800px',
          marginBottom: '24px',
        }}>
          The resume that finally does you justice.
        </div>

        {/* Subtext */}
        <div style={{
          fontSize: '24px',
          color: '#78716C',
          maxWidth: '700px',
          lineHeight: 1.4,
          marginBottom: '48px',
        }}>
          AI rewrites your bullets into achievements. Polished PDF in minutes.
        </div>

        {/* Pills */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {['Free to build', 'AI-powered', '$24.99/mo'].map((tag) => (
            <div key={tag} style={{
              background: 'rgba(245,158,11,0.1)',
              border: '1px solid rgba(245,158,11,0.3)',
              borderRadius: '100px',
              padding: '8px 20px',
              fontSize: '18px',
              color: '#F59E0B',
              fontWeight: '600',
            }}>
              {tag}
            </div>
          ))}
        </div>

        {/* Bottom domain */}
        <div style={{
          position: 'absolute',
          bottom: '48px',
          right: '80px',
          fontSize: '20px',
          color: '#44403C',
          fontWeight: '600',
        }}>
          resumegenius.guru
        </div>
      </div>
    ),
    { ...size }
  )
}
