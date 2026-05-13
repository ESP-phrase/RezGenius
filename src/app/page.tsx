import Link from 'next/link'
import { CheckCircle, Star, ArrowRight, Play, Sparkles, Shield, FileText, Lock, Clock, DollarSign, ChevronDown } from 'lucide-react'
import { Logo } from '@/components/Logo'
import HomeDemoSection from './HomeDemoSection'
import StickyBar from './StickyBar'
import HomePageView from './HomePageView'
import { BuildResumeButton, SeeHowItWorksButton, NavBuildButton, FinalCTAButton, SparkleCTAButton } from './HomeCTA'
import PopupAB from './PopupAB'
import HeroEmailCapture from './HeroEmailCapture'
import HeroMockupSlot from './HeroMockupSlot'

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

type IconComponent = React.ComponentType<{ className?: string; strokeWidth?: number; fill?: string }>

function Stat({ icon: Icon, value, label, caps }: { icon: IconComponent; value: string; label: string; caps?: boolean }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-amber-400" />
      </div>
      <div className="min-w-0">
        <div className="text-stone-100 text-base sm:text-lg font-extrabold leading-tight">{value}</div>
        <div className={`text-stone-500 text-[10px] sm:text-[11px] leading-tight mt-0.5 ${caps ? 'uppercase tracking-wider font-semibold' : ''}`}>{label}</div>
      </div>
    </div>
  )
}

