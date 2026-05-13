'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { generateId } from '@/lib/utils'
import { TEMPLATES } from '@/lib/templates'
import type { Resume, Experience, Education, ResumeSection, TemplateId, TemplateConfig } from '@/types/resume'
import { TEMPLATE_DEFAULTS } from '@/components/pdf/ResumeDocument'
import { Sparkles, Plus, Trash2, ChevronRight, ChevronLeft, Download, Loader2, CheckCircle, User, Briefcase, GraduationCap, Wrench, CreditCard, LayoutTemplate, Save, ArrowLeft } from 'lucide-react'
import ResumePreview from './ResumePreview'
import TemplateThumbnail from './TemplateThumbnail'
import PhotoUploader from './PhotoUploader'
import SaveYourWorkPrompt from './SaveYourWorkPrompt'
import QuickCheckoutFAB from './QuickCheckoutFAB'

const EMPTY_RESUME: Resume = {
  personalInfo: { name: '', email: '', phone: '', location: '', linkedin: '', website: '', summary: '' },
  experience: [],
  education: [],
  skills: [],
}

const STEPS: { key: ResumeSection; label: string; icon: React.ReactNode }[] = [
  { key: 'template',   label: 'Template',   icon: <LayoutTemplate className="w-4 h-4" /> },
  { key: 'personal',   label: 'Personal',   icon: <User className="w-4 h-4" /> },
  { key: 'experience', label: 'Experience', icon: <Briefcase className="w-4 h-4" /> },
  { key: 'education',  label: 'Education',  icon: <GraduationCap className="w-4 h-4" /> },
  { key: 'skills',     label: 'Skills',     icon: <Wrench className="w-4 h-4" /> },
  { key: 'preview',    label: 'Download',   icon: <CreditCard className="w-4 h-4" /> },
]

const inputCls = "bg-stone-800 border-stone-700 text-stone-100 placeholder:text-stone-600 focus:border-amber-500 focus:ring-amber-500/20"

function Field({ label, children, span2 }: { label: string; children: React.ReactNode; span2?: boolean }) {
  return (
    <div className={span2 ? 'col-span-2' : ''}>
      <Label className="text-stone-400 text-xs font-medium mb-1.5 block">{label}</Label>
      {children}
    </div>
  )
}

