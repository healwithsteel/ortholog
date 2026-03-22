import React, { useState, useMemo, useCallback } from 'react'
import { CODING_SCENARIOS, CODING_CONCEPTS, FLASH_CARDS, MODIFIERS, RVU_DATA } from '../data/codingScenarios'

const DIFFICULTY_COLORS = {
  intern: { bg: '#dcfce7', color: '#166534', label: '🟢 Intern' },
  senior: { bg: '#fef3c7', color: '#92400e', label: '🟡 Senior' },
  fellowship: { bg: '#fee2e2', color: '#991b1b', label: '🔴 Fellowship' },
}

const TABS = [
  { id: 'scenarios', label: '🎯 Scenarios', desc: 'Code real cases' },
  { id: 'concepts', label: '📚 Concepts', desc: 'Key principles' },
  { id: 'flash', label: '⚡ Flash Cards', desc: 'Quick quiz' },
  { id: 'modifiers', label: '🏷️ Modifiers', desc: 'Reference' },
]

// ========== SCENARIO TRAINER ==========
function ScenarioTrainer() {
  const [selectedScenario, setSelectedScenario] = useState(null)
  const [filterDifficulty, setFilterDifficulty] = useState('all')
  const [userAnswer, setUserAnswer] = useState({ codes: [], modifiers: [] })
  const [showResult, setShowResult] = useState(false)
  const [completedScenarios, setCompletedScenarios] = useState(() => {
    try { return JSON.parse(localStorage.getItem('ortholog-coding-completed') || '{}') } catch { return {} }
  })

  const filteredScenarios = useMemo(() =>
    filterDifficulty === 'all' ? CODING_SCENARIOS : CODING_SCENARIOS.filter(s => s.difficulty === filterDifficulty),
    [filterDifficulty]
  )

  const handleSubmit = useCallback(() => {
    setShowResult(true)
    const updated = { ...completedScenarios, [selectedScenario.id]: true }
    setCompletedScenarios(updated)
    localStorage.setItem('ortholog-coding-completed', JSON.stringify(updated))
  }, [selectedScenario, completedScenarios])

  const toggleCode = useCallback((code) => {
    setUserAnswer(prev => ({
      ...prev,
      codes: prev.codes.includes(code) ? prev.codes.filter(c => c !== code) : [...prev.codes, code]
    }))
  }, [])

  const toggleModifier = useCallback((mod) => {
    setUserAnswer(prev => ({
      ...prev,
      modifiers: prev.modifiers.includes(mod) ? prev.modifiers.filter(m => m !== mod) : [...prev.modifiers, mod]
    }))
  }, [])

  if (selectedScenario) {
    const sc = selectedScenario
    const allCodeOptions = [...sc.correctCodes, ...(sc.distractors || [])].sort(() => Math.random() - 0.5)
    const modifierOptions = ['AS', '22', '50', '58', '59', '62', '78', '79', 'LT', 'RT']
    
    const correctCodeSet = new Set(sc.correctCodes.map(c => c.code))
    const correctModSet = new Set(sc.correctModifiers)
    
    const codeScore = showResult ? (() => {
      const userSet = new Set(userAnswer.codes)
      const correct = [...correctCodeSet].filter(c => userSet.has(c)).length
      const wrong = [...userSet].filter(c => !correctCodeSet.has(c)).length
      return { correct, wrong, total: correctCodeSet.size }
    })() : null

    const modScore = showResult ? (() => {
      const userSet = new Set(userAnswer.modifiers)
      const correct = [...correctModSet].filter(m => userSet.has(m)).length
      const wrong = [...userSet].filter(m => !correctModSet.has(m)).length
      return { correct, wrong, total: correctModSet.size }
    })() : null

    const totalCorrect = codeScore && modScore ? codeScore.correct + modScore.correct : 0
    const totalPossible = codeScore && modScore ? codeScore.total + modScore.total : 0
    const totalWrong = codeScore && modScore ? codeScore.wrong + modScore.wrong : 0
    const percentage = totalPossible > 0 ? Math.round(((totalCorrect - totalWrong * 0.5) / totalPossible) * 100) : 0

    // Calculate revenue impact
    const correctRevenue = sc.correctCodes.reduce((sum, c) => {
      const rvu = RVU_DATA[c.code]
      return sum + (rvu ? parseFloat(rvu.medicare.replace('$', '').replace(',', '')) : 0)
    }, 0)

    return (
      <div>
        <button onClick={() => { setSelectedScenario(null); setShowResult(false); setUserAnswer({ codes: [], modifiers: [] }) }}
          style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 14, cursor: 'pointer', padding: '8px 0', marginBottom: 12 }}>
          ← Back to Scenarios
        </button>

        <div style={{ background: DIFFICULTY_COLORS[sc.difficulty].bg, padding: '6px 12px', borderRadius: 20, display: 'inline-block', fontSize: 13, fontWeight: 600, color: DIFFICULTY_COLORS[sc.difficulty].color, marginBottom: 12 }}>
          {DIFFICULTY_COLORS[sc.difficulty].label}
        </div>

        <h2 style={{ fontSize: 18, marginBottom: 8 }}>{sc.title}</h2>
        
        <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, marginBottom: 20, borderLeft: '4px solid var(--primary)' }}>
          <p style={{ fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-line' }}>{sc.scenario}</p>
        </div>

        {/* CPT Code Selection */}
        <h3 style={{ fontSize: 15, marginBottom: 10, color: 'var(--primary)' }}>📋 Select CPT Code(s):</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {allCodeOptions.map((opt, i) => {
            const isSelected = userAnswer.codes.includes(opt.code)
            const isCorrect = correctCodeSet.has(opt.code)
            let borderColor = isSelected ? 'var(--primary)' : '#e2e8f0'
            let bgColor = isSelected ? '#eff6ff' : 'white'
            if (showResult) {
              if (isSelected && isCorrect) { borderColor = '#16a34a'; bgColor = '#dcfce7' }
              else if (isSelected && !isCorrect) { borderColor = '#dc2626'; bgColor = '#fee2e2' }
              else if (!isSelected && isCorrect) { borderColor = '#f59e0b'; bgColor = '#fef3c7' }
            }
            return (
              <button key={i} onClick={() => !showResult && toggleCode(opt.code)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, border: `2px solid ${borderColor}`, background: bgColor, cursor: showResult ? 'default' : 'pointer', textAlign: 'left' }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 15, minWidth: 55 }}>{opt.code}</span>
                <span style={{ fontSize: 13, color: '#475569', flex: 1 }}>{opt.desc}</span>
                {showResult && isCorrect && <span>✅</span>}
                {showResult && isSelected && !isCorrect && <span>❌</span>}
                {RVU_DATA[opt.code] && <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{RVU_DATA[opt.code].medicare}</span>}
              </button>
            )
          })}
        </div>

        {/* Modifier Selection */}
        <h3 style={{ fontSize: 15, marginBottom: 10, color: 'var(--primary)' }}>🏷️ Select Modifier(s):</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {modifierOptions.map(mod => {
            const isSelected = userAnswer.modifiers.includes(mod)
            const isCorrect = correctModSet.has(mod)
            let bg = isSelected ? 'var(--primary)' : '#e2e8f0'
            let color = isSelected ? 'white' : '#475569'
            if (showResult) {
              if (isSelected && isCorrect) { bg = '#16a34a'; color = 'white' }
              else if (isSelected && !isCorrect) { bg = '#dc2626'; color = 'white' }
              else if (!isSelected && isCorrect) { bg = '#f59e0b'; color = 'white' }
            }
            return (
              <button key={mod} onClick={() => !showResult && toggleModifier(mod)}
                style={{ padding: '8px 16px', borderRadius: 20, border: 'none', background: bg, color, fontSize: 14, fontWeight: 600, cursor: showResult ? 'default' : 'pointer' }}>
                -{mod}
              </button>
            )
          })}
        </div>

        {!showResult ? (
          <button onClick={handleSubmit}
            style={{ width: '100%', padding: 14, borderRadius: 12, background: 'var(--primary)', color: 'white', border: 'none', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
            Submit Answer
          </button>
        ) : (
          <div>
            {/* Score */}
            <div style={{ background: percentage >= 80 ? '#dcfce7' : percentage >= 50 ? '#fef3c7' : '#fee2e2', borderRadius: 12, padding: 16, textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 36, fontWeight: 800 }}>{Math.max(0, percentage)}%</div>
              <div style={{ fontSize: 14, color: '#475569' }}>
                {percentage >= 80 ? '🎉 Excellent!' : percentage >= 50 ? '📈 Getting there!' : '📚 Keep studying!'}
              </div>
              {correctRevenue > 0 && (
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 8 }}>
                  💰 This case generates ~<strong>${correctRevenue.toLocaleString()}</strong> in professional fees
                </div>
              )}
            </div>

            {/* Explanation */}
            <div style={{ background: '#f0f9ff', borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, marginBottom: 8, color: 'var(--primary)' }}>📖 Explanation</h3>
              <div style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                {sc.explanation.replace(/\*\*(.*?)\*\*/g, '$1')}
              </div>
            </div>

            {/* Correct diagnoses */}
            {sc.correctDiagnoses && (
              <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, marginBottom: 8 }}>🏥 ICD-10 Diagnoses</h3>
                {sc.correctDiagnoses.map((dx, i) => (
                  <div key={i} style={{ fontSize: 13, color: '#475569', padding: '4px 0' }}>• {dx}</div>
                ))}
              </div>
            )}

            {/* Distractor explanations */}
            {sc.distractors?.length > 0 && (
              <div style={{ background: '#fff7ed', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, marginBottom: 8 }}>⚠️ Common Mistakes</h3>
                {sc.distractors.map((d, i) => (
                  <div key={i} style={{ marginBottom: 8, fontSize: 13 }}>
                    <strong style={{ fontFamily: 'monospace' }}>{d.code}</strong>: {d.why}
                  </div>
                ))}
              </div>
            )}

            <button onClick={() => { setSelectedScenario(null); setShowResult(false); setUserAnswer({ codes: [], modifiers: [] }) }}
              style={{ width: '100%', padding: 14, borderRadius: 12, background: 'var(--primary)', color: 'white', border: 'none', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
              Next Scenario →
            </button>
          </div>
        )}
      </div>
    )
  }

  // Scenario list
  const completedCount = Object.keys(completedScenarios).length
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ fontSize: 17 }}>Case Coding Scenarios</h2>
        <span style={{ fontSize: 13, color: '#64748b' }}>{completedCount}/{CODING_SCENARIOS.length} completed</span>
      </div>

      {/* Progress bar */}
      <div style={{ background: '#e2e8f0', borderRadius: 8, height: 8, marginBottom: 16, overflow: 'hidden' }}>
        <div style={{ background: 'var(--accent)', height: '100%', width: `${(completedCount / CODING_SCENARIOS.length) * 100}%`, borderRadius: 8, transition: 'width 0.3s' }} />
      </div>

      {/* Difficulty filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto' }}>
        {[{ id: 'all', label: 'All' }, ...Object.entries(DIFFICULTY_COLORS).map(([id, v]) => ({ id, label: v.label }))].map(f => (
          <button key={f.id} onClick={() => setFilterDifficulty(f.id)}
            style={{ padding: '6px 14px', borderRadius: 20, border: 'none', background: filterDifficulty === f.id ? 'var(--primary)' : '#e2e8f0', color: filterDifficulty === f.id ? 'white' : '#475569', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {f.label}
          </button>
        ))}
      </div>

      {filteredScenarios.map(sc => (
        <button key={sc.id} onClick={() => { setSelectedScenario(sc); setShowResult(false); setUserAnswer({ codes: [], modifiers: [] }) }}
          style={{ display: 'block', width: '100%', textAlign: 'left', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0', background: completedScenarios[sc.id] ? '#f8fafc' : 'white', marginBottom: 10, cursor: 'pointer' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{completedScenarios[sc.id] ? '✅ ' : ''}{sc.title}</div>
              <div style={{ fontSize: 12, color: DIFFICULTY_COLORS[sc.difficulty].color, marginTop: 4, fontWeight: 600 }}>
                {DIFFICULTY_COLORS[sc.difficulty].label} · {sc.correctCodes.length} code{sc.correctCodes.length > 1 ? 's' : ''}
              </div>
            </div>
            <span style={{ fontSize: 20 }}>→</span>
          </div>
        </button>
      ))}
    </div>
  )
}

// ========== CONCEPTS ==========
function ConceptsView() {
  const [expandedId, setExpandedId] = useState(null)
  return (
    <div>
      <h2 style={{ fontSize: 17, marginBottom: 16 }}>Key Coding Concepts</h2>
      {CODING_CONCEPTS.map(concept => (
        <div key={concept.id} style={{ marginBottom: 10 }}>
          <button onClick={() => setExpandedId(expandedId === concept.id ? null : concept.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0', background: expandedId === concept.id ? '#f0f9ff' : 'white', cursor: 'pointer' }}>
            <span style={{ fontSize: 24 }}>{concept.icon}</span>
            <span style={{ fontSize: 15, fontWeight: 600, flex: 1 }}>{concept.title}</span>
            <span style={{ fontSize: 16, transform: expandedId === concept.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
          </button>
          {expandedId === concept.id && (
            <div style={{ padding: '16px 20px', background: '#f8fafc', borderRadius: '0 0 12px 12px', fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-line', marginTop: -4 }}>
              {concept.content.replace(/\*\*(.*?)\*\*/g, '$1')}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ========== FLASH CARDS ==========