function FeatureBlock({ icon: Icon, title, desc }: { icon: IconComponent; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-amber-400" />
      </div>
      <div>
        <h3 className="text-stone-100 font-bold text-base mb-1.5">{title}</h3>
        <p className="text-stone-500 text-xs sm:text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

function AtsScore({ value = 96 }: { value?: number }) {
  // 56px circle with circular progress ring
  const r = 24
  const c = 2 * Math.PI * r
  const dash = (value / 100) * c
  return (
    <div className="relative w-14 h-14 flex-shrink-0">
      <svg viewBox="0 0 56 56" className="w-full h-full -rotate-90">
        <circle cx="28" cy="28" r={r} fill="none" stroke="#E5E7EB" strokeWidth="4" />
        <circle cx="28" cy="28" r={r} fill="none" stroke="#10B981" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${dash} ${c}`} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[14px] font-extrabold text-emerald-600 leading-none">{value}</span>
      </div>
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[7px] font-bold uppercase tracking-widest text-emerald-700 whitespace-nowrap">ATS Score</div>
    </div>
  )
}

function ResumeMockup() {
  return (
    <div className="relative w-full max-w-[280px] sm:max-w-sm md:max-w-md mx-auto">
      {/* Soft amber glow halo behind the device */}
      <div className="absolute inset-0 -m-10 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />
      {/* Outer dark frame */}
      <div className="relative bg-stone-900 border border-stone-800 rounded-3xl p-3 shadow-[0_20px_80px_-15px_rgba(245,158,11,0.25)]">
        {/* Inner resume */}
        <div className="bg-[#FAF9F6] rounded-2xl p-6 text-[10px] font-sans">
          {/* Header with avatar + contact + ATS */}
          <div className="flex items-start gap-3 mb-4 pb-4 border-b border-stone-200">
            <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center flex-shrink-0">
              <span className="text-stone-500 font-bold text-sm">AJ</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-stone-800 text-sm">Alex Johnson</div>
              <div className="text-stone-400 text-[10px] mt-0.5">San Francisco, CA · alex@email.com</div>
              <div className="text-amber-600 text-[10px] font-medium">linkedin.com/in/alexjohnson</div>
            </div>
            <AtsScore value={96} />
          </div>
          {/* Experience */}
          <div className="mb-4">
            <div className="text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-2">Experience</div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-stone-800">Senior Product Manager</span>
              <span className="text-stone-400">•</span>
              <span className="text-stone-600">Stripe</span>
            </div>
            <div className="text-stone-400 text-[10px] mb-1.5">2021 – Present</div>
            <div className="space-y-1.5">
              {['Grew checkout conversion by 31%, adding $4.2M ARR', 'Led 6 engineer teams shipping payments in 12 markets', 'Reduced support tickets 64% via self-serve onboarding'].map((b) => (
                <div key={b} className="flex gap-1.5 text-stone-700 leading-snug">
                  <span className="text-amber-500 mt-0.5 flex-shrink-0">•</span>
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Education */}
          <div className="mb-4">
            <div className="text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-1">Education</div>
            <div className="font-semibold text-stone-800">B.S. Computer Science</div>
            <div className="text-stone-500 text-[10px]">UC Berkeley · 2016</div>
          </div>
          {/* Skills */}
          <div className="mb-4">
            <div className="text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-2">Skills</div>
            <div className="flex flex-wrap gap-1.5">
              {['Product Strategy', 'SQL', 'Python', 'A/B Testing', 'Figma'].map((s) => (
                <span key={s} className="bg-amber-50 border border-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[9px] font-medium">{s}</span>
              ))}
            </div>
          </div>
          {/* Bullets rewritten ribbon */}
          <div className="bg-amber-500 text-stone-950 rounded-lg px-3 py-2 flex items-center gap-2">
            <Star className="w-3 h-3 fill-stone-950 flex-shrink-0" />
            <span className="text-[10px] font-bold">12 bullets rewritten</span>
          </div>
        </div>
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
      <HomePageView />
      <main className="min-h-screen bg-stone-950">

        {/* Nav */}
        <nav className="border-b border-stone-800/60 px-4 sm:px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
          <Logo size="lg" />
          {/* Center nav (desktop only) */}
          <div className="hidden lg:flex items-center gap-8">
            <a href="#features" className="text-stone-300 hover:text-stone-100 text-sm font-medium transition-colors">Features</a>
            <Link href="/pricing" className="text-stone-300 hover:text-stone-100 text-sm font-medium transition-colors">Pricing</Link>
            <button className="text-stone-300 hover:text-stone-100 text-sm font-medium transition-colors inline-flex items-center gap-1">
              Resources <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <Link href="/sign-in" className="text-stone-300 hover:text-stone-100 text-sm font-medium transition-colors">Sign in</Link>
            <NavBuildButton />
          </div>
        </nav>

        {/* Hero */}
        <section className="px-4 sm:px-6 pt-10 sm:pt-16 pb-12 sm:pb-20">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-12 lg:gap-16 items-center">
            <div className="text-center md:text-left order-2 md:order-1">
              {/* Pill */}
              <div className="inline-flex items-center gap-2 border border-stone-700/80 bg-stone-900/40 text-stone-300 text-[11px] sm:text-xs font-medium px-3.5 py-1.5 rounded-full mb-6 sm:mb-8">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Trusted by 10,000+ job seekers
              </div>

              {/* Heading — sans-serif bold like reference */}
              <h1 className="font-extrabold text-stone-100 text-[32px] sm:text-[44px] md:text-[60px] lg:text-[68px] leading-[1.05] tracking-tight mb-5 sm:mb-6">
                The resume that
                <br />
                <span className="relative inline-block">
                  <span style={{ background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    finally does you justice.
                  </span>
                  {/* Sparkle decoration */}
                  <Sparkles className="hidden md:block absolute -top-2 -right-8 w-7 h-7 text-amber-400" strokeWidth={2.5} />
                </span>
              </h1>

              {/* Subhead */}
              <p className="text-stone-400 text-base sm:text-lg mb-7 leading-relaxed md:max-w-xl mx-auto md:mx-0">
                You&apos;re more impressive than your current resume shows. ResumeGenius rewrites your experience into powerful, impactful language that gets responses — polished PDF in minutes.
              </p>

              {/* Email capture as primary CTA */}
              <HeroEmailCapture />

              {/* Secondary: see how it works (text link only) */}
              <div className="text-center md:text-left mb-10">
                <a href="#how-it-works" className="text-stone-500 hover:text-amber-400 text-sm transition-colors inline-flex items-center gap-1.5">
                  ▶ See how it works first
                </a>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5 max-w-2xl">
                <Stat icon={Clock} value="5 min" label="average to finish" />
                <Stat icon={Star} value="4.9★" label="3,100+ reviews" />
                <Stat icon={DollarSign} value="$1" label="7-day trial" />
                <Stat icon={Shield} value="100%" label="SATISFACTION GUARANTEE" caps />
              </div>
            </div>
            <HeroMockupSlot>
              <div className="flex justify-center order-1 md:order-2">
                <ResumeMockup />
              </div>
            </HeroMockupSlot>
          </div>
        </section>

        {/* Trusted by — logos */}
        <section className="px-4 sm:px-6 pb-10 sm:pb-14">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="h-px w-10 bg-stone-800" />
              <span className="text-stone-600 text-[10px] font-semibold uppercase tracking-[0.25em]">Job seekers hired at</span>
              <div className="h-px w-10 bg-stone-800" />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-10 sm:gap-x-14 gap-y-5 opacity-80">
              {['Google', 'stripe', 'airbnb', 'Microsoft', 'Meta', 'NETFLIX', 'shopify', 'figma', 'Uber', 'Notion'].map((co) => (
                <span key={co} className="text-stone-400 font-semibold text-base sm:text-lg tracking-tight">{co}</span>
              ))}
            </div>
          </div>
        </section>

        {/* Feature strip — 4 columns in a dark container */}
        <section id="features" className="px-4 sm:px-6 pb-10 sm:pb-16">
          <div className="max-w-7xl mx-auto bg-stone-900/40 border border-stone-800/60 rounded-2xl p-6 sm:p-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
              <FeatureBlock icon={Sparkles} title="AI-Powered Rewrite" desc="Transforms your experience into compelling, achievement-focused bullet points." />
              <FeatureBlock icon={Shield} title="ATS-Optimized" desc="Designed to pass ATS scanners and get you past the first round." />
              <FeatureBlock icon={FileText} title="Polished, Professional" desc="Beautiful, recruiter-approved formats that make you stand out." />
              <FeatureBlock icon={Lock} title="Privacy First" desc="Your data is secure and never shared. We respect your privacy." />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-16 sm:py-28 px-4 sm:px-6">
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
              <SparkleCTAButton label="Start Now" />
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
            <FinalCTAButton />
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
      <PopupAB />
      <StickyBar />
    </>
  )
}
