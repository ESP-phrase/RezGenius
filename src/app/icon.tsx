import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

/**
 * Browser tab favicon (32x32). Spark mark on dark amber-tinted background.
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0C0A09',
          borderRadius: 7,
        }}
      >
        <svg viewBox="0 0 32 32" width="28" height="28" fill="none">
          <circle cx="16" cy="16" r="15" fill="#F59E0B" fillOpacity="0.18" />
          <path d="M16 4 L19.5 13.5 L29 16 L19.5 18.5 L16 28 L12.5 18.5 L3 16 L12.5 13.5 Z" fill="#F59E0B" />
          <path d="M16 8 L18.2 14.8 L24 16 L18.2 17.2 L16 24 L13.8 17.2 L8 16 L13.8 14.8 Z" fill="#FDE68A" fillOpacity="0.6" />
        </svg>
      </div>
    ),
    { ...size }
  )
}
