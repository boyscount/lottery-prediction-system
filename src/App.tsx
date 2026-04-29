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
import { lotteryHistory } from './data/lotteryHistory'
import { TabType, DreamSelection, AstrologyProfile, LotteryDraw, UserSession } from './types'
type ExtendedTabType = TabType | 'admin'
import { getSession, getSessionAsync, buildUserSession, isPremium } from './utils/auth'
import { supabase, supabaseReady } from './lib/supabase'
import { getDraws, getDreams, getAstrology, saveDraws, saveDreams, saveAstrology } from './lib/db'

export default function App() {
  const [activeTab, setActiveTab]   = useState<ExtendedTabType>('dashboard')
  const [session, setSession]       = useState<UserSession | null>(() => getSession())
  const [showAuth, setShowAuth]     = useState(false)
  const [showSub, setShowSub]       = useState(false)
  const [authMode, setAuthMode]     = useState<'login' | 'register'>('login')

  const [draws, setDraws] = useState<LotteryDraw[]>(lotteryHistory)
  const [dreamSelections, setDreamSelections] = useState<DreamSelection[]>([])
  const [astrologyProfile, setAstrologyProfile] = useState<AstrologyProfile | null>(null)

  // Load initial data
  useEffect(() => {
    getDraws().then(setDraws)
    getDreams(session?.userId).then(setDreamSelections)
    getAstrology(session?.userId).then(setAstrologyProfile)
  }, [])

  // Reload per-user data on session change
  useEffect(() => {
    getDreams(session?.userId).then(setDreamSelections)
    getAstrology(session?.userId).then(setAstrologyProfile)
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

  const navigate = (tab: string) => setActiveTab(tab as TabType)
  const premium = isPremium(session)

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
            session={session}
            onNavigateDream={() => setActiveTab('dream')}
            onNavigateAstrology={() => setActiveTab('astrology')}
            onShowAuth={() => openAuth('login')}
            onShowSubscription={() => setShowSub(true)}
          />
        )}
        {activeTab === 'dream' && (
          <DreamInterpreter
            selected={dreamSelections}
            onSelectionChange={setDreamSelections}
            isPremium={premium}
            onShowAuth={() => openAuth('login')}
            onShowSubscription={() => setShowSub(true)}
          />
        )}
        {activeTab === 'statistics' && (
          <Statistics draws={draws} isPremium={premium} onShowSubscription={() => setShowSub(true)} />
        )}
        {activeTab === 'astrology' && (
          <AstrologyPanel profile={astrologyProfile} onProfileChange={setAstrologyProfile} />
        )}
        {activeTab === 'history' && (
          <HistoryManager draws={draws} onDrawsChange={setDraws} />
        )}
        {activeTab === 'admin' && session?.isAdmin && (
          <AdminPanel session={session} />
        )}
      </Layout>

      {showAuth && (
        <AuthModal
          defaultMode={authMode}
          onSuccess={handleAuthSuccess}
          onClose={() => setShowAuth(false)}
        />
      )}

      {showSub && session && (
        <SubscriptionModal
          session={session}
          onSuccess={handleSubSuccess}
          onClose={() => setShowSub(false)}
        />
      )}
      {showSub && !session && (
        <AuthModal
          defaultMode="register"
          onSuccess={s => { setSession(s); setShowSub(true) }}
          onClose={() => setShowSub(false)}
        />
      )}
    </>
  )
}
