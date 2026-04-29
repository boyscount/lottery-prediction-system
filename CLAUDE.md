# LottoMind — Claude Code Reference

ระบบทำนายหวยไทยอัจฉริยะ ใช้สถิติ + ความฝัน + โหราศาสตร์ไทย + AI  
**React SPA + Express backend** — Auth & DB ผ่าน Supabase, Payment ผ่าน Omise, AI ผ่าน Anthropic  
Dev mode ไม่มี Supabase/Omise → fallback ทุกอย่างไปที่ `localStorage` อัตโนมัติ  
**ทุก feature ใช้ฟรีทั้งหมด** — ไม่มี premium lock ใน production

---

## Dev Commands

```bash
# Frontend
npm run dev      # http://localhost:3000 (หรือ port ถัดไป)
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
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # ห้ามใส่ใน frontend เด็ดขาด
OMISE_SECRET_KEY=skey_test_...
OMISE_PUBLIC_KEY=pkey_test_...
OMISE_WEBHOOK_SECRET=whsec_...
ANTHROPIC_API_KEY=sk-ant-api03-...  # optional — AI Dream Interpreter + Vision Scanner
PORT=4000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

> **ถ้าไม่ตั้งค่า Supabase** — `supabaseReady = false` → app ทำงานด้วย localStorage ทั้งหมด (dev mode)

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
| Layer        | Library                                    |
|--------------|--------------------------------------------|
| Runtime      | Node.js (≥18) — native fetch built-in      |
| Framework    | Express 4                                  |
| Payment      | omise (official Node SDK)                  |
| DB           | @supabase/supabase-js (service-role)       |
| AI           | Anthropic API (claude-3-haiku) via fetch   |
| Helpers      | cors, dotenv                               |

---

## Project Structure

```
.
├── .env.example                # Frontend env template
├── CLAUDE.md                   # ← ไฟล์นี้
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
│
├── server/                     # Express backend
│   ├── .env.example
│   ├── package.json
│   └── index.js                # Payment API + webhook
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
    │   ├── supabase.ts         # Supabase client + supabaseReady flag
    │   └── db.ts               # DB operations (Supabase ↔ localStorage fallback)
    │
    ├── data/
    │   ├── lotteryHistory.ts   # 55 REAL draws (Jan 2024 – Apr 2026) + getNextDrawDate()
    │   └── dreamDatabase.ts    # 60+ dream entries
    │
    ├── utils/
    │   ├── auth.ts             # Auth: Supabase + localStorage fallback, rate limit
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
        ├── DreamInterpreter.tsx   # ฝันแล้วได้เลข (browse mode + AI mode)
        ├── NumberScanner.tsx   # 📷 สแกนเลขด้วย AI (camera/upload → Vision AI)
        ├── NumberJournal.tsx   # บันทึกเลข + ติดตามผล
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

### RLS Policies (สำคัญ)
- Users อ่าน/เขียนได้เฉพาะแถวของตัวเอง (`auth.uid() = user_id`)
- `lottery_draws` — ทุกคนอ่านได้, แก้ไขได้เฉพาะ `is_admin = TRUE`
- Service Role Key (backend เท่านั้น) — bypass RLS ทั้งหมด

### Triggers
- `on_auth_user_created` → auto-insert profile + free subscription เมื่อ user สมัคร
- `subscription_expiry_check` → auto-set `status = 'expired'` เมื่อ `expires_at < NOW()`

> **Setup**: วาง `supabase/migrations/001_schema.sql` ทั้งหมดใน Supabase Dashboard → SQL Editor แล้วกด Run

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

### localStorage Keys (dev mode / fallback)
| Key | เก็บอะไร |
|-----|---------|
| `lottomind_auth` | Supabase session (ถ้า supabaseReady) |
| `lottomind_users` | `UserProfile[]` (localStorage mode) |
| `lottomind_session` | `UserSession` (localStorage mode) |
| `lottomind_draws` | `LotteryDraw[]` |
| `lottomind_dreams_{userId}` | `DreamSelection[]` |
| `lottomind_astro_{userId}` | `AstrologyProfile` |
| `lottomind_rate` | `{date, count}` — rate limit |

### Key Functions
```typescript
registerUser(username, email, password)  // async → { success, session?, error? }
loginUser(credential, password)          // email หรือ username (localStorage mode เท่านั้น)
logoutUser()                             // supabase.auth.signOut + clearSessionLocal
activatePremium(session)                 // async → UserSession (updates DB or localStorage)
buildUserSession(supabaseUser, sub?)     // map Supabase user → UserSession
getSession()                             // sync read localStorage (for initial state)
getSessionAsync()                        // async — ตรวจ Supabase session ด้วย
isPremium(session)                       // boolean — status==='premium' && expiresAt > now
checkRateLimit()                         // { allowed, remaining } (3/day free users)
incrementRateLimit()                     // บวก counter
```

