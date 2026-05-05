# LottoMind — Claude Code Reference

ระบบทำนายหวยไทยอัจฉริยะ ใช้สถิติ + ความฝัน + โหราศาสตร์ไทย + AI  
**React SPA + Express backend** — Auth & DB ผ่าน Supabase, Payment ผ่าน Omise, AI ผ่าน Anthropic  
Dev mode ไม่มี Supabase/Omise → fallback ทุกอย่างไปที่ `localStorage` อัตโนมัติ  
**AI features (Dream AI + Vision Scan) ต้องเป็นสมาชิก Premium เท่านั้น** — enforce ทั้ง frontend + backend

---

## Dev Commands

```bash
# Frontend
npm run dev      # http://localhost:5173 (Vite default) หรือ port ถัดไป
npm run build    # tsc + vite build → dist/
npm run preview  # Preview production build

# Backend (แยก terminal)
cd server
npm install
npm run dev      # node --watch index.js → :4000
```

---

## Environment Variables

### Frontend (`.env` — copy จาก `.env.example`)
```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_OMISE_PUBLIC_KEY=pkey_test_...
VITE_API_URL=http://localhost:4000
```

### Backend (`server/.env` — copy จาก `server/.env.example`)
```env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # ห้ามใส่ใน frontend เด็ดขาด — bypass RLS ทั้งหมด
OMISE_SECRET_KEY=skey_test_...
OMISE_PUBLIC_KEY=pkey_test_...
OMISE_WEBHOOK_SECRET=whsec_...
ANTHROPIC_API_KEY=sk-ant-api03-... # ต้องมี credits — AI Dream + Vision Scanner
PORT=4000
FRONTEND_URL=http://localhost:3000  # ถ้า dev ใช้ port อื่น ต้องแก้ หรือ isDev=true bypass CORS
NODE_ENV=development
```

> **ถ้าไม่ตั้งค่า Supabase** — `supabaseReady = false` → app ทำงานด้วย localStorage ทั้งหมด (dev mode)  
> **ถ้าไม่มี ANTHROPIC_API_KEY** — AI endpoints คืน fallback random numbers แทนที่จะ crash

---

## Tech Stack

### Frontend
| Layer        | Library / Tool                             | Version  |
|--------------|--------------------------------------------|----------|
| UI           | React                                      | 18.3.1   |
| Language     | TypeScript                                 | 5.5.3    |
| Bundler      | Vite                                       | 5.3.4    |
| Charts       | Recharts                                   | 2.12.7   |
| Icons        | Lucide React                               | 0.400.0  |
| CSS Utility  | Tailwind CSS                               | 3.4.6    |
| DB/Auth      | @supabase/supabase-js                      | ^2.39    |
| Helpers      | clsx, date-fns                             | latest   |
| Fonts        | Sarabun (Thai) + Space Grotesk (numbers)   | Google   |

### Backend (`server/`)
| Layer        | Library                                    | Notes |
|--------------|--------------------------------------------|-------|
| Runtime      | Node.js (≥18) — native fetch built-in      | |
| Framework    | Express 4                                  | |
| Payment      | omise `^1.1.0`                             | ⚠️ ต้องใช้ v1.x ไม่ใช่ v2+ |
| DB           | @supabase/supabase-js (service-role)       | bypass RLS |
| AI           | Anthropic API (`claude-haiku-4-5-20251001`) via fetch | |
| Helpers      | cors, dotenv                               | |

---

## Project Structure

```
.
├── .env                        # Frontend env (ไม่ commit — gitignored)
├── .env.example                # Frontend env template
├── CLAUDE.md                   # ← ไฟล์นี้
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
│
├── server/                     # Express backend
│   ├── .env                    # Backend env (ไม่ commit — gitignored)
│   ├── .env.example
│   ├── package.json
│   └── index.js                # Payment API + AI API + webhook + requirePremium middleware
│
├── supabase/
│   └── migrations/
│       └── 001_schema.sql      # Full PostgreSQL schema + RLS + triggers + seed
│
└── src/
    ├── main.tsx                # React root
    ├── App.tsx                 # Root state, auth, routing, onAuthStateChange
    ├── index.css               # Design tokens + all CSS components
    ├── vite-env.d.ts           # Vite ImportMeta types
    │
    ├── types/
    │   └── index.ts            # All TypeScript interfaces
    │
    ├── lib/
    │   ├── supabase.ts         # Supabase client + supabaseReady flag + navigator lock bypass
    │   └── db.ts               # DB operations (Supabase ↔ localStorage fallback)
    │
    ├── data/
    │   ├── lotteryHistory.ts   # 55 REAL draws (Jan 2024 – Apr 2026) + getNextDrawDate()
    │   └── dreamDatabase.ts    # 60+ dream entries
    │
    ├── utils/
    │   ├── auth.ts             # Auth: Supabase + localStorage fallback, rate limit, isPremium
    │   ├── aiRateLimit.ts      # (superseded) rate limit helper — ปัจจุบัน premium-only แทน
    │   ├── prediction.ts       # Weighted prediction engine
    │   ├── statistics.ts       # Frequency, position, overdue, sum analysis
    │   └── astrology.ts        # Thai zodiac, elements, lunar phase
    │
    └── components/
        ├── Layout.tsx          # Header + mobile nav (admin tab visible when isAdmin)
        ├── Logo.tsx            # SVG hexagonal gem logo
        ├── AuthModal.tsx       # Login / Register modal
        ├── SubscriptionModal.tsx  # Donate modal (QR/PromptPay, no session required)
        ├── AdminPanel.tsx      # Admin: users, payments, premium grant/revoke
        ├── PaywallOverlay.tsx  # Blur + lock overlay
        ├── Dashboard.tsx       # Live countdown, latest result, hot/cold balls, community trending
        ├── Predictor.tsx       # ทำนายเลข 2/3/6 ตัว (slot machine loader + particle burst)
        ├── DreamInterpreter.tsx   # ฝันแล้วได้เลข (browse mode + AI mode — AI ต้อง Premium)
        ├── NumberScanner.tsx   # 📷 สแกนเลขด้วย AI (ต้อง Premium — camera/upload → Vision AI)
        ├── NumberJournal.tsx   # บันทึกเลข + ติดตามผล (sync Supabase เมื่อ login)
        ├── Statistics.tsx      # สถิติ + Heatmap (advanced = PREMIUM)
        ├── AstrologyPanel.tsx  # โหราศาสตร์ไทย + ดวงประจำเดือน + draw strength
        └── HistoryManager.tsx  # ประวัติการออกรางวัล
```

