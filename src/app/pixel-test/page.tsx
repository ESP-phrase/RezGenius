'use client'

import { useState } from 'react'
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

  function fire(name: string, fn: () => void) {
    fn()
    setLog((prev) => [{ time: new Date().toLocaleTimeString(), event: name }, ...prev].slice(0, 20))
  }

  async function fireAll() {
    for (const e of EVENTS) {
      e.fire()
      setLog((prev) => [{ time: new Date().toLocaleTimeString(), event: e.name }, ...prev].slice(0, 20))
      await new Promise(r => setTimeout(r, 200))
    }
  }

  async function fireIdentify() {
    await ttqIdentify({
      email: 'test@resumegenius.guru',
      externalId: 'test_user_123',
    })
    setLog((prev) => [{ time: new Date().toLocaleTimeString(), event: 'ttq.identify (hashed PII)' }, ...prev].slice(0, 20))
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Pixel Test</h1>
        <p className="text-stone-400 text-sm mb-8">
          Click a button to fire that event to TikTok + Reddit pixels. Check your TikTok Events Manager
          (allow ~30 min for data to appear), or use TikTok Pixel Helper / Reddit Pixel Helper Chrome extensions
          for instant verification.
        </p>

        <div className="flex gap-3 mb-6">
          <button
            onClick={fireAll}
            className="flex-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-3 rounded-xl transition-colors"
          >
            🔥 Fire ALL events
          </button>
          <button
            onClick={fireIdentify}
            className="px-5 bg-stone-800 hover:bg-stone-700 text-stone-100 font-semibold py-3 rounded-xl transition-colors"
          >
            ttq.identify (PII match)
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
          <div className="text-stone-500 text-xs font-semibold uppercase tracking-widest mb-3">Fire log</div>
          {log.length === 0 ? (
            <p className="text-stone-600 text-sm">No events fired yet.</p>
          ) : (
            <ul className="space-y-1.5 font-mono text-xs">
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
          and the{' '}
          <a
            href="https://chromewebstore.google.com/detail/reddit-pixel-helper/jhmaepacfgcmpgbafhgaopkfehljpkfm"
            target="_blank"
            rel="noopener"
            className="text-amber-500 hover:text-amber-400 underline"
          >
            Reddit Pixel Helper
          </a>{' '}
          to see events live without waiting 30 min.
        </div>
      </div>
    </div>
  )
}
