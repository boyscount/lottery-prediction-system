import React, { useState } from 'react'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { UserSession } from '../types'
import Logo from './Logo'

interface Props {
  session?: UserSession | null
  onSuccess?: (session: UserSession) => void
  onClose: () => void
  mode?: 'donate' | 'upgrade'
}

export default function DonateModal({ onClose, mode = 'donate' }: Props) {
  const [thanked, setThanked] = useState(false)
  const isUpgrade = mode === 'upgrade'

  function handleDone() {
    setThanked(true)
    setTimeout(onClose, 2200)
  }

  return (
    <div
      className="modal-backdrop"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="modal-in glass" style={{
        width: '100%', maxWidth: 400,
        borderRadius: 24, overflow: 'hidden',
        border: '1px solid rgba(124,58,237,0.25)',
        maxHeight: '92dvh', overflowY: 'auto',
      }}>

        {/* ── Thank you screen ── */}
        {thanked ? (
          <div style={{ padding: '48px 28px', textAlign: 'center' }}>
            <div style={{ fontSize: 72, marginBottom: 16 }} className="anim-float">🙏</div>
            <div className="nf-bold" style={{ fontSize: 22, color: '#c4b5fd', marginBottom: 8 }}>
              ขอบคุณมากครับ!
            </div>
            <p style={{ fontSize: 14, color: '#94a3b8' }}>
              ทุกการสนับสนุนช่วยให้เราพัฒนาระบบต่อไปได้
            </p>
          </div>
        ) : (
          <div style={{ padding: '28px 24px' }}>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 22 }}>
              <Logo size={44} className="anim-float" style={{ display: 'inline-block', marginBottom: 10 }} />
              <div className="nf-bold shimmer" style={{ fontSize: 19, marginBottom: 4 }}>
                {isUpgrade ? 'อัพเกรดเป็น Premium' : 'สนับสนุน LottoMind'}
              </div>
              {isUpgrade ? (
                <div>
                  <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, marginBottom: 10 }}>
                    ปลดล็อกฟีเจอร์ทั้งหมด ด้วยการสนับสนุนผู้พัฒนา
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, textAlign: 'left', marginBottom: 4 }}>
                    {[
                      '🤖 ตีความฝันด้วย AI',
                      '📷 สแกนเลขจากรูปด้วย AI',
                      '🎯 ทำนายเลข 2/3/6 ตัว',
                      '📊 สถิติขั้นสูง + Heatmap',
                      '⭐ ดวงประจำเดือน + เลขมงคล',
                    ].map(f => (
                      <div key={f} style={{ fontSize: 12, color: '#c4b5fd', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {f}
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 10, fontSize: 13, color: '#f59e0b', fontWeight: 700 }}>
                    💎 เพียง 59 บาท / เดือน
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                  ถ้าชอบและอยากสนับสนุนการพัฒนา<br />
                  donate ได้เลย ไม่มีขั้นต่ำ 💜
                </p>
              )}
            </div>

            {/* QR Code */}
            <div style={{
              background: '#fff', borderRadius: 20, padding: '20px 16px',
              textAlign: 'center', marginBottom: 18,
              boxShadow: '0 0 40px rgba(124,58,237,0.15)',
            }}>
              <img
                src="/qr-donate.png"
                alt="PromptPay QR Code"
                style={{ width: 200, height: 200, objectFit: 'contain', display: 'block', margin: '0 auto 12px' }}
                onError={e => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
              <div style={{ fontSize: 12, color: '#374151', fontWeight: 600, marginBottom: 4 }}>
                นาย ณัฐพงษ์ ภูสีดิน
              </div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>PromptPay · รับได้ทุกธนาคาร</div>
            </div>

            {/* Email instruction — upgrade mode only */}
            {isUpgrade && <div style={{
              background: 'rgba(124,58,237,0.08)',
              border: '1px solid rgba(124,58,237,0.2)',
              borderRadius: 14, padding: '12px 16px', marginBottom: 16,
            }}>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, fontWeight: 600 }}>
                📧 หลังโอนแล้ว ส่ง slip มาที่
              </div>
              <a
                href="mailto:kimminho.love1103@gmail.com"
                style={{
                  fontSize: 13, color: '#c4b5fd', fontWeight: 700,
                  textDecoration: 'none', wordBreak: 'break-all',
                }}
              >
                kimminho.love1103@gmail.com
              </a>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 6, lineHeight: 1.5 }}>
                แจ้งชื่อผู้ใช้ในแอปด้วยนะครับ<br />
                จะเปิดสิทธิ์ Premium ให้ภายใน 24 ชั่วโมง ✅
              </div>
            </div>}

            {/* Done button */}
            <button
              onClick={handleDone}
              className="btn-primary"
              style={{ borderRadius: 16, padding: '14px 24px', fontSize: 15, width: '100%', marginBottom: 10 }}
            >
              {isUpgrade ? '💎 โอนแล้ว จะส่ง slip ให้!' : '🙏 โอนแล้ว ขอบคุณ!'}
            </button>
            <button
              onClick={onClose}
              style={{
                width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                color: '#374151', fontSize: 13, fontFamily: 'Sarabun, sans-serif', padding: 8,
              }}
            >
              {isUpgrade ? 'ยังไม่อัพเกรด' : 'ไว้คราวหน้า'}
            </button>

          </div>
        )}
      </div>
    </div>
  )
}