---

## Database Schema (Supabase PostgreSQL)

### Tables
| Table            | Description                                  |
|------------------|----------------------------------------------|
| `profiles`       | username, avatar_color, is_admin — linked to auth.users |
| `subscriptions`  | status (free/premium/expired), expires_at    |
| `payments`       | Omise charge records, amount in satang        |
| `lottery_draws`  | ผลรางวัล (shared ทุก user)                    |
| `user_dreams`    | DreamSelection per user                      |
| `user_astrology` | AstrologyProfile per user (JSONB)            |
| `user_journal`   | JournalEntry per user (sync เมื่อ login)      |

### RLS Policies (สำคัญ)
- Users อ่าน/เขียนได้เฉพาะแถวของตัวเอง (`auth.uid() = user_id`)
- `lottery_draws` — ทุกคนอ่านได้, แก้ไขได้เฉพาะ `is_admin = TRUE`
- `user_journal` — `FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)`
- `subscriptions` — admin จัดการได้ทุก row ผ่าน `is_admin()` function (ต้องรัน SQL เพิ่ม)
- Service Role Key (backend เท่านั้น) — bypass RLS ทั้งหมด

### Triggers
- `on_auth_user_created` → auto-insert profile + free subscription เมื่อ user สมัคร
- `subscription_expiry_check` → auto-set `status = 'expired'` เมื่อ `expires_at < NOW()`

### Setup ใน Supabase Dashboard
1. ไปที่ **SQL Editor**
2. วาง `supabase/migrations/001_schema.sql` ทั้งหมด แล้วกด **Run**
3. รัน SQL เพิ่ม — Admin subscriptions policy:
   ```sql
   CREATE POLICY "Admins can manage all subscriptions"
   ON subscriptions FOR ALL
   USING (is_admin()) WITH CHECK (is_admin());
   ```
4. ไปที่ **Authentication → Settings** → ปิด "Confirm email" (สำหรับ dev)
5. สร้าง admin user: ตั้ง `is_admin = TRUE` ใน `profiles` table โดยตรง

---

## Premium Security System (2 Layers)

AI features (Dream AI + Vision Scan) ถูก protect ด้วย 2 ชั้น:

### Layer 1 — Frontend UX Gate (`NumberScanner.tsx`, `DreamInterpreter.tsx`)
```
ไม่ได้ login → แสดง "กรุณาเข้าสู่ระบบ" + ปุ่ม login/register
login แต่ไม่ premium → แสดง "สำหรับสมาชิก Premium" + ปุ่ม upgrade
premium → แสดง UI เต็ม + ส่ง Bearer token กับทุก request
```

### Layer 2 — Backend Enforcement (`requirePremium` middleware)
```javascript
// server/index.js
async function requirePremium(req, res, next) {
  if (!supabaseReady) return next()  // dev mode: ข้ามการตรวจสอบ

  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer '))
    return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ', code: 'REQUIRE_LOGIN' })

  const token = auth.slice(7)
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user)
    return res.status(401).json({ error: 'Session หมดอายุ', code: 'INVALID_TOKEN' })

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('status, expires_at')
    .eq('user_id', user.id)
    .single()

  const isPremium = sub?.status === 'premium' &&
    (!sub.expires_at || new Date(sub.expires_at) > new Date())

  if (!isPremium)
    return res.status(403).json({ error: 'ฟีเจอร์นี้สำหรับสมาชิก Premium เท่านั้น', code: 'REQUIRE_PREMIUM' })

  req.user = user
  next()
}

// Applied to AI endpoints:
app.post('/api/ai/dream', requirePremium, ...)
app.post('/api/ai/scan',  requirePremium, ...)
```

### Error Handling ใน Frontend
```typescript
if (res.status === 401) → prompt login
if (res.status === 403) → prompt upgrade to premium
```

---

## Auth System (`src/utils/auth.ts`)

### Dual Mode
| ตัวแปร | Supabase mode | localStorage mode |
|--------|--------------|-------------------|
| `supabaseReady` | `true` | `false` |
| register | `supabase.auth.signUp` | hash + JSON array |
| login | `supabase.auth.signInWithPassword` | ตรวจ hash |
| session | Supabase JWT → `buildUserSession()` | parse JSON |
| data | Supabase tables | `lottomind_*` keys |
| `session.token` | Supabase JWT (access_token จริง) | random hex token |

### localStorage Keys (dev mode / fallback)
| Key | เก็บอะไร |
|-----|---------|
| `lottomind_auth` | Supabase session (ถ้า supabaseReady) |
| `lottomind_users` | `UserProfile[]` (localStorage mode only) |
| `lottomind_session` | `UserSession` cache |
| `lottomind_draws` | `LotteryDraw[]` |
| `lottomind_dreams_{userId}` | `DreamSelection[]` |
| `lottomind_astro_{userId}` | `AstrologyProfile` |
| `lottomind_journal_{userId}` | `JournalEntry[]` (cache — Supabase is source of truth) |
| `lottomind_rate` | `{date, count}` — rate limit (3/day free users) |

