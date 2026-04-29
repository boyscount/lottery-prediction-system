import React, { useState } from 'react'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { UserSession } from '../types'
import Logo from './Logo'

interface Props {
  session?: UserSession | null
  onSuccess?: (session: UserSession) => void
  onClose: () => void
}

export default function DonateModal({ onClose }: Props) {
  const [thanked, setThanked] = useState(false)

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
                สนับสนุน LottoMind
              </div>
              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                ทุก feature ใช้ฟรี 100%<br />
                ถ้าชอบและอยากสนับสนุนการพัฒนา — donate ได้เลย 💜
              </p>
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

            {/* Done button */}
            <button
              onClick={handleDone}
              className="btn-primary"
              style={{ borderRadius: 16, padding: '14px 24px', fontSize: 15, width: '100%', marginBottom: 10 }}
            >
              🙏 โอนแล้ว ขอบคุณ!
            </button>
            <button
              onClick={onClose}
              style={{
                width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                color: '#374151', fontSize: 13, fontFamily: 'Sarabun, sans-serif', padding: 8,
              }}
            >
              ไว้คราวหน้า
            </button>

          </div>
        )}
      </div>
    </div>
  )
}
