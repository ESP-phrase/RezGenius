import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Serif_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Providers from "@/components/Providers";
import { PostHogProvider } from "@/components/PostHogProvider";
import PixelIdentify from "./PixelIdentify";
import ClarityInit from "./ClarityInit";
import SupportWidget from "./SupportWidget";
import HeartbeatPing from "./HeartbeatPing";
import AttributionTracker from "./AttributionTracker";
import AdminOptOut from "./AdminOptOut";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
const dmSerif = DM_Serif_Display({ variable: "--font-serif", subsets: ["latin"], weight: ["400"], style: ["normal", "italic"] });

// Always provide a valid URL so local builds (without NEXT_PUBLIC_APP_URL) don't crash
const RAW = process.env.NEXT_PUBLIC_APP_URL?.trim();
const APP_URL = RAW && RAW.startsWith('http') ? RAW : 'https://resumegenius.guru';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "ResumeGenius — Build a Resume That Gets You Hired",
    template: "%s | ResumeGenius",
  },
  description: "ResumeGenius rewrites your resume into achievement-focused language and exports a polished PDF in minutes. Used by professionals at Google, Stripe, Airbnb and more.",
  keywords: ["resume builder", "AI resume", "resume writer", "professional resume", "ATS resume", "resume PDF", "free resume builder"],
  authors: [{ name: "ResumeGenius" }],
  creator: "ResumeGenius",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    siteName: "ResumeGenius",
    title: "ResumeGenius — Build a Resume That Gets You Hired",
    description: "Rewrites your experience into language that gets responses. Polished PDF in minutes.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "ResumeGenius" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ResumeGenius — Build a Resume That Gets You Hired",
    description: "Rewrites your experience into language that gets responses. Polished PDF in minutes.",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${dmSerif.variable} font-sans h-full antialiased`}>
      <head>
        {/* Reddit Pixel */}
        <script dangerouslySetInnerHTML={{ __html: `!function(w,d){if(!w.rdt){var p=w.rdt=function(){p.sendEvent?p.sendEvent.apply(p,arguments):p.callQueue.push(arguments)};p.callQueue=[];var t=d.createElement("script");t.src="https://www.redditstatic.com/ads/pixel.js?pixel_id=a2_izia4ip5nhgn",t.async=!0;var s=d.getElementsByTagName("script")[0];s.parentNode.insertBefore(t,s)}}(window,document);rdt('init','a2_izia4ip5nhgn');rdt('track','PageVisit');` }} />
        {/* TikTok Pixel */}
        <script dangerouslySetInnerHTML={{ __html: `!function (w, d, t) {w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};ttq.load('D80TPOJC77UCEH8TAV3G');ttq.page();}(window, document, 'ttq');` }} />
      </head>
      <body className="min-h-full flex flex-col">
        <AdminOptOut />
        <ClarityInit />
        <PixelIdentify />
        <HeartbeatPing />
        <AttributionTracker />
        <PostHogProvider>
          <Providers>{children}</Providers>
        </PostHogProvider>
        <SupportWidget />
        <Analytics />
      </body>
    </html>
  );
}
