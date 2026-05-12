'use client'

import { useRef, useState } from 'react'
import { Camera, X, Loader2, User } from 'lucide-react'

interface Props {
  photoUrl?: string
  onChange: (dataUrl: string | undefined) => void
}

/**
 * Photo uploader for resume personal info section.
 *
 * - Accepts image files (jpg, png, webp)
 * - Resizes client-side to max 400×400 to keep payload small
 * - Stores as base64 data URL (under ~50KB, fits in localStorage + DB)
 * - Round preview tile, click to upload, X to remove
 */
export default function PhotoUploader({ photoUrl, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  async function handleFile(file: File) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setErr('Please pick an image file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setErr('Image must be under 5MB.')
      return
    }
    setLoading(true)
    setErr('')
    try {
      const dataUrl = await resizeAndEncode(file, 400)
      onChange(dataUrl)
    } catch {
      setErr('Could not process image. Try another.')
    }
    setLoading(false)
  }

  function trigger() {
    fileInputRef.current?.click()
  }

  function remove(e: React.MouseEvent) {
    e.stopPropagation()
    onChange(undefined)
  }

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={trigger}
        disabled={loading}
        className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-dashed border-stone-700 hover:border-amber-500/50 bg-stone-900 flex items-center justify-center transition-colors group disabled:opacity-50"
      >
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
        ) : loading ? (
          <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
        ) : (
          <User className="w-7 h-7 text-stone-600 group-hover:text-amber-500 transition-colors" />
        )}
        {photoUrl && (
          <div className="absolute inset-0 bg-stone-950/0 group-hover:bg-stone-950/60 flex items-center justify-center transition-all">
            <Camera className="w-5 h-5 text-stone-100 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        )}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={trigger}
            disabled={loading}
            className="text-amber-500 hover:text-amber-400 text-sm font-medium disabled:opacity-50"
          >
            {photoUrl ? 'Replace photo' : 'Upload photo'}
          </button>
          {photoUrl && (
            <>
              <span className="text-stone-700">·</span>
              <button
                type="button"
                onClick={remove}
                className="text-stone-500 hover:text-red-400 text-sm font-medium inline-flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Remove
              </button>
            </>
          )}
        </div>
        <p className="text-stone-500 text-xs mt-1">JPG / PNG — auto-resized · Optional</p>
        {err && <p className="text-red-400 text-xs mt-1">{err}</p>}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }}
        className="hidden"
      />
    </div>
  )
}

/** Resize image to max dimension and return JPEG data URL */
function resizeAndEncode(file: File, maxDim: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
        const w = Math.round(img.width * scale)
        const h = Math.round(img.height * scale)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('No canvas context'))
        ctx.drawImage(img, 0, 0, w, h)
        // JPEG keeps file size small while still allowing photos
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.onerror = () => reject(new Error('Image load failed'))
      img.src = reader.result as string
    }
    reader.onerror = () => reject(new Error('File read failed'))
    reader.readAsDataURL(file)
  })
}
