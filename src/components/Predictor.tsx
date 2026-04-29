import React, { useState, useMemo, useEffect } from 'react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import { LotteryDraw, DreamSelection, AstrologyProfile, PredictionResult } from '../types'
import { generatePrediction } from '../utils/prediction'
import { getNextDrawDate } from '../data/lotteryHistory'
import clsx from 'clsx'

interface Props {
  draws: LotteryDraw[]
  dreamSelections: DreamSelection[]
  astrologyProfile: AstrologyProfile | null
  onNavigateDream: () => void
  onNavigateAstrology: () => void
}

type PredictType = '2digit' | '3digit' | '6digit'

// ── Input status card ──────────────────────────────────────────
function InputCard({ icon, label, status, active, onClick }: {
  icon: string; label: string; status: string; active: boolean; onClick?: () => void
}) {
  return (
    <button onClick={onClick} style={{
      background: active ? 'rgba(124,58,237,0.14)' : 'rgba(255,255,255,0.03)',
      border: `1px solid ${active ? 'rgba(124,58,237,0.45)' : 'rgba(255,255,255,0.07)'}`,
      borderRadius: 16, padding: '14px 8px',
      textAlign: 'center', cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.22s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
      width: '100%',
    }} className={onClick ? 'hover-lift press' : ''}>
      <span style={{ fontSize: 26 }}>{icon}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: active ? '#e2e8f0' : '#64748b' }}>{label}</span>
      <span className={clsx('badge', active ? 'badge-green' : 'badge-ghost')} style={{ fontSize: 10 }}>
        {status}
      </span>
    </button>
  )
}

// ── Number display ─────────────────────────────────────────────
function NumberDisplay({ number, type, big }: { number: string; type: PredictType; big?: boolean }) {
  if (type === '2digit') {
    const sz = big ? 'b-2xl' : 'b-xl'
    return <div className={`ball ${sz} b-purple nf-bold num-reveal ball-i`}>{number}</div>
  }
  if (type === '3digit') {
    return (
      <div className="pill-cyan nf-bold num-reveal" style={{
        fontSize: big ? 28 : 22, padding: big ? '0 24px' : '0 16px',
        height: big ? 64 : 50, letterSpacing: '0.12em',
      }}>
        {number}
      </div>
    )
  }
  return (
    <div className="digit-slot-wrap">
      {number.split('').map((d, i) => (
        <div key={i} className="digit-slot" style={{ animationDelay: `${i * 65}ms` }}>{d}</div>
      ))}
    </div>
  )
}

