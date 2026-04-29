import React, { useState, useMemo } from 'react'
import { JournalEntry, LotteryDraw } from '../types'
import { getNextDrawDate } from '../data/lotteryHistory'
import clsx from 'clsx'

interface Props {
  entries: JournalEntry[]
  draws: LotteryDraw[]
  onEntriesChange: (e: JournalEntry[]) => void
}

type NumType = '2digit' | '3digit' | '6digit'

const PRIZES: { label: string; color: string }[] = [
  { label: 'รางวัลที่ 1',   color: '#f59e0b' },
  { label: 'ท้าย 3 ตัว',   color: '#a855f7' },
  { label: 'หน้า 3 ตัว',   color: '#7c3aed' },
  { label: 'ท้าย 2 ตัว',   color: '#22c55e' },
  { label: 'ไม่ถูก',        color: '#374151' },
]

function matchResult(entry: JournalEntry, draws: LotteryDraw[]): { hit: boolean; prize: string } | null {
  const draw = draws.find(d => d.date === entry.drawDate)
  if (!draw) return null
  for (const n of entry.numbers) {
    if (n.type === '6digit' && n.value === draw.firstPrize) return { hit: true, prize: 'รางวัลที่ 1 🏆' }
    if ((n.type === '3digit') && (draw.threeDigitBack.includes(n.value) || draw.threeDigitFront.includes(n.value)))
      return { hit: true, prize: draw.threeDigitBack.includes(n.value) ? 'ท้าย 3 ตัว ✨' : 'หน้า 3 ตัว ✨' }
    if (n.type === '2digit' && n.value === draw.twoDigitBack) return { hit: true, prize: 'ท้าย 2 ตัว 🎉' }
  }
  return { hit: false, prize: 'ไม่ถูก' }
}

