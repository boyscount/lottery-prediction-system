import { supabase, supabaseReady } from '../lib/supabase'
import { UserSession, UserProfile, SubscriptionStatus } from '../types'

// ── localStorage fallback (dev mode without Supabase) ──────────
const SALT = 'lottomind_v1_2025_secure_salt'
const USERS_KEY = 'lottomind_users'
const SESSION_KEY = 'lottomind_session'
const RATE_KEY = 'lottomind_rate'

const AVATAR_COLORS = ['#7c3aed','#06b6d4','#f59e0b','#22c55e','#ec4899','#ef4444','#8b5cf6','#14b8a6']

function randomAvatarColor() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
}
function generateId() {
  const a = new Uint8Array(16); crypto.getRandomValues(a)
  return Array.from(a).map(b => b.toString(16).padStart(2,'0')).join('')
}
function generateToken() {
  const a = new Uint8Array(32); crypto.getRandomValues(a)
  return Array.from(a).map(b => b.toString(16).padStart(2,'0')).join('')
}
async function hashPassword(p: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(p + SALT))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('')
}
function loadUsers(): UserProfile[] {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]') } catch { return [] }
}
function saveUsers(u: UserProfile[]) { localStorage.setItem(USERS_KEY, JSON.stringify(u)) }

// ── Rate limiting ───────────────────────────────────────────────
interface RateData { date: string; count: number }
export function checkRateLimit(): { allowed: boolean; remaining: number } {
  const today = new Date().toISOString().slice(0,10)
  try {
    const d: RateData = JSON.parse(localStorage.getItem(RATE_KEY) || `{"date":"${today}","count":0}`)
    if (d.date !== today) { localStorage.setItem(RATE_KEY, JSON.stringify({date:today,count:0})); return {allowed:true,remaining:3} }
    const remaining = Math.max(0, 3 - d.count)
    return { allowed: remaining > 0, remaining }
  } catch { return { allowed: true, remaining: 3 } }
}
export function incrementRateLimit() {
  const today = new Date().toISOString().slice(0,10)
  try {
    const d: RateData = JSON.parse(localStorage.getItem(RATE_KEY) || `{"date":"${today}","count":0}`)
    localStorage.setItem(RATE_KEY, JSON.stringify({ date: today, count: d.date === today ? d.count + 1 : 1 }))
  } catch {}
}

// ── Premium check — ทุก feature ฟรี, donate เพื่อสนับสนุน ─────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function isPremium(_session: UserSession | null): boolean {
  return true
}

// ── Convert Supabase session → app UserSession ──────────────────
export async function buildUserSession(supabaseUser: { id: string; email?: string }, sub?: { status: string; expires_at: string | null; started_at: string | null } | null): Promise<UserSession | null> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, avatar_color, is_admin')
    .eq('id', supabaseUser.id)
    .single()

  const subscription = sub ?? (await (async () => {
    const { data } = await supabase.from('subscriptions').select('status,started_at,expires_at').eq('user_id', supabaseUser.id).single()
    return data
  })())

  const exp = new Date()
  exp.setDate(exp.getDate() + 30)

  return {
    userId: supabaseUser.id,
    username: profile?.username ?? supabaseUser.email?.split('@')[0] ?? 'user',
    email: supabaseUser.email ?? '',
    token: generateToken(),
    createdAt: new Date().toISOString(),
    expiresAt: exp.toISOString(),
    avatarColor: profile?.avatar_color ?? '#7c3aed',
    isAdmin: profile?.is_admin ?? false,
    subscription: {
      status: (subscription?.status ?? 'free') as SubscriptionStatus,
      startDate: subscription?.started_at ?? null,
      expiresAt: subscription?.expires_at ?? null,
    },
  }
}

// ── Get current session ─────────────────────────────────────────
export async function getSessionAsync(): Promise<UserSession | null> {
  if (!supabaseReady) {
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      if (!raw) return null
      const s: UserSession = JSON.parse(raw)
      if (new Date(s.expiresAt) < new Date()) { localStorage.removeItem(SESSION_KEY); return null }
      return s
    } catch { return null }
  }
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return null
  return buildUserSession(session.user)
}

export function getSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const s: UserSession = JSON.parse(raw)
    if (new Date(s.expiresAt) < new Date()) { localStorage.removeItem(SESSION_KEY); return null }
    return s
  } catch { return null }
}
export function saveSessionLocal(s: UserSession) { localStorage.setItem(SESSION_KEY, JSON.stringify(s)) }
export function clearSessionLocal() { localStorage.removeItem(SESSION_KEY); localStorage.removeItem(RATE_KEY) }

// ═══════════════════════════════════════════════════════════════
// AUTH OPERATIONS — Supabase mode
// ═══════════════════════════════════════════════════════════════

