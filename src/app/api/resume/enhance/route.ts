import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'

let _client: OpenAI | null = null
function getClient() {
  if (!_client) _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return _client
}

const STRONG_BULLET_EXAMPLES = [
  'Increased quarterly revenue by 23% by redesigning checkout flow, reducing cart abandonment from 68% to 45%',
  'Led migration of monolithic Rails app to microservices, cutting deployment time from 4 hours to 12 minutes',
  'Managed $2.4M annual marketing budget across 6 channels, achieving 340% ROI on digital campaigns',
  'Built real-time analytics dashboard processing 50M events/day using Kafka and ClickHouse',
  'Reduced customer support tickets by 41% by shipping self-service onboarding wizard used by 12,000+ users',
]

export async function POST(req: NextRequest) {
  try {
    const { bullet, jobTitle, company } = await req.json()

    if (!bullet || bullet.trim().length < 5) {
      return NextResponse.json({ error: 'Bullet text too short' }, { status: 400 })
    }

    const examples = STRONG_BULLET_EXAMPLES.map((e, i) => `${i + 1}. ${e}`).join('\n')

    const completion = await getClient().chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 256,
      messages: [
        {
          role: 'system',
          content: 'You are an expert resume writer. Rewrite resume bullet points to be achievement-focused, quantified where possible, and ATS-optimized. Use strong action verbs. Keep it to 1-2 sentences max. Return ONLY the rewritten bullet with no explanation, no quotes, no extra text.',
        },
        {
          role: 'user',
          content: `Here are examples of strong resume bullets:\n${examples}\n\nNow rewrite this bullet point for a ${jobTitle || 'professional'} role${company ? ` at ${company}` : ''}:\n\n${bullet}`,
        },
      ],
    })

    const enhanced = completion.choices[0]?.message?.content?.trim() ?? bullet

    return NextResponse.json({ enhanced })
  } catch (err) {
    console.error('Enhance error:', err)
    return NextResponse.json({ error: 'Failed to enhance bullet' }, { status: 500 })
  }
}
