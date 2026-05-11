'use client'

import { useEffect, useRef, useState } from 'react'
import { ttqTrack, ttqIdentify } from '@/lib/ttq'
import { rdtTrack } from '@/lib/rdt'

const SAMPLE_PRODUCT = {
  content_id: 'resumegenius_pro',
  content_type: 'product' as const,
  content_name: 'ResumeGenius Pro',
}

const EVENTS = [
  {
    name: 'ViewContent',
    fire: () => {
      ttqTrack('ViewContent', { contents: [SAMPLE_PRODUCT], value: 29, currency: 'USD' })
    },
  },
  {
    name: 'Search',
    fire: () => {
      ttqTrack('Search', { contents: [SAMPLE_PRODUCT], search_string: 'AI resume builder', currency: 'USD' })
    },
  },
  {
    name: 'AddToWishlist',
    fire: () => {
      ttqTrack('AddToWishlist', { contents: [SAMPLE_PRODUCT], value: 29, currency: 'USD' })
    },
  },
  {
    name: 'AddToCart',
    fire: () => {
      ttqTrack('AddToCart', { contents: [SAMPLE_PRODUCT], value: 29, currency: 'USD' })
      rdtTrack('AddToCart', { currency: 'USD', value: 29, itemCount: 1 })
    },
  },
  {
    name: 'AddPaymentInfo',
    fire: () => {
      ttqTrack('AddPaymentInfo', { contents: [SAMPLE_PRODUCT], value: 29, currency: 'USD' })
    },
  },
  {
    name: 'InitiateCheckout',
    fire: () => {
      ttqTrack('InitiateCheckout', { contents: [SAMPLE_PRODUCT], value: 29, currency: 'USD' })
    },
  },
  {
    name: 'PlaceAnOrder',
    fire: () => {
      ttqTrack('PlaceAnOrder', { contents: [SAMPLE_PRODUCT], value: 29, currency: 'USD' })
    },
  },
  {
    name: 'CompleteRegistration',
    fire: () => {
      ttqTrack('CompleteRegistration', { contents: [SAMPLE_PRODUCT], value: 29, currency: 'USD' })
    },
  },
  {
    name: 'Purchase',
    fire: () => {
      const eid = 'test_' + Date.now()
      ttqTrack('Purchase', { contents: [SAMPLE_PRODUCT], value: 29, currency: 'USD', event_id: eid })
      rdtTrack('Purchase', { currency: 'USD', conversionId: eid })
    },
  },
]

export default function PixelTestPage() {
  const [log, setLog] = useState<{ time: string; event: string }[]>([])
  const autoFiredRef = useRef(false)

  // Auto-fire ALL events on first mount + every 5 seconds for 3 rounds (so TikTok gets multiple samples)
  useEffect(() => {
    if (autoFiredRef.current) return
    autoFiredRef.current = true

    let round = 0
    async function burst() {
      for (const e of EVENTS) {
        try { e.fire() } catch {}
        setLog((prev) => [{ time: new Date().toLocaleTimeString(), event: `${e.name} [r${round + 1}]` }, ...prev].slice(0, 50))
        await new Promise(r => setTimeout(r, 250))
      }
      round++
      if (round < 3) setTimeout(burst, 4000)
    }
    // Wait 1s for ttq script to be fully ready, then start
    const t = setTimeout(burst, 1000)
    return () => clearTimeout(t)
  }, [])

  function fire(name: string, fn: () => void) {
    fn()
    setLog((prev) => [{ time: new Date().toLocaleTimeString(), event: name }, ...prev].slice(0, 50))
  }

  async function fireAll() {
    for (const e of EVENTS) {
      e.fire()
      setLog((prev) => [{ time: new Date().toLocaleTimeString(), event: e.name }, ...prev].slice(0, 50))
      await new Promise(r => setTimeout(r, 200))
    }
  }

  async function fireIdentify() {
    await ttqIdentify({
      email: 'test@resumegenius.guru',
      externalId: 'test_user_123',
    })
    setLog((prev) => [{ time: new Date().toLocaleTimeString(), event: 'ttq.identify (hashed PII)' }, ...prev].slice(0, 50))
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Pixel Test</h1>
        <p className="text-stone-400 text-sm mb-2">
          🔥 <strong className="text-amber-400">Auto-firing all events 3 times</strong> on page load — just sit here for 30 seconds.
        </p>
        <p className="text-stone-500 text-xs mb-8">
          Then check TikTok Events Manager (~30 min delay) or use TikTok Pixel Helper for instant verification.
        </p>

        <div className="flex gap-3 mb-6">
          <button
            onClick={fireAll}
            className="flex-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-3 rounded-xl transition-colors"
          >
            🔥 Fire ALL events again
          </button>
          <button
            onClick={fireIdentify}
            className="px-5 bg-stone-800 hover:bg-stone-700 text-stone-100 font-semibold py-3 rounded-xl transition-colors"
          >
            ttq.identify
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {EVENTS.map((e) => (
            <button
              key={e.name}
              onClick={() => fire(e.name, e.fire)}
              className="bg-stone-900 border border-stone-700 hover:border-amber-500/50 hover:bg-stone-800 text-stone-200 text-sm font-medium py-3 rounded-lg transition-colors"
            >
              {e.name}
            </button>
          ))}
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
          <div className="text-stone-500 text-xs font-semibold uppercase tracking-widest mb-3">
            Fire log <span className="text-amber-500">({log.length})</span>
          </div>
          {log.length === 0 ? (
            <p className="text-stone-600 text-sm">No events fired yet — waiting for auto-fire…</p>
          ) : (
            <ul className="space-y-1.5 font-mono text-xs max-h-96 overflow-y-auto">
              {log.map((entry, i) => (
                <li key={i} className="flex gap-3 text-stone-300">
                  <span className="text-stone-600">{entry.time}</span>
                  <span className="text-amber-400">→ {entry.event}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-6 text-stone-600 text-xs">
          <strong className="text-stone-400">Tip:</strong> Install the{' '}
          <a
            href="https://chromewebstore.google.com/detail/tiktok-pixel-helper/aelgobmabdmlfmiklcamdkedjpjnlusf"
            target="_blank"
            rel="noopener"
            className="text-amber-500 hover:text-amber-400 underline"
          >
            TikTok Pixel Helper
          </a>{' '}
          to see events live without waiting 30 min.
        </div>
      </div>
    </div>
  )
}
