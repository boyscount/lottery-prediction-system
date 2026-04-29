import React, { useState, useEffect } from 'react'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import DreamInterpreter from './components/DreamInterpreter'
import Statistics from './components/Statistics'
import AstrologyPanel from './components/AstrologyPanel'
import Predictor from './components/Predictor'
import HistoryManager from './components/HistoryManager'
import AuthModal from './components/AuthModal'
import SubscriptionModal from './components/SubscriptionModal'
import AdminPanel from './components/AdminPanel'
import NumberJournal from './components/NumberJournal'
import NumberScanner from './components/NumberScanner'
import { lotteryHistory } from './data/lotteryHistory'
import { TabType, DreamSelection, AstrologyProfile, LotteryDraw, UserSession, JournalEntry } from './types'
type ExtendedTabType = TabType | 'journal' | 'scanner' | 'admin'
import { getSession, getSessionAsync, buildUserSession } from './utils/auth'
import { supabase, supabaseReady } from './lib/supabase'
import { getDraws, getDreams, getAstrology, saveDraws, saveDreams, saveAstrology, getJournal, saveJournal } from './lib/db'

// ── Save Data Nudge banner ──────────────────────────────────────
function SaveDataNudge({ onSignup, onDismiss }: { onSignup: () => void; onDismiss: () => void }) {
  return (
    <div className="spring-in" style={{
      position: 'fixed', bottom: 76, left: 0, right: 0, zIndex: 40,
      display: 'flex', justifyContent: 'center', padding: '0 12px',
      pointerEvents: 'none',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'rgba(15,10,30,0.92)', backdropFilter: 'blur(16px)',
        border: '1px solid rgba(124,58,237,0.35)',
        borderRadius: 16, padding: '10px 14px',
        maxWidth: 480, width: '100%',
        pointerEvents: 'auto',
        boxShadow: '0 4px 32px rgba(124,58,237,0.2)',
      }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>💾</span>
        <span style={{ fontSize: 12, color: '#94a3b8', flex: 1, lineHeight: 1.4 }}>
          ข้อมูลความฝัน + ดวงเก็บอยู่ใน browser นี้เท่านั้น
          <span style={{ color: '#c4b5fd' }}> สมัครฟรี</span>เพื่อไม่ให้หาย
        </span>
        <button
          onClick={onSignup}
          style={{
            background: 'rgba(124,58,237,0.25)', border: '1px solid rgba(124,58,237,0.5)',
            borderRadius: 10, padding: '6px 12px', fontSize: 11, color: '#c4b5fd',
            cursor: 'pointer', fontFamily: 'Sarabun, sans-serif', flexShrink: 0, fontWeight: 600,
          }}
        >สมัครฟรี</button>
        <button
          onClick={onDismiss}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#374151', fontSize: 16, lineHeight: 1, flexShrink: 0, padding: 4,
          }}
        >×</button>
      </div>
    </div>
  )
}

