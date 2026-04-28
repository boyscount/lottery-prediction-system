import React, { useState } from 'react'
import { UserSession } from '../types'
import { activatePremium } from '../utils/auth'
import Logo from './Logo'

interface Props {
  session: UserSession
  onSuccess: (session: UserSession) => void
  onClose: () => void
}

const FEATURES = [
  { icon: '🔮', text: 'ทำนายเลข 2, 3, 6 ตัว ไม่จำกัด', premium: true },
  { icon: '📊', text: 'สถิติเชิงลึก ทุกมิติ (ตำแหน่ง/ค้าง/ผลรวม)', premium: true },
  { icon: '💭', text: 'เลขจากความฝัน พร้อม confidence score', premium: true },
  { icon: '⭐', text: 'โหราศาสตร์ไทย ดวงประจำเดือน + เลขมงคล', premium: true },
  { icon: '🎯', text: 'Radar analysis หลายปัจจัย', premium: true },
  { icon: '📚', text: 'บันทึกประวัติการออกรางวัล', premium: false },
  { icon: '🔍', text: 'ดูสถิติพื้นฐาน ความถี่', premium: false },
]

export default function SubscriptionModal({ session, onSuccess, onClose }: Props) {
  const [step, setStep] = useState<'plan' | 'payment' | 'success'>('plan')
  const [loading, setLoading] = useState(false)
  const [method, setMethod] = useState<'promptpay' | 'card'>('promptpay')

  async function handleActivate() {
    setLoading(true)
    const updated = await activatePremium(session)
    setLoading(false)
    setStep('success')
    setTimeout(() => onSuccess(updated), 1800)
  }

  const exp = new Date()
  exp.setDate(exp.getDate() + 30)
  const expStr = exp.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div
      className="modal-backdrop"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="modal-in glass" style={{
        width: '100%', maxWidth: 460,
        borderRadius: 24, overflow: 'hidden',
        border: '1px solid rgba(245,158,11,0.3)',
        maxHeight: '90dvh', overflowY: 'auto',
      }}>

        {/* ── Success ── */}
        {step === 'success' && (
          <div style={{ padding: '48px 28px', textAlign: 'center' }}>
            <div style={{ fontSize: 72, marginBottom: 16 }} className="anim-float">🏆</div>
            <div className="nf-bold" style={{ fontSize: 22, color: '#fbbf24', marginBottom: 8 }}>
              ยินดีด้วย! คุณเป็นสมาชิก Premium แล้ว
            </div>
            <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 24 }}>
              สมาชิกภาพของคุณใช้ได้ถึง <strong style={{ color: '#fbbf24' }}>{expStr}</strong>
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {FEATURES.filter(f => f.premium).map((f, i) => (
                <span key={i} className="badge badge-amber spring-in" style={{
                  fontSize: 12, animationDelay: `${i * 80}ms`
                }}>
                  {f.icon} {f.text}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Plan ── */}
        {step === 'plan' && (
          <div style={{ padding: '28px' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Logo size={48} className="anim-float" style={{ display: 'inline-block', marginBottom: 12 }} />
              <div className="nf-bold shimmer" style={{ fontSize: 20, marginBottom: 4 }}>LottoMind Premium</div>
              <p style={{ fontSize: 13, color: '#64748b' }}>ปลดล็อกทุกฟีเจอร์ในราคาที่คุ้มค่า</p>
            </div>

            {/* Price card */}
            <div style={{
              borderRadius: 20, padding: '20px 24px', marginBottom: 20,
              background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(124,58,237,0.08))',
              border: '1.5px solid rgba(245,158,11,0.4)',
              textAlign: 'center', position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: -20, right: -20, width: 120, height: 120,
                background: 'rgba(245,158,11,0.06)', borderRadius: '50%', filter: 'blur(30px)',
                pointerEvents: 'none',
              }} />
              <div className="badge badge-amber" style={{ fontSize: 11, marginBottom: 12 }}>
                💎 สมาชิกพิเศษ
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 4, marginBottom: 4 }}>
                <span style={{ fontSize: 42, fontFamily: 'Space Grotesk', fontWeight: 800, color: '#fbbf24', lineHeight: 1 }}>
                  59
                </span>
                <span style={{ fontSize: 16, color: '#92400e', marginBottom: 6 }}>บาท</span>
              </div>
              <div style={{ fontSize: 13, color: '#92400e' }}>ต่อเดือน — ยกเลิกได้ทุกเมื่อ</div>
            </div>

            {/* Feature list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {FEATURES.map((f, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 12px', borderRadius: 12,
                  background: f.premium ? 'rgba(245,158,11,0.05)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${f.premium ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.06)'}`,
                }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{f.icon}</span>
                  <span style={{ fontSize: 13, color: f.premium ? '#e2e8f0' : '#4b5563', flex: 1 }}>{f.text}</span>
                  <span style={{ fontSize: 14, flexShrink: 0 }}>
                    {f.premium ? '✅' : '⬜'}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep('payment')}
              className="btn-primary cta-ring"
              style={{ borderRadius: 16, padding: '15px 24px', fontSize: 16, width: '100%', marginBottom: 10 }}
            >
              💎 สมัครสมาชิก 59 บาท/เดือน
            </button>
            <button
              onClick={onClose}
              style={{
                width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                color: '#374151', fontSize: 13, fontFamily: 'Sarabun, sans-serif', padding: 8,
              }}
            >
              ไว้ทีหลัง
            </button>
          </div>
        )}

        {/* ── Payment ── */}
        {step === 'payment' && (
          <div style={{ padding: '28px' }}>
            <button
              onClick={() => setStep('plan')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: 13, marginBottom: 20, fontFamily: 'Sarabun, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              ← ย้อนกลับ
            </button>

            <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: 16, marginBottom: 6 }}>เลือกวิธีชำระเงิน</div>
            <p style={{ fontSize: 12, color: '#64748b', marginBottom: 20 }}>ยอดชำระ 59 บาท · สมาชิก 1 เดือน</p>

            {/* Method selector */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
              {([
                { id: 'promptpay', label: 'PromptPay', emoji: '🏦' },
                { id: 'card', label: 'บัตรเครดิต', emoji: '💳' },
              ] as const).map(m => (
                <button key={m.id}
                  onClick={() => setMethod(m.id)}
                  style={{
                    flex: 1, padding: '12px 8px', borderRadius: 14,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    cursor: 'pointer', transition: 'all 0.2s',
                    background: method === m.id ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.03)',
                    border: `1.5px solid ${method === m.id ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    fontFamily: 'Sarabun, sans-serif',
                  }}
                >
                  <span style={{ fontSize: 24 }}>{m.emoji}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: method === m.id ? '#c4b5fd' : '#64748b' }}>{m.label}</span>
                </button>
              ))}
            </div>

            {/* PromptPay mock */}
            {method === 'promptpay' && (
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{
                  display: 'inline-block', padding: 16, borderRadius: 16,
                  background: '#fff', marginBottom: 12,
                }}>
                  {/* Mock QR */}
                  <div style={{
                    width: 140, height: 140,
                    background: 'repeating-linear-gradient(0deg, #000 0 4px, transparent 4px 8px), repeating-linear-gradient(90deg, #000 0 4px, transparent 4px 8px)',
                    borderRadius: 4,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 32,
                  }}>
                    <div style={{
                      width: 50, height: 50, background: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 26,
                    }}>🏦</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: '#64748b' }}>สแกน QR หรือโอนผ่านแอปธนาคาร</div>
                <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>
                  พร้อมเพย์: <strong style={{ color: '#fbbf24', fontFamily: 'Space Grotesk' }}>098-XXX-XXXX</strong>
                </div>
              </div>
            )}

            {/* Card mock */}
            {method === 'card' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                <input placeholder="หมายเลขบัตร 16 หลัก" maxLength={19}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#e2e8f0', outline: 'none', padding: '12px 14px', fontSize: 14, width: '100%', fontFamily: 'Space Grotesk, monospace', letterSpacing: '0.1em' }} />
                <div style={{ display: 'flex', gap: 10 }}>
                  <input placeholder="MM/YY" maxLength={5}
                    style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#e2e8f0', outline: 'none', padding: '12px 14px', fontSize: 14, fontFamily: 'Space Grotesk, monospace' }} />
                  <input placeholder="CVV" maxLength={4}
                    style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#e2e8f0', outline: 'none', padding: '12px 14px', fontSize: 14, fontFamily: 'Space Grotesk, monospace' }} />
                </div>
              </div>
            )}

            {/* Security note */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 12,
              background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', marginBottom: 20,
            }}>
              <span>🔒</span>
              <span style={{ fontSize: 11, color: '#4ade80' }}>ข้อมูลการชำระเงินถูกเข้ารหัส SSL 256-bit</span>
            </div>

            <button
              onClick={handleActivate}
              disabled={loading}
              className="btn-primary"
              style={{ borderRadius: 16, padding: '15px 24px', fontSize: 16, width: '100%' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <svg style={{ width: 18, height: 18 }} className="anim-spin-slow" fill="none" viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path style={{ opacity: 0.8 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  กำลังดำเนินการ...
                </span>
              ) : '✅ ยืนยันการชำระเงิน 59 บาท'}
            </button>
            <p style={{ fontSize: 10, color: '#374151', textAlign: 'center', marginTop: 8 }}>
              * ระบบสาธิต ไม่มีการเรียกเก็บเงินจริง
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
