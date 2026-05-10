import Link from 'next/link'
import { CheckCircle, Star, ArrowRight } from 'lucide-react'
import { Logo } from '@/components/Logo'
import HomeDemoSection from './HomeDemoSection'
import ExitIntent from './ExitIntent'
import StickyBar from './StickyBar'

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'ResumeGenius',
  url: process.env.NEXT_PUBLIC_APP_URL ?? 'https://resumegenius.guru',
  description: 'ResumeGenius rewrites your resume into achievement-focused language and exports a polished PDF in minutes.',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '29', priceCurrency: 'USD' },
  aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '2100' },
}

function ResumeMockup() {
  return (
    <div className="bg-[#FAF9F6] rounded-xl shadow-2xl p-6 w-full max-w-sm text-[10px] font-sans border border-stone-200">
      <div className="flex items-start gap-3 mb-4 pb-4 border-b border-stone-200">
        <div className="w-9 h-9 rounded-full bg-stone-200 flex items-center justify-center flex-shrink-0">
          <span className="text-stone-500 font-bold text-sm">AJ</span>
        </div>
        <div>
          <div className="font-bold text-stone-800 text-sm">Alex Johnson</div>
          <div className="text-stone-400">alex@email.com · San Francisco, CA</div>
          <div className="text-stone-400">linkedin.com/in/alexjohnson</div>
        </div>
      </div>
      <div className="mb-3">
        <div className="text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-1">Experience</div>
        <div className="font-semibold text-stone-700">Senior Product Manager</div>
        <div className="text-stone-400 mb-1">Stripe · 2021 – Present</div>
        <div className="space-y-1">
          {['Grew checkout conversion by 31%, adding $4.2M ARR', 'Led 6-engineer team shipping payments in 12 markets', 'Reduced support tickets 44% via self-serve onboarding'].map((b) => (
            <div key={b} className="flex gap-1 text-stone-600">
              <span className="text-amber-500 mt-0.5 flex-shrink-0">•</span>
              <span>{b}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mb-3">
        <div className="text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-1">Education</div>
        <div className="font-semibold text-stone-700">B.S. Computer Science</div>
        <div className="text-stone-400">UC Berkeley · 2019</div>
      </div>
      <div>
        <div className="text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-1">Skills</div>
        <div className="flex flex-wrap gap-1">
          {['Product Strategy', 'SQL', 'Python', 'A/B Testing', 'Figma'].map((s) => (
            <span key={s} className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[9px]">{s}</span>
          ))}
        </div>
      </div>
      <div className="mt-4 bg-amber-500 text-stone-950 rounded-lg px-3 py-2 flex items-center gap-2">
        <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3 flex-shrink-0"><path d="M6 1l1.2 3.6H11L8.1 6.8l1.2 3.6L6 8.2 2.7 10.4l1.2-3.6L1 4.6h3.8L6 1z" fill="currentColor"/></svg>
        <span className="text-[9px] font-semibold">12 bullets rewritten</span>
      </div>
    </div>
  )
}

const testimonials = [
  { name: 'Marcus T.', role: 'Software Engineer', text: 'Rewrote my bullets from vague descriptions into real achievements. Got 3 interviews in the first week after sending it out.' },
  { name: 'Priya S.', role: 'Marketing Manager', text: 'Was skeptical, but it actually made mine significantly better. Hired within 2 weeks of using it.' },
  { name: 'Jordan K.', role: 'Data Analyst', text: "Spent years struggling to describe my impact in words. This figured it out in seconds. Don't know why I waited so long." },
]

const logos = ['Google', 'Stripe', 'Airbnb', 'Microsoft', 'Meta', 'Netflix', 'Shopify', 'Figma', 'Uber', 'Notion']

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen bg-stone-950">

        {/* Nav */}
        <nav className="border-b border-stone-800/60 px-4 sm:px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
          <Logo size="lg" />
          <div className="flex items-center gap-3 sm:gap-6">
            <Link href="/pricing" className="hidden sm:inline text-stone-500 hover:text-stone-200 text-sm transition-colors">Pricing</Link>
            <Link href="/sign-in" className="text-stone-500 hover:text-stone-200 text-sm transition-colors">Sign In</Link>
            <Link href="/start">
              <button className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-lg transition-colors whitespace-nowrap">
                Build My Resume
              </button>
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="px-4 sm:px-6 pt-12 sm:pt-20 pb-16 sm:pb-24">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
            <div className="text-center md:text-left order-2 md:order-1">
              <div className="inline-flex items-center gap-2 border border-stone-700 text-stone-400 text-[11px] sm:text-xs font-medium px-3 py-1.5 rounded-full mb-6 sm:mb-8">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                Used by professionals at Google, Stripe &amp; more
              </div>
              <h1 className="text-[36px] sm:text-[44px] md:text-[52px] leading-[1.08] font-normal text-stone-100 mb-5 sm:mb-6" style={{ fontFamily: 'var(--font-serif)' }}>
                The resume that<br />
                <em style={{ fontStyle: 'italic', color: '#FBBF24' }}>finally does you justice</em>
              </h1>
              <p className="text-stone-400 text-base sm:text-lg mb-8 sm:mb-10 leading-relaxed md:max-w-md mx-auto md:mx-0">
                You&apos;re more impressive than your current resume shows. ResumeGenius rewrites your experience into language that gets responses — polished PDF in minutes.
              </p>
              <div className="flex flex-col sm:flex-row items-center md:items-center md:justify-start gap-4 sm:gap-5 mb-10 sm:mb-12">
                <Link href="/start" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-base px-7 py-3.5 rounded-lg transition-colors">
                    Build My Resume <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <span className="text-stone-600 text-sm">Free to build · Pay to download</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-4 sm:gap-8">
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-stone-100">5 min</div>
                  <div className="text-stone-500 text-[10px] sm:text-xs mt-0.5">average to finish</div>
                </div>
                <div className="w-px h-8 bg-stone-800" />
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-stone-100">4.9★</div>
                  <div className="text-stone-500 text-[10px] sm:text-xs mt-0.5">2,100+ users</div>
                </div>
                <div className="w-px h-8 bg-stone-800" />
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-stone-100">$1</div>
                  <div className="text-stone-500 text-[10px] sm:text-xs mt-0.5">7-day trial</div>
                </div>
              </div>
            </div>
            <div className="flex justify-center order-1 md:order-2">
              <ResumeMockup />
            </div>
          </div>
        </section>

        {/* Logos marquee */}
        <section className="relative border-y border-stone-800/60 py-10 overflow-hidden bg-stone-900/40">
          <div className="flex items-center justify-center gap-3 mb-7">
            <div className="h-px w-10 bg-stone-700" />
            <span className="text-stone-600 text-[10px] font-semibold uppercase tracking-[0.25em]">Trusted by professionals at</span>
            <div className="h-px w-10 bg-stone-700" />
          </div>
          <div className="relative flex overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-r from-stone-950 to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-l from-stone-950 to-transparent pointer-events-none" />
            {[0, 1].map(track => (
              <div key={track} className="flex animate-marquee items-center shrink-0" aria-hidden={track === 1}>
                {logos.map((co, i) => (
                  <span key={i} className="inline-flex items-center flex-shrink-0 px-8">
                    <span className="text-stone-500 font-medium text-sm tracking-wide">{co}</span>
                    <span className="text-stone-700 text-sm select-none ml-8">·</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 sm:py-28 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-10 sm:mb-16">
              <div className="text-amber-500 text-xs font-semibold uppercase tracking-[0.2em] mb-3 sm:mb-4">How It Works</div>
              <h2 className="text-3xl sm:text-4xl text-stone-100" style={{ fontFamily: 'var(--font-serif)' }}>
                Done in the time it takes<br /><em style={{ fontStyle: 'italic' }}>to make coffee</em>
              </h2>
            </div>
            <div className="space-y-0">
              {[
                { n: '01', title: 'Tell us about your work', desc: 'Add your roles, responsibilities, and education. Bullet points don\'t need to be polished — rough notes are fine.' },
                { n: '02', title: 'We rewrite it', desc: 'Click ✦ on any bullet and watch it become a specific, quantified achievement that recruiters actually stop to read.' },
                { n: '03', title: 'Download and apply', desc: 'Pay once and get a clean, perfectly formatted PDF. No subscription trap — just your resume, ready to go.' },
              ].map((s, idx) => (
                <div key={s.n} className={`flex gap-5 sm:gap-10 py-7 sm:py-10 ${idx < 2 ? 'border-b border-stone-800/60' : ''}`}>
                  <div className="text-[36px] sm:text-[56px] font-bold leading-none text-stone-800 w-12 sm:w-20 flex-shrink-0 select-none" style={{ fontFamily: 'var(--font-serif)' }}>{s.n}</div>
                  <div className="pt-1 sm:pt-2">
                    <h3 className="text-lg sm:text-xl font-semibold text-stone-200 mb-2">{s.title}</h3>
                    <p className="text-sm sm:text-base text-stone-500 leading-relaxed max-w-lg">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-12">
              <Link href="/start">
                <button className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-7 py-3.5 rounded-lg transition-colors">
                  Start Now <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Before / After */}
        <section className="py-16 sm:py-28 px-4 sm:px-6 bg-stone-900/40 border-y border-stone-800/60">
          <div className="max-w-4xl mx-auto">
            <div className="mb-10 sm:mb-16">
              <div className="text-amber-500 text-xs font-semibold uppercase tracking-[0.2em] mb-3 sm:mb-4">The Difference</div>
              <h2 className="text-3xl sm:text-4xl text-stone-100" style={{ fontFamily: 'var(--font-serif)' }}>
                What your bullets look like<br /><em style={{ fontStyle: 'italic' }}>before and after</em>
              </h2>
              <p className="text-stone-500 mt-4 max-w-lg text-sm sm:text-base">This is the actual output — no cherry picking. Every bullet gets the same treatment.</p>
            </div>
            <div className="space-y-6">
              {[
                {
                  before: 'Managed a team of engineers and worked on the backend system',
                  after: 'Led a 5-person engineering team that rebuilt the core backend, cutting API response times by 62% and eliminating a $40K/month infrastructure bottleneck',
                },
                {
                  before: 'Helped with marketing campaigns and social media',
                  after: 'Owned social media strategy across 4 platforms, growing combined following by 84K in 6 months and contributing to a 3× increase in inbound leads',
                },
                {
                  before: 'Responsible for customer support and improving satisfaction',
                  after: 'Redesigned the support workflow from scratch, reducing average resolution time from 3 days to 4 hours and lifting CSAT scores from 71% to 94%',
                },
              ].map((item, i) => (
                <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 sm:p-5">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-stone-600 mb-3">Before</div>
                    <p className="text-stone-500 text-sm leading-relaxed">{item.before}</p>
                  </div>
                  <div className="bg-stone-900 border border-amber-500/20 rounded-xl p-4 sm:p-5 relative">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-3">After</div>
                    <p className="text-stone-300 text-sm leading-relaxed">{item.after}</p>
                    <div className="absolute top-4 right-4">
                      <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3 text-amber-500"><path d="M6 1l1.2 3.6H11L8.1 6.8l1.2 3.6L6 8.2 2.7 10.4l1.2-3.6L1 4.6h3.8L6 1z" fill="currentColor"/></svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-stone-600 text-sm mt-8">Results vary by role and input quality. The more detail you give, the better the output.</p>
          </div>
        </section>

        {/* Live Demo */}
        <HomeDemoSection />

        {/* Features */}
        <section className="py-16 sm:py-28 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-10 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl text-stone-100" style={{ fontFamily: 'var(--font-serif)' }}>Built differently</h2>
              <p className="text-stone-500 mt-3 text-sm sm:text-base">Most resume tools want you to do the work. We do it for you.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
              {[
                { label: 'Writes like a human', desc: 'The rewritten bullets sound like a senior recruiter wrote them — specific, confident, and free of filler words.' },
                { label: 'Clears the filters', desc: 'Laid out and worded to pass the automated screening most companies run before a human sees anything.' },
                { label: 'PDF in seconds', desc: 'Clean layout that prints perfectly, uploads correctly, and looks exactly how it should every time.' },
              ].map((f, i) => (
                <div key={f.label} className="border-t border-stone-700 pt-6">
                  <div className="text-amber-500/40 text-xs font-bold mb-4">0{i + 1}</div>
                  <h3 className="font-semibold text-stone-200 mb-2 text-base">{f.label}</h3>
                  <p className="text-sm text-stone-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who it's for */}
        <section className="py-16 sm:py-28 px-4 sm:px-6 bg-stone-900/40 border-y border-stone-800/60">
          <div className="max-w-4xl mx-auto">
            <div className="mb-10 sm:mb-16">
              <div className="text-amber-500 text-xs font-semibold uppercase tracking-[0.2em] mb-3 sm:mb-4">Who It&apos;s For</div>
              <h2 className="text-3xl sm:text-4xl text-stone-100" style={{ fontFamily: 'var(--font-serif)' }}>
                Works for wherever<br /><em style={{ fontStyle: 'italic' }}>you are in your career</em>
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {[
                {
                  title: 'Recent graduates',
                  desc: "You don't have decades of experience — but you do have projects, internships, and coursework that matter. We help you frame them the way hiring managers actually want to see them.",
                  tag: 'First job · Internship → full-time',
                },
                {
                  title: 'Career changers',
                  desc: "Switching industries means your past experience needs to be repositioned, not buried. We translate what you've done into language that makes sense for where you're going.",
                  tag: 'Industry switch · New field',
                },
                {
                  title: 'Senior professionals',
                  desc: "Years of experience is an asset — if it's written well. We help you cut the noise, sharpen the impact, and present a decade of work in a page that actually reads.",
                  tag: '10+ years · Leadership roles',
                },
                {
                  title: 'Anyone who hates writing about themselves',
                  desc: "Most people are great at their jobs and terrible at describing them. You paste in what you did. We handle the words. That's the whole deal.",
                  tag: 'Just about everyone',
                },
              ].map((card) => (
                <div key={card.title} className="border border-stone-800 rounded-xl p-7 hover:border-stone-700 transition-colors">
                  <span className="inline-block text-[10px] font-semibold uppercase tracking-widest text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-full mb-4">{card.tag}</span>
                  <h3 className="text-lg font-semibold text-stone-200 mb-2">{card.title}</h3>
                  <p className="text-stone-500 text-sm leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16 sm:py-28 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-10 sm:mb-16">
              <div className="flex items-center gap-2 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                <span className="text-stone-400 text-sm ml-1 font-medium">4.9 · 2,100+ reviews</span>
              </div>
              <h2 className="text-3xl sm:text-4xl text-stone-100" style={{ fontFamily: 'var(--font-serif)' }}>People are getting hired</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
              {testimonials.map((t) => (
                <div key={t.name} className="bg-stone-900/60 border border-stone-800/60 rounded-xl p-6">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-stone-400 text-sm leading-relaxed mb-5">&ldquo;{t.text}&rdquo;</p>
                  <div>
                    <div className="font-semibold text-stone-300 text-sm">{t.name}</div>
                    <div className="text-stone-600 text-xs mt-0.5">{t.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 sm:py-28 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="mb-10 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl text-stone-100" style={{ fontFamily: 'var(--font-serif)' }}>Questions people ask<br /><em style={{ fontStyle: 'italic' }}>before they try it</em></h2>
            </div>
            <div className="space-y-0">
              {[
                {
                  q: 'Will it sound like AI wrote it?',
                  a: "No — and that's the point. The rewrites are trained to sound like a strong human writer, not a language model. Specific numbers, active verbs, no buzzwords. If it sounds robotic, rerun it.",
                },
                {
                  q: "What if I don't have metrics or numbers?",
                  a: "Give us what you have. We'll work with context — team size, scope, timeline, outcomes. You don't need a spreadsheet. You just need to describe what you actually did.",
                },
                {
                  q: 'Is it really free to build?',
                  a: 'Yes. You can build, edit, and preview your entire resume for free. You only pay when you want to download the PDF. No trial periods, no hidden paywalls.',
                },
                {
                  q: 'What format does the PDF come in?',
                  a: 'Standard letter size PDF, formatted for both digital submission and printing. Compatible with every job application system we\'ve tested.',
                },
                {
                  q: 'How long does it actually take?',
                  a: 'Most people finish in under 10 minutes. If you have your work history handy, closer to 5. The AI handles the slow part — writing.',
                },
                {
                  q: 'Can I edit the rewrites?',
                  a: "Completely. Every bullet is editable. The AI gives you a strong starting point — you have full control over the final version. It's your resume.",
                },
              ].map((item, i, arr) => (
                <div key={item.q} className={`py-8 ${i < arr.length - 1 ? 'border-b border-stone-800/60' : ''}`}>
                  <h3 className="text-stone-200 font-semibold mb-3">{item.q}</h3>
                  <p className="text-stone-500 text-sm leading-relaxed max-w-2xl">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-16 sm:py-28 px-4 sm:px-6 bg-stone-900/40 border-y border-stone-800/60">
          <div className="max-w-3xl mx-auto">
            <div className="mb-10 sm:mb-14">
              <h2 className="text-3xl sm:text-4xl text-stone-100" style={{ fontFamily: 'var(--font-serif)' }}>Try it for $1.</h2>
              <p className="text-stone-500 mt-3 text-sm sm:text-base">7-day trial, then $29/mo. Cancel anytime.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 text-left">
              <div className="border-2 border-amber-500/60 rounded-xl p-6 sm:p-8 space-y-5 relative bg-amber-500/5">
                <div className="absolute top-5 right-5 bg-amber-500 text-stone-950 text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide">BEST VALUE</div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-bold text-stone-100">$1<span className="text-base font-normal text-stone-500">/7 days</span></div>
                  </div>
                  <div className="font-semibold text-stone-300 mt-1">Try Pro — then $29/mo</div>
                </div>
                <ul className="space-y-2.5">
                  {['Unlimited PDF downloads', 'Unlimited AI rewrites', 'AI Generate from prompt', 'All 6 templates', 'Cancel anytime'].map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-stone-300">
                      <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
                <Link href="/pricing">
                  <button className="w-full mt-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm py-2.5 rounded-lg transition-colors">
                    Try $1 for 7 days
                  </button>
                </Link>
              </div>
              <div className="border border-stone-800 rounded-xl p-6 sm:p-8 space-y-5">
                <div>
                  <div className="text-3xl font-bold text-stone-100">$149<span className="text-base font-normal text-stone-500"> once</span></div>
                  <div className="font-semibold text-stone-300 mt-1">Lifetime — pay once</div>
                </div>
                <ul className="space-y-2.5">
                  {['Everything in Pro', 'No recurring charges', 'All future updates', 'Lifetime priority support', 'Yours forever'].map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-stone-400">
                      <CheckCircle className="w-4 h-4 text-stone-600 flex-shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
                <Link href="/pricing">
                  <button className="w-full mt-2 border border-stone-700 text-stone-300 hover:bg-stone-800 font-semibold text-sm py-2.5 rounded-lg transition-colors">
                    Get Lifetime
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-28 px-6">
          <div className="max-w-2xl mx-auto text-center px-4 sm:px-6">
            <h2 className="text-3xl sm:text-5xl text-stone-100 mb-5 leading-tight" style={{ fontFamily: 'var(--font-serif)' }}>
              Stop sending the resume<br /><em style={{ fontStyle: 'italic', color: '#FBBF24' }}>that&apos;s costing you interviews</em>
            </h2>
            <p className="text-stone-500 mb-8 sm:mb-10 text-sm sm:text-base leading-relaxed">It takes 5 minutes. Your next job is waiting.</p>
            <Link href="/start">
              <button className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-base px-8 sm:px-10 py-3.5 sm:py-4 rounded-lg transition-colors">
                Build My Resume for Free <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-stone-800/60 px-4 sm:px-6 py-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
            <Logo size="sm" />
            <span className="text-stone-700 text-xs sm:text-sm order-3 sm:order-2">© {new Date().getFullYear()} ResumeGenius</span>
            <div className="flex gap-5 sm:gap-6 text-stone-600 text-xs sm:text-sm order-2 sm:order-3">
              <Link href="/privacy" className="hover:text-stone-300 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-stone-300 transition-colors">Terms</Link>
              <a href="mailto:support@resumegenius.guru" className="hover:text-stone-300 transition-colors">Contact</a>
            </div>
          </div>
        </footer>

      </main>
      <ExitIntent />
      <StickyBar />
    </>
  )
}
