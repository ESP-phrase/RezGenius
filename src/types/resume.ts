export interface PersonalInfo {
  name: string
  email: string
  phone: string
  location: string
  linkedin?: string
  website?: string
  summary?: string
  /** Data URL (base64) of the user's profile photo. Stored client-side. */
  photoUrl?: string
}

export interface Experience {
  id: string
  company: string
  title: string
  startDate: string
  endDate: string
  current: boolean
  bullets: string[]
}

export interface Education {
  id: string
  school: string
  degree: string
  field: string
  graduationDate: string
  gpa?: string
}

export interface Skill {
  id: string
  name: string
}

export interface Resume {
  personalInfo: PersonalInfo
  experience: Experience[]
  education: Education[]
  skills: Skill[]
}

export type ResumeSection = 'template' | 'personal' | 'experience' | 'education' | 'skills' | 'preview'

export type TemplateId = 'classic' | 'modern' | 'minimal' | 'bold' | 'sidebar' | 'clean'

export interface TemplateConfig {
  accentColor: string        // hex e.g. '#2a7d7b'
  font: 'sans' | 'serif'
  spacing: 'compact' | 'normal' | 'spacious'
}