### Key Functions
```typescript
registerUser(username, email, password)  // async → { success, session?, error? }
loginUser(email, password)               // Supabase mode: email only (username ไม่รองรับ)
logoutUser()                             // scope:'local' signOut + clearSessionLocal
activatePremium(session)                 // async → UserSession (updates DB or localStorage)
buildUserSession(supabaseUser, sub?, accessToken?)  // map Supabase user → UserSession
                                         // ⚠️ ต้องส่ง accessToken เพื่อให้ session.token = JWT จริง
getSession()                             // sync read localStorage (for initial state)
getSessionAsync()                        // async — ตรวจ Supabase session ด้วย
isPremium(session)                       // boolean — status==='premium' && expiresAt > now
checkRateLimit()                         // { allowed, remaining } (3/day free users)
incrementRateLimit()                     // บวก counter
```

### Critical: Token Must Be Real Supabase JWT
```typescript
// ✅ CORRECT — ส่ง access_token จาก Supabase session
const session = await buildUserSession(data.user, null, data.session?.access_token)

// ❌ WRONG — generateToken() สร้าง random hex ไม่ใช่ JWT — backend จะปฏิเสธ
```

### Navigator Lock Bypass (`src/lib/supabase.ts`)
```typescript
export const supabase = createClient(url || 'https://placeholder.supabase.co', key || 'placeholder', {
  auth: {
    persistSession: true,
    storageKey: 'lottomind_auth',
    autoRefreshToken: true,
    // ป้องกัน NavigatorLockAcquireTimeoutError
    lock: <R>(_name: string, _timeout: number, fn: () => Promise<R>): Promise<R> => fn(),
  },
})
```

### Logout Must Use `scope: 'local'`
```typescript
// ✅ CORRECT — ป้องกัน lock contention บน logout
await supabase.auth.signOut({ scope: 'local' })

// ❌ WRONG — default scope ทำให้ NavigatorLockAcquireTimeoutError
await supabase.auth.signOut()
```

### Security Notes
- Password hash: `SHA-256(password + SALT)` via Web Crypto API — localStorage mode เท่านั้น
- Supabase mode: password จัดการโดย Supabase Auth (bcrypt) — ปลอดภัยกว่า
- Input sanitization: strip `<>"'&`, validate regex ก่อนทุก operation
- Rate limit: 3 predictions/day สำหรับ free user (frontend only — Predictor component)

---

## DB Operations (`src/lib/db.ts`)

ทุก function รองรับทั้ง Supabase และ localStorage:

### getDraws() — Merge Strategy (สำคัญ)
localStorage mode จะ **merge** ข้อมูลแทน replace เพื่อป้องกัน stale cache ทับ real data:
```typescript
// lotteryHistory (hardcoded) เป็น source of truth เสมอ
// User-added draws (ที่ admin เพิ่มเอง) จะถูก preserve
const historyIds = new Set(lotteryHistory.map(d => d.id))
const userAdded  = stored.filter(d => !historyIds.has(d.id))
return [...lotteryHistory, ...userAdded].sort(...)
```
> ถ้าไม่ทำ merge: user ที่มี cached draws เก่าใน localStorage จะไม่เห็น real draws ใหม่

```typescript
// Draws (shared)
getDraws()                          // → LotteryDraw[]
saveDraws(draws)                    // upsert
deleteDraw(id)                      // Supabase เท่านั้น

// Per-user data (Supabase when logged in, localStorage fallback)
getDreams(userId?)                  // → DreamSelection[]
saveDreams(dreams, userId?)
getAstrology(userId?)               // → AstrologyProfile | null
saveAstrology(profile, userId?)
getJournal(userId?)                 // → JournalEntry[] (localStorage as cache)
saveJournal(entries, userId?)       // localStorage เสมอ + Supabase upsert ถ้า login

// Subscription
getSubscription(userId)             // Supabase เท่านั้น

// Admin (ต้องใช้ service role หรือ is_admin policies)
adminGetUsers()                     // profiles + subscriptions join
adminGetPayments()                  // payments + profiles join
adminSetPremium(userId, days)       // upsert subscription
adminRevokeSubscription(userId)     // set status='free'
```

### saveJournal — Dual Write Strategy
```typescript
// เก็บ localStorage เสมอ (ใช้เป็น cache + offline support)
localStorage.setItem(key, JSON.stringify(entries))
// Supabase upsert เมื่อ supabaseReady && userId
await supabase.from('user_journal').upsert(rows, { onConflict: 'id' })
```

---

## Payment Flow (`server/index.js`)

### ⚠️ หมายเหตุสำคัญ — Omise ไม่ได้ใช้งานจริง
เว็บทำนายหวยเข้าข่ายการพนัน → ผิด ToS ของ Omise, Stripe, และ payment gateway ทั่วไป  
**Flow จริงที่ใช้งานในปัจจุบัน = Manual (QR ส่วนตัว + admin grant)**

### Manual Premium Flow (ปัจจุบัน)
```
1. user กดปุ่ม "อัพเกรด" → เห็น SubscriptionModal (mode='upgrade')
2. สแกน QR PromptPay ส่วนตัว → โอนเงิน 59 บาท
3. ส่ง slip + ชื่อผู้ใช้ มาที่ kimminho.love1103@gmail.com
4. admin เปิด Admin Panel → แท็บ 👥 ผู้ใช้ → กด "💎 ให้สิทธิ์" → ใส่วัน → ยืนยัน
```

### SubscriptionModal — 2 Modes
| prop `mode` | เปิดจาก | Title | เนื้อหา |
|---|---|---|---|
| `'donate'` | ❤️ ปุ่มสนับสนุนใน header | "สนับสนุน LottoMind" | QR + "donate ได้เลย ไม่มีขั้นต่ำ" |
| `'upgrade'` | 🔒 paywall ใน feature ต่างๆ | "อัพเกรดเป็น Premium" | QR + feature list + ราคา 59฿ + email box |

