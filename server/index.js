require('dotenv').config()
const express = require('express')
const cors = require('cors')
const crypto = require('crypto')
const Omise = require('omise')
const { createClient } = require('@supabase/supabase-js')

const app = express()
const PORT = process.env.PORT || 4000

// ── Supabase admin client (service role — never expose to frontend) ──
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// ── Omise client ──────────────────────────────────────────────────
const omise = Omise({
  secretKey: process.env.OMISE_SECRET_KEY,
  omiseVersion: '2019-05-29',
})

// ── Middleware ────────────────────────────────────────────────────
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',')
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.some(o => origin.startsWith(o.trim()))) return cb(null, true)
    cb(new Error('Not allowed by CORS'))
  },
  credentials: true,
}))

// Raw body for webhook signature verification
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }))
app.use(express.json())

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

// ── Health check ─────────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ ok: true, ts: new Date().toISOString() }))

app.listen(PORT, () => {
  console.log(`LottoMind server running on :${PORT}`)
  if (!process.env.OMISE_SECRET_KEY) console.warn('⚠️  OMISE_SECRET_KEY not set')
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY not set')
})