export default function ResumeBuilder() {
  const searchParams = useSearchParams()
  const resumeId = searchParams.get('id')

  const [resume, setResume] = useState<Resume>(EMPTY_RESUME)
  const [templateId, setTemplateId] = useState<TemplateId>('classic')
  const [templateConfig, setTemplateConfig] = useState<TemplateConfig>({ accentColor: TEMPLATE_DEFAULTS['classic'], font: 'sans', spacing: 'normal' })
  const [step, setStep] = useState(0)
  const [enhancing, setEnhancing] = useState<Record<string, boolean>>({})
  const [checkingOut, setCheckingOut] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(!!resumeId)

  // Prefill email if user submitted it on the hero email-capture form
  // AND restore anonymous draft from localStorage if no resumeId from DB
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Anonymous draft restore (only if not editing a DB-saved resume)
    if (!resumeId) {
      const draft = localStorage.getItem('anon_resume_draft')
      if (draft) {
        try {
          const parsed = JSON.parse(draft)
          if (parsed.resume) setResume(parsed.resume)
          if (parsed.templateId) setTemplateId(parsed.templateId)
          if (parsed.templateConfig) setTemplateConfig(parsed.templateConfig)
        } catch {}
      }
    }

    const captured = sessionStorage.getItem('captured_email')
    if (captured) {
      setResume(r => r.personalInfo.email ? r : { ...r, personalInfo: { ...r.personalInfo, email: captured } })
      sessionStorage.removeItem('captured_email')
    }
  }, [resumeId])

  // Auto-save anonymous draft to localStorage on every change
  useEffect(() => {
    if (typeof window === 'undefined' || resumeId) return // only for anon users
    const t = setTimeout(() => {
      try {
        localStorage.setItem('anon_resume_draft', JSON.stringify({ resume, templateId, templateConfig }))
      } catch {}
    }, 500) // debounce
    return () => clearTimeout(t)
  }, [resume, templateId, templateConfig, resumeId])

  useEffect(() => {
    if (!resumeId) return
    fetch(`/api/resumes/${resumeId}`)
      .then(r => r.json())
      .then(data => {
        if (data.resume) {
          const parsed = JSON.parse(data.resume.data)
          const tid = data.resume.templateId as TemplateId
          setResume(parsed)
          setTemplateId(tid)
          setTemplateConfig(parsed.templateConfig ?? { accentColor: TEMPLATE_DEFAULTS[tid] ?? '#1a1a1a', font: 'sans', spacing: 'normal' })
        }
      })
      .finally(() => setLoading(false))
  }, [resumeId])

  const saveToDb = useCallback(async () => {
    if (!resumeId) return
    setSaving(true)
    await fetch(`/api/resumes/${resumeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: JSON.stringify({ ...resume, templateConfig }),
        templateId,
        title: resume.personalInfo.name ? `${resume.personalInfo.name}'s Resume` : 'My Resume',
      }),
    })
    setSaving(false)
    setSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
  }, [resumeId, resume, templateId])

  const updatePersonal = (field: string, value: string) =>
    setResume(r => ({ ...r, personalInfo: { ...r.personalInfo, [field]: value } }))

  const addExperience = () =>
    setResume(r => ({ ...r, experience: [...r.experience, { id: generateId(), company: '', title: '', startDate: '', endDate: '', current: false, bullets: [''] }] }))

  const updateExperience = (id: string, field: keyof Experience, value: unknown) =>
    setResume(r => ({ ...r, experience: r.experience.map(e => e.id === id ? { ...e, [field]: value } : e) }))

  const removeExperience = (id: string) =>
    setResume(r => ({ ...r, experience: r.experience.filter(e => e.id !== id) }))

  const updateBullet = (expId: string, idx: number, value: string) =>
    setResume(r => ({ ...r, experience: r.experience.map(e => e.id === expId ? { ...e, bullets: e.bullets.map((b, i) => i === idx ? value : b) } : e) }))

  const addBullet = (expId: string) =>
    setResume(r => ({ ...r, experience: r.experience.map(e => e.id === expId ? { ...e, bullets: [...e.bullets, ''] } : e) }))

  const removeBullet = (expId: string, idx: number) =>
    setResume(r => ({ ...r, experience: r.experience.map(e => e.id === expId ? { ...e, bullets: e.bullets.filter((_, i) => i !== idx) } : e) }))

  const enhanceBullet = async (expId: string, idx: number, bullet: string, exp: Experience) => {
    if (!bullet.trim()) return
    const key = `${expId}-${idx}`
    setEnhancing(s => ({ ...s, [key]: true }))
    try {
      const res = await fetch('/api/resume/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bullet, jobTitle: exp.title, company: exp.company }),
      })
      const data = await res.json()
      if (data.enhanced) updateBullet(expId, idx, data.enhanced)
    } finally {
      setEnhancing(s => ({ ...s, [key]: false }))
    }
  }

  const addEducation = () =>
    setResume(r => ({ ...r, education: [...r.education, { id: generateId(), school: '', degree: '', field: '', graduationDate: '', gpa: '' }] }))

  const updateEducation = (id: string, field: keyof Education, value: string) =>
    setResume(r => ({ ...r, education: r.education.map(e => e.id === id ? { ...e, [field]: value } : e) }))

  const removeEducation = (id: string) =>
    setResume(r => ({ ...r, education: r.education.filter(e => e.id !== id) }))

  const addSkill = (name: string) => {
    if (!name.trim()) return
    setResume(r => ({ ...r, skills: [...r.skills, { id: generateId(), name: name.trim() }] }))
  }

  const removeSkill = (id: string) =>
    setResume(r => ({ ...r, skills: r.skills.filter(s => s.id !== id) }))

  const handleCheckout = async (mode: 'one-time' | 'subscription') => {
    setCheckingOut(true)
    const resumeId = generateId()
    localStorage.setItem(`resume_${resumeId}`, JSON.stringify({ ...resume, templateId, templateConfig }))
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: mode === 'subscription' ? 'subscription' : 'payment', resumeId }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally {
      setCheckingOut(false)
    }
  }

  const currentStep = STEPS[step]

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col">
      {/* Top nav */}
      <header className="bg-stone-900 border-b border-stone-800 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          {resumeId ? (
            <Link href="/dashboard" className="flex items-center gap-1.5 text-stone-500 hover:text-stone-300 transition-colors text-xs mr-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
            </Link>
          ) : (
            <Link href="/" className="font-bold text-stone-100 text-sm tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>
              ResumeGenius
            </Link>
          )}
        </div>
        <div className="flex items-center gap-1">
          {STEPS.map((s, i) => {
            const done = i < step
            const active = i === step
            return (
              <button key={s.key} onClick={() => setStep(i)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  active ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : done ? 'text-stone-400 hover:text-stone-200'
                  : 'text-stone-600 hover:text-stone-400'
                }`}
              >
                {done ? <CheckCircle className="w-3.5 h-3.5 text-amber-500" /> : s.icon}
                {s.label}
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-3">
          {resumeId && (
            <button onClick={saveToDb} disabled={saving} className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-300 transition-colors disabled:opacity-50">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {saving ? 'Saving…' : savedAt ? `Saved ${savedAt}` : 'Save'}
            </button>
          )}
          <div className="text-xs text-stone-600">Step {step + 1}/{STEPS.length}</div>
        </div>
      </header>

      <div className="h-0.5 bg-stone-800">
        <div className="h-full bg-amber-500 transition-all duration-300" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Form panel */}
        <div className="w-full lg:w-[55%] flex flex-col lg:border-r border-stone-800 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 flex-1">
            <div className="mb-8">
              <div className="flex items-center gap-2 text-amber-500 text-xs font-semibold uppercase tracking-widest mb-2">
                {currentStep.icon} {currentStep.label}
              </div>
              <h2 className="text-2xl text-stone-100" style={{ fontFamily: 'var(--font-serif)' }}>
                {currentStep.key === 'template'   && 'Choose your template'}
                {currentStep.key === 'personal'   && 'Tell us about yourself'}
                {currentStep.key === 'experience' && 'Your work experience'}
                {currentStep.key === 'education'  && 'Your education'}
                {currentStep.key === 'skills'     && 'Your skills'}
                {currentStep.key === 'preview'    && "You're ready to download"}
              </h2>
              <p className="text-stone-500 text-sm mt-1">
                {currentStep.key === 'template'   && 'Pick a style. You can switch anytime — the preview updates instantly.'}
                {currentStep.key === 'personal'   && 'This goes at the top of your resume.'}
                {currentStep.key === 'experience' && 'Add each role. Use the ✦ button to let AI rewrite your bullets.'}
                {currentStep.key === 'education'  && 'List your degrees, certifications, or bootcamps.'}
                {currentStep.key === 'skills'     && 'Add tools, languages, and competencies relevant to your target role.'}
                {currentStep.key === 'preview'    && 'Your AI-enhanced resume is complete. Choose a plan to download it.'}
              </p>
            </div>

            {/* Template selector + customizer */}
            {currentStep.key === 'template' && (
              <div className="space-y-8">
              <div className="grid grid-cols-3 gap-4">
                {TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => { setTemplateId(t.id); setTemplateConfig(c => ({ ...c, accentColor: TEMPLATE_DEFAULTS[t.id] })) }}
                    className={`group rounded-xl overflow-hidden border-2 transition-all ${
                      templateId === t.id
                        ? 'border-amber-500 shadow-lg shadow-amber-500/20'
                        : 'border-stone-700 hover:border-stone-500'
                    }`}
                  >
                    <div className="aspect-[3/4] bg-white overflow-hidden">
                      <TemplateThumbnail id={t.id} />
                    </div>
                    <div className={`px-3 py-2 text-left transition-colors ${templateId === t.id ? 'bg-amber-500/10' : 'bg-stone-900'}`}>
                      <div className={`text-xs font-semibold ${templateId === t.id ? 'text-amber-400' : 'text-stone-300'}`}>
                        {t.name}
                        {templateId === t.id && <span className="ml-2 text-[10px] text-amber-500">✓ Selected</span>}
                      </div>
                      <div className="text-[10px] text-stone-500 mt-0.5">{t.description}</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* ── Customise ── */}
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-6">
                <div className="text-stone-100 font-semibold text-sm">Customize</div>

                {/* Color */}
                <div>
                  <div className="text-stone-400 text-xs font-medium mb-3">Accent color</div>
                  <div className="flex flex-wrap items-center gap-2">
                    {['#1a1a1a','#2a7d7b','#1d4ed8','#5b21b6','#b45309','#be123c','#15803d','#c2410c','#0369a1','#1e2936'].map(color => (
                      <button
                        key={color}
                        onClick={() => setTemplateConfig(c => ({ ...c, accentColor: color }))}
                        className="w-7 h-7 rounded-full border-2 transition-all"
                        style={{
                          backgroundColor: color,
                          borderColor: templateConfig.accentColor === color ? '#fff' : 'transparent',
                          boxShadow: templateConfig.accentColor === color ? `0 0 0 2px ${color}` : 'none',
                        }}
                      />
                    ))}
                    {/* Custom color picker */}
                    <label className="w-7 h-7 rounded-full border-2 border-dashed border-stone-600 hover:border-stone-400 cursor-pointer flex items-center justify-center transition-colors overflow-hidden relative" title="Custom color">
                      <input
                        type="color"
                        value={templateConfig.accentColor}
                        onChange={e => setTemplateConfig(c => ({ ...c, accentColor: e.target.value }))}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <span className="text-stone-500 text-xs pointer-events-none">+</span>
                    </label>
                    <div className="ml-1 w-7 h-7 rounded-full border border-stone-700" style={{ backgroundColor: templateConfig.accentColor }} />
                  </div>
                </div>

                {/* Font */}
                <div>
                  <div className="text-stone-400 text-xs font-medium mb-3">Font style</div>
                  <div className="flex gap-2">
                    {(['sans', 'serif'] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setTemplateConfig(c => ({ ...c, font: f }))}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                          templateConfig.font === f
                            ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                            : 'border-stone-700 text-stone-400 hover:border-stone-500 hover:text-stone-200'
                        }`}
                        style={{ fontFamily: f === 'serif' ? 'Georgia, serif' : 'inherit' }}
                      >
                        {f === 'sans' ? 'Modern (Sans)' : 'Classic (Serif)'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Spacing */}
                <div>
                  <div className="text-stone-400 text-xs font-medium mb-3">Spacing</div>
                  <div className="flex gap-2">
                    {(['compact', 'normal', 'spacious'] as const).map(sp => (
                      <button
                        key={sp}
                        onClick={() => setTemplateConfig(c => ({ ...c, spacing: sp }))}
                        className={`px-4 py-2 rounded-lg text-sm capitalize border transition-all ${
                          templateConfig.spacing === sp
                            ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                            : 'border-stone-700 text-stone-400 hover:border-stone-500 hover:text-stone-200'
                        }`}
                      >
                        {sp}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              </div>
            )}

            {/* Personal */}
            {currentStep.key === 'personal' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <PhotoUploader
                    photoUrl={resume.personalInfo.photoUrl}
                    onChange={(url) => updatePersonal('photoUrl', url ?? '')}
                  />
                </div>
                <Field label="Full Name" span2><Input className={inputCls} value={resume.personalInfo.name} onChange={e => updatePersonal('name', e.target.value)} placeholder="Alex Johnson" /></Field>
                <Field label="Email"><Input className={inputCls} type="email" value={resume.personalInfo.email} onChange={e => updatePersonal('email', e.target.value)} placeholder="alex@email.com" /></Field>
                <Field label="Phone"><Input className={inputCls} value={resume.personalInfo.phone} onChange={e => updatePersonal('phone', e.target.value)} placeholder="(555) 000-0000" /></Field>
                <Field label="Location"><Input className={inputCls} value={resume.personalInfo.location} onChange={e => updatePersonal('location', e.target.value)} placeholder="San Francisco, CA" /></Field>
                <Field label="LinkedIn"><Input className={inputCls} value={resume.personalInfo.linkedin ?? ''} onChange={e => updatePersonal('linkedin', e.target.value)} placeholder="linkedin.com/in/alexjohnson" /></Field>
                <Field label="Website / Portfolio"><Input className={inputCls} value={resume.personalInfo.website ?? ''} onChange={e => updatePersonal('website', e.target.value)} placeholder="alexjohnson.com" /></Field>
                <Field label="Professional Summary (optional)" span2>
                  <Textarea className={`${inputCls} resize-none`} value={resume.personalInfo.summary ?? ''} onChange={e => updatePersonal('summary', e.target.value)} placeholder="Results-driven product manager with 5+ years building 0→1 products..." rows={3} />
                </Field>
              </div>
            )}

            {/* Experience */}
            {currentStep.key === 'experience' && (
              <div className="space-y-5">
                {resume.experience.map(exp => (
                  <div key={exp.id} className="bg-stone-900 border border-stone-800 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-stone-300 font-medium text-sm">{exp.company || 'New Position'}</span>
                      <button onClick={() => removeExperience(exp.id)} className="text-stone-600 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <Field label="Job Title"><Input className={inputCls} value={exp.title} onChange={e => updateExperience(exp.id, 'title', e.target.value)} placeholder="Software Engineer" /></Field>
                      <Field label="Company"><Input className={inputCls} value={exp.company} onChange={e => updateExperience(exp.id, 'company', e.target.value)} placeholder="Acme Inc." /></Field>
                      <Field label="Start Date"><Input className={inputCls} value={exp.startDate} onChange={e => updateExperience(exp.id, 'startDate', e.target.value)} placeholder="Jan 2022" /></Field>
                      <Field label="End Date">
                        <Input className={inputCls} value={exp.current ? 'Present' : exp.endDate} disabled={exp.current} onChange={e => updateExperience(exp.id, 'endDate', e.target.value)} placeholder="Dec 2024" />
                        <label className="flex items-center gap-2 mt-2 text-xs text-stone-500 cursor-pointer select-none">
                          <input type="checkbox" checked={exp.current} onChange={e => updateExperience(exp.id, 'current', e.target.checked)} className="accent-amber-500" />
                          I currently work here
                        </label>
                      </Field>
                    </div>
                    <div>
                      <Label className="text-stone-400 text-xs font-medium mb-2 block">Bullet Points <span className="text-amber-500/70 font-normal ml-1">✦ = AI enhance</span></Label>
                      <div className="space-y-2">
                        {exp.bullets.map((bullet, idx) => (
                          <div key={idx} className="flex gap-2 items-start">
                            <Textarea value={bullet} onChange={e => updateBullet(exp.id, idx, e.target.value)} placeholder="Describe what you did and its impact..." rows={2} className={`${inputCls} flex-1 text-sm resize-none`} />
                            <div className="flex flex-col gap-1 pt-0.5">
                              <button onClick={() => enhanceBullet(exp.id, idx, bullet, exp)} disabled={enhancing[`${exp.id}-${idx}`] || !bullet.trim()} className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 hover:bg-amber-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                                {enhancing[`${exp.id}-${idx}`] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                              </button>
                              {exp.bullets.length > 1 && (
                                <button onClick={() => removeBullet(exp.id, idx)} className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-600 hover:text-red-400 transition-colors">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        <button onClick={() => addBullet(exp.id)} className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-300 transition-colors mt-1">
                          <Plus className="w-3.5 h-3.5" /> Add bullet point
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={addExperience} className="w-full border-2 border-dashed border-stone-700 hover:border-amber-500/40 rounded-xl py-4 text-sm text-stone-500 hover:text-stone-300 transition-all flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> Add Work Experience
                </button>
              </div>
            )}

            {/* Education */}
            {currentStep.key === 'education' && (
              <div className="space-y-5">
                {resume.education.map(edu => (
                  <div key={edu.id} className="bg-stone-900 border border-stone-800 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-stone-300 font-medium text-sm">{edu.school || 'New School'}</span>
                      <button onClick={() => removeEducation(edu.id)} className="text-stone-600 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="School / University" span2><Input className={inputCls} value={edu.school} onChange={e => updateEducation(edu.id, 'school', e.target.value)} placeholder="MIT" /></Field>
                      <Field label="Degree"><Input className={inputCls} value={edu.degree} onChange={e => updateEducation(edu.id, 'degree', e.target.value)} placeholder="Bachelor of Science" /></Field>
                      <Field label="Field of Study"><Input className={inputCls} value={edu.field} onChange={e => updateEducation(edu.id, 'field', e.target.value)} placeholder="Computer Science" /></Field>
                      <Field label="Graduation Date"><Input className={inputCls} value={edu.graduationDate} onChange={e => updateEducation(edu.id, 'graduationDate', e.target.value)} placeholder="May 2022" /></Field>
                      <Field label="GPA (optional)"><Input className={inputCls} value={edu.gpa ?? ''} onChange={e => updateEducation(edu.id, 'gpa', e.target.value)} placeholder="3.8" /></Field>
                    </div>
                  </div>
                ))}
                <button onClick={addEducation} className="w-full border-2 border-dashed border-stone-700 hover:border-amber-500/40 rounded-xl py-4 text-sm text-stone-500 hover:text-stone-300 transition-all flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> Add Education
                </button>
              </div>
            )}

            {/* Skills */}
            {currentStep.key === 'skills' && (
              <div className="space-y-5">
                <div className="flex flex-wrap gap-2 min-h-[56px] bg-stone-900 border border-stone-800 rounded-xl p-4">
                  {resume.skills.length === 0 && <span className="text-stone-600 text-sm">Skills will appear here...</span>}
                  {resume.skills.map(s => (
                    <span key={s.id} className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs px-3 py-1.5 rounded-lg">
                      {s.name}
                      <button onClick={() => removeSkill(s.id)} className="text-amber-500/50 hover:text-red-400 transition-colors text-sm leading-none">×</button>
                    </span>
                  ))}
                </div>
                <form onSubmit={e => { e.preventDefault(); const inp = e.currentTarget.elements.namedItem('skill') as HTMLInputElement; addSkill(inp.value); inp.value = '' }} className="flex gap-2">
                  <Input name="skill" className={`${inputCls} flex-1`} placeholder="e.g. TypeScript, Figma, AWS, Python..." />
                  <Button type="submit" className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold">Add</Button>
                </form>
                <div className="space-y-2">
                  <p className="text-xs text-stone-500">Popular skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {['React', 'Python', 'SQL', 'Figma', 'TypeScript', 'AWS', 'Product Strategy', 'Data Analysis', 'Leadership', 'Go'].map(s => (
                      <button key={s} onClick={() => addSkill(s)} disabled={resume.skills.some(sk => sk.name === s)} className="text-xs text-stone-400 border border-stone-700 hover:border-amber-500/40 hover:text-stone-200 px-3 py-1.5 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                        + {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Download */}
            {currentStep.key === 'preview' && (
              <div className="space-y-4">
                <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex items-center gap-6 text-sm">
                  <div className="text-center"><div className="text-xl font-bold text-stone-100">{resume.experience.length}</div><div className="text-stone-500 text-xs">Positions</div></div>
                  <div className="w-px h-8 bg-stone-800" />
                  <div className="text-center"><div className="text-xl font-bold text-stone-100">{resume.experience.reduce((a, e) => a + e.bullets.filter(Boolean).length, 0)}</div><div className="text-stone-500 text-xs">Bullets</div></div>
                  <div className="w-px h-8 bg-stone-800" />
                  <div className="text-center"><div className="text-xl font-bold text-stone-100">{resume.skills.length}</div><div className="text-stone-500 text-xs">Skills</div></div>
                  <div className="w-px h-8 bg-stone-800" />
                  <div className="text-center"><div className="text-xl font-bold text-amber-400">ATS ✓</div><div className="text-stone-500 text-xs">Optimized</div></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-stone-900 border border-stone-700 rounded-xl p-6 space-y-4">
                    <div><div className="text-2xl font-black text-stone-100">$4.99</div><div className="text-stone-300 font-semibold mt-0.5">One-Time Download</div></div>
                    <ul className="space-y-2 text-xs text-stone-400">
                      {['Single PDF download', 'AI-enhanced bullets', 'Professional template'].map(i => (
                        <li key={i} className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />{i}</li>
                      ))}
                    </ul>
                    <Button variant="outline" className="w-full border-stone-600 text-stone-200 hover:bg-stone-800 hover:text-white font-semibold" onClick={() => handleCheckout('one-time')} disabled={checkingOut}>
                      {checkingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Download className="w-4 h-4 mr-2" />Buy & Download</>}
                    </Button>
                  </div>
                  <div className="bg-stone-900 border-2 border-amber-500 rounded-xl p-6 space-y-4 relative">
                    <div className="absolute top-3 right-3 bg-amber-500 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded-full">BEST VALUE</div>
                    <div><div className="text-2xl font-black text-stone-100">$9.99<span className="text-sm font-normal text-stone-400">/mo</span></div><div className="text-stone-300 font-semibold mt-0.5">Monthly Subscription</div></div>
                    <ul className="space-y-2 text-xs text-stone-400">
                      {['Unlimited downloads', 'All AI enhancements', 'Multiple templates', 'Priority support'].map(i => (
                        <li key={i} className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />{i}</li>
                      ))}
                    </ul>
                    <Button className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold" onClick={() => handleCheckout('subscription')} disabled={checkingOut}>
                      {checkingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4 mr-2" />Subscribe</>}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom nav */}
          <div className="border-t border-stone-800 px-8 py-4 flex justify-between items-center bg-stone-900/50">
            <Button variant="ghost" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} className="text-stone-400 hover:text-white hover:bg-stone-800">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            {step < STEPS.length - 1 && (
              <Button onClick={() => setStep(s => s + 1)} className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-6">
                Continue <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>

        {/* Live preview panel — hidden on mobile, visible on lg+ */}
        <div className="hidden lg:block w-[45%] bg-stone-950 p-6 overflow-y-auto">
          <div className="text-xs text-stone-500 font-medium mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
            Live Preview · {TEMPLATES.find(t => t.id === templateId)?.name} template
          </div>
          <ResumePreview resume={resume} templateId={templateId} />
        </div>
      </div>

      {/* Mobile-only floating preview button */}
      <MobilePreviewSheet resume={resume} templateId={templateId} />

      {/* Save-your-work prompt for anonymous users */}
      <SaveYourWorkPrompt resume={resume} isAnonymous={!resumeId} />

      {/* Always-visible checkout FAB so users can ATC from any step */}
      <QuickCheckoutFAB />
    </div>
  )
}

function MobilePreviewSheet({ resume, templateId }: { resume: Resume; templateId: TemplateId }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      {/* Floating button — only visible on mobile/tablet */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Preview resume"
        className="lg:hidden fixed bottom-20 right-5 z-40 inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm h-12 px-5 rounded-full shadow-[0_8px_30px_-5px_rgba(245,158,11,0.6)] transition-transform active:scale-95"
      >
        <span>👁 Preview</span>
      </button>

      {open && (
        <div className="lg:hidden fixed inset-0 z-50 bg-stone-950 flex flex-col">
          <header className="px-4 py-3 border-b border-stone-800 flex items-center justify-between">
            <div className="text-stone-100 font-bold text-sm">Resume Preview</div>
            <button onClick={() => setOpen(false)} className="text-stone-400 hover:text-stone-100 text-sm font-medium">
              ← Back to edit
            </button>
          </header>
          <div className="flex-1 overflow-y-auto p-4 bg-stone-950">
            <ResumePreview resume={resume} templateId={templateId} />
          </div>
        </div>
      )}
    </>
  )
}