```typescript
// App.tsx — แยก mode ตาม source
onShowSubscription={() => { setSubMode('donate'); setShowSub(true) }}   // Layout heart
onShowSubscription={() => { setSubMode('upgrade'); setShowSub(true) }}  // paywall components
```

### Admin: Grant Premium
ใช้ Admin Panel ในแอป (ไม่ต้องแตะ Supabase โดยตรง):
1. Login ด้วย admin account
2. แท็บ **🛡️ Admin → 👥 ผู้ใช้**
3. กด **💎 ให้สิทธิ์** → ใส่จำนวนวัน → **ยืนยัน**

> ⚠️ ต้องรัน SQL เพิ่ม RLS policy ก่อน (ดู Setup section)  
> ⚠️ `adminSetPremium` และ `adminRevokeSubscription` ต้องใช้ `onConflict: 'user_id'`

### Backend Omise Endpoints (โค้ดพร้อม แต่ไม่ได้ใช้)
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/payment/charge` | Bearer JWT | Card payment (Omise) |
| `POST` | `/api/payment/promptpay` | Bearer JWT | PromptPay QR (Omise) |
| `GET`  | `/api/payment/status/:id` | Bearer JWT | Poll charge status |
| `POST` | `/api/payment/webhook` | HMAC signature | Omise webhook |
| `GET`  | `/api/lottery/latest` | — | Auto-fetch ผลล่าสุด |
| `POST` | `/api/ai/dream` | **Bearer JWT + Premium** | AI Dream Interpreter |
| `POST` | `/api/ai/scan`  | **Bearer JWT + Premium** | Vision AI number scanner |
| `GET`  | `/health` | — | Health check |

> ⚠️ AI endpoints **ต้องมี Premium subscription** — ถ้าไม่มี backend คืน 403 REQUIRE_PREMIUM  
> Dev mode (`supabaseReady=false`): `requirePremium` ข้ามการตรวจสอบทั้งหมด

---

## Admin Panel (`src/components/AdminPanel.tsx`)

- ปรากฏใน nav เฉพาะ `session.isAdmin === true`
- ต้องการ `supabaseReady` — ถ้าไม่มี Supabase จะแสดง placeholder
- **Users tab**: ตาราง users + subscription status, ปุ่มให้/ถอน Premium (ระบุจำนวนวัน)
- **Payments tab**: ตาราง payments, จำนวนเงิน, method, status
- **Summary cards**: จำนวน users, Premium active, การชำระสำเร็จ, รายรับรวม

### RLS Requirement (สำคัญ)
Admin Panel ใช้ frontend Supabase client (anon key + RLS) — ต้องมี policy พิเศษ:
```sql
-- ต้องรันใน Supabase SQL Editor ก่อนใช้งาน Admin Panel
CREATE POLICY "Admins can manage all subscriptions"
ON subscriptions FOR ALL
USING (is_admin())
WITH CHECK (is_admin());
```
> ใช้ `is_admin()` SECURITY DEFINER function (สร้างไว้แล้วใน profiles policy) — ไม่มี recursion  
> ถ้าไม่มี policy นี้ → กด "💎 ให้สิทธิ์" จะได้ **403 Forbidden**

---

## Types (`src/types/index.ts`)

```typescript
TabType            // 'dashboard' | 'predict' | 'dream' | 'statistics' | 'astrology' | 'history'
ExtendedTabType    // TabType | 'journal' | 'scanner' | 'admin'  (defined locally in App.tsx + Layout.tsx)
SubscriptionStatus // 'free' | 'premium' | 'expired'

UserSession {
  userId, username, email
  token              // Supabase JWT (access_token) ใน Supabase mode — ใช้เป็น Bearer token
  createdAt, expiresAt         // token expiry (30 วัน)
  avatarColor                  // hex color
  isAdmin?: boolean
  subscription: { status, startDate, expiresAt }
}

UserProfile {       // localStorage mode เท่านั้น
  id, username, email, passwordHash
  createdAt, avatarColor, subscription
}

LotteryDraw        // id=date, date, firstPrize(6d), threeDigitFront[2], threeDigitBack[2], twoDigitBack
DreamEntry         // id, thaiName, englishName, category, twoDigit[], threeDigit[], confidence, tags[]
DreamSelection     // dreamId, thaiName, twoDigit[], threeDigit[], confidence
AstrologyProfile   // birthDate, element, thaiZodiac, luckyNumbers[], luckyDays[], luckyColors[], fortune, personalNumber
PredictedNumber    // number, score, confidence, reasons[], factors{statistical,dream,astrology,pattern}
PredictionResult   // twoDigit[], threeDigit[], sixDigit[], generatedAt, drawDate, inputFactors
JournalEntry       // id, drawDate, numbers[{type,value}], note?, checkedResult?, hitPrize?, createdAt
```

---

## AI Features (`server/index.js`)

> ⚠️ ทั้งสอง endpoint ต้องผ่าน `requirePremium` middleware ก่อนเสมอ

### AI Dream Interpreter (`POST /api/ai/dream`)
```typescript
// Request (+ Header: Authorization: Bearer <JWT>)
{ dreamText: string }  // Thai natural language, max 1000 chars