function FlashCardsView() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [filterCat, setFilterCat] = useState('all')
  const [score, setScore] = useState({ correct: 0, wrong: 0 })
  const [shuffledCards, setShuffledCards] = useState(() => {
    return [...FLASH_CARDS].sort(() => Math.random() - 0.5)
  })

  const filteredCards = useMemo(() =>
    filterCat === 'all' ? shuffledCards : shuffledCards.filter(c => c.category === filterCat),
    [filterCat, shuffledCards]
  )

  const card = filteredCards[currentIndex]

  const handleNext = (correct) => {
    setScore(prev => ({ ...prev, [correct ? 'correct' : 'wrong']: prev[correct ? 'correct' : 'wrong'] + 1 }))
    setShowAnswer(false)
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex(prev => prev + 1)
    } else {
      setCurrentIndex(0)
      setShuffledCards(prev => [...prev].sort(() => Math.random() - 0.5))
    }
  }

  if (!card) return <p style={{ color: '#64748b', textAlign: 'center', padding: 40 }}>No cards in this category</p>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ fontSize: 17 }}>Flash Cards</h2>
        <span style={{ fontSize: 13, color: '#64748b' }}>
          ✅ {score.correct} · ❌ {score.wrong} · {currentIndex + 1}/{filteredCards.length}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto' }}>
        {[{ id: 'all', label: 'All' }, { id: 'cpt', label: 'CPT' }, { id: 'modifier', label: 'Modifiers' }, { id: 'concept', label: 'Concepts' }].map(f => (
          <button key={f.id} onClick={() => { setFilterCat(f.id); setCurrentIndex(0); setShowAnswer(false) }}
            style={{ padding: '6px 14px', borderRadius: 20, border: 'none', background: filterCat === f.id ? 'var(--primary)' : '#e2e8f0', color: filterCat === f.id ? 'white' : '#475569', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {f.label}
          </button>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: 16, border: '2px solid #e2e8f0', overflow: 'hidden', minHeight: 200 }}>
        {/* Question */}
        <div style={{ padding: 24, textAlign: 'center', borderBottom: showAnswer ? '2px solid #e2e8f0' : 'none' }}>
          <div style={{ fontSize: 12, color: DIFFICULTY_COLORS[card.difficulty]?.color || '#64748b', fontWeight: 600, marginBottom: 12 }}>
            {DIFFICULTY_COLORS[card.difficulty]?.label || card.difficulty}
          </div>
          <p style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.5 }}>{card.q}</p>
        </div>

        {/* Answer */}
        {showAnswer ? (
          <div style={{ padding: 24, background: '#f0fdf4' }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#166534', textAlign: 'center', lineHeight: 1.5 }}>{card.a}</p>
          </div>
        ) : (
          <div style={{ padding: 24, textAlign: 'center' }}>
            <button onClick={() => setShowAnswer(true)}
              style={{ padding: '12px 32px', borderRadius: 12, background: 'var(--primary)', color: 'white', border: 'none', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
              Show Answer
            </button>
          </div>
        )}
      </div>

      {showAnswer && (
        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <button onClick={() => handleNext(false)}
            style={{ flex: 1, padding: 14, borderRadius: 12, background: '#fee2e2', color: '#991b1b', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
            ❌ Got it Wrong
          </button>
          <button onClick={() => handleNext(true)}
            style={{ flex: 1, padding: 14, borderRadius: 12, background: '#dcfce7', color: '#166534', border: 'none', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
            ✅ Got it Right
          </button>
        </div>
      )}
    </div>
  )
}

// ========== MODIFIER REFERENCE ==========
function ModifierReference() {
  const [expandedMod, setExpandedMod] = useState(null)
  return (
    <div>
      <h2 style={{ fontSize: 17, marginBottom: 16 }}>Modifier Reference</h2>
      {Object.entries(MODIFIERS).map(([code, info]) => (
        <button key={code} onClick={() => setExpandedMod(expandedMod === code ? null : code)}
          style={{ display: 'block', width: '100%', textAlign: 'left', padding: 14, borderRadius: 12, border: '1px solid #e2e8f0', background: expandedMod === code ? '#f0f9ff' : 'white', marginBottom: 8, cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 16, color: 'var(--primary)', minWidth: 40 }}>-{code}</span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{info.name}</span>
          </div>
          {expandedMod === code && (
            <div style={{ marginTop: 10, padding: '10px 12px', background: '#f8fafc', borderRadius: 8, fontSize: 13, lineHeight: 1.6, color: '#475569' }}>
              {info.desc}
            </div>
          )}
        </button>
      ))}
    </div>
  )
}

// ========== MAIN CODING ACADEMY ==========
export default function CodingAcademy() {
  const [activeSubTab, setActiveSubTab] = useState('scenarios')

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 32, marginBottom: 4 }}>🏫</div>
        <h1 style={{ fontSize: 20, marginBottom: 4 }}>Coding Academy</h1>
        <p style={{ fontSize: 13, color: '#64748b' }}>Learn to code like you bill — accurately and completely</p>
        <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 6, lineHeight: 1.4, maxWidth: 340, marginLeft: 'auto', marginRight: 'auto' }}>
          ⚠️ Educational purposes only. Not a substitute for professional coding guidance. Verify all codes with your institution's billing department.
        </p>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#f1f5f9', borderRadius: 12, padding: 4 }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveSubTab(tab.id)}
            style={{ flex: 1, padding: '10px 4px', borderRadius: 10, border: 'none', background: activeSubTab === tab.id ? 'white' : 'transparent', color: activeSubTab === tab.id ? 'var(--primary)' : '#64748b', fontSize: 12, fontWeight: 600, cursor: 'pointer', boxShadow: activeSubTab === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', lineHeight: 1.3 }}>
            <div>{tab.label.split(' ')[0]}</div>
            <div style={{ fontSize: 10, fontWeight: 400, marginTop: 2 }}>{tab.desc}</div>
          </button>
        ))}
      </div>

      {activeSubTab === 'scenarios' && <ScenarioTrainer />}
      {activeSubTab === 'concepts' && <ConceptsView />}
      {activeSubTab === 'flash' && <FlashCardsView />}
      {activeSubTab === 'modifiers' && <ModifierReference />}
    </div>
  )
}
