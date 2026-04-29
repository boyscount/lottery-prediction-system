import React, { useState, useRef, useEffect } from 'react'
import { Home, Target, Moon, BarChart2, Star, BookOpen, LogOut, Heart, LogIn, Shield } from 'lucide-react'
import { TabType, UserSession } from '../types'
import { logoutUser } from '../utils/auth'
import Logo from './Logo'
import clsx from 'clsx'

type ExtendedTabType = TabType | 'admin'

interface LayoutProps {
  activeTab: ExtendedTabType
  onTabChange: (tab: ExtendedTabType) => void
  children: React.ReactNode
  session: UserSession | null
  onSessionChange: (s: UserSession | null) => void
  onShowAuth: () => void
  onShowSubscription: () => void
}

const TABS: { id: ExtendedTabType; label: string; short: string; Icon: React.ElementType; premium?: boolean; adminOnly?: boolean }[] = [
  { id: 'dashboard',  label: 'หน้าหลัก',      short: 'หลัก',    Icon: Home },
  { id: 'predict',    label: 'ทำนายเลข',      short: 'ทำนาย',   Icon: Target, premium: true },
  { id: 'dream',      label: 'ฝันแล้วได้เลข', short: 'ฝัน',     Icon: Moon },
  { id: 'statistics', label: 'สถิติ',           short: 'สถิติ',   Icon: BarChart2 },
  { id: 'astrology',  label: 'โหราศาสตร์',     short: 'ดวง',     Icon: Star },
  { id: 'history',    label: 'ประวัติ',         short: 'ประวัติ', Icon: BookOpen },
  { id: 'admin',      label: 'Admin',            short: 'Admin',   Icon: Shield, adminOnly: true },
]

function addRipple(e: React.MouseEvent<HTMLButtonElement>) {
  const btn = e.currentTarget
  const dot = document.createElement('span')
  dot.className = 'ripple-dot'
  const rect = btn.getBoundingClientRect()
  dot.style.left = `${e.clientX - rect.left}px`
  dot.style.top  = `${e.clientY - rect.top}px`
  btn.appendChild(dot)
  setTimeout(() => dot.remove(), 700)
}

