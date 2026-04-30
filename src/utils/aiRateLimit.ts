// AI feature rate limit for anonymous users
// Members (logged-in) get unlimited uses

const KEY = 'lottomind_ai_uses'
export const AI_DAILY_LIMIT = 3

interface AiUseRecord {
  date: string   // YYYY-MM-DD
  count: number
}

function getTodayISO() {
  return new Date().toISOString().slice(0, 10)
}

function getRecord(): AiUseRecord {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { date: getTodayISO(), count: 0 }
    const rec: AiUseRecord = JSON.parse(raw)
    // Reset if it's a new day
    if (rec.date !== getTodayISO()) return { date: getTodayISO(), count: 0 }
    return rec
  } catch {
    return { date: getTodayISO(), count: 0 }
  }
}

export function checkAiRateLimit(): { allowed: boolean; used: number; remaining: number } {
  const rec = getRecord()
  const used = rec.count
  const remaining = Math.max(0, AI_DAILY_LIMIT - used)
  return { allowed: used < AI_DAILY_LIMIT, used, remaining }
}

export function incrementAiUse() {
  const rec = getRecord()
  localStorage.setItem(KEY, JSON.stringify({ date: rec.date, count: rec.count + 1 }))
}
