import React, { useState } from 'react'
import { LotteryDraw, DrawFormData } from '../types'

interface Props {
  draws: LotteryDraw[]
  onDrawsChange: (d: LotteryDraw[]) => void
}

const empty: DrawFormData = {
  date:'', firstPrize:'',
  threeDigitFront1:'', threeDigitFront2:'',
  threeDigitBack1:'',  threeDigitBack2:'',
  twoDigitBack:'',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 5 }}>{label}</div>
      {children}
    </div>
  )
}

export default function HistoryManager({ draws, onDrawsChange }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState<DrawFormData>(empty)
  const [error, setError]       = useState('')
  const [search, setSearch]     = useState('')

  const set = (k: keyof DrawFormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  function validate(): boolean {
    if (!form.date)                        { setError('กรุณาระบุวันที่'); return false }
    if (!/^\d{6}$/.test(form.firstPrize)) { setError('รางวัลที่ 1 ต้องเป็น 6 หลัก'); return false }
    if (!/^\d{3}$/.test(form.threeDigitFront1)||!/^\d{3}$/.test(form.threeDigitFront2))
      { setError('เลขหน้า 3 ตัว ต้องเป็น 3 หลัก'); return false }
    if (!/^\d{3}$/.test(form.threeDigitBack1)||!/^\d{3}$/.test(form.threeDigitBack2))
      { setError('เลขท้าย 3 ตัว ต้องเป็น 3 หลัก'); return false }
    if (!/^\d{2}$/.test(form.twoDigitBack)) { setError('เลขท้าย 2 ตัว ต้องเป็น 2 หลัก'); return false }
    setError('')
    return true
  }

  function addDraw() {
    if (!validate()) return
    if (draws.find(d => d.id === form.date)) { setError('งวดนี้มีข้อมูลอยู่แล้ว'); return }
    const nd: LotteryDraw = {
      id: form.date, date: form.date, firstPrize: form.firstPrize,
      threeDigitFront: [form.threeDigitFront1, form.threeDigitFront2],
      threeDigitBack:  [form.threeDigitBack1,  form.threeDigitBack2],
      twoDigitBack: form.twoDigitBack,
    }
    onDrawsChange([...draws, nd].sort((a,b) => a.date.localeCompare(b.date)))
    setForm(empty)
    setShowForm(false)
  }

  const filtered = [...draws]
    .filter(d => !search || d.date.includes(search) || d.firstPrize.includes(search) || d.twoDigitBack.includes(search))
    .reverse()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>📚 ประวัติการออกรางวัล</h2>
          <p style={{ fontSize: 13, color: '#64748b' }}>ข้อมูล {draws.length} งวด — เพิ่มผลล่าสุดเพื่อเพิ่มความแม่นยำ</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setError('') }}
          className="btn-primary"
          style={{ borderRadius: 12, padding: '10px 16px', fontSize: 13, flexShrink: 0 }}
        >
          {showForm ? '✕ ปิด' : '+ เพิ่มงวด'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="glass anim-fade-up" style={{
          borderRadius: 20, padding: 20,
          border: '1px solid rgba(124,58,237,0.3)',
          background: 'rgba(124,58,237,0.05)',
        }}>
          <div style={{ fontWeight: 600, color: '#c4b5fd', marginBottom: 16 }}>เพิ่มผลการออกรางวัล</div>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#fca5a5', fontSize: 12, padding: '8px 12px', borderRadius: 10, marginBottom: 14,
            }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <Field label="📅 วันที่ออกรางวัล">
              <input type="date" value={form.date} onChange={set('date')}
                className="input input-date" style={{ padding: '9px 12px', fontSize: 14 }} />
            </Field>
            <Field label="🏆 รางวัลที่ 1 (6 หลัก)">
              <input type="text" maxLength={6} placeholder="123456" value={form.firstPrize} onChange={set('firstPrize')}
                className="input input-mono" style={{ padding: '9px 12px', fontSize: 18, letterSpacing: '0.18em' }} />
            </Field>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
            {[
              { key: 'threeDigitFront1' as keyof DrawFormData, label: 'หน้า 3ตัว #1' },
              { key: 'threeDigitFront2' as keyof DrawFormData, label: 'หน้า 3ตัว #2' },
              { key: 'threeDigitBack1'  as keyof DrawFormData, label: 'ท้าย 3ตัว #1' },
              { key: 'threeDigitBack2'  as keyof DrawFormData, label: 'ท้าย 3ตัว #2' },
            ].map(f => (
              <Field key={f.key} label={f.label}>
                <input type="text" maxLength={3} placeholder="000" value={form[f.key]} onChange={set(f.key)}
                  className="input input-mono" style={{ padding: '9px 8px', fontSize: 16 }} />
              </Field>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
            <div style={{ width: 100 }}>
              <Field label="ท้าย 2 ตัว">
                <input type="text" maxLength={2} placeholder="00" value={form.twoDigitBack} onChange={set('twoDigitBack')}
                  className="input input-mono" style={{ padding: '9px 12px', fontSize: 22 }} />
              </Field>
            </div>
            <button
              onClick={addDraw}
              style={{
                flex: 1, background: 'linear-gradient(135deg,#166534,#22c55e)',
                color: '#fff', fontWeight: 700, fontSize: 14,
                border: 'none', borderRadius: 12, padding: '11px 16px', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              ✅ บันทึก
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none' }}>🔍</span>
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="ค้นหาวันที่ หรือ เลขที่ออก..."
          className="input"
          style={{ paddingLeft: 40, paddingRight: 16, paddingTop: 10, paddingBottom: 10, fontSize: 14 }}
        />
      </div>

      {/* Table */}
      <div className="glass" style={{ borderRadius: 20, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <th style={{ padding: '11px 14px', textAlign: 'left', color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>วันที่</th>
                <th style={{ padding: '11px 10px', textAlign: 'center', color: '#fbbf24', fontWeight: 600 }}>รางวัลที่ 1</th>
                <th style={{ padding: '11px 10px', textAlign: 'center', color: '#c4b5fd', fontWeight: 600 }}>หน้า 3 ตัว</th>
                <th style={{ padding: '11px 10px', textAlign: 'center', color: '#67e8f9', fontWeight: 600 }}>ท้าย 3 ตัว</th>
                <th style={{ padding: '11px 10px', textAlign: 'center', color: '#86efac', fontWeight: 600 }}>ท้าย 2 ตัว</th>
                <th style={{ padding: '11px 10px', width: 40 }} />
              </tr>
            </thead>
            <tbody>
              {filtered.map((draw, i) => (
                <tr key={draw.id}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    background: i === 0 ? 'rgba(245,158,11,0.04)' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = i === 0 ? 'rgba(245,158,11,0.04)' : 'transparent' }}
                >
                  <td style={{ padding: '9px 14px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                    {i === 0 && <span className="badge badge-amber" style={{ fontSize: 9, marginRight: 6 }}>ล่าสุด</span>}
                    {draw.date}
                  </td>
                  <td style={{ padding: '9px 10px', textAlign: 'center' }}>
                    <span className="nf-bold prize-display" style={{ fontSize: 16 }}>{draw.firstPrize}</span>
                  </td>
                  <td style={{ padding: '9px 10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
                      {draw.threeDigitFront.map(n => (
                        <span key={n} className="nf-bold" style={{ color: '#c4b5fd', fontSize: 13 }}>{n}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '9px 10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
                      {draw.threeDigitBack.map(n => (
                        <span key={n} className="nf-bold" style={{ color: '#67e8f9', fontSize: 13 }}>{n}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '9px 10px', textAlign: 'center' }}>
                    <div className="ball b-sm b-green nf-bold" style={{ margin: '0 auto' }}>
                      {draw.twoDigitBack}
                    </div>
                  </td>
                  <td style={{ padding: '9px 10px', textAlign: 'center' }}>
                    <button
                      onClick={() => onDrawsChange(draws.filter(d => d.id !== draw.id))}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#374151', fontSize: 18, lineHeight: 1,
                        transition: 'color 0.15s', padding: '2px 6px',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#374151')}
                      title="ลบ"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: '#374151', fontSize: 14 }}>
              ไม่พบข้อมูลที่ตรงกับการค้นหา
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
