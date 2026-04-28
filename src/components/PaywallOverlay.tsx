import React from 'react'
import { UserSession } from '../types'

interface Props {
  session: UserSession | null
  children: React.ReactNode
  feature?: string
  onLogin: () => void
  onUpgrade: () => void
}

export default function PaywallOverlay({ session, children, feature, onLogin, onUpgrade }: Props) {
  return (
    <div style={{ position: 'relative', borderRadius: 'inherit' }}>
      {/* Blurred content */}
      <div style={{
        filter: 'blur(6px)',
        pointerEvents: 'none',
        userSelect: 'none',
        opacity: 0.5,
      }}>
        {children}
      </div>

      {/* Lock overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'rgba(2,8,20,0.75)',
        backdropFilter: 'blur(4px)',
        borderRadius: 20,
        padding: 24,
        textAlign: 'center',
      }}>
        {/* Lock icon with glow */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%', marginBottom: 16,
          background: 'radial-gradient(circle at 40% 35%, rgba(245,158,11,0.3), rgba(124,58,237,0.2))',
          border: '1.5px solid rgba(245,158,11,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32,
          boxShadow: '0 0 32px rgba(245,158,11,0.25), 0 0 60px rgba(124,58,237,0.15)',
          animation: 'pulseGlow 3s ease-in-out infinite',
        }}>
          🔒
        </div>

        <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: 16, marginBottom: 6 }}>
          ฟีเจอร์{feature || 'นี้'}สำหรับสมาชิก Premium
        </div>
        <p style={{ fontSize: 12, color: '#64748b', marginBottom: 20, lineHeight: 1.7 }}>
          สมัครสมาชิกรายเดือนเพื่อปลดล็อก<br/>
          การทำนายเลข สถิติเชิงลึก และโหราศาสตร์ครบชุด
        </p>

        {/* Price badge */}
        <div className="badge badge-amber" style={{ fontSize: 14, padding: '6px 16px', marginBottom: 20, fontFamily: 'Space Grotesk, monospace' }}>
          💎 เพียง 59 บาท/เดือน
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 260 }}>
          {!session ? (
            <>
              <button
                onClick={onLogin}
                className="btn-primary"
                style={{ borderRadius: 14, padding: '13px 20px', fontSize: 15 }}
              >
                🔑 เข้าสู่ระบบ / สมัครสมาชิก
              </button>
            </>
          ) : (
            <button
              onClick={onUpgrade}
              className="btn-primary cta-ring"
              style={{ borderRadius: 14, padding: '13px 20px', fontSize: 15 }}
            >
              💎 อัปเกรด Premium 59 บาท/เดือน
            </button>
          )}
        </div>

        {/* Feature checklist */}
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-start' }}>
          {['🔮 ทำนายเลข 2/3/6 ตัวไม่จำกัด', '📊 สถิติเชิงลึกทุกมิติ', '⭐ โหราศาสตร์ไทยครบชุด', '💭 เลขจากความฝัน + ความเชื่อมั่น'].map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#94a3b8' }}>
              <span style={{ color: '#86efac', fontSize: 10 }}>✓</span> {f}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
