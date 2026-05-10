'use client'

import { useRef, useEffect, useState } from 'react'
import type { Resume, TemplateId, TemplateConfig } from '@/types/resume'

interface Props { resume: Resume; templateId: TemplateId; config?: Partial<TemplateConfig> }

const ACCENT: Record<TemplateId, string> = {
  classic: '#1a1a1a', modern: '#2a7d7b', minimal: '#374151',
  bold: '#5b21b6', sidebar: '#1e2936', clean: '#b45309',
}

function isEmpty(r: Resume) {
  return !r.personalInfo.name && !r.personalInfo.email && r.experience.length === 0
}

/* ── Shared sub-components ── */
function ExpEntry({ exp, accent }: { exp: Resume['experience'][0]; accent: string }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-baseline gap-2">
        <div>
          <span className="font-bold" style={{ color: accent }}>{exp.title || 'Job Title'}</span>
          {exp.company && <span className="text-slate-500"> · {exp.company}</span>}
        </div>
        <span className="text-slate-400 text-[11px] whitespace-nowrap shrink-0">
          {exp.startDate}{exp.startDate ? ' – ' : ''}{exp.current ? 'Present' : exp.endDate}
        </span>
      </div>
      <ul className="mt-1 space-y-1">
        {exp.bullets.filter(Boolean).map((b, i) => (
          <li key={i} className="flex gap-2 text-slate-600 leading-snug">
            <span className="mt-0.5 shrink-0" style={{ color: accent }}>•</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function EduEntry({ edu }: { edu: Resume['education'][0] }) {
  return (
    <div className="mb-3 flex justify-between items-start gap-2">
      <div>
        <div className="font-bold text-slate-800">{edu.school}</div>
        {(edu.degree || edu.field) && (
          <div className="text-slate-500">{edu.degree}{edu.field ? `, ${edu.field}` : ''}</div>
        )}
        {edu.gpa && <div className="text-slate-400 text-[11px]">GPA: {edu.gpa}</div>}
      </div>
      <span className="text-slate-400 text-[11px] whitespace-nowrap shrink-0">{edu.graduationDate}</span>
    </div>
  )
}

function SecHead({ title, accent }: { title: string; accent: string }) {
  return (
    <div className="flex items-center gap-2 mb-3 mt-1">
      <div className="font-bold text-[11px] uppercase tracking-[0.12em]" style={{ color: accent }}>{title}</div>
      <div className="flex-1 h-px" style={{ backgroundColor: accent, opacity: 0.25 }} />
    </div>
  )
}

/* ── Classic ── */
function Classic({ resume: r, accent }: { resume: Resume; accent: string }) {
  const p = r.personalInfo
  return (
    <div className="bg-white text-slate-800 text-[13px] font-sans leading-relaxed min-h-full" style={{ padding: '36px 40px' }}>
      <div className="text-center pb-4 mb-5" style={{ borderBottom: `2px solid ${accent}` }}>
        <h1 className="font-black uppercase tracking-widest mb-1" style={{ fontSize: 22, letterSpacing: 2 }}>{p.name || 'Your Name'}</h1>
        {p.summary && <div className="text-slate-500 text-[12px] mb-2">{p.summary.split('.')[0]}</div>}
        <div className="flex flex-wrap justify-center gap-x-4 text-slate-500 text-[11px]">
          {[p.phone, p.email, p.location, p.linkedin].filter(Boolean).map((v, i) => <span key={i}>{v}</span>)}
        </div>
      </div>
      {p.summary && (
        <div className="mb-5">
          <SecHead title="About Me" accent={accent} />
          <p className="text-slate-600 leading-relaxed">{p.summary}</p>
        </div>
      )}
      {r.experience.length > 0 && (
        <div className="mb-5">
          <SecHead title="Work Experience" accent={accent} />
          {r.experience.map(e => <ExpEntry key={e.id} exp={e} accent={accent} />)}
        </div>
      )}
      {r.education.length > 0 && (
        <div className="mb-5">
          <SecHead title="Education" accent={accent} />
          {r.education.map(e => <EduEntry key={e.id} edu={e} />)}
        </div>
      )}
      {r.skills.length > 0 && (
        <div>
          <SecHead title="Skills" accent={accent} />
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            {r.skills.map(s => (
              <div key={s.id} className="flex items-center gap-1.5 text-slate-600 text-[12px]">
                <span style={{ color: accent }}>•</span>{s.name}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Modern (Renata Voss teal) ── */
function Modern({ resume: r, accent }: { resume: Resume; accent: string }) {
  const p = r.personalInfo
  return (
    <div className="bg-white text-slate-800 text-[13px] font-sans leading-relaxed min-h-full flex flex-col">
      <div className="text-white text-center px-8 py-6" style={{ backgroundColor: accent }}>
        <h1 className="font-black uppercase tracking-[0.15em] mb-1" style={{ fontSize: 24 }}>{p.name || 'Your Name'}</h1>
        {p.summary && <div className="text-[12px] italic opacity-80">{p.summary.split('.')[0].toUpperCase()}</div>}
      </div>
      <div className="flex flex-1">
        <div className="w-[38%] p-5 flex flex-col gap-5" style={{ backgroundColor: '#f7f7f7', borderRight: '1px solid #e5e5e5' }}>
          <SideSection title="Contact" accent={accent}>
            {[p.email, p.phone, p.location, p.linkedin].filter(Boolean).map((v, i) => (
              <div key={i} className="text-[11px] text-slate-600 text-center">{v}</div>
            ))}
          </SideSection>
          {r.education.length > 0 && (
            <SideSection title="Education" accent={accent}>
              {r.education.map(e => (
                <div key={e.id} className="text-center mb-2">
                  <div className="text-[11px] font-bold text-slate-700">{e.degree}</div>
                  {e.field && <div className="text-[11px] text-slate-500">{e.field}</div>}
                  <div className="text-[11px] text-slate-500">{e.school}</div>
                  <div className="text-[10px] text-slate-400">{e.graduationDate}</div>
                </div>
              ))}
            </SideSection>
          )}
          {r.skills.length > 0 && (
            <SideSection title="Skills" accent={accent}>
              {r.skills.map(s => <div key={s.id} className="text-[11px] text-slate-600 text-center">{s.name}</div>)}
            </SideSection>
          )}
        </div>
        <div className="flex-1 p-6">
          {r.experience.length > 0 && (
            <div className="mb-5">
              <div className="font-black uppercase tracking-wide mb-1 pb-1" style={{ fontSize: 14, borderBottom: `2px solid ${accent}` }}>Work Experience</div>
              {r.experience.map(e => (
                <div key={e.id} className="mb-4">
                  <div className="font-bold text-[14px]">{e.title}</div>
                  <div className="text-slate-600 text-[12px]">{e.company}</div>
                  <div className="text-slate-400 text-[11px] mb-2">{e.startDate} – {e.current ? 'current' : e.endDate}</div>
                  <ul className="space-y-1">
                    {e.bullets.filter(Boolean).map((b, i) => (
                      <li key={i} className="flex gap-2 text-slate-600 text-[12px]"><span style={{ color: accent }}>•</span>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
          {r.education.length > 0 && (
            <div>
              <div className="font-black uppercase tracking-wide mb-1 pb-1" style={{ fontSize: 14, borderBottom: `2px solid ${accent}` }}>Education</div>
              {r.education.map(e => (
                <div key={e.id} className="mb-3">
                  <div className="font-bold text-[13px]">{e.degree}{e.field ? ` in ${e.field}` : ''}</div>
                  <div className="text-slate-500 text-[12px]">{e.school}</div>
                  <div className="text-slate-400 text-[11px]">{e.graduationDate}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function SideSection({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="font-bold text-[10px] uppercase tracking-[0.12em] text-center mb-1" style={{ color: '#333' }}>{title}</div>
      <div className="w-6 mx-auto mb-2" style={{ height: 2, backgroundColor: accent }} />
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  )
}

/* ── Minimal ── */
function Minimal({ resume: r, accent }: { resume: Resume; accent: string }) {
  const p = r.personalInfo
  return (
    <div className="bg-white text-slate-700 text-[13px] font-sans min-h-full" style={{ padding: '48px 52px' }}>
      <div className="mb-7">
        <h1 className="font-bold text-[24px] text-slate-900 tracking-tight mb-1">{p.name || 'Your Name'}</h1>
        {p.summary && <div className="text-slate-500 text-[13px] mb-2">{p.summary.split('.')[0]}</div>}
        <div className="flex flex-wrap gap-x-5 text-slate-400 text-[11px]">
          {[p.email, p.phone, p.location, p.linkedin].filter(Boolean).map((v, i) => <span key={i}>{v}</span>)}
        </div>
      </div>
      {p.summary && <MinSec title="Profile"><p className="text-slate-500 leading-relaxed">{p.summary}</p></MinSec>}
      {r.experience.length > 0 && (
        <MinSec title="Experience">
          {r.experience.map(e => (
            <div key={e.id} className="mb-4">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-slate-900">{e.title}</span>
                <span className="text-slate-400 text-[11px]">{e.startDate} – {e.current ? 'Present' : e.endDate}</span>
              </div>
              <div className="text-slate-500 text-[12px] mb-1">{e.company}</div>
              {e.bullets.filter(Boolean).map((b, i) => (
                <div key={i} className="flex gap-2 text-slate-500 text-[12px]"><span className="text-slate-300">–</span>{b}</div>
              ))}
            </div>
          ))}
        </MinSec>
      )}
      {r.education.length > 0 && (
        <MinSec title="Education">
          {r.education.map(e => (
            <div key={e.id} className="flex justify-between items-start mb-2">
              <div><div className="font-bold text-slate-900">{e.degree}{e.field ? `, ${e.field}` : ''}</div><div className="text-slate-500 text-[12px]">{e.school}</div></div>
              <span className="text-slate-400 text-[11px]">{e.graduationDate}</span>
            </div>
          ))}
        </MinSec>
      )}
      {r.skills.length > 0 && (
        <MinSec title="Skills">
          <div className="text-slate-500 leading-relaxed">{r.skills.map(s => s.name).join('  ·  ')}</div>
        </MinSec>
      )}
    </div>
  )
}
function MinSec({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-300 mb-3">{title}</div>
      {children}
    </div>
  )
}

/* ── Bold ── */
function Bold({ resume: r, accent }: { resume: Resume; accent: string }) {
  const p = r.personalInfo
  return (
    <div className="bg-white text-slate-800 text-[13px] font-sans min-h-full">
      <div className="text-white px-8 py-6" style={{ backgroundColor: accent }}>
        <h1 className="font-black text-[26px] tracking-tight mb-1">{p.name || 'Your Name'}</h1>
        {p.summary && <div className="text-[12px] opacity-80 mb-2">{p.summary.split('.')[0]}</div>}
        <div className="flex flex-wrap gap-x-5 text-[11px] opacity-70">
          {[p.email, p.phone, p.location].filter(Boolean).map((v, i) => <span key={i}>{v}</span>)}
        </div>
      </div>
      <div style={{ padding: '20px 32px' }}>
        {([
          p.summary && { title: 'Summary', body: <p className="text-slate-600 leading-relaxed">{p.summary}</p> },
          r.experience.length > 0 && { title: 'Experience', body: r.experience.map(e => <ExpEntry key={e.id} exp={e} accent={accent} />) },
          r.education.length > 0 && { title: 'Education', body: r.education.map(e => <EduEntry key={e.id} edu={e} />) },
          r.skills.length > 0 && { title: 'Skills', body: <div className="flex flex-wrap gap-2">{r.skills.map(s => <span key={s.id} className="text-[11px] px-2 py-1 rounded" style={{ backgroundColor: `${accent}18`, color: accent }}>{s.name}</span>)}</div> },
        ].filter(Boolean) as { title: string; body: React.ReactNode }[]).map((sec) => (
          <div key={sec.title} className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1 h-4 rounded-sm" style={{ backgroundColor: accent }} />
              <div className="font-black uppercase tracking-wide text-[12px]" style={{ color: accent }}>{sec.title}</div>
            </div>
            <div className="h-px mb-3" style={{ backgroundColor: `${accent}30` }} />
            {sec.body}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Sidebar (Max Johnson dark navy) ── */
function Sidebar({ resume: r, accent }: { resume: Resume; accent: string }) {
  const p = r.personalInfo
  const initials = p.name ? p.name.split(' ').map(n => n[0]).slice(0, 2).join('') : 'YN'
  return (
    <div className="bg-white text-slate-800 text-[13px] font-sans min-h-full flex">
      <div className="w-[36%] p-5 flex flex-col gap-5 text-white" style={{ backgroundColor: accent }}>
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-[20px] font-black mb-3" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
            {initials}
          </div>
          <div className="font-bold text-[14px] text-center leading-tight">{p.name}</div>
          {p.summary && <div className="text-[11px] text-center opacity-70 mt-1">{p.summary.split('.')[0]}</div>}
        </div>
        <div>
          <div className="font-bold text-[11px] mb-1">Contact</div>
          <div className="w-5 mb-2" style={{ height: 1.5, backgroundColor: 'rgba(255,255,255,0.5)' }} />
          {p.location && <><div className="text-[10px] font-bold opacity-70">Address</div><div className="text-[11px] opacity-80 mb-2">{p.location}</div></>}
          {p.phone    && <><div className="text-[10px] font-bold opacity-70">Phone</div><div className="text-[11px] opacity-80 mb-2">{p.phone}</div></>}
          {p.email    && <><div className="text-[10px] font-bold opacity-70">Email</div><div className="text-[11px] opacity-80 mb-2 break-all">{p.email}</div></>}
        </div>
        {r.skills.length > 0 && (
          <div>
            <div className="font-bold text-[11px] mb-1">Skills</div>
            <div className="w-5 mb-2" style={{ height: 1.5, backgroundColor: 'rgba(255,255,255,0.5)' }} />
            {r.skills.map(s => <div key={s.id} className="text-[11px] opacity-80 flex gap-1.5 mb-1"><span>•</span>{s.name}</div>)}
          </div>
        )}
      </div>
      <div className="flex-1 p-6 flex flex-col gap-5">
        {p.summary && (
          <div>
            <div className="font-bold text-[14px] mb-1">Profile</div>
            <div className="w-5 h-0.5 mb-3 bg-slate-900" />
            <p className="text-slate-600 leading-relaxed text-[12px]">{p.summary}</p>
          </div>
        )}
        {r.experience.length > 0 && (
          <div>
            <div className="font-bold text-[14px] mb-1">Work Experience</div>
            <div className="w-5 h-0.5 mb-3 bg-slate-900" />
            {r.experience.map(e => (
              <div key={e.id} className="mb-4">
                <div className="font-bold text-[13px]">{e.title}</div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">{e.company}</span>
                  <span className="text-slate-400">{e.startDate} – {e.current ? 'Present' : e.endDate}</span>
                </div>
                <ul className="mt-1 space-y-0.5">
                  {e.bullets.filter(Boolean).map((b, i) => <li key={i} className="flex gap-1.5 text-slate-600 text-[12px]"><span>•</span>{b}</li>)}
                </ul>
              </div>
            ))}
          </div>
        )}
        {r.education.length > 0 && (
          <div>
            <div className="font-bold text-[14px] mb-1">Education</div>
            <div className="w-5 h-0.5 mb-3 bg-slate-900" />
            {r.education.map(e => (
              <div key={e.id} className="flex justify-between items-start mb-2">
                <div><div className="font-bold text-[13px]">{e.degree}{e.field ? ` in ${e.field}` : ''}</div><div className="text-slate-500 text-[12px]">{e.school}</div></div>
                <span className="text-slate-400 text-[11px]">{e.graduationDate}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Clean ── */
function Clean({ resume: r, accent }: { resume: Resume; accent: string }) {
  const p = r.personalInfo
  return (
    <div className="bg-white text-slate-800 text-[13px] font-sans min-h-full" style={{ padding: '36px 44px' }}>
      <div className="text-center pb-4 mb-5" style={{ borderBottom: `2.5px solid ${accent}` }}>
        <h1 className="font-bold text-[22px] tracking-tight mb-1">{p.name || 'Your Name'}</h1>
        {p.summary && <div className="text-[12px] mb-2" style={{ color: accent }}>{p.summary.split('.')[0]}</div>}
        <div className="flex flex-wrap justify-center gap-x-4 text-slate-500 text-[11px]">
          {[p.phone, p.email, p.location, p.linkedin].filter(Boolean).map((v, i) => <span key={i}>{v}</span>)}
        </div>
      </div>
      {p.summary && <CleanSec title="Profile" accent={accent}><p className="text-slate-600 leading-relaxed">{p.summary}</p></CleanSec>}
      {r.experience.length > 0 && (
        <CleanSec title="Experience" accent={accent}>
          {r.experience.map(e => <ExpEntry key={e.id} exp={e} accent={accent} />)}
        </CleanSec>
      )}
      {r.education.length > 0 && (
        <CleanSec title="Education" accent={accent}>
          {r.education.map(e => <EduEntry key={e.id} edu={e} />)}
        </CleanSec>
      )}
      {r.skills.length > 0 && (
        <CleanSec title="Skills" accent={accent}>
          <div className="flex flex-wrap gap-2">
            {r.skills.map(s => <span key={s.id} className="text-[11px] px-2 py-0.5 rounded-full border" style={{ borderColor: `${accent}50`, color: accent }}>{s.name}</span>)}
          </div>
        </CleanSec>
      )}
    </div>
  )
}
function CleanSec({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="font-bold text-[10px] uppercase tracking-[0.18em] mb-2" style={{ color: accent }}>{title}</div>
      <div className="h-px mb-3" style={{ backgroundColor: `${accent}40` }} />
      {children}
    </div>
  )
}

/* ── Scaler wrapper ── */
const TEMPLATES: Record<TemplateId, React.FC<{ resume: Resume; accent: string }>> = {
  classic: Classic, modern: Modern, minimal: Minimal,
  bold: Bold, sidebar: Sidebar, clean: Clean,
}

export default function ResumePreview({ resume, templateId, config }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const DOC_W = 794 // approx A4 at 96dpi

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setScale(containerRef.current.offsetWidth / DOC_W)
      }
    }
    update()
    const ro = new ResizeObserver(update)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const accent = config?.accentColor ?? ACCENT[templateId]
  const Template = TEMPLATES[templateId] ?? Classic

  if (isEmpty(resume)) {
    return (
      <div ref={containerRef} className="w-full bg-white rounded-xl shadow-2xl flex items-center justify-center" style={{ aspectRatio: '794/1123' }}>
        <div className="text-center text-slate-300">
          <p className="text-sm">Your resume preview will appear here</p>
          <p className="text-xs mt-1 text-slate-400">Fill in your details on the left</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="w-full relative shadow-2xl rounded-sm overflow-hidden" style={{ height: scale * 1123 }}>
      <div style={{ width: DOC_W, transform: `scale(${scale})`, transformOrigin: 'top left', position: 'absolute', top: 0, left: 0 }}>
        <Template resume={resume} accent={accent} />
      </div>
    </div>
  )
}
