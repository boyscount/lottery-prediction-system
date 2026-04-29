import React, { useState, useMemo, useRef } from 'react'
import { dreamDatabase, categoryLabels } from '../data/dreamDatabase'
import { DreamCategory, DreamSelection } from '../types'
import clsx from 'clsx'

interface Props {
  selected: DreamSelection[]
  onSelectionChange: (sel: DreamSelection[]) => void
  isPremium: boolean
  onShowAuth: () => void
  onShowSubscription: () => void
}

const CATS = Object.keys(categoryLabels) as DreamCategory[]

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

// ─── AI Dream Interpreter Panel ──────────────────────────────────────────────
interface AiDreamResult {
  keywords: string[]
  interpretation: string
  twoDigits: number[]
  threeDigits: number[]
  confidence: number
  luckyElements: string[]
  isFallback?: boolean
}

function AiDreamPanel() {
  const [text, setText]       = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState<AiDreamResult | null>(null)
  const [error, setError]     = useState('')

  async function handleAnalyze() {
    if (!text.trim() || text.length < 5) {
      setError('กรุณาอธิบายความฝันอย่างน้อย 5 ตัวอักษร')
      return
    }
    setError('')
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch(`${API_URL}/api/ai/dream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dreamText: text }),
      })
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      const data = await res.json()
      setResult(data)
    } catch (e: any) {
      setError('ไม่สามารถเชื่อมต่อ AI ได้ กรุณาตรวจสอบ server หรือลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Input */}
      <div className="glass" style={{ borderRadius: 18, padding: 18, border: '1px solid rgba(139,92,246,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 22 }}>🤖</span>
          <div>
            <div style={{ fontWeight: 700, color: '#c4b5fd', fontSize: 14 }}>AI ตีความฝัน</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>พิมพ์สิ่งที่ฝัน AI จะวิเคราะห์เลขมงคลให้</div>
          </div>
        </div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="เช่น ฝันเห็นงูใหญ่สีทองกำลังว่ายน้ำในทะเล มีปลาวาฬโผล่มาด้วย..."
          rows={4}
          style={{
            width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12, padding: '10px 14px', fontSize: 14, color: '#e2e8f0',
            fontFamily: 'Sarabun, sans-serif', resize: 'vertical', outline: 'none',
            boxSizing: 'border-box', lineHeight: 1.6,
          }}
        />
        {error && <div style={{ fontSize: 12, color: '#f87171', marginTop: 6 }}>⚠️ {error}</div>}
        <button
          onClick={handleAnalyze}
          disabled={loading || text.trim().length < 5}
          className="btn-primary press"
          style={{ marginTop: 12, width: '100%', borderRadius: 12, padding: '11px 0', fontSize: 14, opacity: (loading || text.trim().length < 5) ? 0.5 : 1 }}
        >
          {loading ? '🔮 AI กำลังวิเคราะห์...' : '✨ วิเคราะห์ฝันด้วย AI'}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="glass spring-in" style={{ borderRadius: 18, padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔮</div>
          <div style={{ fontSize: 14, color: '#c4b5fd', fontWeight: 600 }}>AI กำลังตีความความฝันของคุณ...</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>ใช้เวลาไม่กี่วินาที</div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="gb-animated glass spring-in" style={{ borderRadius: 20, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 20 }}>✨</span>
            <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: 15 }}>ผลการวิเคราะห์</div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ fontSize: 10, color: '#64748b' }}>ความมั่นใจ</div>
              <span className="badge badge-purple" style={{ fontSize: 11 }}>{result.confidence}%</span>
            </div>
          </div>

          {/* Keywords */}
          {result.keywords.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>🔍 สิ่งที่พบในความฝัน</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {result.keywords.map((k, i) => (
                  <span key={i} style={{
                    background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)',
                    color: '#c4b5fd', fontSize: 12, padding: '3px 10px', borderRadius: 999,
                  }}>{k}</span>
                ))}
              </div>
            </div>
          )}

          {/* Interpretation */}
          <div style={{ marginBottom: 14, padding: 12, background: 'rgba(255,255,255,0.03)', borderRadius: 12, borderLeft: '3px solid rgba(124,58,237,0.6)' }}>
            <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>{result.interpretation}</div>
          </div>

          {/* Numbers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>🎰 เลข 2 ตัวมงคล</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {result.twoDigits.map((n, i) => (
                  <div key={i} className="ball b-sm b-purple nf-bold num-reveal spring-in"
                    style={{ animationDelay: `${i * 60}ms` }}>
                    {String(n).padStart(2, '0')}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>🎲 เลข 3 ตัวมงคล</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {result.threeDigits.map((n, i) => (
                  <div key={i} className="pill-cyan nf-bold num-reveal spring-in"
                    style={{ fontSize: 13, padding: '0 10px', height: 34, animationDelay: `${i * 60}ms` }}>
                    {String(n).padStart(3, '0')}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Lucky Elements */}
          {result.luckyElements && result.luckyElements.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              <span style={{ fontSize: 11, color: '#64748b', alignSelf: 'center' }}>✨ มงคล:</span>
              {result.luckyElements.map((e, i) => (
                <span key={i} className="badge badge-amber" style={{ fontSize: 11 }}>{e}</span>
              ))}
            </div>
          )}

          {result.isFallback && (
            <div style={{ fontSize: 10, color: '#374151', marginTop: 10 }}>
              ⚠️ ใช้โหมด Offline (ยังไม่ได้ตั้งค่า ANTHROPIC_API_KEY)
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function DreamInterpreter({ selected, onSelectionChange, isPremium, onShowAuth, onShowSubscription }: Props) {
  const [search, setSearch]       = useState('')
  const [cat, setCat]             = useState<DreamCategory | 'all'>('all')
  const [expanded, setExpanded]   = useState<string | null>(null)
  const [activeMode, setActiveMode] = useState<'browse' | 'ai'>('browse')
  const scrollRef                 = useRef<HTMLDivElement>(null)

  const filtered = useMemo(() => dreamDatabase.filter(d => {
    const mc = cat === 'all' || d.category === cat
    const ms = !search || d.thaiName.includes(search) ||
      d.englishName.toLowerCase().includes(search.toLowerCase()) ||
      d.tags.some(t => t.includes(search))
    return mc && ms
  }), [search, cat])

  const isOn = (id: string) => selected.some(s => s.dreamId === id)

  function toggle(dream: typeof dreamDatabase[0]) {
    if (isOn(dream.id)) {
      onSelectionChange(selected.filter(s => s.dreamId !== dream.id))
    } else {
      onSelectionChange([...selected, {
        dreamId: dream.id, thaiName: dream.thaiName,
        twoDigit: dream.twoDigit, threeDigit: dream.threeDigit,
        confidence: dream.confidence,
      }])
    }
  }

  // Basic results (max confidence per number)
  const result2 = useMemo(() => {
    const map = new Map<number, number>()
    for (const s of selected)
      for (const n of s.twoDigit)
        map.set(n, Math.max(map.get(n) || 0, s.confidence))
    return Array.from(map.entries()).sort((a,b) => b[1]-a[1]).slice(0, 8)
      .map(([n, c]) => ({ n: n.toString().padStart(2,'0'), c }))
  }, [selected])

  const result3 = useMemo(() => {
    const map = new Map<number, number>()
    for (const s of selected)
      for (const n of s.threeDigit)
        map.set(n, Math.max(map.get(n) || 0, s.confidence))
    return Array.from(map.entries()).sort((a,b) => b[1]-a[1]).slice(0, 6)
      .map(([n, c]) => ({ n: n.toString().padStart(3,'0'), c }))
  }, [selected])

  // Combo analyzer: numbers that appear in 2+ dreams (overlap = extra confidence)
  const comboNumbers = useMemo(() => {
    if (selected.length < 2) return []
    const countMap = new Map<number, { count: number; totalConf: number; dreamNames: string[] }>()
    for (const s of selected) {
      for (const n of s.twoDigit) {
        const prev = countMap.get(n) || { count: 0, totalConf: 0, dreamNames: [] }
        countMap.set(n, {
          count: prev.count + 1,
          totalConf: prev.totalConf + s.confidence,
          dreamNames: [...prev.dreamNames, s.thaiName],
        })
      }
    }
    return Array.from(countMap.entries())
      .filter(([, v]) => v.count >= 2)
      .sort((a, b) => b[1].count - a[1].count || b[1].totalConf - a[1].totalConf)
      .slice(0, 6)
      .map(([n, v]) => ({
        n: n.toString().padStart(2, '0'),
        count: v.count,
        avgConf: Math.round(v.totalConf / v.count),
        dreamNames: v.dreamNames,
      }))
  }, [selected])

  const confBar = (c: number) => c >= 75 ? 'pbar-green' : c >= 60 ? 'pbar-cyan' : 'pbar-amber'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>💭 ฝันแล้วได้เลข</h2>
        <p style={{ fontSize: 13, color: '#64748b' }}>เลือกสิ่งที่คุณฝันเห็น หรือให้ AI ตีความความฝันของคุณ</p>
      </div>

      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 0, background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 4 }}>
        <button
          onClick={() => setActiveMode('browse')}
          style={{
            flex: 1, padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
            border: 'none', cursor: 'pointer', fontFamily: 'Sarabun, sans-serif',
            background: activeMode === 'browse' ? 'rgba(124,58,237,0.35)' : 'transparent',
            color: activeMode === 'browse' ? '#c4b5fd' : '#64748b',
            transition: 'all 0.2s',
          }}
        >
          📚 เลือกจากฐานข้อมูล
        </button>
        <button
          onClick={() => setActiveMode('ai')}
          style={{
            flex: 1, padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
            border: 'none', cursor: 'pointer', fontFamily: 'Sarabun, sans-serif',
            background: activeMode === 'ai' ? 'rgba(124,58,237,0.35)' : 'transparent',
            color: activeMode === 'ai' ? '#c4b5fd' : '#64748b',
            transition: 'all 0.2s',
          }}
        >
          🤖 AI ตีความฝัน
        </button>
      </div>

      {/* AI Mode */}
      {activeMode === 'ai' && <AiDreamPanel />}

      {/* Browse mode */}
      {activeMode === 'browse' && <>

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none' }}>🔍</span>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="ค้นหา เช่น งู, ช้าง, น้ำ, ไฟ..."
          className="input"
          style={{ paddingLeft: 40, paddingRight: 16, paddingTop: 10, paddingBottom: 10, fontSize: 14 }}
        />
      </div>

      {/* Category chips - horizontal scroll */}
      <div ref={scrollRef}
        style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4,
          scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
        <style>{`.cat-scroll::-webkit-scrollbar{display:none}`}</style>
        <button className={clsx('chip', cat === 'all' ? 'on' : '')} onClick={() => setCat('all')}>
          🌟 ทั้งหมด
        </button>
        {CATS.map(c => (
          <button key={c} className={clsx('chip', cat === c ? 'on' : '')} onClick={() => setCat(c)}>
            {categoryLabels[c]}
          </button>
        ))}
      </div>

      {/* Selected summary panel */}
      {selected.length > 0 && (
        <div className="glass anim-fade-up" style={{
          borderRadius: 20, padding: 18,
          border: '1px solid rgba(124,58,237,0.35)',
          background: 'rgba(124,58,237,0.07)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontWeight: 600, color: '#c4b5fd', fontSize: 14 }}>
              ✅ เลือกแล้ว {selected.length} อย่าง
            </div>
            <button
              onClick={() => onSelectionChange([])}
              style={{ fontSize: 12, color: '#64748b', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
            >
              ล้างทั้งหมด ×
            </button>
          </div>

          {/* Selected tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {selected.map(s => (
              <button
                key={s.dreamId}
                onClick={() => onSelectionChange(selected.filter(x => x.dreamId !== s.dreamId))}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)',
                  color: '#c4b5fd', fontSize: 12, fontWeight: 500,
                  padding: '4px 10px', borderRadius: 999, cursor: 'pointer',
                }}
              >
                {s.thaiName} <span style={{ color: '#7c3aed', fontWeight: 700 }}>×</span>
              </button>
            ))}
          </div>

          {/* ── Dream Combo Analyzer ── */}
          {comboNumbers.length > 0 && (
            <div style={{
              marginBottom: 16, padding: 14, borderRadius: 14,
              background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.25)',
            }} className="spring-in">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <span style={{ fontSize: 16 }}>⚡</span>
                <span style={{ fontWeight: 700, color: '#fbbf24', fontSize: 13 }}>
                  Combo! เลขซ้ำหลายฝัน
                </span>
                <span className="badge badge-amber" style={{ marginLeft: 'auto', fontSize: 10 }}>
                  พลังสูง
                </span>
              </div>
              <div style={{ fontSize: 11, color: '#78716c', marginBottom: 12, lineHeight: 1.5 }}>
                เลขเหล่านี้ปรากฏใน <strong style={{ color: '#fbbf24' }}>หลายความฝัน</strong> พร้อมกัน — โอกาสสูงกว่าปกติ
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {comboNumbers.map((c, i) => (
                  <div key={c.n} className="spring-in" style={{ animationDelay: `${i * 80}ms`, textAlign: 'center' }}>
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <div className="ball b-md b-amber nf-bold ball-i" style={{ margin: '0 auto' }}>
                        {c.n}
                      </div>
                      <div style={{
                        position: 'absolute', top: -8, right: -8,
                        background: '#ef4444', color: '#fff', borderRadius: 999,
                        fontSize: 9, fontWeight: 800, padding: '2px 5px', whiteSpace: 'nowrap',
                        border: '1px solid rgba(0,0,0,0.3)',
                      }}>
                        ×{c.count}
                      </div>
                    </div>
                    <div style={{ fontSize: 9, color: '#92400e', marginTop: 6, lineHeight: 1.4, maxWidth: 60 }}>
                      {c.dreamNames.join(', ')}
                    </div>
                    <div style={{ fontSize: 10, color: '#d97706', fontWeight: 700 }}>{c.avgConf}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results — premium locked */}
          {isPremium ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: '#64748b', marginBottom: 10 }}>🎰 เลข 2 ตัวแนะนำ</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {result2.map(({ n, c }, i) => (
                    <div key={i} style={{ textAlign: 'center' }}>
                      <div
                        className="ball b-md b-purple nf-bold ball-i num-reveal"
                        style={{ animationDelay: `${i * 60}ms`, ...(i === 0 ? { boxShadow: '0 0 20px rgba(124,58,237,0.8), 0 4px 20px rgba(124,58,237,0.5)' } : {}) }}
                      >
                        {n}
                      </div>
                      <div style={{ fontSize: 10, color: '#8b5cf6', marginTop: 3 }}>{c}%</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#64748b', marginBottom: 10 }}>🎲 เลข 3 ตัวแนะนำ</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {result3.map(({ n, c }, i) => (
                    <div key={i} style={{ textAlign: 'center' }}>
                      <div className="pill-cyan nf-bold num-reveal"
                        style={{ fontSize: 14, padding: '0 10px', height: 36, animationDelay: `${i * 60}ms`,
                          boxShadow: i === 0 ? '0 0 16px rgba(6,182,212,0.7)' : undefined }}>
                        {n}
                      </div>
                      <div style={{ fontSize: 10, color: '#06b6d4', marginTop: 3 }}>{c}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              {/* Blurred preview */}
              <div style={{ filter: 'blur(7px)', pointerEvents: 'none', userSelect: 'none', opacity: 0.45 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#64748b', marginBottom: 10 }}>🎰 เลข 2 ตัวแนะนำ</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {['??','??','??'].map((n, i) => (
                        <div key={i} style={{ textAlign: 'center' }}>
                          <div className="ball b-md b-purple nf-bold">{n}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#64748b', marginBottom: 10 }}>🎲 เลข 3 ตัวแนะนำ</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {['???','???'].map((n, i) => (
                        <div key={i} style={{ textAlign: 'center' }}>
                          <div className="pill-cyan nf-bold" style={{ fontSize: 14, padding: '0 10px', height: 36 }}>{n}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* Lock */}
              <div style={{
                position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12,
                background: 'rgba(2,8,20,0.7)', backdropFilter: 'blur(4px)',
              }}>
                <span style={{ fontSize: 24 }}>🔒</span>
                <span style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', lineHeight: 1.5 }}>
                  เลขจากความฝันสำหรับสมาชิก Premium
                </span>
                <button onClick={onShowSubscription} className="btn-primary press"
                  style={{ borderRadius: 10, padding: '8px 16px', fontSize: 12, marginTop: 4 }}>
                  💎 อัปเกรด 59 บาท/เดือน
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dream grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
        {filtered.map(dream => {
          const on = isOn(dream.id)
          const exp = expanded === dream.id
          return (
            <div
              key={dream.id}
              className={clsx('dream-card', on ? 'selected' : '')}
              onClick={() => toggle(dream)}
            >
              <div style={{ padding: 14 }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, color: on ? '#e2e8f0' : '#cbd5e1', fontSize: 15, lineHeight: 1.2 }}>
                      {dream.thaiName}
                    </div>
                    <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>{dream.englishName}</div>
                  </div>
                  {on && (
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg,#7c3aed,#06b6d4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, color: '#fff', fontWeight: 700,
                      boxShadow: '0 0 10px rgba(124,58,237,0.6)',
                    }}>✓</div>
                  )}
                </div>

                {/* Confidence bar */}
                <div className="pbar-track" style={{ height: 3, marginBottom: 8 }}>
                  <div className={`pbar-fill ${confBar(dream.confidence)}`} style={{ width: `${dream.confidence}%` }} />
                </div>

                {/* Numbers preview */}
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
                  {dream.twoDigit.slice(0, 3).map((n, ni) => (
                    <span key={ni} style={{
                      background: 'rgba(124,58,237,0.22)', border: '1px solid rgba(124,58,237,0.4)',
                      color: '#c4b5fd', fontSize: 10, fontWeight: 700,
                      padding: '2px 6px', borderRadius: 6,
                      fontFamily: 'Space Grotesk, monospace',
                    }}>
                      {n.toString().padStart(2,'0')}
                    </span>
                  ))}
                  {dream.threeDigit.slice(0, 1).map((n, ni) => (
                    <span key={ni} style={{
                      background: 'rgba(6,182,212,0.18)', border: '1px solid rgba(6,182,212,0.35)',
                      color: '#67e8f9', fontSize: 10, fontWeight: 700,
                      padding: '2px 6px', borderRadius: 6,
                      fontFamily: 'Space Grotesk, monospace',
                    }}>
                      {n.toString().padStart(3,'0')}
                    </span>
                  ))}
                </div>

                {/* Footer row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 9, color: '#374151' }}>{categoryLabels[dream.category]}</span>
                  <button
                    onClick={e => { e.stopPropagation(); setExpanded(exp ? null : dream.id) }}
                    style={{ fontSize: 9, color: '#475569', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    {exp ? '▲ ซ่อน' : '▼ คำทำนาย'}
                  </button>
                </div>

                {/* Expanded description */}
                {exp && (
                  <div style={{
                    marginTop: 8, paddingTop: 8, fontSize: 11, color: '#64748b', lineHeight: 1.5,
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    {dream.description}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 16px', color: '#374151' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
          <p style={{ fontSize: 14 }}>ไม่พบความฝันที่ตรงกับการค้นหา</p>
        </div>
      )}

      </> /* end browse mode */}
    </div>
  )
}