// Response
{
  keywords: string[]       // สิ่งที่พบในความฝัน (max 6)
  interpretation: string   // คำอธิบาย
  twoDigits: number[]      // เลข 2 ตัวมงคล (4-8 ตัว)
  threeDigits: number[]    // เลข 3 ตัวมงคล (2-6 ตัว)
  confidence: number       // 50-95
  luckyElements: string[]  // สี/ทิศ/ธาตุ (max 3)
  isFallback?: boolean     // true ถ้าไม่มี API key
}
```
- ใช้ `claude-haiku-4-5-20251001` (เร็ว ราคาถูก)
- **Fallback mode**: ถ้าไม่มี `ANTHROPIC_API_KEY` → คืน random numbers (ไม่ crash)
- Frontend: `DreamInterpreter.tsx` → mode toggle `browse` / `ai` (ai tab แสดง paywall ถ้าไม่ premium)

### Vision AI Scanner (`POST /api/ai/scan`)
```typescript
// Request (+ Header: Authorization: Bearer <JWT>)
{ imageBase64: string, mimeType?: string }  // base64 image, ขนาดสูงสุด ~5 MB
// ⚠️ express.json({ limit: '10mb' }) ต้องตั้งค่าใน server ไม่งั้น HTTP 413

// Response
{
  numbers: string[]       // ตัวเลขทั้งหมดที่พบในภาพ
  luckyNumbers: string[]  // เลขมงคลแนะนำ
  interpretation: string
  confidence: number
}
```
- ใช้ Claude Vision API (image + text input)
- Frontend: `NumberScanner.tsx` — 3 states: login wall → upgrade wall → scanner UI
- ตัวอย่าง input: สลาก, ป้ายทะเบียน, บ้านเลขที่, ปฏิทิน

### Shared helper
```javascript
callClaude(messages, systemPrompt, maxTokens)  // wrapper around Anthropic fetch API
```

### Anthropic Model Version
```javascript
// ✅ ใช้ model นี้ (verified working, April 2026)
model: 'claude-haiku-4-5-20251001'

// ❌ deprecated — จะได้ 404
// 'claude-3-haiku-20240307'
// 'claude-3-5-haiku-20241022'
```

---

## Real Lottery Data (`src/data/lotteryHistory.ts`)

**55 real draws** from January 2024 – April 2026:
- Source: GLO (Government Lottery Office) via thethaiger.com  
- ข้อมูลจริงทุก draw: firstPrize, threeDigitFront[2], threeDigitBack[2], twoDigitBack
- Jan/May draws: date shifts apply (17th, 2nd instead of 16th/1st)
- **Note**: 2024-10-16 front-3-digit เป็น approximation (verified: 482962, 2d:00)

---

## Auto-Fetch Latest Lottery Result

ทุกครั้งที่ app โหลด จะ fetch ผลล่าสุดจาก external API อัตโนมัติ

### Flow
```
App.tsx mount → fetchLatestDraw() → GET /api/lottery/latest
→ backend fetch lotto.api.rayriffy.com/latest
→ parse Thai date + prizes → upsert Supabase → return draw
→ frontend: ถ้า draw.id ยังไม่อยู่ใน state → insert + sort
```

### Backend: `GET /api/lottery/latest` (`server/index.js`)
- **Source**: `https://lotto.api.rayriffy.com/latest`
- **User-Agent**: ต้องใช้ browser UA — Cloudflare block request ธรรมดา (error 1015)
- **Cache**: in-memory 1 ชั่วโมง (`lotteryCache`) — ไม่ hammer upstream API
- **upsert**: บันทึกลง Supabase `lottery_draws` อัตโนมัติถ้า `supabaseReady`

### Rayriffy API Response Shape (สำคัญ)
```javascript
{
  status: "success",
  response: {
    date: "2 พฤษภาคม 2569",   // ชื่อเดือนเต็มภาษาไทย (ไม่ใช่ย่อ)
    prizes: [                   // รางวัลหลัก — รางวัลที่ 1 อยู่ที่นี่
      { id: "prizeFirst", number: ["536077"], ... },
      ...
    ],
    runningNumbers: [           // เลขท้าย — อยู่แยกจาก prizes
      { id: "runningNumberFrontThree", number: ["267","318"] },
      { id: "runningNumberBackThree",  number: ["065","153"] },
      { id: "runningNumberBackTwo",    number: ["43"] },
    ]
  }
}
```

> ⚠️ **เลขท้าย 3/2 ตัวอยู่ใน `runningNumbers[]` ไม่ใช่ `prizes[]`**

### Date Parsing (`parseLotteryDate`)
รองรับ 3 format:
| Format | ตัวอย่าง |
|--------|---------|
| Full Thai month (พ.ศ.) | "2 พฤษภาคม 2569" → "2026-05-02" |
| Short Thai month (พ.ศ.) | "1 เม.ย. 2568" → "2025-04-01" |
| Slash/dash | "16/04/2568" → "2025-04-16" |

แปลง พ.ศ. → ค.ศ. ด้วย `year > 2500 ? year - 543 : year`

### Frontend: `fetchLatestDraw()` (`src/lib/db.ts`)
```typescript
export async function fetchLatestDraw(): Promise<LotteryDraw | null>
// - call GET /api/lottery/latest with 10s timeout
// - silent failure (return null) ถ้า backend down
```

