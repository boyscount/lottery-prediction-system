import { AstrologyProfile } from '../types'

const THAI_ZODIAC = [
  { name: 'ชวด (หนู)', english: 'Rat',    years: [1924,1936,1948,1960,1972,1984,1996,2008,2020], lucky: [1,19,91,51,11], element: 'น้ำ', color: 'น้ำเงิน' },
  { name: 'ฉลู (วัว)', english: 'Ox',     years: [1925,1937,1949,1961,1973,1985,1997,2009,2021], lucky: [2,20,62,26,36], element: 'ดิน', color: 'เหลือง' },
  { name: 'ขาล (เสือ)', english: 'Tiger', years: [1926,1938,1950,1962,1974,1986,1998,2010,2022], lucky: [3,53,73,13,37], element: 'ไม้', color: 'เขียว' },
  { name: 'เถาะ (กระต่าย)', english: 'Rabbit', years: [1927,1939,1951,1963,1975,1987,1999,2011,2023], lucky: [4,64,46,14,41], element: 'ไม้', color: 'เขียว' },
  { name: 'มะโรง (มังกร)', english: 'Dragon', years: [1928,1940,1952,1964,1976,1988,2000,2012,2024], lucky: [5,55,95,50,15], element: 'ดิน', color: 'เหลือง' },
  { name: 'มะเส็ง (งู)', english: 'Snake', years: [1929,1941,1953,1965,1977,1989,2001,2013,2025], lucky: [6,66,69,96,12], element: 'ไฟ', color: 'แดง' },
  { name: 'มะเมีย (ม้า)', english: 'Horse', years: [1930,1942,1954,1966,1978,1990,2002,2014,2026], lucky: [7,77,70,57,17], element: 'ไฟ', color: 'แดง' },
  { name: 'มะแม (แพะ)', english: 'Goat',  years: [1931,1943,1955,1967,1979,1991,2003,2015,2027], lucky: [8,68,48,38,83], element: 'ดิน', color: 'เหลือง' },
  { name: 'วอก (ลิง)', english: 'Monkey', years: [1932,1944,1956,1968,1980,1992,2004,2016,2028], lucky: [9,46,16,64,61], element: 'โลหะ', color: 'ขาว' },
  { name: 'ระกา (ไก่)', english: 'Rooster',years: [1933,1945,1957,1969,1981,1993,2005,2017,2029], lucky: [0,10,100,40,4],  element: 'โลหะ', color: 'ขาว' },
  { name: 'จร (หมา)', english: 'Dog',     years: [1934,1946,1958,1970,1982,1994,2006,2018,2030], lucky: [2,52,25,72,27], element: 'ดิน', color: 'น้ำตาล' },
  { name: 'กุน (หมู)', english: 'Pig',    years: [1935,1947,1959,1971,1983,1995,2007,2019,2031], lucky: [5,25,52,35,53], element: 'น้ำ', color: 'น้ำเงิน' },
]

const ELEMENT_NUMBERS: Record<string, number[]> = {
  'ไฟ':   [1, 3, 7, 9, 19, 31, 71, 91],
  'ดิน':  [0, 5, 50, 55, 0, 45, 54],
  'โลหะ': [4, 6, 9, 46, 64, 49, 94],
  'น้ำ':  [1, 6, 16, 61, 15, 51],
  'ไม้':  [3, 8, 38, 83, 13, 31],
}

export function getThaiZodiac(birthYear: number) {
  const zodiac = THAI_ZODIAC.find(z => z.years.some(y => y === birthYear))
  if (!zodiac) {
    // Fallback: calculate by cycle
    const idx = ((birthYear - 1924) % 12 + 12) % 12
    return THAI_ZODIAC[idx]
  }
  return zodiac
}

export function calculatePersonalNumber(birthDate: string): number {
  const digits = birthDate.replace(/-/g, '').split('').map(Number)
  let sum = digits.reduce((a, b) => a + b, 0)
  while (sum > 9) sum = sum.toString().split('').map(Number).reduce((a, b) => a + b, 0)
  return sum
}

export function getAstrologyProfile(birthDate: string): AstrologyProfile {
  const date = new Date(birthDate)
  const birthYear = date.getFullYear()
  const birthMonth = date.getMonth() + 1

  const zodiac = getThaiZodiac(birthYear)
  const personalNumber = calculatePersonalNumber(birthDate)
  const elementNumbers = ELEMENT_NUMBERS[zodiac.element] || []

  // Combine lucky numbers from zodiac + element + personal number
  const luckySet = new Set<number>([
    ...zodiac.lucky,
    ...elementNumbers,
    personalNumber,
    personalNumber * 10 + personalNumber,
    parseInt(`${personalNumber}${birthMonth % 10}`),
  ])
  const luckyNumbers = Array.from(luckySet).filter(n => n <= 99).slice(0, 10)

  // Current month fortune based on personal number + current month
  const currentMonth = new Date().getMonth() + 1
  const fortune = ((personalNumber + currentMonth) % 10) * 10 + 50
  const clampedFortune = Math.min(95, Math.max(40, fortune))

  const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์']
  const luckyDayIndex = (personalNumber + birthMonth) % 7
  const luckyDays = [dayNames[luckyDayIndex], dayNames[(luckyDayIndex + 3) % 7]]

  return {
    birthDate,
    element: zodiac.element,
    thaiZodiac: zodiac.name,
    thaiZodiacYear: birthYear,
    luckyNumbers,
    luckyDays,
    luckyColors: [zodiac.color, 'ทอง'],
    currentMonthFortune: clampedFortune,
    personalNumber,
  }
}

export function getAstrologyScore(num: number, profile: AstrologyProfile): number {
  const n2 = num.toString().padStart(2, '0')
  const n = num

  if (profile.luckyNumbers.includes(n)) return 100
  if (profile.luckyNumbers.some(l => l.toString().includes(n2[0]) || l.toString().includes(n2[1]))) return 50
  const elementNums = ELEMENT_NUMBERS[profile.element] || []
  if (elementNums.includes(n)) return 70
  if (n.toString().includes(profile.personalNumber.toString())) return 60
  return 10
}

export function getCurrentLunarInfo(): { phase: string; auspicious: boolean; phaseEmoji: string } {
  const today = new Date()
  // Approximate lunar phase (simplified)
  const lunarCycle = 29.53
  const knownNewMoon = new Date('2024-01-11')
  const daysSince = (today.getTime() - knownNewMoon.getTime()) / 86400000
  const phase = ((daysSince % lunarCycle) + lunarCycle) % lunarCycle

  let phaseName: string
  let phaseEmoji: string
  if (phase < 1) { phaseName = 'วันขึ้น ๑ ค่ำ'; phaseEmoji = '🌑' }
  else if (phase < 7) { phaseName = 'ข้างขึ้น'; phaseEmoji = '🌒' }
  else if (phase < 8) { phaseName = 'วันขึ้น ๗ ค่ำ'; phaseEmoji = '🌓' }
  else if (phase < 14) { phaseName = 'ข้างขึ้น'; phaseEmoji = '🌔' }
  else if (phase < 15.5) { phaseName = 'วันเพ็ญ (เต็มดวง)'; phaseEmoji = '🌕' }
  else if (phase < 22) { phaseName = 'ข้างแรม'; phaseEmoji = '🌖' }
  else if (phase < 23) { phaseName = 'วันแรม ๗ ค่ำ'; phaseEmoji = '🌗' }
  else { phaseName = 'ข้างแรม'; phaseEmoji = '🌘' }

  const auspicious = phase >= 13 && phase <= 16
  return { phase: phaseName, auspicious, phaseEmoji }
}
