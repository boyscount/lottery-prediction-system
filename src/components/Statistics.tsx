import React, { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid, RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from 'recharts'
import { LotteryDraw } from '../types'
import { getFrequencyChartData, getDigitPositionFrequency, getSumFrequency, getOverdueNumbers, getTwoDigitStats } from '../utils/statistics'
import clsx from 'clsx'

interface Props {
  draws: LotteryDraw[]
  isPremium: boolean
  onShowSubscription: () => void
}
type View = 'frequency' | 'position' | 'overdue' | 'sum'

const TREND_COLORS = { hot: '#ef4444', warm: '#f59e0b', cold: '#3b82f6', frozen: '#8b5cf6' }

export default function Statistics({ draws, isPremium, onShowSubscription }: Props) {
  const [view, setView] = useState<View>('frequency')

  const freq     = useMemo(() => getFrequencyChartData(draws), [draws])
  const posFq    = useMemo(() => getDigitPositionFrequency(draws), [draws])
  const sumFq    = useMemo(() => {
    const sf = getSumFrequency(draws)
    return Object.entries(sf).map(([s,c]) => ({ sum: `${s}`, count: c })).sort((a,b)=>b.count-a.count)
  }, [draws])
  const overdue  = useMemo(() => getOverdueNumbers(draws), [draws])
  const allStats = useMemo(() => getTwoDigitStats(draws).filter(s => s.count > 0), [draws])

  const POS_COLORS = ['#7c3aed','#06b6d4','#f59e0b','#ec4899','#22c55e','#f97316']

  const posData = useMemo(() =>
    Array.from({ length: 10 }, (_, d) => {
      const obj: Record<string, number|string> = { digit: d.toString() }
      posFq.forEach((pos, i) => { obj[`P${i+1}`] = pos[d] })
      return obj
    }), [posFq])

  const tooltipStyle = {
    contentStyle: {
      background: 'rgba(8,5,22,0.95)', border: '1px solid rgba(124,58,237,0.4)',
      borderRadius: 10, color: '#e2e8f0', fontSize: 12,
    },
    cursor: { fill: 'rgba(124,58,237,0.08)' },
  }

  const VIEWS: { id: View; label: string; emoji: string; premium?: boolean }[] = [
    { id: 'frequency', label: 'ความถี่ 2 ตัว', emoji: '📈' },
    { id: 'position',  label: 'ตำแหน่งหลัก',  emoji: '🔢', premium: true },
    { id: 'overdue',   label: 'เลขค้าง',       emoji: '⏰', premium: true },
    { id: 'sum',       label: 'ผลรวม',          emoji: '➕', premium: true },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>📊 วิเคราะห์สถิติเชิงลึก</h2>
        <p style={{ fontSize: 13, color: '#64748b' }}>
          ข้อมูล {draws.length} งวด · {draws[0]?.date} ถึง {draws[draws.length-1]?.date}
        </p>
      </div>

      {/* View Tabs */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
        {VIEWS.map(v => (
          <button
            key={v.id}
            onClick={() => {
              if (v.premium && !isPremium) { onShowSubscription(); return }
              setView(v.id)
            }}
            className={clsx('tab-btn', view === v.id ? 'on' : '')}
            style={{ padding: '7px 14px', fontSize: 12 }}
          >
            <span>{v.emoji}</span> {v.label}
            {v.premium && !isPremium && <span style={{ fontSize: 9, marginLeft: 2 }}>💎</span>}
          </button>
        ))}
      </div>

      {/* ── Frequency ── */}
      {view === 'frequency' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="glass" style={{ borderRadius: 20, padding: '18px 12px' }}>
            <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: 13, marginBottom: 14, paddingLeft: 6 }}>
              ความถี่การออกเลขท้าย 2 ตัว (Top 30)
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={freq} margin={{ top: 4, right: 6, bottom: 4, left: -24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="number" tick={{ fill: '#475569', fontSize: 9 }} interval={0} />
                <YAxis tick={{ fill: '#475569', fontSize: 10 }} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="count" radius={[4,4,0,0]} maxBarSize={24}>
                  {freq.map((e, i) => (
                    <Cell key={i} fill={TREND_COLORS[e.trend as keyof typeof TREND_COLORS] || '#7c3aed'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 8, paddingLeft: 6 }}>
              {Object.entries(TREND_COLORS).map(([k, c]) => (
                <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#64748b' }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: c, display: 'inline-block' }} />
                  {{ hot:'🔥ร้อน', warm:'🌡️อุ่น', cold:'❄️เย็น', frozen:'🧊แช่แข็ง' }[k]}
                </span>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="glass" style={{ borderRadius: 20, overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px 8px', fontWeight: 600, color: '#e2e8f0', fontSize: 13 }}>
              ตารางสถิติโดยละเอียด
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    {['เลข','ออก','ล่าสุด','ค้าง','สถานะ'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', color: '#64748b', fontWeight: 600, textAlign: h === 'เลข' ? 'left' : 'center', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allStats.slice(0, 20).map((s, i) => (
                    <tr key={s.number} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i === 0 ? 'rgba(245,158,11,0.04)' : 'transparent' }}>
                      <td style={{ padding: '8px 12px' }}>
                        <span className="ball b-xs nf-bold" style={{ background: 'radial-gradient(circle at 38% 32%,#b99dff,#5b21b6)', boxShadow: '0 2px 8px rgba(124,58,237,0.5)', color: '#fff', fontSize: 11 }}>
                          {s.number}
                        </span>
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center', color: '#e2e8f0', fontWeight: 600 }}>{s.count}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'center', color: '#64748b' }}>{s.lastSeen}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'center', color: '#64748b' }}>{s.absenceDays}ว.</td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                        <span className={clsx('badge trend-' + s.trend)} style={{ fontSize: 10 }}>
                          {{ hot:'🔥', warm:'🌡️', cold:'❄️', frozen:'🧊' }[s.trend]}
                          {' '}{{ hot:'ร้อน', warm:'อุ่น', cold:'เย็น', frozen:'แช่แข็ง' }[s.trend]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Position ── */}
      {view === 'position' && (
        <div className="glass" style={{ borderRadius: 20, padding: '18px 12px' }}>
          <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: 13, marginBottom: 4, paddingLeft: 6 }}>
            ความถี่ตัวเลข 0–9 ตามตำแหน่งรางวัลที่ 1
          </div>
          <div style={{ fontSize: 11, color: '#4b5563', marginBottom: 14, paddingLeft: 6 }}>แกน X = ตัวเลข, สี = ตำแหน่ง</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={posData} margin={{ top: 4, right: 6, bottom: 4, left: -24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="digit" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip {...tooltipStyle} />
              {[1,2,3,4,5,6].map(i => (
                <Bar key={i} dataKey={`P${i}`} fill={POS_COLORS[i-1]} radius={[2,2,0,0]} stackId="a" name={`ตำแหน่ง ${i}`} />
              ))}
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10, paddingLeft: 6 }}>
            {[1,2,3,4,5,6].map(i => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#64748b' }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: POS_COLORS[i-1], display: 'inline-block' }} />
                ตำแหน่ง {i}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Overdue ── */}
      {view === 'overdue' && (
        <div className="glass" style={{ borderRadius: 20, padding: 20 }}>
          <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: 13, marginBottom: 4 }}>⏰ เลขที่ค้างนานที่สุด</div>
          <div style={{ fontSize: 12, color: '#4b5563', marginBottom: 18 }}>เลขเหล่านี้ยังไม่ออกมานาน มีโอกาสออกเร็วๆ นี้</div>
          {overdue.length === 0
            ? <div style={{ textAlign: 'center', color: '#374151', padding: '40px 0' }}>ยังไม่มีข้อมูลเพียงพอ</div>
            : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px,1fr))', gap: 12 }}>
                {overdue.map((n, i) => {
                  const stat = allStats.find(s => s.number === n)
                  return (
                    <div key={n} style={{
                      textAlign: 'center', padding: '14px 10px', borderRadius: 16,
                      background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)',
                    }}>
                      <div style={{ fontSize: 11, color: '#78716c', marginBottom: 6 }}>#{i+1}</div>
                      <div className="ball b-md b-amber nf-bold" style={{ margin: '0 auto 8px' }}>{n}</div>
                      <div style={{ fontSize: 10, color: '#92400e' }}>ค้าง {stat?.absenceDays}ว.</div>
                      <div style={{ fontSize: 10, color: '#d97706', marginTop: 2 }}>ออก {stat?.count} ครั้ง</div>
                    </div>
                  )
                })}
              </div>
            )
          }
        </div>
      )}

      {/* ── Sum ── */}
      {view === 'sum' && (
        <div className="glass" style={{ borderRadius: 20, padding: '18px 12px' }}>
          <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: 13, marginBottom: 4, paddingLeft: 6 }}>
            ผลรวมของเลขท้าย 2 ตัวที่ออกบ่อยที่สุด
          </div>
          <div style={{ fontSize: 11, color: '#4b5563', marginBottom: 14, paddingLeft: 6 }}>
            เช่น เลข 47 มีผลรวม 11 (4+7)
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={sumFq} margin={{ top: 4, right: 6, bottom: 4, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="sum" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `${v}`} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip
                {...tooltipStyle}
                formatter={(v) => [v, 'จำนวนงวด']}
                labelFormatter={v => `ผลรวม ${v}`}
              />
              <Bar dataKey="count" fill="#f59e0b" radius={[5,5,0,0]} name="งวด" />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: 12, padding: '0 6px' }}>
            {sumFq.slice(0, 6).map(s => (
              <div key={s.sum} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)',
                borderRadius: 10, padding: '8px 12px',
              }}>
                <span style={{ fontWeight: 700, color: '#fbbf24', fontFamily: 'Space Grotesk,monospace' }}>∑{s.sum}</span>
                <span style={{ fontSize: 12, color: '#e2e8f0', fontWeight: 600 }}>{s.count}ครั้ง</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