### App.tsx — mount logic
```typescript
fetchLatestDraw().then(latest => {
  if (!latest) return
  setDraws(prev => {
    const exists = prev.some(d => d.id === latest.id)
    if (exists) return prev
    return [...prev, latest].sort((a, b) => a.date.localeCompare(b.date))
  })
})

---

## New UI Features

### Dashboard — Draw-Day Phase Machine (6 states)

Dashboard hero section เปลี่ยน UI ตาม state ของวันหวยออก คำนวณจากเวลาไทย (UTC+7) เสมอ

#### Thailand Time Helpers (`Dashboard.tsx`)
```typescript
getThaiNow(): Date              // UTC+7 — ทำงานถูกต้องทุก timezone ของ user
getTodayThaiISO(): string       // "YYYY-MM-DD" ของวันนี้ตามเวลาไทย
getThaiHourMinute(): { h, m }   // ชั่วโมง/นาที ตามเวลาไทย
isDrawDateISO(iso): boolean     // true ถ้า day = 1,2,16,17 (หวยออกวันนั้น)
addDaysISO(iso, n): string      // บวกวันแบบ safe ไม่มี timezone drift
thaiDate(iso): string           // "2026-04-16" → "16 เม.ย. 2569" (พ.ศ.)
```

#### DrawDayPhase State Machine
```typescript
type DrawDayPhase = 'normal' | 'today-eve' | 'today-pre' | 'today-live' | 'today-wait' | 'today-done'
```

| Phase | เงื่อนไข (เวลาไทย) | Hero UI |
|---|---|---|
| `normal` | ไม่ใช่วันหวยออก และพรุ่งนี้ก็ไม่ใช่ | Countdown ม่วง `.gb-animated` ปกติ |
| `today-eve` | พรุ่งนี้หวยออก (`isDrawDateISO(tomorrow)`) | 🎰 Ribbon gradient "หวยออกพรุ่งนี้!" + countdown urgent |
| `today-pre` | วันหวยออก ก่อน 14:00 Thai | 🎰 Banner ทอง "วันนี้หวยออก!" + countdown ถึง 15:00 + 2 CTA |
| `today-live` | วันหวยออก 14:00–15:30 Thai | 🔴 LIVE pulsing dot + "กำลังออกรางวัล!" + refresh button |
| `today-wait` | วันหวยออก หลัง 15:30 Thai แต่ยังไม่มีผลในข้อมูล | ⏳ "รอผลล่าสุด..." + refresh button |
| `today-done` | วันหวยออก และ latestDraw.date === todayISO | 🎉 การ์ดเขียว "ผลออกแล้ว!" โชว์รางวัลทุกประเภทใน hero |

`useDrawDayPhase()` hook ใช้ `setInterval(calc, 10000)` — อัปเดตทุก 10 วินาที

#### Latest Result Section
- Gold ribbon header แสดง "ผลหวยงวด {thaiDate(date)}"
- รางวัลที่ 1 ขนาดใหญ่ (`.prize-display` + `.digit-slot`)
- 3 คอลัมน์: เลขท้าย 3 ตัวหน้า / เลขท้าย 3 ตัวหลัง / เลขท้าย 2 ตัว
- Timeline 3 งวดล่าสุดด้านล่าง พร้อมปุ่ม "ดูทั้งหมด →" ลิงก์ไปหน้า history
- Community trending numbers (top 8 จาก stats + flavor text)
- Animated gradient border (`.gb-animated`) บน hero card

### DreamInterpreter
- **Browse mode**: เลือกจากฐานข้อมูล 60+ รายการ + Dream Combo analyzer (ฟรีทุกคน)
- **AI mode**: พิมพ์ภาษาไทย → AI วิเคราะห์ → keywords + เลขมงคล **(Premium เท่านั้น)**
  - ไม่ login → แสดง login wall
  - login แต่ไม่ premium → แสดง upgrade wall
  - premium → พิมพ์ + ส่ง Bearer token

### NumberScanner (tab: `scanner`) — **Premium เท่านั้น**
- State 1 (ไม่ login): login/register wall พร้อม feature list
- State 2 (login, ไม่ premium): upgrade wall พร้อมราคา 59 ฿/เดือน
- State 3 (premium): drag-drop / click upload + camera capture (mobile)
- Preview ภาพก่อนวิเคราะห์ + ส่ง `Authorization: Bearer ${session.token}`

### Statistics
- Heatmap view (10×10 grid 00-99) แสดงความถี่ด้วยสี

### AstrologyPanel
- Draw Strength: แสดงพลังงาน 4 งวดถัดไป (score 0-99 + stars)

### Predictor
- Slot machine loader animation ระหว่างรอ
- Particle burst เมื่อผลออก

### NumberJournal (tab: `journal`)
- บันทึกเลขที่จะซื้อ พร้อม draw date
- Auto-detect ว่าถูกรางวัลหรือไม่
- **Sync กับ Supabase** เมื่อ login — ข้อมูลไม่หายเมื่อเปลี่ยนอุปกรณ์

---

## Subscription Tiers

| ฟีเจอร์ | Free | Premium (59 ฿/เดือน) |
|---------|------|----------------------|
| Dashboard (countdown, ผลล่าสุด) | ✅ | ✅ |
| ประวัติการออกรางวัล | ✅ | ✅ |
| ดูฐานข้อมูลความฝัน (browse) | ✅ | ✅ |
| สถิติ — ความถี่ 2 ตัว | ✅ | ✅ |
| โหราศาสตร์ไทย (zodiac + element) | ✅ | ✅ |
| บันทึกเลข (Journal) | ✅ | ✅ |
| สถิติขั้นสูง (ตำแหน่ง/ค้าง/ผลรวม) | 💎 | ✅ |
| เลขจากความฝัน (result numbers) | 💎 | ✅ |
| **ทำนายเลข 2/3/6 ตัว** | 🔒 | ✅ |
| ดวงประจำเดือน + เลขมงคล | 🔒 | ✅ |
| **ตีความฝัน AI** | 🔒 | ✅ |
| **สแกนเลขด้วย AI (Vision)** | 🔒 | ✅ |

> 🔒 = ต้อง Premium, enforce ทั้ง frontend + backend middleware  
> 💎 = frontend paywall เท่านั้น (ไม่มี backend enforce)

---

## Prediction Engine (`src/utils/prediction.ts`)

น้ำหนักคะแนน (weighted scoring):
```
สถิติ (Statistical)    35%
ความฝัน (Dream)        30%
โหราศาสตร์ (Astrology) 20%
Pattern                15%
```

Pattern bonuses: เลขคู่ +30, ผลรวม 9/10 +20, ต่อเนื่อง +15, มีศูนย์ +10, lucky digits +8

Output: `twoDigit[]` 8 ตัว · `threeDigit[]` 6 ตัว · `sixDigit[]` 3 ตัว

---

## CSS Design System (`src/index.css`)

### Design Tokens
```css
--c-bg: #020814       /* Deep dark navy */
--c-purple: #7c3aed   /* Primary accent */
--c-cyan: #06b6d4     /* Secondary */
--c-amber: #f59e0b    /* Gold/prize */
--c-green: #22c55e
--nav-h: 68px
```

### Key Classes

**Cards & Glass**  
`.glass` · `.glass-sm` · `.gb` (gradient border)

**Lottery Balls**  
`.ball` + size `.b-xs/sm/md/lg/xl/2xl` + color `.b-purple/cyan/amber/green/red/ghost/pink`  
`.pill-cyan` · `.pill-purple` · `.prize-display` · `.digit-slot`

**Buttons**  
`.btn-primary` (purple→cyan gradient) · `.btn-ghost` · `.cta-ring` (pulsing)

**Badges**  
`.badge` + `.badge-purple/cyan/amber/green/red/ghost/premium`  
`.trend-hot/warm/cold/frozen`

**Progress Bars**  
`.pbar-track` + `.pbar-fill` + `.pbar-purple/cyan/amber/green/pink`

**Micro Interactions**
| Class | Effect |
|-------|--------|
| `.press:active` | scale(0.93) tap |
| `.ball-i:hover` | spring scale+lift |
| `.spring-in` | spring entrance |
| `.num-reveal` | number drop from above |
| `.modal-in` | scale-in modal |
| `.float-hover` | card float |
| `.cta-ring::after` | expanding ring pulse |
| `.ripple-dot` | JS tap ripple |

**Animations (keyframes)**
```css
@keyframes pulse {
  0%,100% { opacity: 1; transform: scale(1); }
  50%      { opacity: 0.4; transform: scale(1.6); }
}
/* ใช้กับ LIVE dot ใน Dashboard today-live phase */
/* style={{ animation: 'pulse 1s ease-in-out infinite' }} */
```

**Auth / Nav UI**  
`.modal-backdrop` · `.user-avatar` · `.user-dropdown` / `.user-dropdown-item` · `.badge-premium`  
`.bottom-nav` · `.bnav-item.on` · `.top-nav`

---

## Component Props Reference

```typescript
// Layout.tsx
{ activeTab: ExtendedTabType, onTabChange, children, session, onSessionChange, onShowAuth, onShowSubscription }

