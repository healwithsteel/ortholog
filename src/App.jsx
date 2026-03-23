import React, { useState, useMemo, useEffect } from 'react'
import { SAMPLE_CASES, SAMPLE_TIPS } from './data/sampleData'
import { CPT_CODES, CPT_CATEGORIES, REDUCTION_AIDS, IMPLANT_TYPES, APPROACHES, DEFAULT_ATTENDINGS, PATIENT_POSITIONS } from './data/cptCodes'
import { loadCases, saveCases, loadTips, saveTips, loadUser, saveUser, exportAllData } from './lib/storage'
import { useAuth } from './lib/auth'
import { isSupabaseConfigured } from './lib/supabase'
import { upsertUserProfile, getUserProfile, loadCasesFromSupabase, saveCaseToSupabase, loadTipsFromSupabase } from './lib/dataService'
import AuthScreen from './components/AuthScreen'
import OnboardingScreen from './components/OnboardingScreen'
import Dashboard from './components/Dashboard'
import CaseList from './components/CaseList'
import CaseDetail from './components/CaseDetail'
import NewCaseForm from './components/NewCaseForm'
import TipsPage from './components/TipsPage'
import NewTipForm from './components/NewTipForm'
import CPTLibrary from './components/CPTLibrary'
import CodingAcademy from './components/CodingAcademy'
import ProfilePage from './components/ProfilePage'
import TabBar from './components/TabBar'
import { useInstallPrompt, InstallBanner } from './components/InstallPrompt'

