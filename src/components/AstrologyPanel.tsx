import React, { useState } from 'react'
import { AstrologyProfile } from '../types'
import { getAstrologyProfile, getCurrentLunarInfo } from '../utils/astrology'

interface Props {
  profile: AstrologyProfile | null
  onProfileChange: (p: AstrologyProfile | null) => void
}

const ELEMENT_EMOJI: Record<string, string> = {
  'ไฟ': '🔥', 'ดิน': '🌍', 'โลหะ': '⚙️', 'น้ำ': '💧', 'ไม้': '🌿',
}

const FORTUNE_MSG = (f: number) =>
  f >= 80 ? { text: 'ดวงเยี่ยมมาก — เหมาะซื้อสลากอย่างยิ่ง!', color: '#86efac', emoji: '🌟' }
  : f >= 65 ? { text: 'ดวงดี — มีโอกาสโชคลาภ', color: '#67e8f9', emoji: '😊' }
  : f >= 50 ? { text: 'ดวงปานกลาง — ลองดูก็ได้', color: '#fbbf24', emoji: '🙂' }
  : { text: 'ดวงอ่อน — ทำบุญก่อนนะ', color: '#fca5a5', emoji: '🙏' }

export default function AstrologyPanel({ profile, onProfileChange }: Props) {
  const [birthDate, setBirthDate] = useState(profile?.birthDate || '')
  const [error, setError] = useState('')
  const lunar = getCurrentLunarInfo()

  function calculate() {
    if (!birthDate) { setError('กรุณาเลือกวันเกิด'); return }
    setError('')
    onProfileChange(getAstrologyProfile(birthDate))
  }

  const fortune = profile ? FORTUNE_MSG(profile.currentMonthFortune) : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>⭐ โหราศาสตร์ไทย</h2>
        <p style={{ fontSize: 13, color: '#64748b' }}>คำนวณเลขมงคลตามดวงชะตา นักษัตร และธาตุประจำตัว</p>
      </div>

      {/* Lunar today */}
      <div className="glass" style={{
        borderRadius: 20, padding: 18,
        border: '1px solid rgba(245,158,11,0.22)',
        background: 'rgba(245,158,11,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 48, lineHeight: 1 }}>{lunar.phaseEmoji}</span>
          <div>
            <div style={{ fontWeight: 700, color: '#fbbf24', fontSize: 15 }}>{lunar.phase}</div>
            <div style={{ fontSize: 12, marginTop: 4, color: lunar.auspicious ? '#86efac' : '#64748b' }}>
              {lunar.auspicious
                ? '✅ วันมงคล เหมาะซื้อสลากมากที่สุด'
                : '⏳ ยังไม่ใช่วันมงคล รอวันพระดีกว่า'}
            </div>
            <div style={{ fontSize: 11, color: '#4b5563', marginTop: 3 }}>สภาพดวงจันทร์วันนี้</div>
          </div>
        </div>
      </div>

      {/* Birth date input */}
      <div className="glass" style={{ borderRadius: 20, padding: 20 }}>
        <div style={{ fontWeight: 600, color: '#e2e8f0', marginBottom: 14 }}>🎂 กรอกวันเกิดเพื่อดูดวงส่วนตัว</div>
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            color: '#fca5a5', fontSize: 12, padding: '8px 12px', borderRadius: 10, marginBottom: 12,
          }}>
            {error}
          </div>
        )}
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="date"
            value={birthDate}
            onChange={e => setBirthDate(e.target.value)}
            className="input input-date"
            style={{ padding: '10px 14px', fontSize: 14, flex: 1 }}
          />
          <button
            onClick={calculate}
            disabled={!birthDate}
            className="btn-primary"
            style={{ borderRadius: 12, padding: '10px 20px', fontSize: 14, flexShrink: 0 }}
          >
            คำนวณ
          </button>
        </div>
        <div style={{ fontSize: 11, color: '#374151', marginTop: 8 }}>
          * ใช้วันเกิดตามปฏิทินสากล (ค.ศ.)
        </div>
      </div>

      {/* Profile result */}
      {profile && fortune && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Zodiac hero card */}
          <div className="gb" style={{ borderRadius: 24 }}>
            <div style={{ padding: 22, position: 'relative', overflow: 'hidden' }}>
              <div style={{
                position: 'absolute', top: -20, right: -20,
                width: 140, height: 140,
                background: 'rgba(245,158,11,0.08)', borderRadius: '50%', filter: 'blur(30px)',
                pointerEvents: 'none',
              }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, position: 'relative' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 36, marginBottom: 4 }}>
                    {ELEMENT_EMOJI[profile.element] || '✨'}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 2 }}>ธาตุ</div>
                  <div style={{ fontWeight: 700, color: '#06b6d4', fontSize: 14 }}>{profile.element}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>ปีนักษัตร</div>
                  <div style={{ fontWeight: 700, color: '#fbbf24', fontSize: 13, lineHeight: 1.3 }}>{profile.thaiZodiac}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>เลขชะตา</div>
                  <div className="ball b-lg b-purple nf-bold" style={{ margin: '0 auto' }}>
                    {profile.personalNumber}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fortune meter */}
          <div className="glass" style={{ borderRadius: 20, padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontWeight: 600, color: '#e2e8f0', fontSize: 14 }}>ดวงโชคลาภเดือนนี้</span>
              <span style={{ fontWeight: 800, fontSize: 22, color: fortune.color }}
                className="nf-bold">
                {profile.currentMonthFortune}%
              </span>
            </div>
            <div className="pbar-track" style={{ height: 12, borderRadius: 8, marginBottom: 10 }}>
              <div style={{
                height: '100%', borderRadius: 8, width: `${profile.currentMonthFortune}%`,
                background: `linear-gradient(90deg, ${fortune.color}80, ${fortune.color})`,
                transition: 'width 1.5s cubic-bezier(0.4,0,0.2,1)',
                boxShadow: `0 0 12px ${fortune.color}60`,
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', top: 0, bottom: 0, left: '-100%', width: '60%',
                  background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)',
                  animation: 'pbarSweep 2s ease-in-out infinite',
                }} />
              </div>
            </div>
            <div style={{ fontSize: 13, color: fortune.color }}>
              {fortune.emoji} {fortune.text}
            </div>
          </div>

          {/* Lucky numbers */}
          <div className="glass" style={{ borderRadius: 20, padding: 18 }}>
            <div style={{ fontWeight: 600, color: '#e2e8f0', marginBottom: 14, fontSize: 14 }}>
              🍀 เลขมงคลประจำตัว
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {profile.luckyNumbers.map((n, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div className={`ball b-md nf-bold ${i === 0 ? 'b-amber' : i <= 2 ? 'b-purple' : 'b-ghost'}`}
                    style={{ margin: '0 auto' }}>
                    {n.toString().padStart(2, '0')}
                  </div>
                  {i === 0 && (
                    <div style={{ fontSize: 9, color: '#b45309', marginTop: 3, fontWeight: 600 }}>
                      ดีสุด
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Info grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="glass" style={{ borderRadius: 16, padding: 14 }}>
              <div style={{ fontSize: 11, color: '#4b5563', marginBottom: 6 }}>📅 วันมงคล</div>
              <div style={{ fontWeight: 600, color: '#86efac', fontSize: 13 }}>
                {profile.luckyDays.join(' / ')}
              </div>
            </div>
            <div className="glass" style={{ borderRadius: 16, padding: 14 }}>
              <div style={{ fontSize: 11, color: '#4b5563', marginBottom: 6 }}>🎨 สีมงคล</div>
              <div style={{ fontWeight: 600, color: '#f9a8d4', fontSize: 13 }}>
                {profile.luckyColors.join(' / ')}
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="glass" style={{ borderRadius: 18, padding: 16, border: '1px solid rgba(124,58,237,0.2)' }}>
            <div style={{ fontWeight: 600, color: '#c4b5fd', marginBottom: 10, fontSize: 13 }}>📜 คำแนะนำตามโหราศาสตร์</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>
              <div>🔸 เกิดปี <strong style={{ color: '#fbbf24' }}>{profile.thaiZodiac}</strong> — ธาตุ <strong style={{ color: '#06b6d4' }}>{profile.element}</strong></div>
              <div>🔸 เลขชะตา <strong style={{ color: '#c4b5fd' }}>{profile.personalNumber}</strong> — นำโชคในการเสี่ยงทาย</div>
              <div>🔸 วันดีซื้อสลาก: <strong style={{ color: '#86efac' }}>{profile.luckyDays.join(', ')}</strong></div>
              <div>🔸 สวมสี <strong style={{ color: '#f9a8d4' }}>{profile.luckyColors.join(', ')}</strong> เพิ่มพลังดวง</div>
            </div>
          </div>
        </div>
      )}

      {!profile && (
        <div style={{ textAlign: 'center', padding: '48px 16px', color: '#374151' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }} className="anim-float">⭐</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#4b5563', marginBottom: 8 }}>กรอกวันเกิดเพื่อเริ่มต้น</div>
          <div style={{ fontSize: 13 }}>ระบบจะคำนวณปีนักษัตร ธาตุ เลขมงคล และดวงประจำเดือนให้</div>
        </div>
      )}
    </div>
  )
}
