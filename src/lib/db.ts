import { supabase, supabaseReady } from './supabase'
import { LotteryDraw, DreamSelection, AstrologyProfile, JournalEntry } from '../types'
import { lotteryHistory } from '../data/lotteryHistory'

// ── Lottery Draws ───────────────────────────────────────────────
export async function getDraws(): Promise<LotteryDraw[]> {
  if (!supabaseReady) {
    const raw = localStorage.getItem('lottomind_draws')
    if (!raw) return lotteryHistory
    // Merge: lotteryHistory is authoritative (real data).
    // Any stored draws NOT in lotteryHistory are kept (admin additions).
    const stored: LotteryDraw[] = JSON.parse(raw)
    const historyIds = new Set(lotteryHistory.map(d => d.id))
    const userAdded  = stored.filter(d => !historyIds.has(d.id))
    const merged     = [...lotteryHistory, ...userAdded]
    return merged.sort((a, b) => a.date.localeCompare(b.date))
  }
  const { data, error } = await supabase
    .from('lottery_draws')
    .select('*')
    .order('draw_date', { ascending: true })
  if (error || !data) return lotteryHistory
  return data.map(r => ({
    id: r.id,
    date: r.draw_date,
    firstPrize: r.first_prize,
    threeDigitFront: r.three_digit_front,
    threeDigitBack: r.three_digit_back,
    twoDigitBack: r.two_digit_back,
  }))
}

export async function saveDraws(draws: LotteryDraw[]): Promise<void> {
  if (!supabaseReady) {
    localStorage.setItem('lottomind_draws', JSON.stringify(draws))
    return
  }
  const rows = draws.map(d => ({
    id: d.id,
    draw_date: d.date,
    first_prize: d.firstPrize,
    three_digit_front: d.threeDigitFront,
    three_digit_back: d.threeDigitBack,
    two_digit_back: d.twoDigitBack,
  }))
  await supabase.from('lottery_draws').upsert(rows, { onConflict: 'id' })
}

export async function deleteDraw(id: string): Promise<void> {
  if (!supabaseReady) return
  await supabase.from('lottery_draws').delete().eq('id', id)
}

// ── Dream Selections (per-user) ────────────────────────────────
export async function getDreams(userId?: string): Promise<DreamSelection[]> {
  const key = userId ? `lottomind_dreams_${userId}` : 'lottomind_dreams_anon'
  if (!supabaseReady || !userId) {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  }
  const { data, error } = await supabase
    .from('user_dreams')
    .select('*')
    .eq('user_id', userId)
  if (error || !data) return []
  return data.map(r => ({
    dreamId: r.dream_id,
    thaiName: r.thai_name,
    twoDigit: r.two_digit,
    threeDigit: r.three_digit,
    confidence: r.confidence,
  }))
}

export async function saveDreams(dreams: DreamSelection[], userId?: string): Promise<void> {
  const key = userId ? `lottomind_dreams_${userId}` : 'lottomind_dreams_anon'
  if (!supabaseReady || !userId) {
    localStorage.setItem(key, JSON.stringify(dreams))
    return
  }
  await supabase.from('user_dreams').delete().eq('user_id', userId)
  if (dreams.length > 0) {
    await supabase.from('user_dreams').insert(
      dreams.map(d => ({
        user_id: userId,
        dream_id: d.dreamId,
        thai_name: d.thaiName,
        two_digit: d.twoDigit,
        three_digit: d.threeDigit,
        confidence: d.confidence,
      }))
    )
  }
}

// ── Astrology Profile (per-user) ────────────────────────────────
export async function getAstrology(userId?: string): Promise<AstrologyProfile | null> {
  const key = userId ? `lottomind_astro_${userId}` : 'lottomind_astro_anon'
  if (!supabaseReady || !userId) {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  }
  const { data } = await supabase
    .from('user_astrology')
    .select('profile_data')
    .eq('user_id', userId)
    .maybeSingle()
  return data?.profile_data ?? null
}