### Security Notes
- Password hash: `SHA-256(password + SALT)` via Web Crypto API — client-side เท่านั้น
- Supabase mode: password จัดการโดย Supabase Auth (bcrypt) — ปลอดภัยกว่า
- Input sanitization: strip `<>"'&`, validate regex ก่อนทุก operation
- Rate limit: 3 predictions/day สำหรับ free user

---

## DB Operations (`src/lib/db.ts`)

ทุก function รองรับทั้ง Supabase และ localStorage:

```typescript
// Draws (shared)
getDraws()                          // → LotteryDraw[]
saveDraws(draws)                    // upsert
deleteDraw(id)                      // Supabase เท่านั้น

// Per-user data
getDreams(userId?)                  // → DreamSelection[]
saveDreams(dreams, userId?)
getAstrology(userId?)               // → AstrologyProfile | null
saveAstrology(profile, userId?)

// Subscription
getSubscription(userId)             // Supabase เท่านั้น

// Admin (ต้องใช้ service role หรือ is_admin policies)
adminGetUsers()                     // profiles + subscriptions join
adminGetPayments()                  // payments + profiles join
adminSetPremium(userId, days)       // upsert subscription
adminRevokeSubscription(userId)     // set status='free'
```

---

## Payment Flow (`server/index.js`)

### Card Payment
```
Frontend → Omise.js tokenize card → POST /api/payment/charge { token }
Backend → omise.charges.create({ card: token, amount: 5900 })
        → if succeeded → activatePremium(userId) in DB
        → return { success, chargeId }
```

### PromptPay
```
Frontend → POST /api/payment/promptpay
Backend → omise.sources.create(promptpay) → omise.charges.create(source)
        → insert pending payment record
        → return { qrImage, chargeId, expiresAt }
Frontend → poll GET /api/payment/status/:chargeId จนกว่าจะ succeeded
```

### Webhook (auto-confirm)
```
Omise → POST /api/payment/webhook  (event: charge.complete)
Backend → verify HMAC-SHA256 signature
        → if status=succeeded → activatePremium(metadata.userId)
```

### API Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/payment/charge` | Bearer JWT | Card payment |
| `POST` | `/api/payment/promptpay` | Bearer JWT | PromptPay QR |
| `GET`  | `/api/payment/status/:id` | Bearer JWT | Poll charge status |
| `POST` | `/api/payment/webhook` | HMAC signature | Omise webhook |
| `POST` | `/api/ai/dream` | — (public) | AI Dream Interpreter |
| `POST` | `/api/ai/scan` | — (public) | Vision AI number scanner |
| `GET`  | `/health` | — | Health check |

---

## Admin Panel (`src/components/AdminPanel.tsx`)

- ปรากฏใน nav เฉพาะ `session.isAdmin === true`
- ต้องการ `supabaseReady` — ถ้าไม่มี Supabase จะแสดง placeholder
- **Users tab**: ตาราง users + subscription status, ปุ่มให้/ถอน Premium (ระบุจำนวนวัน)
- **Payments tab**: ตาราง payments, จำนวนเงิน, method, status
- **Summary cards**: จำนวน users, Premium active, การชำระสำเร็จ, รายรับรวม

---

## Types (`src/types/index.ts`)

```typescript
TabType            // 'dashboard' | 'predict' | 'dream' | 'statistics' | 'astrology' | 'history'
ExtendedTabType    // TabType | 'journal' | 'scanner' | 'admin'  (defined locally in App.tsx + Layout.tsx)
SubscriptionStatus // 'free' | 'premium' | 'expired'

UserSession {
  userId, username, email, token
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

### AI Dream Interpreter (`POST /api/ai/dream`)
```typescript
// Request
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
- ใช้ claude-3-haiku-20240307 (เร็ว ราคาถูก)
- **Fallback mode**: ถ้าไม่มี `ANTHROPIC_API_KEY` → คืน random numbers (ไม่ crash)
- Frontend: `DreamInterpreter.tsx` → mode toggle `browse` / `ai`