// AdminPanel.tsx
{ session: UserSession }

// Predictor.tsx
{ draws, dreamSelections, astrologyProfile, session, onNavigateDream, onNavigateAstrology, onShowAuth, onShowSubscription }

// DreamInterpreter.tsx
{ selected, onSelectionChange, isPremium, onShowAuth, onShowSubscription, session }
// ⚠️ session prop ใหม่ — ต้องส่งจาก App.tsx เพื่อให้ AI mode ทำงานได้

// Statistics.tsx
{ draws, isPremium, onShowSubscription }

// AstrologyPanel.tsx
{ profile, onProfileChange }

// Dashboard.tsx
{ draws, onNavigate }

// HistoryManager.tsx
{ draws, onDrawsChange }

// AuthModal.tsx
{ onSuccess(session), onClose, defaultMode?: 'login' | 'register' }

// SubscriptionModal.tsx
{ session?, onSuccess?(session), onClose, mode?: 'donate' | 'upgrade' }
// mode='donate' → สนับสนุน copy (default)
// mode='upgrade' → feature list + ราคา + email instruction

// PaywallOverlay.tsx
{ session, children, feature?, onLogin, onUpgrade }

// NumberScanner.tsx
{ session?: UserSession, onShowAuth?: () => void, onShowSubscription?: () => void }
// ⚠️ 3 UI states based on session + premium status

// Logo.tsx
{ size?, className?, style? }
```

---

## Lottery Draw Format

```typescript
{
  id: "2025-04-16",             // same as date
  date: "2025-04-16",           // YYYY-MM-DD (Thai lottery: 1st & 16th)
  firstPrize: "890123",         // 6 digits
  threeDigitFront: ["234", "567"],
  threeDigitBack:  ["901", "345"],
  twoDigitBack: "34",
}
```

---

## Thai Astrology (`src/utils/astrology.ts`)

- 12 นักษัตร mapped to birth years
- 5 ธาตุ: ไฟ, ดิน, โลหะ, น้ำ, ไม้
- `getAstrologyProfile(birthDate)` → lucky numbers, colors, days, fortune score
- `getCurrentLunarInfo()` → lunar phase + auspicious flag
- `getAstrologyScore(number, profile)` → 0-100 score for prediction weighting

---

## Dream Database Format

```typescript
{
  id: "snake",
  thaiName: "งู", englishName: "Snake",
  category: "animals",
  description: "ฝันเห็นงู...",
  twoDigit: [12, 56, 76],
  threeDigit: [120, 560],
  confidence: 75,
  tags: ["งู", "เลื้อยคลาน"]
}
```

---

## Common Patterns

### Check premium access
```typescript
import { isPremium } from '../utils/auth'
const premium = isPremium(session)
if (!premium) return <PaywallOverlay onLogin={onShowAuth} onUpgrade={onShowSubscription} />
```

### Call AI endpoint with Bearer token
```typescript
// session.token คือ Supabase JWT จริง — backend ตรวจสอบ + verify premium
const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/dream`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.token}`,
  },
  body: JSON.stringify({ dreamText }),
})

