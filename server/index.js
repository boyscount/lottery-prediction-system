require('dotenv').config()
const express = require('express')
const cors = require('cors')
const crypto = require('crypto')
const Omise = require('omise')
const { createClient } = require('@supabase/supabase-js')

// ── Anthropic (optional — AI features) ───────────────────────────
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY
async function callClaude(messages, systemPrompt, maxTokens = 512) {
  if (!ANTHROPIC_KEY) throw new Error('ANTHROPIC_API_KEY not configured')
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Anthropic API error: ${res.status} ${err}`)
  }
  const data = await res.json()
  return data.content[0].text
}

const app = express()
const PORT = process.env.PORT || 4000

// ── Supabase admin client (service role — never expose to frontend) ──
const supabaseReady = !!(
  process.env.SUPABASE_URL &&
  process.env.SUPABASE_SERVICE_ROLE_KEY &&
  !process.env.SUPABASE_URL.includes('xxxxxxxxxxxxxxxxxxxx')
)
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder',
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// ── Omise client ──────────────────────────────────────────────────
const omise = Omise({
  secretKey: process.env.OMISE_SECRET_KEY,
  omiseVersion: '2019-05-29',
})

// ── Middleware ────────────────────────────────────────────────────
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',')
const isDev = process.env.NODE_ENV !== 'production'
app.use(cors({
  origin: (origin, cb) => {
    // Dev mode: allow all origins
    if (isDev) return cb(null, true)
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return cb(null, true)
    // Prod: check against FRONTEND_URL list
    if (allowedOrigins.some(o => origin.startsWith(o.trim()))) return cb(null, true)
    cb(new Error('Not allowed by CORS'))
  },
  credentials: true,
}))

// Raw body for webhook signature verification
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }))
app.use(express.json({ limit: '10mb' }))

// ── Auth middleware ──────────────────────────────────────────────
async function requireAuth(req, res, next) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' })
  const token = auth.slice(7)
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return res.status(401).json({ error: 'Invalid token' })
  req.user = user
  next()
}

// ── Premium middleware — ใช้กับ AI endpoints ─────────────────────
// ชั้นที่ 1 (frontend) ป้องกัน UX, ชั้นนี้ enforce จริง
async function requirePremium(req, res, next) {
  // Dev mode (ไม่มี Supabase) → ข้ามการตรวจสอบ
  if (!supabaseReady) return next()

  // ต้องมี Bearer token
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ', code: 'REQUIRE_LOGIN' })
  }

  // Verify JWT กับ Supabase Auth
  const token = auth.slice(7)
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) {
    return res.status(401).json({ error: 'Session หมดอายุ กรุณาล็อกอินใหม่', code: 'INVALID_TOKEN' })
  }

  // ตรวจ subscription จาก DB (ไม่เชื่อ frontend เด็ดขาด)
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('status, expires_at')
    .eq('user_id', user.id)
    .single()

  const isPremium =
    sub?.status === 'premium' &&
    (!sub.expires_at || new Date(sub.expires_at) > new Date())

  if (!isPremium) {
    return res.status(403).json({ error: 'ฟีเจอร์นี้สำหรับสมาชิก Premium เท่านั้น', code: 'REQUIRE_PREMIUM' })
  }

  req.user = user
  next()
}

// ── POST /api/payment/charge (card via Omise token) ───────────────
app.post('/api/payment/charge', requireAuth, async (req, res) => {
  const { token } = req.body
  if (!token) return res.status(400).json({ error: 'Missing card token' })

  try {
    const charge = await omise.charges.create({
      amount: 5900,        // 59 THB in satang
      currency: 'thb',
      card: token,
      description: `LottoMind Premium — ${req.user.email}`,
      metadata: { userId: req.user.id },
    })

    if (charge.status === 'successful') {
      await activatePremium(req.user.id, charge.id, 'card', 5900)
      return res.json({ success: true, chargeId: charge.id })
    }

    return res.status(402).json({ error: charge.failure_message || 'Payment failed' })
  } catch (err) {
    console.error('Charge error:', err)
    res.status(500).json({ error: 'Payment processing error' })
  }
})

// ── POST /api/payment/promptpay (create PromptPay source) ─────────
app.post('/api/payment/promptpay', requireAuth, async (req, res) => {
  try {
    const source = await omise.sources.create({
      amount: 5900,
      currency: 'thb',
      type: 'promptpay',
    })

    const charge = await omise.charges.create({
      amount: 5900,
      currency: 'thb',
      source: source.id,
      description: `LottoMind Premium — ${req.user.email}`,
      metadata: { userId: req.user.id },
      return_uri: `${process.env.FRONTEND_URL}/payment/callback`,
    })

    // Record pending payment
    await supabase.from('payments').insert({
      user_id: req.user.id,
      amount: 5900,
      currency: 'thb',
      status: 'pending',
      method: 'promptpay',
      omise_charge_id: charge.id,
    })

    res.json({
      success: true,
      chargeId: charge.id,
      qrImage: charge.source?.scannable_code?.image?.download_uri ?? null,
      expiresAt: charge.expires_at,
    })
  } catch (err) {
    console.error('PromptPay error:', err)
    res.status(500).json({ error: 'PromptPay creation failed' })
  }
})

// ── GET /api/payment/status/:chargeId ─────────────────────────────
app.get('/api/payment/status/:chargeId', requireAuth, async (req, res) => {
  try {
    const charge = await omise.charges.retrieve(req.params.chargeId)
    if (charge.status === 'successful') {
      await activatePremium(req.user.id, charge.id, charge.source?.type ?? 'unknown', charge.amount)
    }
    res.json({ status: charge.status })
  } catch (err) {
    res.status(500).json({ error: 'Status check failed' })
  }
})

// ── POST /api/payment/webhook (Omise webhook) ─────────────────────
app.post('/api/payment/webhook', async (req, res) => {
  // Verify HMAC-SHA256 signature
  const sig = req.headers['omise-signature']
  if (process.env.OMISE_WEBHOOK_SECRET && sig) {
    const expected = crypto
      .createHmac('sha256', process.env.OMISE_WEBHOOK_SECRET)
      .update(req.body)
      .digest('hex')
    if (sig !== expected) return res.status(401).send('Invalid signature')
  }

  let event
  try { event = JSON.parse(req.body.toString()) } catch { return res.status(400).send('Bad JSON') }

  if (event.key === 'charge.complete') {
    const charge = event.data
    if (charge.status === 'successful' && charge.metadata?.userId) {
      await activatePremium(charge.metadata.userId, charge.id, charge.source?.type ?? 'card', charge.amount)
    }
  }

  res.sendStatus(200)
})

// ── Shared: activate premium in DB ───────────────────────────────
async function activatePremium(userId, chargeId, method, amount) {
  const exp = new Date()
  exp.setDate(exp.getDate() + 30)

  await supabase.from('subscriptions').upsert({
    user_id: userId,
    status: 'premium',
    started_at: new Date().toISOString(),
    expires_at: exp.toISOString(),
    updated_at: new Date().toISOString(),
  })

  await supabase.from('payments').upsert({
    omise_charge_id: chargeId,
    user_id: userId,
    amount,
    currency: 'thb',
    status: 'succeeded',
    method,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'omise_charge_id' })
}

// ── POST /api/ai/dream — AI Dream Interpreter (Premium only) ─────
app.post('/api/ai/dream', requirePremium, async (req, res) => {
  const { dreamText } = req.body
  if (!dreamText || typeof dreamText !== 'string' || dreamText.length > 1000) {
    return res.status(400).json({ error: 'dreamText required (max 1000 chars)' })
  }

  // Fallback if no API key (dev mode)
  if (!ANTHROPIC_KEY) {
    return res.json(fallbackDreamResult(dreamText))
  }

  try {
    const systemPrompt = `คุณเป็นผู้เชี่ยวชาญการตีความฝันและเลขมงคลไทย ตอบเป็น JSON เท่านั้น

รูปแบบ JSON ที่ต้องตอบ:
{
  "keywords": ["คำสำคัญ1", "คำสำคัญ2", ...],  // สิ่งที่ฝันเห็น (ไทย) สูงสุด 5 อย่าง
  "interpretation": "คำอธิบายความหมายของฝัน 1-2 ประโยค",
  "twoDigits": [12, 34, 56, 78],  // เลข 2 ตัวมงคล 4-6 ตัว (integer 0-99)
  "threeDigits": [123, 456, 789],  // เลข 3 ตัวมงคล 2-4 ตัว (integer 0-999)
  "confidence": 72,  // ความมั่นใจ 50-90 (integer)
  "luckyElements": ["สี/ทิศ/ธาตุที่เป็นมงคล"]  // สูงสุด 3 อย่าง
}

ตีความตามหลักโหราศาสตร์ไทยและความเชื่อเรื่องเลขมงคล ห้ามตอบนอกเหนือจาก JSON`

    const raw = await callClaude(
      [{ role: 'user', content: `ฉันฝันว่า: ${dreamText}` }],
      systemPrompt,
      800
    )

    // Extract JSON — handle plain JSON or markdown code blocks (```json ... ```)
    const stripped = raw.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '')
    const jsonMatch = stripped.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Invalid AI response format')
    const result = JSON.parse(jsonMatch[0])

    // Validate and sanitize
    res.json({
      keywords: (result.keywords || []).slice(0, 6).map(String),
      interpretation: String(result.interpretation || '').slice(0, 300),
      twoDigits: (result.twoDigits || []).filter(n => Number.isInteger(n) && n >= 0 && n <= 99).slice(0, 8),
      threeDigits: (result.threeDigits || []).filter(n => Number.isInteger(n) && n >= 0 && n <= 999).slice(0, 6),
      confidence: Math.min(95, Math.max(50, Number(result.confidence) || 70)),
      luckyElements: (result.luckyElements || []).slice(0, 3).map(String),
    })
  } catch (err) {
    console.error('AI dream error:', err.message)
    res.json(fallbackDreamResult(dreamText))
  }
})

function fallbackDreamResult(text) {
  // Simple keyword-based fallback (no AI key)
  const keywords = text.split(/\s+/).filter(w => w.length >= 2).slice(0, 4)
  const seed = text.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const rng = (n) => ((seed * 9301 + 49297) % 233280 / 233280 * n) | 0
  return {
    keywords,
    interpretation: 'ฝันนี้บ่งบอกถึงโชคลาภที่กำลังจะมาถึง ควรสังเกตสัญญาณรอบข้าง',
    twoDigits: [rng(99), rng(99), rng(99), rng(99)].map(n => Math.max(1, n)),
    threeDigits: [rng(999), rng(999), rng(999)].map(n => Math.max(1, n)),
    confidence: 60 + rng(20),
    luckyElements: ['สีเหลือง', 'ทิศตะวันออก'],
    isFallback: true,
  }
}

// ── POST /api/ai/scan — Vision AI Number Scanner (Premium only) ──
app.post('/api/ai/scan', requirePremium, async (req, res) => {
  const { imageBase64, mimeType = 'image/jpeg' } = req.body
  if (!imageBase64) return res.status(400).json({ error: 'imageBase64 required' })

  if (!ANTHROPIC_KEY) {
    return res.json({
      numbers: ['12', '34', '56'],
      luckyNumbers: ['34', '12'],
      interpretation: 'ไม่ได้ตั้งค่า API key — แสดงตัวอย่างข้อมูล',
      isFallback: true,
    })
  }

  try {
    const systemPrompt = `คุณเป็น AI วิเคราะห์ตัวเลขในรูปภาพ ตอบเป็น JSON เท่านั้น
รูปแบบ:
{
  "numbers": ["12", "34", "56"],  // ตัวเลขทั้งหมดที่เห็นในภาพ (string)
  "luckyNumbers": ["34"],         // เลขมงคลที่แนะนำ 2-4 ตัว
  "interpretation": "คำอธิบายสั้น ๆ เกี่ยวกับตัวเลขที่เห็น",
  "confidence": 80
}`

    const raw = await callClaude(
      [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mimeType, data: imageBase64 } },
          { type: 'text', text: 'โปรดวิเคราะห์ตัวเลขทั้งหมดในภาพนี้และแนะนำเลขมงคล' },
        ],
      }],
      systemPrompt,
      600
    )

    // Extract JSON — handle plain JSON or markdown code blocks (```json ... ```)
    const stripped = raw.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '')
    const jsonMatch = stripped.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('Raw AI scan response:', raw.slice(0, 500))
      throw new Error('Invalid AI response')
    }
    const result = JSON.parse(jsonMatch[0].trim())

    res.json({
      numbers: (result.numbers || []).slice(0, 20).map(String),
      luckyNumbers: (result.luckyNumbers || []).slice(0, 6).map(String),
      interpretation: String(result.interpretation || '').slice(0, 300),
      confidence: Math.min(99, Math.max(30, Number(result.confidence) || 70)),
    })
  } catch (err) {
    console.error('AI scan error:', err.message)
    res.status(500).json({ error: 'AI scan failed: ' + err.message })
  }
})

// ── Health check ─────────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ ok: true, ts: new Date().toISOString() }))

app.listen(PORT, () => {
  console.log(`LottoMind server running on :${PORT}`)
  if (!process.env.OMISE_SECRET_KEY) console.warn('⚠️  OMISE_SECRET_KEY not set')
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY not set')
})