### Vision AI Scanner (`POST /api/ai/scan`)
```typescript
// Request
{ imageBase64: string, mimeType?: string }  // base64 image (max 5 MB)

// Response
{
  numbers: string[]       // ตัวเลขทั้งหมดที่พบในภาพ
  luckyNumbers: string[]  // เลขมงคลแนะนำ
  interpretation: string
  confidence: number
}
```
- ใช้ Claude Vision API (image + text input)
- Frontend: `NumberScanner.tsx` → drag-drop / gallery / camera capture
- ตัวอย่าง input: สลาก, ป้ายทะเบียน, บ้านเลขที่, ปฏิทิน

### Shared helper
```javascript
callClaude(messages, systemPrompt, maxTokens)  // wrapper around Anthropic API
```

---

## Real Lottery Data (`src/data/lotteryHistory.ts`)

**55 real draws** from January 2024 – April 2026:
- Source: GLO (Government Lottery Office) via thethaiger.com  
- ข้อมูลจริงทุก draw: firstPrize, threeDigitFront[2], threeDigitBack[2], twoDigitBack
- Jan/May draws: date shifts apply (17th, 2nd instead of 16th/1st)
- **Note**: 2024-10-16 front-3-digit เป็น approximation (verified: 482962, 2d:00)

---

## New UI Features

### Dashboard
- Live countdown (วินาที) พร้อม animation
- Community trending numbers (top 8 จาก stats + flavor text)
- Animated gradient border (`.gb-animated`) บน hero card

### DreamInterpreter
- **Browse mode**: เลือกจากฐานข้อมูล 60+ รายการ + Dream Combo analyzer
- **AI mode**: พิมพ์ภาษาไทย → AI วิเคราะห์ → keywords + เลขมงคล

### NumberScanner (tab: `scanner`)
- Drag-drop หรือ click อัปโหลด
- ถ่ายรูปผ่าน camera (mobile)
- Preview ภาพก่อนวิเคราะห์
- แสดงตัวเลขทั้งหมดที่พบ + เลขมงคลแนะนำ

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

---

## Subscription Tiers

| ฟีเจอร์ | Free | Premium (59 ฿/เดือน) |
|---------|------|----------------------|
| Dashboard (countdown, ผลล่าสุด) | ✅ | ✅ |
| ประวัติการออกรางวัล | ✅ | ✅ |
| ดูฐานข้อมูลความฝัน (browse) | ✅ | ✅ |
| สถิติ — ความถี่ 2 ตัว | ✅ | ✅ |
| โหราศาสตร์ไทย (zodiac + element) | ✅ | ✅ |
| สถิติขั้นสูง (ตำแหน่ง/ค้าง/ผลรวม) | 💎 | ✅ |
| เลขจากความฝัน (result numbers) | 💎 | ✅ |
| **ทำนายเลข 2/3/6 ตัว** | 🔒 | ✅ |
| ดวงประจำเดือน + เลขมงคล | 🔒 | ✅ |

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
{ selected, onSelectionChange, isPremium, onShowAuth, onShowSubscription }

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
{ session, onSuccess(session), onClose }

// PaywallOverlay.tsx
{ session, children, feature?, onLogin, onUpgrade }

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

### Call backend API with Supabase auth token
```typescript
const { data: { session } } = await supabase.auth.getSession()
const res = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/charge`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.access_token}`,
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
- [ ] ติดตั้ง Omise.js ใน `index.html` สำหรับ card tokenization  
      `<script src="https://cdn.omise.co/omise.js"></script>`
- [ ] ตั้ง Omise Webhook URL → `https://your-domain/api/payment/webhook`
- [ ] ตั้งค่า `ANTHROPIC_API_KEY` ใน backend env (optional แต่แนะนำสำหรับ AI features)
- [ ] Deploy backend (Railway / Render / Fly.io) — ต้องใช้ HTTPS
- [ ] Set `FRONTEND_URL` ใน backend env เป็น production domain
- [ ] Set `VITE_API_URL` ใน frontend env เป็น backend URL จริง
- [ ] สร้าง admin user: ตั้ง `is_admin = TRUE` ใน `profiles` table โดยตรง

---

## Notes & Known Warnings

- **CSS build warning** — `@import` Google Fonts อยู่หลัง `@tailwind` → cosmetic เท่านั้น ไม่กระทบ build
- **Chunk size warning** — 865 kB มาจาก Recharts → lazy load ได้ถ้าต้องการ
- **Username login** — Supabase mode รองรับแค่ email login (username → error message ให้ใช้ email)
- **localStorage mode** — ข้อมูลหายเมื่อล้าง browser cache, ไม่มีการ sync ข้ามอุปกรณ์
- **PDPA** — ควรมี Privacy Policy และปุ่ม "ลบบัญชี" สำหรับ production จริง
