import React, { useState } from 'react'
import { UserSession } from '../types'
import { registerUser, loginUser } from '../utils/auth'
import Logo from './Logo'

interface Props {
  onSuccess: (session: UserSession) => void
  onClose: () => void
  defaultMode?: 'login' | 'register'
}

export default function AuthModal({ onSuccess, onClose, defaultMode = 'login' }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [showPwd2, setShowPwd2] = useState(false)

  const [username, setUsername] = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    // timeout 15s — ป้องกันค้างหน้าจอถ้า Supabase ตอบช้า
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('ระบบใช้เวลานานเกินไป กรุณาลองใหม่')), 15000)
    )

    try {
      if (mode === 'register') {
        if (password !== confirm) { setError('รหัสผ่านไม่ตรงกัน'); setLoading(false); return }
        const res = await Promise.race([registerUser(username, email, password), timeout])
        if (res.success && res.session) { onSuccess(res.session); return }
        setError(res.error || 'เกิดข้อผิดพลาด')
      } else {
        const res = await Promise.race([loginUser(email, password), timeout])
        if (res.success && res.session) { onSuccess(res.session); return }
        setError(res.error || 'เกิดข้อผิดพลาด')
      }
    } catch (err: any) {
      setError(err?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่')
    }
    setLoading(false)
  }

  const inp: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12,
    color: '#e2e8f0',
    outline: 'none',
    padding: '12px 14px',
    fontSize: 14,
    width: '100%',
    fontFamily: 'Sarabun, sans-serif',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  }

  return (
    <div
      className="modal-backdrop"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="modal-in glass" style={{
        width: '100%', maxWidth: 440,
        borderRadius: 24, overflow: 'hidden',
        border: '1px solid rgba(124,58,237,0.3)',
      }}>
        {/* Header */}
        <div style={{
          padding: '28px 28px 0',
          textAlign: 'center',
          background: 'linear-gradient(180deg, rgba(124,58,237,0.08) 0%, transparent 100%)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
            <Logo size={52} className="anim-float" />
          </div>
          <div className="shimmer nf-bold" style={{ fontSize: 20, marginBottom: 4 }}>LottoMind</div>
          <p style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>
            {mode === 'login' ? 'ยินดีต้อนรับกลับ 👋' : 'สมัครฟรี ใช้ได้ทุก feature'}
          </p>
          {mode === 'register' && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
              borderRadius: 10, background: 'rgba(124,58,237,0.08)',
              border: '1px solid rgba(124,58,237,0.2)', marginBottom: 16,
            }}>
              <span style={{ fontSize: 16 }}>💾</span>
              <span style={{ fontSize: 12, color: '#a78bfa', lineHeight: 1.4 }}>
                ข้อมูลความฝัน + ดวงของคุณจะถูกบันทึกถาวร<br/>และใช้ได้ทุกอุปกรณ์
              </span>
            </div>
          )}
          {mode === 'login' && <div style={{ marginBottom: 24 }} />}

          {/* Mode tabs */}
          <div style={{
            display: 'flex', gap: 4, padding: 4,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 16, marginBottom: 24,
          }}>
            {(['login', 'register'] as const).map(m => (
              <button key={m}
                onClick={() => { setMode(m); setError('') }}
                style={{
                  flex: 1, padding: '9px 0', borderRadius: 12, fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.2s', border: 'none',
                  background: mode === m
                    ? 'linear-gradient(135deg,rgba(124,58,237,0.35),rgba(6,182,212,0.18))'
                    : 'transparent',
                  color: mode === m ? '#c4b5fd' : '#4b5563',
                  fontFamily: 'Sarabun, sans-serif',
                }}
              >
                {m === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={submit} style={{ padding: '0 28px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#fca5a5', fontSize: 12, padding: '10px 14px', borderRadius: 12,
            }}>
              ⚠️ {error}
            </div>
          )}

          {mode === 'register' && (
            <div>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>ชื่อผู้ใช้</div>
              <input
                style={inp}
                placeholder="ชื่อผู้ใช้ (ตัวอักษร/ตัวเลข)"
                value={username}
                onChange={e => setUsername(e.target.value)}
                maxLength={30}
                autoComplete="username"
                required
                onFocus={e => { e.target.style.borderColor = 'rgba(124,58,237,0.7)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.15)' }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none' }}
              />
            </div>
          )}

          <div>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>
              {mode === 'login' ? 'อีเมล' : 'อีเมล'}
            </div>
            <input
              style={inp}
              type={mode === 'register' ? 'email' : 'text'}
              placeholder={mode === 'login' ? 'อีเมล' : 'your@email.com'}
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
              onFocus={e => { e.target.style.borderColor = 'rgba(124,58,237,0.7)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.15)' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none' }}
            />
          </div>

          <div>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>รหัสผ่าน</div>
            <div style={{ position: 'relative' }}>
              <input
                style={{ ...inp, paddingRight: 44 }}
                type={showPwd ? 'text' : 'password'}
                placeholder="รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                onFocus={e => { e.target.style.borderColor = 'rgba(124,58,237,0.7)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.15)' }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none' }}
              />
              <button type="button" className="pwd-toggle" onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>ยืนยันรหัสผ่าน</div>
              <div style={{ position: 'relative' }}>
                <input
                  style={{ ...inp, paddingRight: 44 }}
                  type={showPwd2 ? 'text' : 'password'}
                  placeholder="ยืนยันรหัสผ่าน"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  required
                  onFocus={e => { e.target.style.borderColor = 'rgba(124,58,237,0.7)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.15)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none' }}
                />
                <button type="button" className="pwd-toggle" onClick={() => setShowPwd2(!showPwd2)}>
                  {showPwd2 ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ borderRadius: 14, padding: '14px 20px', fontSize: 15, marginTop: 4 }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <svg style={{ width: 18, height: 18 }} className="anim-spin-slow" fill="none" viewBox="0 0 24 24">
                  <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path style={{ opacity: 0.8 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                กำลังดำเนินการ...
              </span>
            ) : mode === 'login' ? '🔑 เข้าสู่ระบบ' : '✨ สร้างบัญชีฟรี'}
          </button>

          {mode === 'register' && (
            <p style={{ fontSize: 11, color: '#374151', textAlign: 'center', lineHeight: 1.6 }}>
              การสมัครถือว่าคุณยอมรับเงื่อนไขการใช้งาน<br/>
              รหัสผ่านถูกเข้ารหัสด้วย SHA-256 ไม่มีใครเห็นรหัสผ่านของคุณ 🔒
            </p>
          )}

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#374151', fontSize: 13, fontFamily: 'Sarabun, sans-serif',
              textAlign: 'center',
            }}
          >
            ← ย้อนกลับ
          </button>
        </form>
      </div>
    </div>
  )
}