export async function registerUser(username: string, email: string, password: string) {
  const uname = username.trim().replace(/[<>"'&]/g, '')
  const em = email.trim().toLowerCase()

  if (!uname || uname.length < 3) return { success: false, error: 'ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร' }
  if (uname.length > 30) return { success: false, error: 'ชื่อผู้ใช้ยาวเกินไป' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) return { success: false, error: 'รูปแบบอีเมลไม่ถูกต้อง' }
  if (password.length < 6) return { success: false, error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' }

  if (supabaseReady) {
    const { data, error } = await supabase.auth.signUp({
      email: em,
      password,
      options: { data: { username: uname, avatar_color: randomAvatarColor() } },
    })
    if (error) return { success: false, error: error.message }
    if (!data.user) return { success: false, error: 'สมัครสมาชิกไม่สำเร็จ' }
    const session = await buildUserSession(data.user)
    if (session) saveSessionLocal(session)
    return { success: true, session: session ?? undefined }
  }

  // localStorage fallback
  const users = loadUsers()
  if (users.find(u => u.email === em)) return { success: false, error: 'อีเมลนี้มีผู้ใช้งานแล้ว' }
  if (users.find(u => u.username.toLowerCase() === uname.toLowerCase())) return { success: false, error: 'ชื่อผู้ใช้นี้มีผู้ใช้งานแล้ว' }

  const user: UserProfile = {
    id: generateId(), username: uname, email: em,
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
    avatarColor: AVATAR_COLORS[users.length % AVATAR_COLORS.length],
    subscription: { status: 'free', startDate: null, expiresAt: null },
  }
  saveUsers([...users, user])
  const session = createLocalSession(user)
  saveSessionLocal(session)
  return { success: true, session }
}

export async function loginUser(credential: string, password: string) {
  const cred = credential.trim().replace(/[<>"'&]/g, '')
  if (!cred || !password) return { success: false, error: 'กรุณากรอกข้อมูลให้ครบ' }

  if (supabaseReady) {
    // Try email login first, then look up by username
    let loginEmail = cred
    if (!cred.includes('@')) {
      const { data } = await supabase.from('profiles').select('id').eq('username', cred).single()
      if (!data) return { success: false, error: 'ไม่พบบัญชีผู้ใช้' }
      // Can't get email from profiles — must sign in with email
      return { success: false, error: 'กรุณาใช้อีเมลในการเข้าสู่ระบบ' }
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email: loginEmail, password })
    if (error) return { success: false, error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }
    if (!data.user) return { success: false, error: 'เข้าสู่ระบบไม่สำเร็จ' }
    const session = await buildUserSession(data.user)
    if (session) saveSessionLocal(session)
    return { success: true, session: session ?? undefined }
  }

  // localStorage fallback
  const users = loadUsers()
  const user = users.find(u => u.email === cred.toLowerCase() || u.username.toLowerCase() === cred.toLowerCase())
  if (!user) return { success: false, error: 'ไม่พบบัญชีผู้ใช้' }
  if (await hashPassword(password) !== user.passwordHash) return { success: false, error: 'รหัสผ่านไม่ถูกต้อง' }
  const session = createLocalSession(user)
  saveSessionLocal(session)
  return { success: true, session }
}

export async function logoutUser() {
  if (supabaseReady) await supabase.auth.signOut()
  clearSessionLocal()
}

export async function activatePremium(session: UserSession): Promise<UserSession> {
  const exp = new Date()
  exp.setDate(exp.getDate() + 30)
  const sub = { status: 'premium' as SubscriptionStatus, startDate: new Date().toISOString(), expiresAt: exp.toISOString() }

  if (supabaseReady) {
    await supabase.from('subscriptions').upsert({
      user_id: session.userId, status: 'premium',
      started_at: sub.startDate, expires_at: sub.expiresAt,
      updated_at: new Date().toISOString(),
    })
  } else {
    const users = loadUsers()
    const idx = users.findIndex(u => u.id === session.userId)
    if (idx >= 0) { users[idx].subscription = sub; saveUsers(users) }
  }

  const updated: UserSession = { ...session, subscription: sub }
  saveSessionLocal(updated)
  return updated
}

// ── localStorage session helpers ────────────────────────────────
function createLocalSession(user: UserProfile): UserSession {
  const exp = new Date(); exp.setDate(exp.getDate() + 30)
  return {
    userId: user.id, username: user.username, email: user.email,
    token: generateToken(),
    createdAt: new Date().toISOString(), expiresAt: exp.toISOString(),
    avatarColor: user.avatarColor, isAdmin: false,
    subscription: { ...user.subscription },
  }
}
