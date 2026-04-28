import { LotteryDraw, DreamSelection, PredictionResult, PredictedNumber, AstrologyProfile } from '../types'
import { getTwoDigitStats, getThreeDigitStats, getOverdueNumbers } from './statistics'
import { getAstrologyScore } from './astrology'

function scorePatternMatch(num: number): number {
  const s = num.toString().padStart(2, '0')
  const d1 = parseInt(s[0])
  const d2 = parseInt(s[1])
  let score = 0
  if (d1 === d2) score += 30                          // doubles: 11, 22, ...
  if (d1 + d2 === 9 || d1 + d2 === 10) score += 20  // sum 9 or 10
  if (Math.abs(d1 - d2) === 1) score += 15           // consecutive
  if (d1 === 0 || d2 === 0) score += 10              // contains zero
  if ([6, 8, 9].includes(d1) || [6, 8, 9].includes(d2)) score += 8 // lucky digits
  return Math.min(score, 100)
}

function scorePatternMatch3(num: string): number {
  const digits = num.split('').map(Number)
  let score = 0
  if (digits[0] === digits[1] && digits[1] === digits[2]) score += 40 // triples
  if (digits[0] === digits[2]) score += 20
  const sum = digits.reduce((a, b) => a + b, 0)
  if (sum === 9 || sum === 18 || sum === 6) score += 15
  return Math.min(score, 100)
}

export function predictTwoDigit(
  draws: LotteryDraw[],
  dreams: DreamSelection[],
  astrology: AstrologyProfile | null,
  count = 5
): PredictedNumber[] {
  const stats = getTwoDigitStats(draws)
  const overdue = getOverdueNumbers(draws)
  const maxCount = Math.max(...stats.map(s => s.count), 1)

  const scores: { number: string; score: number; reasons: string[]; factors: PredictedNumber['factors'] }[] = []

  for (let i = 0; i <= 99; i++) {
    const n = i.toString().padStart(2, '0')
    const stat = stats.find(s => s.number === n)

    const statScore = stat ? (stat.count / maxCount) * 100 : 5
    const overdueBonus = overdue.includes(n) ? 60 : 0
    const adjustedStat = Math.min(100, statScore + overdueBonus * 0.3)

    let dreamScore = 0
    for (const dream of dreams) {
      if (dream.twoDigit.includes(i)) {
        dreamScore = Math.max(dreamScore, dream.confidence)
      } else {
        const partial = dream.twoDigit.find(d => {
          const s = d.toString().padStart(2, '0')
          return s[0] === n[0] || s[1] === n[1]
        })
        if (partial !== undefined) dreamScore = Math.max(dreamScore, dream.confidence * 0.4)
      }
    }

    const astroScore = astrology ? getAstrologyScore(i, astrology) : 10
    const patternScore = scorePatternMatch(i)

    const w = { statistical: 0.35, dream: 0.30, astrology: 0.20, pattern: 0.15 }
    const total =
      adjustedStat * w.statistical +
      dreamScore * w.dream +
      astroScore * w.astrology +
      patternScore * w.pattern

    const reasons: string[] = []
    if (adjustedStat > 50) reasons.push(`ออกบ่อย ${stat?.count || 0} ครั้ง`)
    if (overdueBonus > 0) reasons.push(`ค้างนาน ${stat?.absenceDays} วัน`)
    if (dreamScore > 60) reasons.push(`ฝันตรง ${dreams.find(d => d.twoDigit.includes(i))?.thaiName}`)
    else if (dreamScore > 20) reasons.push('เลขใกล้เคียงความฝัน')
    if (astroScore > 60) reasons.push('เลขมงคลตามดวง')
    if (patternScore > 40) reasons.push('รูปแบบนำโชค')
    if (reasons.length === 0) reasons.push('สถิติสม่ำเสมอ')

    scores.push({
      number: n,
      score: total,
      reasons,
      factors: {
        statistical: Math.round(adjustedStat),
        dream: Math.round(dreamScore),
        astrology: Math.round(astroScore),
        pattern: Math.round(patternScore),
      },
    })
  }

  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(s => ({ ...s, confidence: Math.round(Math.min(95, s.score)) }))
}

