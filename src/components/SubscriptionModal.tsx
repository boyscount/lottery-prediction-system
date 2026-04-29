import React, { useState } from 'react'
import { UserSession } from '../types'
import Logo from './Logo'

interface Props {
  session?: UserSession | null
  onSuccess?: (session: UserSession) => void
  onClose: () => void
}

const AMOUNTS = [20, 50, 100, 200]

export default function DonateModal({ onClose }: Props) {
  const [copied, setCopied] = useState(false)
  const [thanked, setThanked] = useState(false)

  function copyRef() {
    navigator.clipboard.writeText('004999084321198').then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

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

            {/* Suggested amounts */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10, textAlign: 'center' }}>
                จำนวนที่แนะนำ (สแกน QR แล้วใส่จำนวนเองได้)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {AMOUNTS.map(a => (
                  <div key={a} style={{
                    padding: '10px 4px', borderRadius: 12, textAlign: 'center',
                    background: 'rgba(124,58,237,0.08)',
                    border: '1px solid rgba(124,58,237,0.2)',
                  }}>
                    <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 16, color: '#c4b5fd' }}>
                      {a}
                    </div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>บาท</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reference copy */}
            <button
              onClick={copyRef}
              style={{
                width: '100%', padding: '11px 16px', borderRadius: 14, marginBottom: 14,
                background: copied ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${copied ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.1)'}`,
                cursor: 'pointer', fontFamily: 'Sarabun, sans-serif',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 10, color: '#64748b', marginBottom: 2 }}>เลขที่อ้างอิง</div>
                <div style={{ fontFamily: 'Space Grotesk', fontSize: 13, color: '#e2e8f0', letterSpacing: '0.05em' }}>
                  004999084321198
                </div>
              </div>
              <span style={{ fontSize: 12, color: copied ? '#4ade80' : '#64748b' }}>
                {copied ? '✅ คัดลอกแล้ว' : '📋 คัดลอก'}
              </span>
            </button>

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