if (res.status === 401) { /* prompt login */ }
if (res.status === 403) { /* prompt upgrade */ }
```

### Call payment endpoint with Supabase auth token
```typescript
const { data: { session: supaSession } } = await supabase.auth.getSession()
const res = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/charge`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${supaSession?.access_token}`,
  },
  body: JSON.stringify({ token: omiseToken }),
})
```

### Spring animation on list items
```tsx
<div className="spring-in" style={{ animationDelay: `${i * 80}ms` }}>
```

### Ball with hover spring
```tsx
<div className="ball b-md b-purple nf-bold ball-i">{number}</div>
```

### Press state on custom button
```tsx
<button className="press" style={{ /* ... */ }}>
```

---

## Production Checklist

- [ ] ตั้งค่า `.env` (frontend) และ `server/.env` (backend) ด้วยค่าจริง
- [ ] รัน `001_schema.sql` ใน Supabase SQL Editor
- [ ] ปิด email confirmation ใน Supabase Auth Settings (หรือ configure email provider)
- [ ] ติดตั้ง Omise.js ใน `index.html` สำหรับ card tokenization  
      `<script src="https://cdn.omise.co/omise.js"></script>`
- [ ] ตั้ง Omise Webhook URL → `https://your-domain/api/payment/webhook`
- [ ] ตั้งค่า `ANTHROPIC_API_KEY` ใน backend env — **ต้องมี credits ใน Anthropic account**
- [ ] Deploy backend (Railway / Render / Fly.io) — ต้องใช้ HTTPS
- [ ] Set `FRONTEND_URL` ใน backend env เป็น production domain (กำหนด CORS)
- [ ] Set `VITE_API_URL` ใน frontend env เป็น backend URL จริง
- [ ] สร้าง admin user: ตั้ง `is_admin = TRUE` ใน `profiles` table โดยตรง
- [ ] รัน SQL เพิ่ม admin subscriptions policy (ดู Database Schema → Setup)
- [ ] ตรวจสอบ `express.json({ limit: '10mb' })` ใน server/index.js (สำหรับ Vision AI)
- [ ] ตั้งค่า `VITE_API_URL` ใน Vercel env → Railway backend URL

---

## Notes & Known Issues (Resolved)

- **CSS build warning** — `@import` Google Fonts อยู่หลัง `@tailwind` → cosmetic เท่านั้น ไม่กระทบ build
- **Chunk size warning** — 865 kB มาจาก Recharts → lazy load ได้ถ้าต้องการ
- **Username login** — Supabase mode รองรับแค่ email login (username → error message ให้ใช้ email)
- **localStorage mode** — ข้อมูลหายเมื่อล้าง browser cache, ไม่มีการ sync ข้ามอุปกรณ์
- **PDPA** — ควรมี Privacy Policy และปุ่ม "ลบบัญชี" สำหรับ production จริง
- **Draw-day detection** — ใช้ `isDrawDateISO()` เทียบกับ `todayISO` โดยตรง ไม่ใช่เทียบกับ `getNextDrawDate()` เพราะ `getNextDrawDate()` คืนค่างวด **ถัดไป** เสมอ (ไม่ใช่วันนี้) แม้วันนี้จะเป็นวันหวยออกก็ตาม
- **2024-10-16 data** — เลขหน้า 3 ตัวเป็น approximation (รางวัลที่ 1: 482962, เลขท้าย 2 ตัว: 00 ตรวจสอบแล้ว)

### Auth Bugs Fixed (เอกสารประวัติ)
| Bug | สาเหตุ | วิธีแก้ |
|-----|--------|---------|
| Login ไม่ได้ "ไม่พบบัญชีผู้ใช้" | Supabase email confirmation เปิดอยู่ | ปิดใน Auth Settings + รัน SQL confirm email |
| Logout ไม่ได้ | `signOut()` ไม่ระบุ scope → lock contention | `signOut({ scope: 'local' })` |
| NavigatorLockAcquireTimeoutError | Supabase ใช้ navigator.locks → race condition | lock bypass ใน createClient config |
| session.token ไม่ใช่ JWT จริง | `buildUserSession` สร้าง random token | เพิ่ม `accessToken?` param + ส่งจาก caller |
| isPremium() always true | hardcode `return true` | แก้ให้ตรวจ subscription.status จริง |
| HTTP 413 on image upload | express.json limit 100kb | `express.json({ limit: '10mb' })` |
| CORS error | FRONTEND_URL ไม่ตรงกับ Vite port | dev mode allow all origins |
| AI 404 model not found | deprecated claude-3-haiku-20240307 | เปลี่ยนเป็น claude-haiku-4-5-20251001 |
| omise npm install fail | package version `^2.6.0` ไม่มี | เปลี่ยนเป็น `^1.1.0` |
| OTP expired URL hash | เปิด email link เก่า | useEffect ล้าง error hash จาก URL |
| lottery date parse ไม่ได้ | API ส่งชื่อเดือนเต็ม "พฤษภาคม" ไม่ใช่ย่อ | เพิ่ม full Thai month map ใน parseLotteryDate |
| lottery เลขท้าย 3/2 ตัวหาย | อยู่ใน `runningNumbers[]` ไม่ใช่ `prizes[]` | เปลี่ยน lookup ไปที่ `runningNumbers` |
| rayriffy API 1015 (Cloudflare) | User-Agent "LottoMind/1.0" ถูก block | เปลี่ยนเป็น Chrome browser UA |
| Admin "ให้สิทธิ์" 403 Forbidden | RLS block admin จากการแก้ subscription คนอื่น | เพิ่ม policy `USING (is_admin())` บน subscriptions |
| Admin upsert insert แทน update | ไม่ได้ระบุ `onConflict` | เพิ่ม `{ onConflict: 'user_id' }` ทั้ง 2 functions |

### Deployed URLs
| Service | URL |
|---------|-----|
| Frontend | Vercel — `https://lottery-prediction-system-2asg.vercel.app` |
| Backend | Railway — `https://lottery-prediction-system-production.up.railway.app` |
