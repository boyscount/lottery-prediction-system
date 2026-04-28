import { LotteryDraw, NumberStat } from '../types'

export function getTwoDigitStats(draws: LotteryDraw[]): NumberStat[] {
  const sorted = [...draws].sort((a, b) => a.date.localeCompare(b.date))
  const counts: Record<string, number> = {}
  const lastSeen: Record<string, string> = {}

  for (const draw of sorted) {
    const n = draw.twoDigitBack.padStart(2, '0')
    counts[n] = (counts[n] || 0) + 1
    lastSeen[n] = draw.date
  }

  const today = new Date()
  const results: NumberStat[] = []

  for (let i = 0; i <= 99; i++) {
    const n = i.toString().padStart(2, '0')
    const count = counts[n] || 0
    const last = lastSeen[n] || '2020-01-01'
    const absenceDays = Math.floor((today.getTime() - new Date(last).getTime()) / 86400000)

    let trend: NumberStat['trend']
    if (count >= 3 && absenceDays < 60) trend = 'hot'
    else if (count >= 2 && absenceDays < 120) trend = 'warm'
    else if (absenceDays > 365) trend = 'frozen'
    else trend = 'cold'

    results.push({ number: n, count, lastSeen: last, absenceDays, trend })
  }

  return results.sort((a, b) => b.count - a.count || a.absenceDays - b.absenceDays)
}

export function getThreeDigitStats(draws: LotteryDraw[]): NumberStat[] {
  const sorted = [...draws].sort((a, b) => a.date.localeCompare(b.date))
  const counts: Record<string, number> = {}
  const lastSeen: Record<string, string> = {}

  for (const draw of sorted) {
    for (const n of [...draw.threeDigitBack, ...draw.threeDigitFront]) {
      counts[n] = (counts[n] || 0) + 1
      lastSeen[n] = draw.date
    }
  }

  const today = new Date()
  const results: NumberStat[] = Object.keys(counts).map(n => {
    const count = counts[n]
    const last = lastSeen[n]
    const absenceDays = Math.floor((today.getTime() - new Date(last).getTime()) / 86400000)
    let trend: NumberStat['trend']
    if (count >= 3 && absenceDays < 90) trend = 'hot'
    else if (count >= 2 && absenceDays < 180) trend = 'warm'
    else if (absenceDays > 500) trend = 'frozen'
    else trend = 'cold'
    return { number: n, count, lastSeen: last, absenceDays, trend }
  })

  return results.sort((a, b) => b.count - a.count)
}

export function getDigitPositionFrequency(draws: LotteryDraw[]): number[][] {
  // 6 positions, digits 0-9
  const freq: number[][] = Array.from({ length: 6 }, () => Array(10).fill(0))
  for (const draw of draws) {
    const digits = draw.firstPrize.split('')
    digits.forEach((d, i) => { freq[i][parseInt(d)]++ })
  }
  return freq
}

export function getHotNumbers(draws: LotteryDraw[], count = 10): string[] {
  const stats = getTwoDigitStats(draws)
  return stats.filter(s => s.trend === 'hot' || s.trend === 'warm').slice(0, count).map(s => s.number)
}

export function getColdNumbers(draws: LotteryDraw[], count = 10): string[] {
  const stats = getTwoDigitStats(draws)
  return stats.filter(s => s.trend === 'cold' || s.trend === 'frozen').slice(0, count).map(s => s.number)
}

export function getOverdueNumbers(draws: LotteryDraw[]): string[] {
  const stats = getTwoDigitStats(draws)
  // Expected frequency: each number should appear roughly every 100 draws
  return stats
    .filter(s => s.absenceDays > 180 && s.count > 0)
    .sort((a, b) => b.absenceDays - a.absenceDays)
    .slice(0, 10)
    .map(s => s.number)
}

export function getMonthlyPattern(draws: LotteryDraw[]): Record<number, string[]> {
  const pattern: Record<number, string[]> = {}
  for (let m = 1; m <= 12; m++) pattern[m] = []

  for (const draw of draws) {
    const month = new Date(draw.date).getMonth() + 1
    const n = draw.twoDigitBack.padStart(2, '0')
    if (!pattern[month].includes(n)) pattern[month].push(n)
  }
  return pattern
}

export function getSumFrequency(draws: LotteryDraw[]): Record<number, number> {
  const freq: Record<number, number> = {}
  for (const draw of draws) {
    const digits = draw.twoDigitBack.padStart(2, '0').split('')
    const sum = digits.reduce((acc, d) => acc + parseInt(d), 0)
    freq[sum] = (freq[sum] || 0) + 1
  }
  return freq
}

export function getFrequencyChartData(draws: LotteryDraw[]): { number: string; count: number; trend: string }[] {
  const stats = getTwoDigitStats(draws)
  return stats
    .filter(s => s.count > 0)
    .slice(0, 30)
    .map(s => ({ number: s.number, count: s.count, trend: s.trend }))
}
