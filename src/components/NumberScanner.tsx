import React, { useState, useRef, useCallback } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

interface ScanResult {
  numbers: string[]
  luckyNumbers: string[]
  interpretation: string
  confidence: number
}

export default function NumberScanner() {
  const [preview, setPreview]       = useState<string | null>(null)
  const [loading, setLoading]       = useState(false)
  const [result, setResult]         = useState<ScanResult | null>(null)
  const [error, setError]           = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef                = useRef<HTMLInputElement>(null)
  const cameraInputRef              = useRef<HTMLInputElement>(null)

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

    // Preview
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)

    // Convert to base64 for API
    const base64Reader = new FileReader()
    base64Reader.onload = async (e) => {
      const dataUrl = e.target?.result as string
      // Remove the "data:image/jpeg;base64," prefix
      const base64 = dataUrl.split(',')[1]
      const mimeType = file.type

      setLoading(true)
      try {
        const res = await fetch(`${API_URL}/api/ai/scan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, mimeType }),
        })
        if (!res.ok) throw new Error(`Server error ${res.status}`)
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        setResult(data)
      } catch (err: any) {
        setError('ไม่สามารถวิเคราะห์ภาพได้: ' + (err.message || 'ลองใหม่อีกครั้ง'))
      } finally {
        setLoading(false)
      }
    }
    base64Reader.readAsDataURL(file)
  }, [])

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
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>📷 สแกนเลขด้วย AI</h2>
        <p style={{ fontSize: 13, color: '#64748b' }}>
          ถ่ายหรืออัปโหลดภาพที่มีตัวเลข → AI วิเคราะห์และแนะนำเลขมงคล
        </p>
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
            onClick={() => cameraInputRef.current?.click()}
            className="btn-primary press"
            style={{ padding: '11px 16px', fontSize: 13, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            📸 ถ่ายภาพ
          </button>
        </div>
      )}

      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} style={{ display: 'none' }} />

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
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 12,
              }}>
                <div style={{ fontSize: 40 }}>🔮</div>
                <div style={{ fontSize: 14, color: '#c4b5fd', fontWeight: 600 }}>AI กำลังวิเคราะห์ภาพ...</div>
              </div>
            )}
          </div>
          <div style={{ padding: '12px 16px', display: 'flex', gap: 10 }}>
            <button
              onClick={handleReset}
              className="btn-ghost press"
              style={{ flex: 1, padding: '9px 0', fontSize: 13, borderRadius: 10 }}
            >
              🔄 เปลี่ยนรูป
            </button>
            {!loading && !result && (
              <button
                onClick={() => {
                  if (fileInputRef.current?.files?.[0]) processFile(fileInputRef.current.files[0])
                  else if (cameraInputRef.current?.files?.[0]) processFile(cameraInputRef.current.files[0])
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

          {/* Interpretation */}
          <div style={{ marginBottom: 16, padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 12, borderLeft: '3px solid rgba(6,182,212,0.6)' }}>
            <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>{result.interpretation}</div>
          </div>

          {/* All numbers found */}
          {result.numbers.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>🔢 ตัวเลขทั้งหมดที่พบ</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {result.numbers.map((n, i) => (
                  <span key={i} style={{
                    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
                    color: '#e2e8f0', fontSize: 12, fontWeight: 700,
                    padding: '4px 10px', borderRadius: 8,
                    fontFamily: 'Space Grotesk, monospace',
                  }}>{n}</span>
                ))}
              </div>
            </div>
          )}

          {/* Lucky numbers */}
          {result.luckyNumbers.length > 0 && (
            <div>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 10 }}>⭐ เลขมงคลแนะนำ</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {result.luckyNumbers.map((n, i) => {
                  const is3 = n.length === 3
                  const is6 = n.length === 6
                  return is6 ? (
                    <div key={i} className="prize-display num-reveal spring-in" style={{ padding: '6px 14px', animationDelay: `${i * 80}ms` }}>
                      {n}
                    </div>
                  ) : is3 ? (
                    <div key={i} className="pill-cyan nf-bold num-reveal spring-in"
                      style={{ fontSize: 14, padding: '0 12px', height: 36, animationDelay: `${i * 80}ms` }}>
                      {n}
                    </div>
                  ) : (
                    <div key={i} className="ball b-md b-purple nf-bold ball-i num-reveal spring-in"
                      style={{ animationDelay: `${i * 80}ms` }}>
                      {n.padStart(2, '0')}
                    </div>
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