// ── Factor bar ─────────────────────────────────────────────────
function FactorBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
        <span style={{ color: '#64748b' }}>{label}</span>
        <span style={{ color: '#94a3b8', fontWeight: 700 }}>{value}%</span>
      </div>
      <div className="pbar-track" style={{ height: 4 }}>
        <div className={`pbar-fill ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────
export default function Predictor({ draws, dreamSelections, astrologyProfile, onNavigateDream, onNavigateAstrology }: Props) {
  const [result, setResult]       = useState<PredictionResult | null>(null)
  const [loading, setLoading]     = useState(false)
  const [activeType, setActiveType] = useState<PredictType>('2digit')
  const [visible, setVisible]     = useState(false)
  const nextDraw = getNextDrawDate()

  // Track viewport for responsive layout
  const [isWide, setIsWide] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 768 : false)
  useEffect(() => {
    const handler = () => setIsWide(window.innerWidth >= 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  function runPrediction() {
    setLoading(true)
    setVisible(false)
    setTimeout(() => {
      const r = generatePrediction(draws, dreamSelections, astrologyProfile, nextDraw)
      setResult(r)
      setLoading(false)
      setTimeout(() => setVisible(true), 80)
    }, 1600)
  }

  const numbers = useMemo(() => {
    if (!result) return []
    return activeType === '2digit' ? result.twoDigit
      : activeType === '3digit'   ? result.threeDigit
      : result.sixDigit
  }, [result, activeType])

  const confInfo = (c: number) => ({
    label: c >= 75 ? 'สูงมาก' : c >= 60 ? 'สูง' : c >= 45 ? 'ปานกลาง' : 'ต่ำ',
    badge: c >= 75 ? 'badge-green' : c >= 60 ? 'badge-cyan' : c >= 45 ? 'badge-amber' : 'badge-red',
    bar:   c >= 75 ? 'pbar-green'  : c >= 60 ? 'pbar-cyan'  : c >= 45 ? 'pbar-amber'  : 'pbar-pink',
  })

  // ── Left panel (input + CTA) ──────────────────────────────────
  const leftPanel = (
    <div className="predictor-left" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Title */}
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>🎯 ทำนายเลข</h2>
        <p style={{ fontSize: 13, color: '#64748b' }}>
          รวมสถิติ + ความฝัน + โหราศาสตร์ เพื่อความแม่นยำสูงสุด
        </p>
      </div>

      {/* Input status cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
        <InputCard icon="📊" label="สถิติ"
          status={`${draws.length} งวด`} active />
        <InputCard icon="💭" label="ความฝัน"
          status={dreamSelections.length > 0 ? `${dreamSelections.length} อย่าง` : 'ยังไม่เลือก'}
          active={dreamSelections.length > 0} onClick={onNavigateDream} />
        <InputCard icon="⭐" label="ดวง"
          status={astrologyProfile ? 'ตั้งค่าแล้ว' : 'ยังไม่ตั้ง'}
          active={!!astrologyProfile} onClick={onNavigateAstrology} />
      </div>

      {/* CTA button */}
      {(
        <button
          onClick={runPrediction}
          disabled={loading}
          className={`btn-primary${!loading ? ' cta-ring' : ''}`}
          style={{ borderRadius: 18, padding: '17px 24px', fontSize: 16, width: '100%' }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <svg style={{ width: 20, height: 20 }} className="anim-spin-slow" fill="none" viewBox="0 0 24 24">
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path style={{ opacity: 0.8 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              กำลังวิเคราะห์...
            </span>
          ) : (
            <>🔮 คำนวณทำนาย<br/><span style={{ fontSize: 12, opacity: 0.75 }}>งวด {nextDraw}</span></>
          )}
        </button>
      )}

      {/* Draw date info */}
      {result && (
        <div className="glass" style={{ borderRadius: 16, padding: '12px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 6 }}>
            <span>ปัจจัยที่ใช้</span>
            <span style={{ color: '#94a3b8' }}>{result.generatedAt ? new Date(result.generatedAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            <span className="badge badge-purple" style={{ fontSize: 10 }}>📊 สถิติ {draws.length} งวด</span>
            {result.inputFactors.dreamsUsed.length > 0 && (
              <span className="badge badge-cyan" style={{ fontSize: 10 }}>💭 {result.inputFactors.dreamsUsed.length} ความฝัน</span>
            )}
            {result.inputFactors.astrologyUsed && (
              <span className="badge badge-amber" style={{ fontSize: 10 }}>⭐ โหราศาสตร์</span>
            )}
          </div>
        </div>
      )}
    </div>
  )

  // ── Right panel (results) ─────────────────────────────────────
  const rightPanel = result ? (
    <div style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)', transition: 'all 0.5s cubic-bezier(0.4,0,0.2,1)' }}>

      {/* Type switcher */}
      <div style={{
        display: 'flex', gap: 6, padding: 6,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 20, marginBottom: 16,
      }}>
        {([
          { id: '2digit', label: '2 ตัว', emoji: '🎰' },
          { id: '3digit', label: '3 ตัว', emoji: '🎲' },
          { id: '6digit', label: '6 ตัว', emoji: '🏆' },
        ] as { id: PredictType; label: string; emoji: string }[]).map(t => (
          <button key={t.id} onClick={() => setActiveType(t.id)}
            className="press"
            style={{
              flex: 1, padding: '10px 4px', borderRadius: 14,
              fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              border: activeType === t.id ? '1px solid rgba(124,58,237,0.5)' : '1px solid transparent',
              background: activeType === t.id
                ? 'linear-gradient(135deg,rgba(124,58,237,0.35),rgba(6,182,212,0.18))'
                : 'transparent',
              color: activeType === t.id ? '#e2e8f0' : '#4b5563',
              fontFamily: 'Sarabun, sans-serif',
            }}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {/* Number cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {numbers.map((item, idx) => {
          const isTop = idx === 0
          const ci = confInfo(item.confidence)
          return (
            <div key={item.number + idx}
              className={clsx('anim-fade-up', isTop ? 'gb' : 'glass')}
              style={{
                borderRadius: isTop ? 22 : 16,
                padding: isTop ? '22px 20px' : '16px',
                animationDelay: `${idx * 80}ms`,
              }}
            >
              {/* Top row: rank + number + radar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                {/* Rank */}
                <div style={{
                  width: isTop ? 38 : 32, height: isTop ? 38 : 32,
                  borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: isTop ? 16 : 12, fontWeight: 800,
                  background: isTop
                    ? 'linear-gradient(135deg,#b45309,#fbbf24)'
                    : 'rgba(255,255,255,0.07)',
                  color: isTop ? '#000' : '#6b7280',
                  boxShadow: isTop ? '0 0 16px rgba(245,158,11,0.55)' : 'none',
                }}>
                  {isTop ? '★' : idx + 1}
                </div>

                {/* Number (big for top card) */}
                <div style={{ flexShrink: 0 }}>
                  <NumberDisplay number={item.number} type={activeType} big={isTop} />
                </div>

                {/* Confidence + bar + reasons */}
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7, flexWrap: 'wrap' }}>
                    <span className={clsx('badge', ci.badge)} style={{ fontSize: isTop ? 12 : 10 }}>
                      {ci.label} {item.confidence}%
                    </span>
                  </div>
                  <div className="pbar-track" style={{ height: isTop ? 6 : 4, marginBottom: 7 }}>
                    <div className={`pbar-fill ${ci.bar}`} style={{ width: `${item.confidence}%` }} />
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {item.reasons.slice(0, isTop ? 6 : 3).map((r, i) => (
                      <span key={i} style={{
                        fontSize: 10, color: '#64748b', padding: '2px 7px',
                        background: 'rgba(255,255,255,0.04)', borderRadius: 6,
                      }}>{r}</span>
                    ))}
                  </div>
                </div>

                {/* Radar chart (top card, desktop only) */}
                {isTop && isWide && (
                  <div style={{ width: 90, height: 90, flexShrink: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={[
                        { s: 'สถิติ', v: item.factors.statistical },
                        { s: 'ฝัน',  v: item.factors.dream },
                        { s: 'ดวง',  v: item.factors.astrology },
                        { s: 'แบบ',  v: item.factors.pattern },
                      ]}>
                        <PolarGrid stroke="rgba(255,255,255,0.08)" />
                        <PolarAngleAxis dataKey="s" tick={{ fill: '#374151', fontSize: 9 }} />
                        <Radar dataKey="v" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.32} strokeWidth={1.5} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Factor breakdown — all cards */}
              <div style={{
                marginTop: 14, paddingTop: 14,
                borderTop: '1px solid rgba(255,255,255,0.07)',
                display: 'grid', gridTemplateColumns: 'repeat(2,1fr)',
                gap: '8px 20px',
              }}>
                <FactorBar label="สถิติ"      value={item.factors.statistical} color="pbar-purple" />
                <FactorBar label="ความฝัน"    value={item.factors.dream}       color="pbar-cyan"   />
                <FactorBar label="โหราศาสตร์" value={item.factors.astrology}   color="pbar-amber"  />
                <FactorBar label="Pattern"    value={item.factors.pattern}     color="pbar-green"  />
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ textAlign: 'center', fontSize: 11, color: '#374151', marginTop: 14, padding: 8 }}>
        * เพื่อความบันเทิงเท่านั้น ไม่รับรองผลการออกรางวัล
      </div>
    </div>
  ) : (
    /* Empty state */
    <div style={{ textAlign: 'center', padding: '60px 24px', color: '#374151' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }} className="anim-float">🔮</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: '#4b5563', marginBottom: 8 }}>พร้อมทำนายเลขแล้ว</div>
      <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.7 }}>
        กดปุ่ม "คำนวณทำนาย" เพื่อเริ่มต้น<br/>
        ยิ่งเพิ่มความฝันและข้อมูลดวงชะตา ยิ่งแม่น
      </div>
    </div>
  )

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className={`predictor-wrap${result ? ' has-result' : ''}`}>
      {/* Left / single column */}
      <div>
        {leftPanel}
        {/* On mobile: results go below inputs */}
        {!isWide && rightPanel}
      </div>

      {/* Right column (desktop with results) */}
      {isWide && (
        <div>
          {rightPanel}
        </div>
      )}
    </div>
  )
}