function EntryCard({ entry, draws, onDelete, onSetPrize }: {
  entry: JournalEntry
  draws: LotteryDraw[]
  onDelete: () => void
  onSetPrize: (prize: string) => void
}) {
  const [showPrize, setShowPrize] = useState(false)
  const autoMatch = useMemo(() => matchResult(entry, draws), [entry, draws])
  const isPast = entry.drawDate < new Date().toISOString().slice(0, 10)
  const displayPrize = entry.hitPrize || (autoMatch?.prize ?? null)
  const isHit = entry.hitPrize
    ? entry.hitPrize !== 'ไม่ถูก'
    : (autoMatch?.hit ?? false)

  return (
    <div className={clsx('journal-entry', isHit && isPast ? 'hit' : '')} style={{ animationDelay: '0ms' }}>
      <div style={{ padding: '14px 16px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>{isHit && isPast ? '🎉' : isPast ? '📅' : '⏳'}</span>
            <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: 14, fontFamily: 'Space Grotesk, monospace' }}>
              งวด {entry.drawDate}
            </span>
            {!isPast && <span className="badge badge-cyan" style={{ fontSize: 10 }}>รอผล</span>}
            {isPast && isHit && <span className="badge badge-amber" style={{ fontSize: 10 }}>ถูก!</span>}
          </div>
          <button onClick={onDelete}
            style={{ background: 'none', border: 'none', color: '#374151', cursor: 'pointer', fontSize: 16, padding: 4 }}>
            ×
          </button>
        </div>

        {/* Numbers */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
          {entry.numbers.map((n, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              {n.type === '2digit' && (
                <div className="ball b-md b-purple nf-bold">{n.value}</div>
              )}
              {n.type === '3digit' && (
                <div className="pill-cyan nf-bold" style={{ fontSize: 15, padding: '0 12px', height: 40 }}>{n.value}</div>
              )}
              {n.type === '6digit' && (
                <div style={{ display: 'flex', gap: 2 }}>
                  {n.value.split('').map((d, di) => (
                    <div key={di} className="digit-slot" style={{ width: 32, height: 40, fontSize: 18 }}>{d}</div>
                  ))}
                </div>
              )}
              <span style={{ fontSize: 9, color: '#4b5563' }}>{{ '2digit':'2 ตัว','3digit':'3 ตัว','6digit':'6 ตัว' }[n.type]}</span>
            </div>
          ))}
        </div>

        {entry.note && (
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10, fontStyle: 'italic' }}>
            💬 {entry.note}
          </div>
        )}

        {/* Result area */}
        {isPast && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 10 }}>
            {displayPrize ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, color: '#64748b' }}>ผลลัพธ์:</span>
                <span style={{
                  fontWeight: 700, fontSize: 12,
                  color: isHit ? '#fbbf24' : '#374151',
                }}>
                  {displayPrize}
                </span>
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                {showPrize ? (
                  <div>
                    <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>เลือกผลลัพธ์:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {PRIZES.map(p => (
                        <button key={p.label}
                          onClick={() => { onSetPrize(p.label); setShowPrize(false) }}
                          style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: `1px solid ${p.color}40`,
                            color: p.color, borderRadius: 8, padding: '4px 10px',
                            fontSize: 11, cursor: 'pointer', fontFamily: 'Sarabun, sans-serif',
                          }}>
                          {p.label}
                        </button>
                      ))}
                      <button onClick={() => setShowPrize(false)}
                        style={{ background: 'none', border: 'none', color: '#374151', cursor: 'pointer', fontSize: 11, fontFamily: 'Sarabun, sans-serif' }}>
                        ยกเลิก
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setShowPrize(true)}
                    style={{
                      background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)',
                      color: '#c4b5fd', borderRadius: 10, padding: '6px 12px',
                      fontSize: 11, cursor: 'pointer', fontFamily: 'Sarabun, sans-serif',
                    }}>
                    ✏️ บันทึกผล
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function NumberJournal({ entries, draws, onEntriesChange }: Props) {
  const nextDraw = getNextDrawDate()
  const [numType, setNumType] = useState<NumType>('2digit')
  const [numInput, setNumInput] = useState('')
  const [note, setNote] = useState('')
  const [drawDate, setDrawDate] = useState(nextDraw)
  const [tempNums, setTempNums] = useState<{ type: NumType; value: string }[]>([])
  const [error, setError] = useState('')

  const maxLen = numType === '6digit' ? 6 : numType === '3digit' ? 3 : 2

  const stats = useMemo(() => {
    const total = entries.length
    const past  = entries.filter(e => e.drawDate < new Date().toISOString().slice(0, 10))
    const hits  = past.filter(e => {
      const r = matchResult(e, draws)
      return e.hitPrize ? e.hitPrize !== 'ไม่ถูก' : r?.hit
    })
    return { total, pastCount: past.length, hitCount: hits.length }
  }, [entries, draws])

  function addNumber() {
    const v = numInput.trim()
    if (v.length !== maxLen || !/^\d+$/.test(v)) {
      setError(`กรุณากรอกตัวเลข ${maxLen} หลัก`)
      return
    }
    if (tempNums.some(n => n.value === v && n.type === numType)) {
      setError('เลขนี้เพิ่มแล้ว')
      return
    }
    setTempNums(prev => [...prev, { type: numType, value: v }])
    setNumInput('')
    setError('')
  }

  function saveEntry() {
    if (tempNums.length === 0) { setError('เพิ่มเลขอย่างน้อย 1 ตัวก่อน'); return }
    const entry: JournalEntry = {
      id: Date.now().toString(),
      drawDate,
      numbers: tempNums,
      note: note.trim() || undefined,
      createdAt: new Date().toISOString(),
    }
    onEntriesChange([entry, ...entries])
    setTempNums([])
    setNote('')
    setNumInput('')
    setError('')
  }

  function deleteEntry(id: string) {
    onEntriesChange(entries.filter(e => e.id !== id))
  }

  function setPrize(id: string, prize: string) {
    onEntriesChange(entries.map(e => e.id === id ? { ...e, hitPrize: prize } : e))
  }

  const sortedEntries = useMemo(() =>
    [...entries].sort((a, b) => b.drawDate.localeCompare(a.drawDate)), [entries])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>📓 บันทึกเลขที่จะซื้อ</h2>
        <p style={{ fontSize: 13, color: '#64748b' }}>จดเลขที่ตั้งใจซื้อ บันทึกผล ดูสถิติการถูก</p>
      </div>

      {/* Stats summary */}
      {entries.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {[
            { v: stats.total,      label: 'รายการทั้งหมด', c: '#c4b5fd' },
            { v: stats.pastCount,  label: 'งวดที่ผ่านมา',   c: '#67e8f9' },
            { v: stats.hitCount > 0 ? `${stats.hitCount}🎉` : '0', label: 'ถูกรางวัล', c: '#fbbf24' },
          ].map(s => (
            <div key={s.label} className="glass" style={{ borderRadius: 14, padding: '12px 10px', textAlign: 'center' }}>
              <div className="nf-bold" style={{ fontSize: 22, color: s.c }}>{s.v}</div>
              <div style={{ fontSize: 11, color: '#4b5563', marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Add entry form */}
      <div className="gb" style={{ borderRadius: 24 }}>
        <div style={{ padding: 20 }}>
          <div style={{ fontWeight: 600, color: '#e2e8f0', marginBottom: 16, fontSize: 15 }}>
            ➕ เพิ่มเลขใหม่
          </div>

          {/* Draw date */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>งวดที่ต้องการ</div>
            <input type="date" value={drawDate}
              onChange={e => setDrawDate(e.target.value)}
              className="input input-date"
              style={{ padding: '10px 14px', fontSize: 14 }}
            />
          </div>

          {/* Type selector */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>ประเภทเลข</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {(['2digit','3digit','6digit'] as NumType[]).map(t => (
                <button key={t} onClick={() => { setNumType(t); setNumInput('') }}
                  className={clsx('tab-btn', numType === t ? 'on' : '')}
                  style={{ padding: '7px 12px', fontSize: 12 }}>
                  {{'2digit':'🎰 2 ตัว','3digit':'🎲 3 ตัว','6digit':'🏆 6 ตัว'}[t]}
                </button>
              ))}
            </div>
          </div>

          {/* Number input */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input
              className="input input-mono"
              placeholder={`${'0'.repeat(maxLen)} (${maxLen} หลัก)`}
              value={numInput}
              onChange={e => setNumInput(e.target.value.replace(/\D/g,'').slice(0, maxLen))}
              onKeyDown={e => e.key === 'Enter' && addNumber()}
              maxLength={maxLen}
              style={{ padding: '10px 14px', fontSize: 16, letterSpacing: '0.25em', flex: 1 }}
            />
            <button onClick={addNumber} className="btn-primary press"
              style={{ borderRadius: 12, padding: '10px 18px', fontSize: 13, flexShrink: 0 }}>
              + เพิ่ม
            </button>
          </div>

          {/* Temp numbers */}
          {tempNums.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12, padding: 12,
              background: 'rgba(124,58,237,0.07)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 12 }}>
              {tempNums.map((n, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {n.type === '2digit'
                    ? <div className="ball b-sm b-purple nf-bold">{n.value}</div>
                    : n.type === '3digit'
                    ? <div className="pill-cyan nf-bold" style={{ fontSize: 13, padding: '0 10px', height: 36 }}>{n.value}</div>
                    : <span className="nf-bold" style={{ color: '#fbbf24', fontSize: 14 }}>{n.value}</span>
                  }
                  <button onClick={() => setTempNums(prev => prev.filter((_, j) => j !== i))}
                    style={{ background: 'none', border: 'none', color: '#374151', cursor: 'pointer', fontSize: 14, padding: 0 }}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Note */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>โน้ต (ไม่บังคับ)</div>
            <input className="input" placeholder="เช่น ฝันเห็นงู, เลขดวง..."
              value={note} onChange={e => setNote(e.target.value)}
              style={{ padding: '10px 14px', fontSize: 13 }}
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#fca5a5', fontSize: 12, padding: '8px 12px', borderRadius: 10, marginBottom: 12,
            }}>
              ⚠️ {error}
            </div>
          )}

          <button onClick={saveEntry} className="btn-primary"
            style={{ borderRadius: 14, padding: '13px 20px', fontSize: 14, width: '100%' }}>
            💾 บันทึกรายการ
          </button>
        </div>
      </div>

      {/* Journal entries */}
      {sortedEntries.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontWeight: 600, color: '#94a3b8', fontSize: 13 }}>
            📋 รายการทั้งหมด ({sortedEntries.length})
          </div>
          {sortedEntries.map(entry => (
            <EntryCard
              key={entry.id}
              entry={entry}
              draws={draws}
              onDelete={() => deleteEntry(entry.id)}
              onSetPrize={(prize) => setPrize(entry.id, prize)}
            />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '48px 16px', color: '#374151' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }} className="anim-float">📓</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#4b5563', marginBottom: 8 }}>ยังไม่มีรายการ</div>
          <div style={{ fontSize: 13 }}>เพิ่มเลขที่จะซื้อด้านบน<br/>เมื่องวดออกแล้วกลับมาบันทึกผลได้</div>
        </div>
      )}
    </div>
  )
}
