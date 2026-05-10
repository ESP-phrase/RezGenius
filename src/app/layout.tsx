import type { Metadata } from "next";
import { Plus_Jakarta_Sans, DM_Serif_Display } from "next/font/google";
import Providers from "@/components/Providers";
import { PostHogProvider } from "@/components/PostHogProvider";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });
const dmSerif = DM_Serif_Display({ variable: "--font-serif", subsets: ["latin"], weight: ["400"], style: ["normal", "italic"] });

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://resumegenius.guru";

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
        <script dangerouslySetInnerHTML={{ __html: `!function(w,d){if(!w.rdt){var p=w.rdt=function(){p.sendEvent?p.sendEvent.apply(p,arguments):p.callQueue.push(arguments)};p.callQueue=[];var t=d.createElement("script");t.src="https://www.redditstatic.com/ads/pixel.js?pixel_id=a2_izia4ip5nhgn",t.async=!0;var s=d.getElementsByTagName("script")[0];s.parentNode.insertBefore(t,s)}}(window,document);rdt('init','a2_izia4ip5nhgn');rdt('track','PageVisit');` }} />
      </head>
      <body className="min-h-full flex flex-col">
        <PostHogProvider>
          <Providers>{children}</Providers>
        </PostHogProvider>
      </body>
    </html>
  );
}