export function predictThreeDigit(
  draws: LotteryDraw[],
  dreams: DreamSelection[],
  astrology: AstrologyProfile | null,
  count = 5
): PredictedNumber[] {
  const stats = getThreeDigitStats(draws)
  const dreamThreeNums = new Set(dreams.flatMap(d => d.threeDigit.map(n => n.toString().padStart(3, '0'))))
  const astroNums = new Set((astrology?.luckyNumbers || []).map(n => {
    const s = n.toString().padStart(2, '0')
    return [`${s}${s[0]}`, `${s[0]}${s}`, `${s}${(parseInt(s)+1) % 10}`]
  }).flat())

  const candidates = new Set<string>()
  stats.slice(0, 50).forEach(s => candidates.add(s.number))
  dreamThreeNums.forEach(n => candidates.add(n))
  astroNums.forEach(n => candidates.add(n.padStart(3, '0').slice(0, 3)))

  // Fill up to 200 candidates
  while (candidates.size < 200) {
    const r = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    candidates.add(r)
  }

  const maxCount = Math.max(...stats.map(s => s.count), 1)
  const results: PredictedNumber[] = []

  for (const n of candidates) {
    const stat = stats.find(s => s.number === n)
    const statScore = stat ? (stat.count / maxCount) * 100 : 5

    let dreamScore = 0
    for (const dream of dreams) {
      if (dream.threeDigit.map(d => d.toString().padStart(3, '0')).includes(n)) {
        dreamScore = Math.max(dreamScore, dream.confidence)
      }
    }

    const astroScore = astroNums.has(n) ? 70 : 10
    const patternScore = scorePatternMatch3(n)

    const w = { statistical: 0.35, dream: 0.30, astrology: 0.20, pattern: 0.15 }
    const total = statScore * w.statistical + dreamScore * w.dream + astroScore * w.astrology + patternScore * w.pattern

    const reasons: string[] = []
    if (statScore > 50) reasons.push(`ออกบ่อย`)
    if (dreamScore > 60) reasons.push('ตรงกับความฝัน')
    if (astroScore > 60) reasons.push('เลขดวงดี')
    if (patternScore > 40) reasons.push('รูปแบบเด่น')
    if (reasons.length === 0) reasons.push('สถิติดี')

    results.push({
      number: n,
      score: total,
      confidence: Math.round(Math.min(90, total)),
      reasons,
      factors: {
        statistical: Math.round(statScore),
        dream: Math.round(dreamScore),
        astrology: Math.round(astroScore),
        pattern: Math.round(patternScore),
      },
    })
  }

  return results.sort((a, b) => b.score - a.score).slice(0, count)
}

export function predictSixDigit(
  topTwo: PredictedNumber[],
  topThree: PredictedNumber[],
  draws: LotteryDraw[],
  count = 3
): PredictedNumber[] {
  const results: PredictedNumber[] = []
  // Combine top 3-digit front + back
  const threeA = topThree.slice(0, 3)
  const threeB = topThree.slice(1, 4)

  for (const a of threeA) {
    for (const b of threeB) {
      if (a.number === b.number) continue
      const combined = a.number + b.number
      const score = (a.score + b.score) / 2 * 0.85
      results.push({
        number: combined,
        score,
        confidence: Math.round(Math.min(75, score)),
        reasons: ['รวมเลข 3 ตัวที่ดีที่สุด', ...a.reasons.slice(0, 1)],
        factors: {
          statistical: Math.round((a.factors.statistical + b.factors.statistical) / 2),
          dream: Math.round((a.factors.dream + b.factors.dream) / 2),
          astrology: Math.round((a.factors.astrology + b.factors.astrology) / 2),
          pattern: Math.round((a.factors.pattern + b.factors.pattern) / 2),
        },
      })
      if (results.length >= count * 2) break
    }
    if (results.length >= count * 2) break
  }

  return results.sort((a, b) => b.score - a.score).slice(0, count)
}

export function generatePrediction(
  draws: LotteryDraw[],
  dreams: DreamSelection[],
  astrology: AstrologyProfile | null,
  drawDate: string
): PredictionResult {
  const twoDigit = predictTwoDigit(draws, dreams, astrology, 5)
  const threeDigit = predictThreeDigit(draws, dreams, astrology, 5)
  const sixDigit = predictSixDigit(twoDigit, threeDigit, draws, 3)

  return {
    twoDigit,
    threeDigit,
    sixDigit,
    generatedAt: new Date().toISOString(),
    drawDate,
    inputFactors: {
      dreamsUsed: dreams.map(d => d.thaiName),
      astrologyUsed: astrology !== null,
      birthDate: astrology?.birthDate,
    },
  }
}
