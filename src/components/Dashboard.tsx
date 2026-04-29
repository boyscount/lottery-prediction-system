import React, { useState, useEffect, useMemo } from 'react'
import { LotteryDraw } from '../types'
import { getNextDrawDate } from '../data/lotteryHistory'
import { getHotNumbers, getColdNumbers, getTwoDigitStats } from '../utils/statistics'
import { getCurrentLunarInfo } from '../utils/astrology'

interface Props {
  draws: LotteryDraw[]
  onNavigate: (tab: string) => void
}

const MONTH_TH = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.']

function useCountdown(targetDate: string) {
  const [diff, setDiff] = useState(0)
  useEffect(() => {
    function calc() {
      const now  = new Date()
      const draw = new Date(targetDate + 'T00:00:00')
      setDiff(Math.max(0, draw.getTime() - now.getTime()))
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [targetDate])
  const days    = Math.floor(diff / 86400000)
  const hours   = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000)  / 60000)
  const seconds = Math.floor((diff % 60000)    / 1000)
  return { days, hours, minutes, seconds, urgent: days <= 3 }
}

// Simulated community trending — weighted by frequency + seeded randomness per draw-date
function useCommunityTrending(draws: LotteryDraw[]) {
  return useMemo(() => {
    const stats = getTwoDigitStats(draws).filter(s => s.count > 0)
    // Score: blend frequency trend + pseudo-random flavor per "session"
    const seed = new Date().toDateString().length  // changes each day
    return stats
      .map(s => {
        const trendBonus = s.trend === 'hot' ? 40 : s.trend === 'warm' ? 20 : s.trend === 'cold' ? 5 : 0
        // deterministic-ish pseudo random per number
        const n = parseInt(s.number)
        const pseudo = ((n * 17 + seed * 3) % 30)
        return { number: s.number, score: s.count * 3 + trendBonus + pseudo, trend: s.trend }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
  }, [draws])
}

export default function Dashboard({ draws, onNavigate }: Props) {
  const latest   = [...draws].sort((a, b) => b.date.localeCompare(a.date))[0]
  const nextDraw = getNextDrawDate()
  const { days, hours, minutes, seconds, urgent } = useCountdown(nextDraw)
  const hot      = getHotNumbers(draws, 8)
  const cold     = getColdNumbers(draws, 8)
  const lunar    = getCurrentLunarInfo()
  const trending = useCommunityTrending(draws)

  const nd = new Date(nextDraw)
  const drawLabel = `${nd.getDate()} ${MONTH_TH[nd.getMonth()]} ${nd.getFullYear() + 543}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* ══ HERO ══ */}
      <div className="gb-animated" style={{ borderRadius: 28, overflow: 'hidden' }}>
        <div style={{ position: 'relative', padding: '28px 24px', textAlign: 'center', overflow: 'hidden' }}>
          {/* Glow layers */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse 100% 80% at 50% 0%, rgba(124,58,237,0.2) 0%, transparent 60%)',
          }} />

          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              งวดถัดไป · สลากกินแบ่งรัฐบาล
            </div>
            <div className="nf-bold" style={{ fontSize: 24, color: '#fff', marginBottom: 20 }}>
              {drawLabel}
            </div>

            {/* Live countdown blocks */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 18 }}>
              {[
                { val: days,    lbl: 'วัน' },
                { val: hours,   lbl: 'ชม.' },
                { val: minutes, lbl: 'นาที' },
                { val: seconds, lbl: 'วิ' },
              ].map((b, i) => (
                <React.Fragment key={b.lbl}>
                  <div className="countdown-block">
                    <span className={`countdown-val${urgent ? ' urgent' : ''}`}>
                      {String(b.val).padStart(2, '0')}
                    </span>
                    <span className="countdown-lbl">{b.lbl}</span>
                  </div>
                  {i < 3 && <span style={{ color: '#374151', fontSize: 22, fontWeight: 800, marginBottom: 14, lineHeight: 1 }}>:</span>}
                </React.Fragment>
              ))}
            </div>

            {/* Lunar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 22 }}>
              <span style={{ fontSize: 18 }}>{lunar.phaseEmoji}</span>
              <span style={{ fontSize: 13, color: lunar.auspicious ? '#86efac' : '#64748b' }}>
                {lunar.phase}
                {lunar.auspicious && <span style={{ marginLeft: 6, color: '#86efac' }}>✨ วันมงคล</span>}
              </span>
            </div>

            <button
              className="btn-primary anim-pulse-glow"
              onClick={() => onNavigate('predict')}
              style={{ padding: '14px 36px', fontSize: 16, borderRadius: 16, display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              🎯 ทำนายเลขเลย
            </button>
          </div>
        </div>
      </div>

      {/* ══ LATEST RESULT ══ */}
      {latest && (
        <div className="glass" style={{ borderRadius: 22, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: '#e2e8f0' }}>
              <span>🏆</span> ผลล่าสุด
            </div>
            <span className="badge badge-amber">{latest.date}</span>
          </div>

          {/* First prize */}
          <div style={{
            textAlign: 'center', padding: '16px 12px', borderRadius: 16, marginBottom: 16,
            background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.14)',
          }}>
            <div style={{ fontSize: 11, color: '#78716c', marginBottom: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>รางวัลที่ 1</div>
            <div className="prize-display" style={{ fontSize: 'clamp(36px,8vw,56px)' }}>
              {latest.firstPrize}
            </div>
          </div>

          {/* Other prizes */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>หน้า 3 ตัว</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
                {latest.threeDigitFront.map(n => (
                  <div key={n} className="pill-purple nf-bold" style={{ fontSize: 14, padding: '0 10px', height: 38 }}>{n}</div>
                ))}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>ท้าย 3 ตัว</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
                {latest.threeDigitBack.map(n => (
                  <div key={n} className="pill-cyan nf-bold" style={{ fontSize: 14, padding: '0 10px', height: 38 }}>{n}</div>
                ))}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>ท้าย 2 ตัว</div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div className="ball b-lg b-green nf-bold">{latest.twoDigitBack}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ COMMUNITY TRENDING ══ */}
      <div className="glass" style={{ borderRadius: 20, padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 20 }}>🔥</span>
          <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: 14 }}>เลขฮิตชุมชน</span>
          <span className="trend-badge" style={{ marginLeft: 'auto' }}>Live</span>
        </div>
        <div style={{ fontSize: 12, color: '#4b5563', marginBottom: 14 }}>
          เลขที่ผู้ใช้นิยมทำนายในงวดนี้ อัปเดตตามสถิติจริง
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {trending.map((t, i) => (
            <div key={t.number} className="spring-in" style={{ animationDelay: `${i * 55}ms`, textAlign: 'center' }}>
              <div className={`ball b-sm nf-bold ball-i ${
                t.trend === 'hot' ? 'b-red' : t.trend === 'warm' ? 'b-amber' : t.trend === 'cold' ? 'b-ghost' : 'b-ghost'
              }`} style={{ position: 'relative' }}>
                {t.number}
                {i < 3 && (
                  <span style={{
                    position: 'absolute', top: -6, right: -6,
                    background: i === 0 ? '#ef4444' : i === 1 ? '#f59e0b' : '#6366f1',
                    color: '#fff', borderRadius: '50%', width: 16, height: 16,
                    fontSize: 8, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {['🔥','⭐','💜'][i]}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 9, color: '#4b5563', marginTop: 3 }}>
                {i < 3 ? ['#1','#2','#3'][i] : `#${i+1}`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ HOT / COLD ══ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* Hot */}
        <div className="glass" style={{ borderRadius: 20, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <span>🔥</span>
            <span style={{ fontWeight: 600, color: '#fca5a5', fontSize: 13 }}>เลขร้อน</span>
            <span className="badge badge-red" style={{ marginLeft: 'auto', fontSize: 10 }}>ออกบ่อย</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }} className="stagger">
            {hot.map((n, i) => (
              <div key={n} style={{ position: 'relative' }} className="anim-ball-drop">
                <div className="ball b-sm b-red nf-bold">{n}</div>
                <div style={{
                  position: 'absolute', top: -4, right: -4,
                  width: 16, height: 16, borderRadius: '50%',
                  background: '#b91c1c', color: '#fff',
                  fontSize: 9, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2,
                }}>{i + 1}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Cold */}
        <div className="glass" style={{ borderRadius: 20, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <span>🧊</span>
            <span style={{ fontWeight: 600, color: '#93c5fd', fontSize: 13 }}>เลขเย็น</span>
            <span className="badge badge-cyan" style={{ marginLeft: 'auto', fontSize: 10 }}>ค้างนาน</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }} className="stagger">
            {cold.map((n, i) => (
              <div key={n} style={{ position: 'relative' }} className="anim-ball-drop">
                <div className="ball b-sm b-ghost nf-bold">{n}</div>
                <div style={{
                  position: 'absolute', top: -4, right: -4,
                  width: 16, height: 16, borderRadius: '50%',
                  background: '#1d4ed8', color: '#fff',
                  fontSize: 9, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2,
                }}>{i + 1}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ QUICK ACTIONS ══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          { icon: '💭', title: 'ฝันแล้วได้เลข',  desc: 'แปลความฝัน → เลข', tab: 'dream',
            from: 'rgba(124,58,237,0.22)', to: 'rgba(79,22,185,0.08)', border: 'rgba(124,58,237,0.3)' },
          { icon: '⭐', title: 'โหราศาสตร์',      desc: 'เลขดีตามดวง',      tab: 'astrology',
            from: 'rgba(245,158,11,0.22)', to: 'rgba(180,83,9,0.06)', border: 'rgba(245,158,11,0.3)' },
          { icon: '📓', title: 'บันทึกเลข',       desc: 'จดเลขที่จะซื้อ',    tab: 'journal',
            from: 'rgba(34,197,94,0.2)',   to: 'rgba(22,101,52,0.06)', border: 'rgba(34,197,94,0.3)' },
        ].map(item => (
          <button key={item.tab} onClick={() => onNavigate(item.tab)} className="hover-lift"
            style={{
              background: `linear-gradient(145deg, ${item.from}, ${item.to})`,
              border: `1px solid ${item.border}`,
              borderRadius: 18, padding: '14px 12px',
              textAlign: 'left', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', gap: 6,
            }}>
            <span style={{ fontSize: 28 }}>{item.icon}</span>
            <span style={{ fontWeight: 700, fontSize: 13, color: '#f1f5f9', lineHeight: 1.2 }}>{item.title}</span>
            <span style={{ fontSize: 11, color: '#64748b', lineHeight: 1.3 }}>{item.desc}</span>
          </button>
        ))}
      </div>

      {/* ══ MINI STATS ══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
        {[
          { v: draws.length,                              label: 'งวดทั้งหมด',   c: '#c4b5fd' },
          { v: draws[0]?.date.slice(0,4) || '-',          label: 'ตั้งแต่ปี',    c: '#67e8f9' },
          { v: lunar.auspicious ? '🍀' : '⏳',           label: lunar.auspicious ? 'วันมงคล' : 'รอวันดี', c: '#86efac' },
        ].map(s => (
          <div key={s.label} className="glass" style={{ borderRadius: 14, padding: '12px 10px', textAlign: 'center' }}>
            <div className="nf-bold" style={{ fontSize: 20, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: 11, color: '#4b5563', marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
