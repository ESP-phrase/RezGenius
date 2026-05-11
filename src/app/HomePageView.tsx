'use client'

import { useEffect } from 'react'
import { ttqTrack } from '@/lib/ttq'

/**
 * Fires TikTok ViewContent on homepage load to populate the top of funnel.
 * Required for TikTok's vertical funnel optimization to work properly.
 */
export default function HomePageView() {
  useEffect(() => {
    ttqTrack('ViewContent', {
      contents: [
        { content_id: 'resumegenius_home', content_type: 'product', content_name: 'ResumeGenius AI Resume Builder' },
      ],
      currency: 'USD',
    })
  }, [])
  return null
}