export async function saveAstrology(profile: AstrologyProfile | null, userId?: string): Promise<void> {
  const key = userId ? `lottomind_astro_${userId}` : 'lottomind_astro_anon'
  if (!supabaseReady || !userId) {
    localStorage.setItem(key, JSON.stringify(profile))
    return
  }
  if (!profile) {
    await supabase.from('user_astrology').delete().eq('user_id', userId)
    return
  }
  await supabase.from('user_astrology').upsert({
    user_id: userId,
    birth_date: profile.birthDate,
    profile_data: profile,
    updated_at: new Date().toISOString(),
  })
}

// ── Number Journal (per-user) ────────────────────────────────────
export async function getJournal(userId?: string): Promise<JournalEntry[]> {
  const key = userId ? `lottomind_journal_${userId}` : 'lottomind_journal_anon'
  if (!supabaseReady || !userId) {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  }
  const { data, error } = await supabase
    .from('user_journal')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error || !data) {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  }
  return data.map(r => ({
    id: r.id,
    drawDate: r.draw_date,
    numbers: r.numbers,
    note: r.note ?? undefined,
    checkedResult: r.checked_result ?? false,
    hitPrize: r.hit_prize ?? undefined,
    createdAt: r.created_at,
  }))
}

export async function saveJournal(entries: JournalEntry[], userId?: string): Promise<void> {
  const key = userId ? `lottomind_journal_${userId}` : 'lottomind_journal_anon'
  // เก็บ localStorage เป็น cache เสมอ
  localStorage.setItem(key, JSON.stringify(entries))
  if (!supabaseReady || !userId) return

  if (entries.length === 0) {
    await supabase.from('user_journal').delete().eq('user_id', userId)
    return
  }
  await supabase.from('user_journal').upsert(
    entries.map(e => ({
      id: e.id,
      user_id: userId,
      draw_date: e.drawDate,
      numbers: e.numbers,
      note: e.note ?? null,
      checked_result: e.checkedResult ?? false,
      hit_prize: e.hitPrize ?? null,
      created_at: e.createdAt,
      updated_at: new Date().toISOString(),
    })),
    { onConflict: 'id' }
  )
}

// ── Subscription status ─────────────────────────────────────────
export async function getSubscription(userId: string) {
  if (!supabaseReady) return null
  const { data } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  return data
}

// ── Admin: all users + subscriptions ───────────────────────────
// profiles.id และ subscriptions.user_id ต่างก็อ้างถึง auth.users(id)
// ไม่มี FK ตรงถึงกัน → PostgREST embed ไม่ได้ → ทำ 2 query แยกแล้ว merge
export async function adminGetUsers() {
  // Parallel queries — ไม่รอทีละ query
  const [{ data: profiles }, { data: subs }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, username, avatar_color, is_admin, created_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('subscriptions')
      .select('user_id, status, started_at, expires_at'),
  ])
  if (!profiles?.length) return []

  const subMap = new Map(subs?.map(s => [s.user_id, s]) ?? [])
  return profiles.map(p => ({
    ...p,
    subscriptions: subMap.has(p.id) ? [subMap.get(p.id)!] : [],
  }))
}

export async function adminGetPayments() {
  const { data: payments } = await supabase
    .from('payments')
    .select('id, user_id, amount, currency, status, method, omise_charge_id, created_at')
    .order('created_at', { ascending: false })
    .limit(200)
  if (!payments?.length) return []

  const userIds = [...new Set(payments.filter(p => p.user_id).map(p => p.user_id))]
  const { data: profiles } = userIds.length
    ? await supabase.from('profiles').select('id, username').in('id', userIds)
    : { data: [] }

  const profMap = new Map(profiles?.map(p => [p.id, { username: p.username }]) ?? [])
  return payments.map(p => ({
    ...p,
    profiles: p.user_id ? (profMap.get(p.user_id) ?? null) : null,
  }))
}

export async function adminSetPremium(userId: string, days: number) {
  const exp = new Date()
  exp.setDate(exp.getDate() + days)
  await supabase.from('subscriptions').upsert({
    user_id: userId,
    status: 'premium',
    started_at: new Date().toISOString(),
    expires_at: exp.toISOString(),
    updated_at: new Date().toISOString(),
  })
}

export async function adminRevokeSubscription(userId: string) {
  await supabase.from('subscriptions').upsert({
    user_id: userId,
    status: 'free',
    expires_at: null,
    updated_at: new Date().toISOString(),
  })
}