export default function App() {
  const { session, user: authUser, loading: authLoading, signOut, isSupabaseEnabled } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [cases, setCases] = useState([])
  const [tips, setTips] = useState([])
  const [showNewCase, setShowNewCase] = useState(false)
  const [showNewTip, setShowNewTip] = useState(false)
  const [selectedCase, setSelectedCase] = useState(null)
  const { showBanner, install, dismiss, isIOS } = useInstallPrompt()

  // Load data based on auth state
  useEffect(() => {
    if (authLoading) return

    const loadData = async () => {
      if (isSupabaseEnabled && authUser) {
        // Authenticated with Supabase — load from cloud
        const profile = await getUserProfile(authUser.id)
        if (profile) {
          setUser({
            id: profile.id,
            displayName: profile.display_name,
            email: profile.email,
            pgyYear: profile.pgy_year,
            program: profile.programs?.name || 'Unknown Program',
            programId: profile.program_id,
            role: profile.role,
            tier: profile.tier,
          })
        } else {
          // First login — create profile
          const newProfile = await upsertUserProfile(authUser)
          if (newProfile) {
            setUser({
              id: newProfile.id,
              displayName: newProfile.display_name,
              email: newProfile.email,
              pgyYear: newProfile.pgy_year,
              program: 'Unknown Program',
              programId: newProfile.program_id,
              role: newProfile.role,
              tier: newProfile.tier,
            })
          }
        }
        
        // Load cases from Supabase
        const cloudCases = await loadCasesFromSupabase(authUser.id)
        if (cloudCases && cloudCases.length > 0) {
          // Transform from DB format to app format
          setCases(cloudCases.map(c => ({
            id: c.id,
            date: c.date,
            patientAge: c.patient_age,
            patientSex: c.patient_sex,
            diagnosis: c.diagnosis,
            category: c.diagnosis,
            icd10: c.icd10,
            procedures: c.procedures,
            approach: c.approach,
            implants: c.implants,
            reductionAid: c.reduction_aid,
            attending: c.attending,
            role: c.role,
            complications: c.complications,
            notes: c.notes,
            isEmergency: c.is_emergency,
            bloodLossMl: c.blood_loss_ml,
            operativeTimeMin: c.operative_time_min,
            createdAt: c.created_at,
          })))
        } else {
          // No cloud cases — check localStorage for migration
          const localCases = loadCases()
          setCases(localCases || SAMPLE_CASES)
        }
        
        // Load tips (from program)
        const profile2 = await getUserProfile(authUser.id)
        const cloudTips = await loadTipsFromSupabase(profile2?.program_id)
        if (cloudTips && cloudTips.length > 0) {
          setTips(cloudTips.map(t => ({
            id: t.id,
            title: t.title,
            body: t.body,
            content: t.body,
            category: t.category,
            tags: t.tags,
            cptCodes: t.cpt_codes,
            createdBy: t.users?.display_name || 'Anonymous',
            createdAt: t.created_at,
            likes: 0,
          })))
        } else {
          const localTips = loadTips()
          setTips(localTips || SAMPLE_TIPS)
        }
      } else {
        // No Supabase or not authenticated — use localStorage
        const savedUser = loadUser()
        const savedCases = loadCases()
        const savedTips = loadTips()
        setUser(savedUser)
        setCases(savedCases || SAMPLE_CASES)
        setTips(savedTips || SAMPLE_TIPS)
      }
      
      setIsLoading(false)
    }
    
    loadData()
  }, [authLoading, authUser, isSupabaseEnabled])

  // Persist cases whenever they change (localStorage fallback, debounced)
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => saveCases(cases), 300)
      return () => clearTimeout(timer)
    }
  }, [cases, isLoading])

  // Persist tips (debounced to prevent freeze on rapid updates)
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => saveTips(tips), 300)
      return () => clearTimeout(timer)
    }
  }, [tips, isLoading])

  const stats = useMemo(() => ({
    totalCases: cases.length,
    thisMonth: cases.filter(c => {
      const d = new Date(c.date)
      const now = new Date()
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length,
    categories: [...new Set(cases.flatMap(c => Array.isArray(c.category) ? c.category : [c.category]))].length,
    attendings: [...new Set(cases.map(c => c.attending))].length,
  }), [cases])

  const handleOnboardingComplete = (profile) => {
    setUser(profile)
    saveUser(profile)
  }

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser)
    saveUser(updatedUser)
  }

  const handleSignOut = async () => {
    if (isSupabaseEnabled) {
      await signOut()
    }
    setUser(null)
    saveUser(null)
  }

  const handleAddCase = async (newCase) => {
    const caseWithMeta = {
      ...newCase,
      id: String(Date.now()),
      createdBy: user?.displayName || 'Anonymous',
      createdAt: new Date().toISOString(),
    }
    
    setCases(prev => [caseWithMeta, ...prev])
    setShowNewCase(false)
    
    // Also save to Supabase if connected
    if (isSupabaseEnabled && authUser) {
      await saveCaseToSupabase(caseWithMeta, authUser.id)
    }
  }

  const handleAddTip = (newTip) => {
    setTips(prev => [{
      ...newTip,
      id: 't' + Date.now(),
      createdBy: user?.displayName || 'Anonymous',
      createdAt: new Date().toISOString(),
      likes: 0,
    }, ...prev])
    setShowNewTip(false)
  }

  const handleUpdateTip = (updatedTip) => {
    setTips(prev => prev.map(t => t.id === updatedTip.id ? updatedTip : t))
  }

  const handleExport = () => {
    const data = exportAllData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ortholog-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Loading state
  if (isLoading || authLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <img src="/ortholog/rocf-logo.png" alt="OrthoLog" style={{ width: 80, height: 80, objectFit: 'contain' }} />
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Loading...</p>
        </div>
      </div>
    )
  }

  // Auth screen (if Supabase is configured but no session)
  if (isSupabaseEnabled && !authUser) {
    return <AuthScreen />
  }

  // Onboarding (localStorage fallback — no Supabase)
  if (!isSupabaseEnabled && !user) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />
  }

  const handleUpdateCase = (updatedCase) => {
    setCases(prev => prev.map(c => c.id === updatedCase.id ? updatedCase : c))
  }

  const handleDeleteCase = (caseId) => {
    setCases(prev => prev.filter(c => c.id !== caseId))
    setSelectedCase(null)
  }

  const renderPage = () => {
    if (selectedCase) {
      return <CaseDetail caseData={selectedCase} onBack={() => setSelectedCase(null)} onUpdateCase={handleUpdateCase} onDeleteCase={handleDeleteCase} />
    }
    
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard stats={stats} cases={cases} tips={tips} onSelectCase={setSelectedCase} />
      case 'cases':
        return <CaseList cases={cases} onSelectCase={setSelectedCase} />
      case 'tips':
        return <TipsPage tips={tips} onNewTip={() => setShowNewTip(true)} onUpdateTip={handleUpdateTip} />
      case 'cpt':
        return <CPTLibrary />
      case 'coding':
        return <CodingAcademy />
      case 'profile':
        return <ProfilePage user={user} onUpdateUser={handleUpdateUser} cases={cases} onExport={handleExport} onSignOut={isSupabaseEnabled ? handleSignOut : undefined} />
      default:
        return <Dashboard stats={stats} cases={cases} tips={tips} onSelectCase={setSelectedCase} />
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/ortholog/rocf-logo.png" alt="ROCF" style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 6 }} />
          <div>
            <h1 style={{ fontSize: 18, lineHeight: 1.2 }}>OrthoLog</h1>
            <p style={{ fontSize: 11, opacity: 0.8, lineHeight: 1.2 }}>UCF/HCA Ocala — Orthopaedic Surgery</p>
          </div>
        </div>
        {isSupabaseEnabled && authUser && (
          <div style={{ fontSize: 11, opacity: 0.6 }}>
            ☁️ {authUser.email.split('@')[0]}
          </div>
        )}
      </header>

      <main className="page">
        <div className="container" style={{ paddingTop: 16 }}>
          {renderPage()}
        </div>
      </main>

      {!selectedCase && !['cpt', 'profile', 'coding'].includes(activeTab) && (
        <button 
          className="fab" 
          onClick={() => activeTab === 'tips' ? setShowNewTip(true) : setShowNewCase(true)}
          title={activeTab === 'tips' ? 'New Tip' : 'Log Case'}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      )}

      <TabBar activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); setSelectedCase(null); }} />

      {showBanner && (
        <InstallBanner onInstall={install} onDismiss={dismiss} isIOS={isIOS} />
      )}

      {showNewCase && (
        <NewCaseForm 
          onSubmit={handleAddCase} 
          onClose={() => setShowNewCase(false)}
          cptCodes={CPT_CODES}
          reductionAids={REDUCTION_AIDS}
          implantTypes={IMPLANT_TYPES}
          approaches={APPROACHES}
          attendings={DEFAULT_ATTENDINGS}
          positions={PATIENT_POSITIONS}
        />
      )}

      {showNewTip && (
        <NewTipForm
          onSubmit={handleAddTip}
          onClose={() => setShowNewTip(false)}
        />
      )}
    </div>
  )
}
