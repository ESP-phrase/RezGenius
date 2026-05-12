import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@react-pdf/renderer'],

  // PostHog reverse proxy — bypasses ad-blockers that strip third-party
  // scripts. PostHog SDK calls go to /ingest on our domain, then we
  // proxy them transparently to PostHog. Catches ~30% more sessions.
  // Docs: https://posthog.com/docs/advanced/proxy/nextjs
  async rewrites() {
    return [
      { source: '/ingest/static/:path*', destination: 'https://us-assets.i.posthog.com/static/:path*' },
      { source: '/ingest/:path*',        destination: 'https://us.i.posthog.com/:path*' },
      { source: '/ingest/decide',        destination: 'https://us.i.posthog.com/decide' },
    ]
  },
  // PostHog requires this so /ingest/decide can be hit cross-origin
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
