export type TabType = 'dashboard' | 'predict' | 'dream' | 'statistics' | 'astrology' | 'history'

export type DreamCategory =
  | 'animals'
  | 'people'
  | 'nature'
  | 'objects'
  | 'places'
  | 'activities'
  | 'supernatural'
  | 'colors'

export interface DreamEntry {
  id: string
  thaiName: string
  englishName: string
  category: DreamCategory
  description: string
  twoDigit: number[]
  threeDigit: number[]
  confidence: number
  tags: string[]
}

export interface LotteryDraw {
  id: string
  date: string           // YYYY-MM-DD
  firstPrize: string     // 6 digits
  threeDigitFront: string[] // 2 sets
  threeDigitBack: string[]  // 2 sets
  twoDigitBack: string   // 2 digits
}

export interface NumberStat {
  number: string
  count: number
  lastSeen: string
  absenceDays: number
  trend: 'hot' | 'warm' | 'cold' | 'frozen'
}

export interface PredictedNumber {
  number: string
  score: number
  confidence: number
  reasons: string[]
  factors: {
    statistical: number
    dream: number
    astrology: number
    pattern: number
  }
}

export interface PredictionResult {
  twoDigit: PredictedNumber[]
  threeDigit: PredictedNumber[]
  sixDigit: PredictedNumber[]
  generatedAt: string
  drawDate: string
  inputFactors: {
    dreamsUsed: string[]
    astrologyUsed: boolean
    birthDate?: string
  }
}

export interface DreamSelection {
  dreamId: string
  thaiName: string
  twoDigit: number[]
  threeDigit: number[]
  confidence: number
}

export interface AstrologyProfile {
  birthDate: string
  element: string
  thaiZodiac: string
  thaiZodiacYear: number
  luckyNumbers: number[]
  luckyDays: string[]
  luckyColors: string[]
  currentMonthFortune: number // 0-100
  personalNumber: number
}

export interface DrawFormData {
  date: string
  firstPrize: string
  threeDigitFront1: string
  threeDigitFront2: string
  threeDigitBack1: string
  threeDigitBack2: string
  twoDigitBack: string
}

// ── Auth / User / Subscription ──────────────────────────────────
export type SubscriptionStatus = 'free' | 'premium' | 'expired'

export interface UserProfile {
  id: string
  username: string
  email: string
  passwordHash: string
  createdAt: string
  avatarColor: string
  subscription: {
    status: SubscriptionStatus
    startDate: string | null
    expiresAt: string | null
  }
}

export interface UserSession {
  userId: string
  username: string
  email: string
  token: string
  createdAt: string
  expiresAt: string
  avatarColor: string
  isAdmin?: boolean
  subscription: {
    status: SubscriptionStatus
    startDate: string | null
    expiresAt: string | null
  }
}