export default function Layout({ activeTab, onTabChange, children, session, onSessionChange, onShowAuth, onShowSubscription }: LayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef    = useRef<HTMLDivElement>(null)
  const menuRefMob = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click (both desktop + mobile ref)
  useEffect(() => {
    function handler(e: MouseEvent) {
      const t = e.target as Node
      if (
        menuRef.current    && !menuRef.current.contains(t) &&
        menuRefMob.current && !menuRefMob.current.contains(t)
      ) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function handleLogout() {
    await logoutUser(); onSessionChange(null); setMenuOpen(false)
  }

  const currentTab = TABS.find(t => t.id === activeTab)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>

      {/* ─── Header ─── */}
      <header className="glass-sm sticky top-0 z-50"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>

            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <Logo size={38} className="anim-float" style={{ flexShrink: 0 }} />
              <div>
                <div className="shimmer nf-bold" style={{ fontSize: 17, lineHeight: 1.1 }}>
                  LottoMind
                </div>
                <div style={{ fontSize: 10, color: '#374151', lineHeight: 1.2, marginTop: 1 }} className="sm-hide">
                </div>
              </div>
            </div>

            {/* Desktop nav + user menu */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <nav className="top-nav" style={{ gap: 3 }}>
                {TABS.filter(t => !t.adminOnly || session?.isAdmin).map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={clsx('tab-btn', activeTab === tab.id ? 'on' : '')}
                    style={{ padding: '6px 12px', fontSize: 12 }}
                  >
                    <tab.Icon size={12} />
                    {tab.label}
                  </button>
                ))}
              </nav>

              {/* User area — desktop only */}
              <div className="sm-hide" style={{ position: 'relative' }} ref={menuRef}>
                {session ? (
                  <button
                    className="user-avatar spring-in"
                    style={{ background: session.avatarColor }}
                    onClick={() => setMenuOpen(!menuOpen)}
                    title={session.username}
                  >
                    {session.username.charAt(0).toUpperCase()}
                  </button>
                ) : (
                  <button
                    onClick={onShowAuth}
                    className="btn-ghost"
                    style={{ padding: '7px 14px', fontSize: 12, borderRadius: 10, display: 'flex', alignItems: 'center', gap: 5 }}
                  >
                    <LogIn size={13} /> บันทึกข้อมูล
                  </button>
                )}

                {/* Dropdown */}
                {menuOpen && session && (
                  <div className="user-dropdown glass" onClick={() => setMenuOpen(false)}>
                    {/* Profile header */}
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="user-avatar" style={{ background: session.avatarColor, cursor: 'default' }}>
                          {session.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: 13 }}>{session.username}</div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>{session.email}</div>
                        </div>
                      </div>
                      <div style={{ marginTop: 10 }}>
                        <span className="badge badge-ghost" style={{ fontSize: 11 }}>
                          ✅ ใช้ฟรีทุก feature
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <button className="user-dropdown-item" onClick={() => { setMenuOpen(false); onShowSubscription() }}>
                      <Heart size={14} style={{ color: '#f472b6' }} />
                      <span style={{ color: '#f472b6' }}>สนับสนุนผู้พัฒนา 💜</span>
                    </button>
                    <button className="user-dropdown-item" onClick={handleLogout}>
                      <LogOut size={14} /> ออกจากระบบ
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile: current tab label + user button */}
            <div className="sm-show-only" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#c4b5fd' }}>
                {currentTab?.label}
              </span>
              {session ? (
                <div ref={menuRefMob} style={{ position: 'relative' }}>
                  <button
                    className="user-avatar"
                    style={{ background: session.avatarColor, width: 28, height: 28, fontSize: 11 }}
                    onClick={() => setMenuOpen(!menuOpen)}
                  >
                    {session.username.charAt(0).toUpperCase()}
                  </button>
                  {menuOpen && (
                    <div className="user-dropdown glass" onClick={() => setMenuOpen(false)}>
                      <div style={{ padding: '12px 16px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: 13 }}>{session.username}</div>
                        <div style={{ fontSize: 10, color: '#4ade80', marginTop: 2 }}>✅ ใช้ฟรีทุก feature</div>
                      </div>
                      <button className="user-dropdown-item" onClick={() => { setMenuOpen(false); onShowSubscription() }}>
                        <Heart size={13} style={{ color: '#f472b6' }} />
                        <span style={{ color: '#f472b6', fontSize: 12 }}>สนับสนุนผู้พัฒนา 💜</span>
                      </button>
                      <button className="user-dropdown-item" onClick={handleLogout}>
                        <LogOut size={13} /> ออกจากระบบ
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={onShowAuth}
                  style={{
                    background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)',
                    borderRadius: 8, padding: '4px 10px', fontSize: 11, color: '#c4b5fd', cursor: 'pointer',
                    fontFamily: 'Sarabun, sans-serif',
                  }}
                >
                  💾 บันทึก
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ─── Main content ─── */}
      <main style={{ flex: 1 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 16px' }}
          className="page-wrap">
          <div className="page-in" key={activeTab}>
            {children}
          </div>
        </div>
      </main>

      {/* ─── Footer (desktop only) ─── */}
      <div className="top-nav"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', padding: '12px 16px', fontSize: 11, color: '#374151' }}>
        LottoMind · เพื่อความบันเทิงเท่านั้น · ไม่รับรองผลการออกรางวัล
      </div>

      {/* ─── Mobile Bottom Nav ─── */}
      <nav className="bottom-nav">
        {TABS.filter(t => !t.adminOnly || session?.isAdmin).map(tab => (
          <button
            key={tab.id}
            className={clsx('bnav-item', activeTab === tab.id ? 'on' : '')}
            onClick={(e) => { addRipple(e); onTabChange(tab.id as ExtendedTabType) }}
            style={{ position: 'relative', overflow: 'hidden' }}
          >
            <tab.Icon size={22} className="bnav-ic" />
            <span className="bnav-lbl">{tab.short}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
