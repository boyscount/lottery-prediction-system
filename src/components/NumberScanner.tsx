import React, { useState, useRef, useCallback, useEffect } from 'react'
import { UserSession } from '../types'
import { isPremium } from '../utils/auth'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

interface ScanResult {
  numbers: string[]
  luckyNumbers: string[]
  interpretation: string
  confidence: number
}

interface Props {
  session?: UserSession | null
  onShowAuth?: () => void
  onShowSubscription?: () => void
}

export default function NumberScanner({ session, onShowAuth, onShowSubscription }: Props) {
  const [preview, setPreview]         = useState<string | null>(null)
  const [loading, setLoading]         = useState(false)
  const [result, setResult]           = useState<ScanResult | null>(null)
  const [error, setError]             = useState('')
  const [isDragging, setIsDragging]   = useState(false)
  const [cameraOpen, setCameraOpen]   = useState(false)
  const [cameraError, setCameraError] = useState('')
  const fileInputRef                  = useRef<HTMLInputElement>(null)
  const videoRef                      = useRef<HTMLVideoElement>(null)
  const streamRef                     = useRef<MediaStream | null>(null)

  // Start camera stream
  async function openCamera() {
    setCameraError('')
    setCameraOpen(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
    } catch {
      setCameraError('ไม่สามารถเปิดกล้องได้ กรุณาอนุญาต permission กล้องในเบราว์เซอร์')
    }
  }

  // Stop camera stream
  function closeCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setCameraOpen(false)
    setCameraError('')
  }

  // Capture frame from video
  function capturePhoto() {
    const video = videoRef.current
    if (!video) return
    const canvas = document.createElement('canvas')
    canvas.width  = video.videoWidth  || 1280
    canvas.height = video.videoHeight || 720
    canvas.getContext('2d')?.drawImage(video, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    closeCamera()
    setPreview(dataUrl)
    // Process immediately
    const base64 = dataUrl.split(',')[1]
    sendToApi(base64, 'image/jpeg')
  }

  // Cleanup on unmount
  useEffect(() => () => { streamRef.current?.getTracks().forEach(t => t.stop()) }, [])

  const userIsPremium = isPremium(session ?? null)

  const sendToApi = useCallback(async (base64: string, mimeType: string) => {
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (session?.token) headers['Authorization'] = `Bearer ${session.token}`
      const res = await fetch(`${API_URL}/api/ai/scan`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      })
      if (res.status === 401) { setError('กรุณาเข้าสู่ระบบก่อนใช้ฟีเจอร์นี้'); return }
      if (res.status === 403) { setError('ฟีเจอร์นี้สำหรับสมาชิก Premium เท่านั้น'); return }
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
    } catch (err: any) {
      setError('ไม่สามารถวิเคราะห์ภาพได้: ' + (err.message || 'ลองใหม่อีกครั้ง'))
    } finally {
      setLoading(false)
    }
  }, [session])

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('กรุณาเลือกไฟล์รูปภาพ (jpg, png, webp)')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('ไฟล์ใหญ่เกินไป (สูงสุด 5 MB)')
      return
    }
    setError('')
    setResult(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      setPreview(dataUrl)
      sendToApi(dataUrl.split(',')[1], file.type)
    }
    reader.readAsDataURL(file)
  }, [sendToApi])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  function handleReset() {
    setPreview(null)
    setResult(null)
    setError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ── Paywall: ไม่ได้ login ─────────────────────────────────────
  if (!session) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>📷 สแกนเลขด้วย AI</h2>
          <p style={{ fontSize: 13, color: '#64748b' }}>ถ่ายหรืออัปโหลดภาพที่มีตัวเลข → AI วิเคราะห์และแนะนำเลขมงคล</p>
        </div>
        <div className="glass spring-in" style={{
          borderRadius: 20, padding: 36, textAlign: 'center',
          border: '1px solid rgba(124,58,237,0.3)',
        }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>📷</div>
          <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: 17, marginBottom: 8 }}>
            สแกนเลขด้วย AI
          </div>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 24, lineHeight: 1.7 }}>
            อัปโหลดรูปสลาก, ป้ายทะเบียน, บ้านเลขที่<br />
            AI จะวิเคราะห์และแนะนำ<strong style={{ color: '#c4b5fd' }}>เลขมงคล</strong>ให้ทันที<br /><br />
            ต้องเข้าสู่ระบบและสมัคร Premium เพื่อใช้ฟีเจอร์นี้
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={onShowAuth} className="btn-ghost press"
              style={{ borderRadius: 14, padding: '11px 24px', fontSize: 14 }}>
              🔑 เข้าสู่ระบบ
            </button>
            <button onClick={onShowAuth} className="btn-primary press"
              style={{ borderRadius: 14, padding: '11px 24px', fontSize: 14, fontWeight: 700 }}>
              ✨ สมัครฟรี
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Paywall: login แล้วแต่ยังไม่ Premium ────────────────────────
  if (!userIsPremium) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>📷 สแกนเลขด้วย AI</h2>
          <p style={{ fontSize: 13, color: '#64748b' }}>ถ่ายหรืออัปโหลดภาพที่มีตัวเลข → AI วิเคราะห์และแนะนำเลขมงคล</p>
        </div>
        <div className="gb-animated glass spring-in" style={{ borderRadius: 20, padding: 36, textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>💎</div>
          <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: 17, marginBottom: 8 }}>
            ฟีเจอร์ Premium
          </div>
          <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 8, lineHeight: 1.7 }}>
            สวัสดี <strong style={{ color: '#c4b5fd' }}>{session.username}</strong> 👋<br />
            สแกนเลข AI ใช้ได้สำหรับ Premium เท่านั้น
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 24, alignItems: 'center' }}>
            {[
              '📷 สแกนสลาก / ป้ายทะเบียน / บ้านเลขที่',
              '🤖 AI วิเคราะห์และแนะนำเลขมงคล',
              '🎰 ตีความฝันด้วย AI ไม่จำกัด',
              '🔮 ทำนายเลข 2/3/6 ตัว',
            ].map(f => (
              <div key={f} style={{ fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                {f}
              </div>
            ))}
          </div>
          <button onClick={onShowSubscription} className="btn-primary press"
            style={{ borderRadius: 14, padding: '13px 36px', fontSize: 15, fontWeight: 700 }}>
            💎 อัปเกรด Premium — 59 ฿/เดือน
          </button>
        </div>
      </div>
    )
  }

  // ── Premium user: แสดง scanner ───────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>📷 สแกนเลขด้วย AI</h2>
          <p style={{ fontSize: 13, color: '#64748b' }}>
            ถ่ายหรืออัปโหลดภาพที่มีตัวเลข → AI วิเคราะห์และแนะนำเลขมงคล
          </p>
        </div>
        <span className="badge badge-premium" style={{ fontSize: 11, flexShrink: 0 }}>💎 Premium</span>
      </div>

      {/* Upload / Camera area */}
      {!preview && (
        <div
          onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="press"
          style={{
            border: `2px dashed ${isDragging ? 'rgba(124,58,237,0.8)' : 'rgba(255,255,255,0.12)'}`,
            borderRadius: 20, padding: '40px 20px', textAlign: 'center', cursor: 'pointer',
            background: isDragging ? 'rgba(124,58,237,0.08)' : 'rgba(255,255,255,0.02)',
            transition: 'all 0.2s',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>📷</div>
          <div style={{ fontWeight: 600, color: '#c4b5fd', fontSize: 15, marginBottom: 6 }}>
            วางรูปที่นี่ หรือคลิกเพื่อเลือก
          </div>
          <div style={{ fontSize: 12, color: '#475569' }}>รองรับ JPG, PNG, WEBP (สูงสุด 5 MB)</div>
        </div>
      )}

      {/* Button row */}
      {!preview && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-ghost press"
            style={{ padding: '11px 16px', fontSize: 13, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            🖼️ เลือกจากแกลเลอรี
          </button>
          <button
            onClick={openCamera}
            className="btn-primary press"
            style={{ padding: '11px 16px', fontSize: 13, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            📸 ถ่ายภาพ
          </button>
        </div>
      )}

      {/* Hidden file input (gallery only) */}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />

      {/* ── In-app Camera Modal ── */}
      {cameraOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.95)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 16, padding: 16,
        }}>
          {cameraError ? (
            <div style={{ textAlign: 'center', padding: 32 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📵</div>
              <div style={{ color: '#f87171', fontSize: 14, marginBottom: 20 }}>{cameraError}</div>
              <button onClick={closeCamera} className="btn-ghost"
                style={{ borderRadius: 12, padding: '10px 24px', fontSize: 13 }}>
                ปิด
              </button>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 13, color: '#94a3b8' }}>จัดเฟรมให้ตัวเลขอยู่ตรงกลาง แล้วกดถ่าย</div>
              <div style={{ position: 'relative', width: '100%', maxWidth: 480, borderRadius: 16, overflow: 'hidden', border: '2px solid rgba(124,58,237,0.5)' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: '100%', display: 'block', maxHeight: '60dvh', objectFit: 'cover' }}
                />
                {/* Viewfinder guide */}
                <div style={{
                  position: 'absolute', inset: '20%',
                  border: '2px solid rgba(124,58,237,0.7)',
                  borderRadius: 8, pointerEvents: 'none',
                }} />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={closeCamera} className="btn-ghost"
                  style={{ borderRadius: 14, padding: '12px 24px', fontSize: 14 }}>
                  ยกเลิก
                </button>
                <button onClick={capturePhoto} className="btn-primary press"
                  style={{ borderRadius: 14, padding: '12px 36px', fontSize: 15, fontWeight: 700 }}>
                  📸 ถ่าย
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="glass" style={{ borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ position: 'relative' }}>
            <img
              src={preview}
              alt="Preview"
              style={{ width: '100%', maxHeight: 320, objectFit: 'contain', display: 'block', background: '#000' }}
            />
            {loading && (
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
              }}>
                <div style={{ fontSize: 40 }}>🔮</div>
                <div style={{ fontSize: 14, color: '#c4b5fd', fontWeight: 600 }}>AI กำลังวิเคราะห์ภาพ...</div>
              </div>
            )}
          </div>
          <div style={{ padding: '12px 16px', display: 'flex', gap: 10 }}>
            <button onClick={handleReset} className="btn-ghost press"
              style={{ flex: 1, padding: '9px 0', fontSize: 13, borderRadius: 10 }}>
              🔄 เปลี่ยนรูป
            </button>
            {!loading && !result && preview && (
              <button
                onClick={() => {
                  const file = fileInputRef.current?.files?.[0]
                  if (file) processFile(file)
                  else if (preview) {
                    // re-send from preview (camera capture)
                    const base64 = preview.split(',')[1]
                    sendToApi(base64, 'image/jpeg')
                  }
                }}
                className="btn-primary press"
                style={{ flex: 1, padding: '9px 0', fontSize: 13, borderRadius: 10 }}
              >
                🔍 วิเคราะห์อีกครั้ง
              </button>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="glass spring-in" style={{ padding: 14, borderRadius: 14, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.07)' }}>
          <span style={{ fontSize: 13, color: '#f87171' }}>⚠️ {error}</span>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="gb-animated glass spring-in" style={{ borderRadius: 20, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 20 }}>✅</span>
            <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: 15, flex: 1 }}>ผลการวิเคราะห์</div>
            <span className="badge badge-cyan" style={{ fontSize: 11 }}>{result.confidence}%</span>
          </div>

          <div style={{ marginBottom: 16, padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 12, borderLeft: '3px solid rgba(6,182,212,0.6)' }}>
            <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>{result.interpretation}</div>
          </div>

          {result.numbers.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>🔢 ตัวเลขทั้งหมดที่พบ</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {result.numbers.map((n, i) => (
                  <span key={i} style={{
                    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                    color: '#e2e8f0', fontSize: 12, fontWeight: 700,
                    padding: '4px 10px', borderRadius: 8, fontFamily: 'Space Grotesk, monospace',
                  }}>{n}</span>
                ))}
              </div>
            </div>
          )}

          {result.luckyNumbers.length > 0 && (
            <div>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 10 }}>⭐ เลขมงคลแนะนำ</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {result.luckyNumbers.map((n, i) => {
                  const is3 = n.length === 3
                  const is6 = n.length === 6
                  return is6 ? (
                    <div key={i} className="prize-display num-reveal spring-in" style={{ padding: '6px 14px', animationDelay: `${i * 80}ms` }}>{n}</div>
                  ) : is3 ? (
                    <div key={i} className="pill-cyan nf-bold num-reveal spring-in"
                      style={{ fontSize: 14, padding: '0 12px', height: 36, animationDelay: `${i * 80}ms` }}>{n}</div>
                  ) : (
                    <div key={i} className="ball b-md b-purple nf-bold ball-i num-reveal spring-in"
                      style={{ animationDelay: `${i * 80}ms` }}>{n.padStart(2, '0')}</div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Usage tips */}
      {!result && !loading && (
        <div className="glass" style={{ borderRadius: 16, padding: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>💡 ตัวอย่างภาพที่ใช้ได้</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              ['🎫', 'ใบสลาก — เลขที่อยู่บนสลาก'],
              ['🚗', 'ป้ายทะเบียนรถ — เลขทะเบียน'],
              ['🏠', 'บ้านเลขที่ — เลขที่อยู่'],
              ['📅', 'ปฏิทิน/วันที่ — วันมงคล'],
              ['💭', 'ความฝัน — ภาพที่เกี่ยวกับตัวเลข'],
            ].map(([emoji, text]) => (
              <div key={text as string} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#475569' }}>
                <span>{emoji}</span> {text}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
