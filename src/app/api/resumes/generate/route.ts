import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import OpenAI from 'openai'

let _openai: OpenAI | null = null
function getOpenAI() {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return _openai
}

const SYSTEM = `You are a professional resume writer. Given a user's background description, generate a complete, polished resume as JSON.

Rules:
- Write achievement-focused bullet points (quantify results where possible, infer reasonable numbers if not given)
- Use strong action verbs
- Keep summary to 2 sentences max
- Generate 2-4 work experiences (fill gaps intelligently if description is sparse)
- Generate 1-2 education entries
- Generate 6-10 skills
- All IDs must be unique strings (use "exp1", "exp2", "edu1", "skill1" etc.)
- Dates format: "Month YYYY" or "YYYY"

Return ONLY valid JSON matching this exact shape, no markdown, no explanation:
{
  "title": "Resume title (e.g. 'John Smith - Software Engineer')",
  "personalInfo": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedin": "string or empty",
    "website": "string or empty",
    "summary": "string"
  },
  "experience": [
    {
      "id": "exp1",
      "company": "string",
      "title": "string",
      "startDate": "string",
      "endDate": "string",
      "current": false,
      "bullets": ["string", "string", "string"]
    }
  ],
  "education": [
    {
      "id": "edu1",
      "school": "string",
      "degree": "string",
      "field": "string",
      "graduationDate": "string",
      "gpa": ""
    }
  ],
  "skills": [
    { "id": "skill1", "name": "string" }
  ]
}`

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { prompt } = await req.json().catch(() => ({}))
  if (!prompt?.trim()) return NextResponse.json({ error: 'Prompt required' }, { status: 400 })

  const user = await db.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const completion = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM },
      { role: 'user', content: prompt.trim() },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  })

  const raw = completion.choices[0]?.message?.content ?? ''

  let parsed: { title?: string; personalInfo?: object; experience?: object[]; education?: object[]; skills?: object[] }
  try {
    parsed = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'AI returned invalid JSON. Please try again.' }, { status: 500 })
  }

  const { title, ...resumeData } = parsed

  const resume = await db.savedResume.create({
    data: {
      userId: user.id,
      title: (title as string) ?? 'AI Generated Resume',
      data: JSON.stringify(resumeData),
      templateId: 'classic',
    },
  })

  return NextResponse.json({ resume }, { status: 201 })
}
