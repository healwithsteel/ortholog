import React, { useState, useMemo, useEffect } from 'react'
import { SAMPLE_CASES, SAMPLE_TIPS } from './data/sampleData'
import { CPT_CODES, CPT_CATEGORIES, REDUCTION_AIDS, IMPLANT_TYPES, APPROACHES, DEFAULT_ATTENDINGS } from './data/cptCodes'
import { loadCases, saveCases, loadTips, saveTips, loadUser, saveUser, exportAllData } from './lib/storage'
import OnboardingScreen from './components/OnboardingScreen'
import Dashboard from './components/Dashboard'
import CaseList from './components/CaseList'
import CaseDetail from './components/CaseDetail'
import NewCaseForm from './components/NewCaseForm'
import TipsPage from './components/TipsPage'
import NewTipForm from './components/NewTipForm'
import CPTLibrary from './components/CPTLibrary'
import ProfilePage from './components/ProfilePage'
import TabBar from './components/TabBar'

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [cases, setCases] = useState([])
  const [tips, setTips] = useState([])
  const [showNewCase, setShowNewCase] = useState(false)
  const [showNewTip, setShowNewTip] = useState(false)
  const [selectedCase, setSelectedCase] = useState(null)

  // Load persisted data on mount
  useEffect(() => {
    const savedUser = loadUser()
    const savedCases = loadCases()
    const savedTips = loadTips()
    
    setUser(savedUser)
    setCases(savedCases || SAMPLE_CASES)
    setTips(savedTips || SAMPLE_TIPS)
    setIsLoading(false)
  }, [])

  // Persist cases whenever they change
  useEffect(() => {
    if (!isLoading) saveCases(cases)
  }, [cases, isLoading])

  // Persist tips whenever they change
  useEffect(() => {
    if (!isLoading) saveTips(tips)
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

  const handleAddCase = (newCase) => {
    setCases(prev => [{
      ...newCase,
      id: String(Date.now()),
      createdBy: user?.displayName || 'Anonymous',
      createdAt: new Date().toISOString(),
    }, ...prev])
    setShowNewCase(false)
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

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <img src="/rocf-logo.webp" alt="OrthoLog" style={{ width: 80, height: 80, objectFit: 'contain' }} />
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />
  }

  const handleUpdateCase = (updatedCase) => {
    setCases(prev => prev.map(c => c.id === updatedCase.id ? updatedCase : c))
  }

  const renderPage = () => {
    if (selectedCase) {
      return <CaseDetail caseData={selectedCase} onBack={() => setSelectedCase(null)} onUpdateCase={handleUpdateCase} />
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
      case 'profile':
        return <ProfilePage user={user} onUpdateUser={handleUpdateUser} cases={cases} onExport={handleExport} />
      default:
        return <Dashboard stats={stats} cases={cases} tips={tips} onSelectCase={setSelectedCase} />
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/rocf-logo.webp" alt="ROCF" style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 6 }} />
          <div>
            <h1 style={{ fontSize: 18, lineHeight: 1.2 }}>OrthoLog</h1>
            <p style={{ fontSize: 11, opacity: 0.8, lineHeight: 1.2 }}>UCF/HCA Ocala — Orthopaedic Surgery</p>
          </div>
        </div>
      </header>

      <main className="page">
        <div className="container" style={{ paddingTop: 16 }}>
          {renderPage()}
        </div>
      </main>

      {!selectedCase && !['cpt', 'profile'].includes(activeTab) && (
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

      {showNewCase && (
        <NewCaseForm 
          onSubmit={handleAddCase} 
          onClose={() => setShowNewCase(false)}
          cptCodes={CPT_CODES}
          reductionAids={REDUCTION_AIDS}
          implantTypes={IMPLANT_TYPES}
          approaches={APPROACHES}
          attendings={DEFAULT_ATTENDINGS}
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
