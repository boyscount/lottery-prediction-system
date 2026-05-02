import React, { useState, useEffect } from 'react'
import { UserSession } from '../types'
import { adminGetUsers, adminGetPayments, adminSetPremium, adminRevokeSubscription } from '../lib/db'
import { supabaseReady } from '../lib/supabase'

interface Props {
  session: UserSession
}

interface AdminUser {
  id: string
  username: string
  avatar_color: string
  is_admin: boolean
  created_at: string
  subscriptions?: { status: string; started_at: string | null; expires_at: string | null }[]
}

interface AdminPayment {
  id: string
  amount: number
  currency: string
  status: string
  method: string
  omise_charge_id: string | null
  created_at: string
  profiles?: { username: string } | null
}

type View = 'users' | 'payments'

export default function AdminPanel({ session }: Props) {
  const [view, setView] = useState<View>('users')
  const [users, setUsers] = useState<AdminUser[]>([])
  const [payments, setPayments] = useState<AdminPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [actionUserId, setActionUserId] = useState<string | null>(null)
  const [days, setDays] = useState(30)

  useEffect(() => {
    if (!supabaseReady) { setLoading(false); return }
    Promise.all([adminGetUsers(), adminGetPayments()])
      .then(([u, p]) => {
        setUsers(u as unknown as AdminUser[])
        setPayments(p as unknown as AdminPayment[])
      })
      .catch(err => console.error('Admin load error:', err))
      .finally(() => setLoading(false))
  }, [])

  async function handleSetPremium(userId: string) {
    await adminSetPremium(userId, days)
    const u = await adminGetUsers()
    setUsers(u as AdminUser[])
    setActionUserId(null)
  }

  async function handleRevoke(userId: string) {
    await adminRevokeSubscription(userId)
    const u = await adminGetUsers()
    setUsers(u as AdminUser[])
  }

  const totalRevenue = payments.filter(p => p.status === 'succeeded').reduce((s, p) => s + p.amount, 0)
  const succeededCount = payments.filter(p => p.status === 'succeeded').length

  if (!supabaseReady) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: '#64748b' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔌</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>
          Admin Panel ต้องใช้ Supabase
        </div>
        <p style={{ fontSize: 13 }}>
          กรุณาตั้งค่า VITE_SUPABASE_URL และ VITE_SUPABASE_ANON_KEY ใน .env
        </p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ fontSize: 28 }}>🛡️</div>
        <div>
          <div className="nf-bold" style={{ fontSize: 20, color: '#e2e8f0' }}>Admin Panel</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>จัดการผู้ใช้ · ดูการชำระเงิน · ควบคุมสิทธิ์</div>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'ผู้ใช้ทั้งหมด', value: users.length, emoji: '👥', color: '#7c3aed' },
          { label: 'Premium active', value: users.filter(u => u.subscriptions?.[0]?.status === 'premium').length, emoji: '💎', color: '#f59e0b' },
          { label: 'การชำระสำเร็จ', value: succeededCount, emoji: '✅', color: '#22c55e' },
          { label: 'รายรับรวม (บาท)', value: (totalRevenue / 100).toFixed(0), emoji: '💰', color: '#06b6d4' },
        ].map((c, i) => (
          <div key={i} className="glass-sm" style={{ padding: '16px 20px', borderRadius: 16, border: `1px solid ${c.color}30` }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{c.emoji}</div>
            <div style={{ fontSize: 22, fontFamily: 'Space Grotesk', fontWeight: 800, color: c.color }}>{c.value}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {([
          { id: 'users', label: '👥 ผู้ใช้' },
          { id: 'payments', label: '💳 การชำระเงิน' },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setView(t.id)}
            className={view === t.id ? 'btn-primary' : 'btn-ghost'}
            style={{ padding: '8px 18px', borderRadius: 12, fontSize: 13 }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>กำลังโหลด...</div>
      ) : view === 'users' ? (

        /* Users table */
        <div className="glass-sm" style={{ borderRadius: 16, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['ผู้ใช้', 'สมัครเมื่อ', 'สถานะ', 'หมดอายุ', 'จัดการ'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, color: '#64748b', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const sub = u.subscriptions?.[0]
                const isPrem = sub?.status === 'premium'
                const exp = sub?.expires_at ? new Date(sub.expires_at) : null
                const expired = exp ? exp < new Date() : false
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%', background: u.avatar_color,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
                        }}>
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0' }}>{u.username}</div>
                          {u.is_admin && <span style={{ fontSize: 9, color: '#ef4444', fontWeight: 700 }}>ADMIN</span>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#64748b' }}>
                      {new Date(u.created_at).toLocaleDateString('th-TH')}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge ${isPrem && !expired ? 'badge-amber' : 'badge-ghost'}`} style={{ fontSize: 11 }}>
                        {isPrem && !expired ? '💎 Premium' : isPrem && expired ? '⏰ หมดอายุ' : '⬜ Free'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#64748b' }}>
                      {exp ? exp.toLocaleDateString('th-TH') : '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {actionUserId === u.id ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <input
                            type="number" value={days} onChange={e => setDays(Number(e.target.value))}
                            min={1} max={365}
                            style={{
                              width: 52, padding: '4px 6px', borderRadius: 8, fontSize: 12,
                              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                              color: '#e2e8f0', outline: 'none',
                            }}
                          />
                          <span style={{ fontSize: 11, color: '#64748b' }}>วัน</span>
                          <button
                            onClick={() => handleSetPremium(u.id)}
                            style={{ padding: '4px 10px', borderRadius: 8, fontSize: 11, background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.4)', color: '#fbbf24', cursor: 'pointer', fontFamily: 'Sarabun, sans-serif' }}
                          >ยืนยัน</button>
                          <button
                            onClick={() => setActionUserId(null)}
                            style={{ padding: '4px 8px', borderRadius: 8, fontSize: 11, background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#64748b', cursor: 'pointer', fontFamily: 'Sarabun, sans-serif' }}
                          >ยกเลิก</button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            onClick={() => setActionUserId(u.id)}
                            style={{ padding: '4px 10px', borderRadius: 8, fontSize: 11, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#fbbf24', cursor: 'pointer', fontFamily: 'Sarabun, sans-serif' }}
                          >💎 ให้สิทธิ์</button>
                          {isPrem && (
                            <button
                              onClick={() => handleRevoke(u.id)}
                              style={{ padding: '4px 10px', borderRadius: 8, fontSize: 11, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', cursor: 'pointer', fontFamily: 'Sarabun, sans-serif' }}
                            >ถอน</button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {users.length === 0 && (
            <div style={{ padding: 32, textAlign: 'center', color: '#64748b', fontSize: 13 }}>ยังไม่มีผู้ใช้</div>
          )}
        </div>

      ) : (

        /* Payments table */
        <div className="glass-sm" style={{ borderRadius: 16, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['ผู้ใช้', 'จำนวน', 'วิธี', 'สถานะ', 'วันที่'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, color: '#64748b', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map(p => {
                const statusColor: Record<string, string> = {
                  succeeded: '#22c55e', pending: '#f59e0b', failed: '#ef4444', refunded: '#64748b',
                }
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#e2e8f0' }}>
                      {(p.profiles as any)?.username ?? '—'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontFamily: 'Space Grotesk', color: '#fbbf24', fontWeight: 700 }}>
                      ฿{(p.amount / 100).toFixed(0)}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#94a3b8' }}>
                      {p.method === 'promptpay' ? '🏦 PromptPay' : p.method === 'card' ? '💳 Card' : p.method ?? '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600, color: statusColor[p.status] ?? '#94a3b8',
                        background: `${statusColor[p.status] ?? '#94a3b8'}18`,
                        padding: '3px 8px', borderRadius: 6,
                      }}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#64748b' }}>
                      {new Date(p.created_at).toLocaleDateString('th-TH')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {payments.length === 0 && (
            <div style={{ padding: 32, textAlign: 'center', color: '#64748b', fontSize: 13 }}>ยังไม่มีการชำระเงิน</div>
          )}
        </div>
      )}
    </div>
  )
}