export default function App() {
  const [activeTab, setActiveTab]   = useState<ExtendedTabType>('dashboard')
  const [session, setSession]       = useState<UserSession | null>(() => getSession())
  const [showAuth, setShowAuth]     = useState(false)
  const [showSub, setShowSub]       = useState(false)
  const [authMode, setAuthMode]     = useState<'login' | 'register'>('login')
  const [showNudge, setShowNudge]   = useState(false)

  // Show nudge after 5s for anonymous users (once per session)
  useEffect(() => {
    if (session) return
    const dismissed = sessionStorage.getItem('nudge_dismissed')
    if (dismissed) return
    const t = setTimeout(() => setShowNudge(true), 5000)
    return () => clearTimeout(t)
  }, [session])

  const [draws, setDraws] = useState<LotteryDraw[]>(lotteryHistory)
  const [dreamSelections, setDreamSelections] = useState<DreamSelection[]>([])
  const [astrologyProfile, setAstrologyProfile] = useState<AstrologyProfile | null>(null)
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([])

  // Load initial data
  useEffect(() => {
    getDraws().then(setDraws)
    getDreams(session?.userId).then(setDreamSelections)
    getAstrology(session?.userId).then(setAstrologyProfile)
    getJournal(session?.userId).then(setJournalEntries)
  }, [])

  // Reload per-user data on session change
  useEffect(() => {
    getDreams(session?.userId).then(setDreamSelections)
    getAstrology(session?.userId).then(setAstrologyProfile)
    getJournal(session?.userId).then(setJournalEntries)
  }, [session?.userId])

  // Supabase auth state listener
  useEffect(() => {
    if (!supabaseReady) return
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, supabaseSession) => {
      if (event === 'SIGNED_IN' && supabaseSession?.user) {
        const s = await buildUserSession(supabaseSession.user)
        if (s) setSession(s)
      } else if (event === 'SIGNED_OUT') {
        setSession(null)
      } else if (event === 'TOKEN_REFRESHED' && supabaseSession?.user) {
        const s = await getSessionAsync()
        if (s) setSession(s)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  // Persist draws
  useEffect(() => { saveDraws(draws) }, [draws])

  // Persist per-user data
  useEffect(() => { saveDreams(dreamSelections, session?.userId) }, [dreamSelections, session?.userId])
  useEffect(() => { saveAstrology(astrologyProfile, session?.userId) }, [astrologyProfile, session?.userId])
  useEffect(() => { saveJournal(journalEntries, session?.userId) }, [journalEntries, session?.userId])

  const navigate = (tab: string) => setActiveTab(tab as TabType)

  function handleAuthSuccess(s: UserSession) {
    setSession(s)
    setShowAuth(false)
  }

  function handleSubSuccess(s: UserSession) {
    setSession(s)
    setShowSub(false)
  }

  function openAuth(mode: 'login' | 'register' = 'login') {
    setAuthMode(mode)
    setShowAuth(true)
  }

  return (
    <>
      <Layout
        activeTab={activeTab}
        onTabChange={setActiveTab}
        session={session}
        onSessionChange={setSession}
        onShowAuth={() => openAuth('login')}
        onShowSubscription={() => setShowSub(true)}
      >
        {activeTab === 'dashboard' && (
          <Dashboard draws={draws} onNavigate={navigate} />
        )}
        {activeTab === 'predict' && (
          <Predictor
            draws={draws}
            dreamSelections={dreamSelections}
            astrologyProfile={astrologyProfile}
            onNavigateDream={() => setActiveTab('dream')}
            onNavigateAstrology={() => setActiveTab('astrology')}
          />
        )}
        {activeTab === 'dream' && (
          <DreamInterpreter
            selected={dreamSelections}
            onSelectionChange={setDreamSelections}
            isPremium={true}
            onShowAuth={() => openAuth('register')}
            onShowSubscription={() => setShowSub(true)}
          />
        )}
        {activeTab === 'statistics' && (
          <Statistics draws={draws} isPremium={true} onShowSubscription={() => setShowSub(true)} />
        )}
        {activeTab === 'astrology' && (
          <AstrologyPanel profile={astrologyProfile} onProfileChange={setAstrologyProfile} />
        )}
        {activeTab === 'history' && (
          <HistoryManager draws={draws} onDrawsChange={setDraws} />
        )}
        {activeTab === 'journal' && (
          <NumberJournal entries={journalEntries} draws={draws} onEntriesChange={setJournalEntries} />
        )}
        {activeTab === 'scanner' && (
          <NumberScanner />
        )}
        {activeTab === 'admin' && session?.isAdmin && (
          <AdminPanel session={session} />
        )}
      </Layout>

      {/* Save data nudge — anonymous users only */}
      {!session && showNudge && (
        <SaveDataNudge
          onSignup={() => { setShowNudge(false); openAuth('register') }}
          onDismiss={() => { setShowNudge(false); sessionStorage.setItem('nudge_dismissed', '1') }}
        />
      )}

      {showAuth && (
        <AuthModal
          defaultMode={authMode}
          onSuccess={handleAuthSuccess}
          onClose={() => setShowAuth(false)}
        />
      )}

      {showSub && (
        <SubscriptionModal
          onClose={() => setShowSub(false)}
        />
      )}
    </>
  )
}
