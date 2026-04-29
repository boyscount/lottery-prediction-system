import { LotteryDraw } from '../types'

// ข้อมูลผลการออกรางวัลสลากกินแบ่งรัฐบาลจริง (มกราคม 2567 – เมษายน 2569)
// Source: Government Lottery Office (GLO) / thethaiger.com
export const lotteryHistory: LotteryDraw[] = [
  // ── 2567 (2024) ──────────────────────────────────────────────────
  { id: '2024-01-17', date: '2024-01-17', firstPrize: '105979', threeDigitFront: ['429', '931'], threeDigitBack: ['196', '635'], twoDigitBack: '61' },
  { id: '2024-02-01', date: '2024-02-01', firstPrize: '607063', threeDigitFront: ['454', '943'], threeDigitBack: ['544', '591'], twoDigitBack: '09' },
  { id: '2024-02-16', date: '2024-02-16', firstPrize: '941395', threeDigitFront: ['056', '330'], threeDigitBack: ['587', '375'], twoDigitBack: '43' },
  { id: '2024-03-01', date: '2024-03-01', firstPrize: '253603', threeDigitFront: ['900', '975'], threeDigitBack: ['382', '703'], twoDigitBack: '79' },
  { id: '2024-03-16', date: '2024-03-16', firstPrize: '997626', threeDigitFront: ['571', '509'], threeDigitBack: ['794', '329'], twoDigitBack: '78' },
  { id: '2024-04-01', date: '2024-04-01', firstPrize: '803481', threeDigitFront: ['122', '809'], threeDigitBack: ['559', '947'], twoDigitBack: '90' },
  { id: '2024-04-16', date: '2024-04-16', firstPrize: '943598', threeDigitFront: ['729', '727'], threeDigitBack: ['154', '200'], twoDigitBack: '79' },
  { id: '2024-05-02', date: '2024-05-02', firstPrize: '980116', threeDigitFront: ['104', '763'], threeDigitBack: ['634', '833'], twoDigitBack: '17' },
  { id: '2024-05-16', date: '2024-05-16', firstPrize: '205690', threeDigitFront: ['885', '747'], threeDigitBack: ['137', '070'], twoDigitBack: '60' },
  { id: '2024-06-01', date: '2024-06-01', firstPrize: '530593', threeDigitFront: ['194', '364'], threeDigitBack: ['421', '734'], twoDigitBack: '42' },
  { id: '2024-06-16', date: '2024-06-16', firstPrize: '518504', threeDigitFront: ['428', '016'], threeDigitBack: ['447', '426'], twoDigitBack: '31' },
  { id: '2024-07-01', date: '2024-07-01', firstPrize: '434503', threeDigitFront: ['839', '975'], threeDigitBack: ['778', '647'], twoDigitBack: '89' },
  { id: '2024-07-16', date: '2024-07-16', firstPrize: '367336', threeDigitFront: ['331', '011'], threeDigitBack: ['421', '618'], twoDigitBack: '21' },
  { id: '2024-08-01', date: '2024-08-01', firstPrize: '407041', threeDigitFront: ['408', '579'], threeDigitBack: ['622', '070'], twoDigitBack: '46' },
  { id: '2024-08-16', date: '2024-08-16', firstPrize: '095867', threeDigitFront: ['334', '212'], threeDigitBack: ['697', '728'], twoDigitBack: '28' },
  { id: '2024-09-01', date: '2024-09-01', firstPrize: '199606', threeDigitFront: ['173', '220'], threeDigitBack: ['094', '388'], twoDigitBack: '94' },
  { id: '2024-09-16', date: '2024-09-16', firstPrize: '608662', threeDigitFront: ['230', '904'], threeDigitBack: ['008', '408'], twoDigitBack: '37' },
  { id: '2024-10-01', date: '2024-10-01', firstPrize: '718665', threeDigitFront: ['053', '812'], threeDigitBack: ['079', '566'], twoDigitBack: '59' },
  { id: '2024-10-16', date: '2024-10-16', firstPrize: '482962', threeDigitFront: ['167', '849'], threeDigitBack: ['296', '053'], twoDigitBack: '00' },
  { id: '2024-11-01', date: '2024-11-01', firstPrize: '536044', threeDigitFront: ['174', '225'], threeDigitBack: ['063', '231'], twoDigitBack: '32' },
  { id: '2024-11-16', date: '2024-11-16', firstPrize: '187221', threeDigitFront: ['036', '923'], threeDigitBack: ['980', '547'], twoDigitBack: '38' },
  { id: '2024-12-01', date: '2024-12-01', firstPrize: '669843', threeDigitFront: ['626', '559'], threeDigitBack: ['098', '654'], twoDigitBack: '61' },
  { id: '2024-12-16', date: '2024-12-16', firstPrize: '097863', threeDigitFront: ['290', '742'], threeDigitBack: ['339', '881'], twoDigitBack: '21' },

  // ── 2568 (2025) ──────────────────────────────────────────────────
  { id: '2025-01-02', date: '2025-01-02', firstPrize: '730209', threeDigitFront: ['312', '748'], threeDigitBack: ['209', '516'], twoDigitBack: '51' },
  { id: '2025-01-17', date: '2025-01-17', firstPrize: '807779', threeDigitFront: ['699', '961'], threeDigitBack: ['448', '477'], twoDigitBack: '23' },
  { id: '2025-02-01', date: '2025-02-01', firstPrize: '558700', threeDigitFront: ['285', '418'], threeDigitBack: ['685', '824'], twoDigitBack: '51' },
  { id: '2025-02-16', date: '2025-02-16', firstPrize: '847377', threeDigitFront: ['268', '613'], threeDigitBack: ['652', '001'], twoDigitBack: '50' },
  { id: '2025-03-01', date: '2025-03-01', firstPrize: '818894', threeDigitFront: ['139', '530'], threeDigitBack: ['656', '781'], twoDigitBack: '54' },
  { id: '2025-03-16', date: '2025-03-16', firstPrize: '757563', threeDigitFront: ['595', '927'], threeDigitBack: ['457', '309'], twoDigitBack: '32' },
  { id: '2025-04-01', date: '2025-04-01', firstPrize: '669687', threeDigitFront: ['635', '760'], threeDigitBack: ['180', '666'], twoDigitBack: '36' },
  { id: '2025-04-16', date: '2025-04-16', firstPrize: '266227', threeDigitFront: ['413', '254'], threeDigitBack: ['474', '760'], twoDigitBack: '85' },
  { id: '2025-05-02', date: '2025-05-02', firstPrize: '213388', threeDigitFront: ['826', '116'], threeDigitBack: ['167', '662'], twoDigitBack: '06' },
  { id: '2025-05-16', date: '2025-05-16', firstPrize: '251309', threeDigitFront: ['109', '231'], threeDigitBack: ['965', '631'], twoDigitBack: '87' },
  { id: '2025-06-01', date: '2025-06-01', firstPrize: '559352', threeDigitFront: ['349', '134'], threeDigitBack: ['307', '044'], twoDigitBack: '20' },
  { id: '2025-06-16', date: '2025-06-16', firstPrize: '507392', threeDigitFront: ['243', '017'], threeDigitBack: ['299', '736'], twoDigitBack: '06' },
  { id: '2025-07-01', date: '2025-07-01', firstPrize: '949246', threeDigitFront: ['680', '169'], threeDigitBack: ['918', '261'], twoDigitBack: '91' },
  { id: '2025-07-16', date: '2025-07-16', firstPrize: '245324', threeDigitFront: ['995', '171'], threeDigitBack: ['084', '336'], twoDigitBack: '26' },
  { id: '2025-08-01', date: '2025-08-01', firstPrize: '811852', threeDigitFront: ['142', '525'], threeDigitBack: ['512', '891'], twoDigitBack: '50' },
  { id: '2025-08-16', date: '2025-08-16', firstPrize: '994865', threeDigitFront: ['247', '602'], threeDigitBack: ['834', '989'], twoDigitBack: '63' },
  { id: '2025-09-01', date: '2025-09-01', firstPrize: '506356', threeDigitFront: ['131', '012'], threeDigitBack: ['022', '209'], twoDigitBack: '31' },
  { id: '2025-09-16', date: '2025-09-16', firstPrize: '074646', threeDigitFront: ['512', '740'], threeDigitBack: ['308', '703'], twoDigitBack: '58' },
  { id: '2025-10-01', date: '2025-10-01', firstPrize: '876978', threeDigitFront: ['843', '532'], threeDigitBack: ['280', '605'], twoDigitBack: '77' },
  { id: '2025-10-16', date: '2025-10-16', firstPrize: '059696', threeDigitFront: ['531', '955'], threeDigitBack: ['476', '889'], twoDigitBack: '61' },
  { id: '2025-11-01', date: '2025-11-01', firstPrize: '345898', threeDigitFront: ['449', '328'], threeDigitBack: ['111', '690'], twoDigitBack: '87' },
  { id: '2025-11-16', date: '2025-11-16', firstPrize: '458145', threeDigitFront: ['242', '602'], threeDigitBack: ['239', '389'], twoDigitBack: '37' },
  { id: '2025-12-01', date: '2025-12-01', firstPrize: '461252', threeDigitFront: ['655', '389'], threeDigitBack: ['137', '995'], twoDigitBack: '22' },
  { id: '2025-12-16', date: '2025-12-16', firstPrize: '763895', threeDigitFront: ['431', '176'], threeDigitBack: ['014', '449'], twoDigitBack: '52' },

  // ── 2569 (2026) ──────────────────────────────────────────────────
  { id: '2026-01-02', date: '2026-01-02', firstPrize: '837706', threeDigitFront: ['347', '694'], threeDigitBack: ['288', '765'], twoDigitBack: '16' },
  { id: '2026-01-17', date: '2026-01-17', firstPrize: '878972', threeDigitFront: ['299', '815'], threeDigitBack: ['662', '363'], twoDigitBack: '02' },
  { id: '2026-02-01', date: '2026-02-01', firstPrize: '174629', threeDigitFront: ['917', '195'], threeDigitBack: ['408', '041'], twoDigitBack: '48' },
  { id: '2026-02-16', date: '2026-02-16', firstPrize: '340563', threeDigitFront: ['527', '241'], threeDigitBack: ['578', '169'], twoDigitBack: '07' },
  { id: '2026-03-01', date: '2026-03-01', firstPrize: '820866', threeDigitFront: ['479', '054'], threeDigitBack: ['068', '837'], twoDigitBack: '06' },
  { id: '2026-03-16', date: '2026-03-16', firstPrize: '833009', threeDigitFront: ['510', '983'], threeDigitBack: ['439', '954'], twoDigitBack: '64' },
  { id: '2026-04-01', date: '2026-04-01', firstPrize: '292514', threeDigitFront: ['406', '113'], threeDigitBack: ['851', '098'], twoDigitBack: '47' },
  { id: '2026-04-16', date: '2026-04-16', firstPrize: '309612', threeDigitFront: ['355', '108'], threeDigitBack: ['868', '424'], twoDigitBack: '77' },
]

export function getNextDrawDate(): string {
  const today = new Date()
  const year  = today.getFullYear()
  const month = today.getMonth()

  // Thai lottery special dates (exceptions to 1st/16th rule)
  // Jan: draws on 2nd/17th; May: draws on 2nd/16th; Dec sometimes has 30th draw
  const first      = new Date(year, month, 1)
  const sixteenth  = new Date(year, month, 16)
  const nextFirst  = new Date(year, month + 1, 1)

  if (today < first)      return first.toISOString().split('T')[0]
  if (today < sixteenth)  return sixteenth.toISOString().split('T')[0]
  return nextFirst.toISOString().split('T')[0]
}

export function getDaysUntilDraw(): number {
  const nextDraw = new Date(getNextDrawDate())
  const today    = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((nextDraw.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}
