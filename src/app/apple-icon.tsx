import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

/**
 * Apple touch icon — used when iOS users "Add to Home Screen" on Safari.
 * 180x180 is the recommended size. No transparency (iOS adds the rounded
 * corners + gloss automatically).
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1C1917 0%, #0C0A09 100%)',
        }}
      >
        {/* Outer glow circle */}
        <div
          style={{
            width: 160,
            height: 160,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(245,158,11,0.25) 0%, rgba(245,158,11,0) 70%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg viewBox="0 0 32 32" width="140" height="140" fill="none">
            <circle cx="16" cy="16" r="15" fill="#F59E0B" fillOpacity="0.2" />
            <path d="M16 4 L19.5 13.5 L29 16 L19.5 18.5 L16 28 L12.5 18.5 L3 16 L12.5 13.5 Z" fill="#F59E0B" />
            <path d="M16 8 L18.2 14.8 L24 16 L18.2 17.2 L16 24 L13.8 17.2 L8 16 L13.8 14.8 Z" fill="#FDE68A" fillOpacity="0.6" />
          </svg>
        </div>
      </div>
    ),
    { ...size }
  )
}
