import React, { useState, useMemo } from 'react'

export default function CaseList({ cases, onSelectCase }) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeAttending, setActiveAttending] = useState('all')
  const [sortBy, setSortBy] = useState('date') // date | attending | category | role

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'trauma', label: 'Trauma' },
    { id: 'recon', label: 'Recon' },
    { id: 'sports', label: 'Sports' },
    { id: 'spine', label: 'Spine' },
    { id: 'peds', label: 'Peds' },
    { id: 'hand', label: 'Hand' },
    { id: 'foot', label: 'Foot/Ankle' },
  ]

  // Extract unique attendings from case data
  const attendings = useMemo(() => {
    const names = [...new Set(cases.map(c => c.attending).filter(Boolean))]
    names.sort()
    return names
  }, [cases])

  // Attending case counts
  const attendingCounts = useMemo(() => {
    const counts = {}
    cases.forEach(c => {
      if (c.attending) {
        counts[c.attending] = (counts[c.attending] || 0) + 1
      }
    })
    return counts
  }, [cases])

  const filtered = useMemo(() => {
    const result = cases.filter(c => {
      const matchesSearch = search === '' || 
        c.procedure.toLowerCase().includes(search.toLowerCase()) ||
        c.cptCode.includes(search) ||
        c.attending.toLowerCase().includes(search.toLowerCase()) ||
        (c.position && c.position.toLowerCase().includes(search.toLowerCase())) ||
        (c.implants && c.implants.some(imp => imp.toLowerCase().includes(search.toLowerCase()))) ||
        (c.reductionAids && c.reductionAids.some(aid => aid.toLowerCase().includes(search.toLowerCase())))

      const cat = Array.isArray(c.category) ? c.category : [c.category]
      const matchesCategory = activeCategory === 'all' || cat.includes(activeCategory)

      const matchesAttending = activeAttending === 'all' || c.attending === activeAttending

      return matchesSearch && matchesCategory && matchesAttending
    })

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'attending':
          return (a.attending || '').localeCompare(b.attending || '') || new Date(b.date) - new Date(a.date)
        case 'category': {
          const catA = Array.isArray(a.category) ? a.category[0] : a.category
          const catB = Array.isArray(b.category) ? b.category[0] : b.category
          return (catA || '').localeCompare(catB || '') || new Date(b.date) - new Date(a.date)
        }
        case 'role':
          return (a.role || '').localeCompare(b.role || '') || new Date(b.date) - new Date(a.date)
        case 'date':
        default:
          return new Date(b.date) - new Date(a.date)
      }
    })

    return result
  }, [cases, search, activeCategory, activeAttending, sortBy])

  // Stats for the filtered view
  const stats = useMemo(() => {
    if (activeAttending === 'all') return null
    const attendingCases = filtered
    const implantMap = {}
    const reductionMap = {}
    const approachMap = {}
    const positionMap = {}
    let primaryCount = 0

    attendingCases.forEach(c => {
      if (c.role?.includes('Primary')) primaryCount++
      if (c.approach) approachMap[c.approach] = (approachMap[c.approach] || 0) + 1
      if (c.position) positionMap[c.position] = (positionMap[c.position] || 0) + 1
      ;(c.implants || []).forEach(imp => { implantMap[imp] = (implantMap[imp] || 0) + 1 })
      ;(c.reductionAids || []).forEach(aid => { reductionMap[aid] = (reductionMap[aid] || 0) + 1 })
    })

    return {
      total: attendingCases.length,
      primaryCount,
      topApproaches: Object.entries(approachMap).sort((a, b) => b[1] - a[1]).slice(0, 5),
      topImplants: Object.entries(implantMap).sort((a, b) => b[1] - a[1]).slice(0, 5),
      topReductionAids: Object.entries(reductionMap).sort((a, b) => b[1] - a[1]).slice(0, 5),
      topPositions: Object.entries(positionMap).sort((a, b) => b[1] - a[1]).slice(0, 5),
    }
  }, [filtered, activeAttending])

  return (
    <div>
      <div className="search-bar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input 
          type="text" 
          placeholder="Search procedures, CPT, attendings, implants..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Attending filter */}
      {attendings.length > 1 && (
        <div style={{ margin: '8px 0' }}>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
            <button
              className={`category-pill ${activeAttending === 'all' ? 'active' : ''}`}
              onClick={() => setActiveAttending('all')}
              style={{ whiteSpace: 'nowrap', fontSize: 13 }}
            >
              👨‍⚕️ All Attendings
            </button>
            {attendings.map(att => (
              <button
                key={att}
                className={`category-pill ${activeAttending === att ? 'active' : ''}`}
                onClick={() => setActiveAttending(att)}
                style={{ whiteSpace: 'nowrap', fontSize: 13 }}
              >
                {att.split(',')[0]} ({attendingCounts[att] || 0})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category filter */}
      <div className="category-pills">
        {categories.map(cat => (
          <button 
            key={cat.id}
            className={`category-pill ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Sort control */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0', fontSize: 13 }}>
        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Sort:</span>
        {[
          { id: 'date', label: '📅 Date' },
          { id: 'attending', label: '👨‍⚕️ Attending' },
          { id: 'category', label: '📂 Category' },
          { id: 'role', label: '🎯 Role' },
        ].map(s => (
          <button
            key={s.id}
            onClick={() => setSortBy(s.id)}
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              border: '1px solid var(--border)',
              background: sortBy === s.id ? 'var(--navy)' : 'white',
              color: sortBy === s.id ? 'white' : 'var(--text)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Attending stats card (when filtered to a specific attending) */}
      {stats && (
        <div className="card" style={{ background: '#f0f4f8', marginBottom: 12 }}>
          <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>
            📊 {activeAttending.split(',')[0]} — {stats.total} Cases
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
            <div>
              <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Your role as primary:</span>
              <div style={{ fontWeight: 700 }}>{stats.primaryCount} ({stats.total > 0 ? Math.round(stats.primaryCount / stats.total * 100) : 0}%)</div>
            </div>
            {stats.topApproaches.length > 0 && (
              <div>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Top approaches:</span>
                {stats.topApproaches.map(([name, count]) => (
                  <div key={name} style={{ fontSize: 12 }}>{name} ({count})</div>
                ))}
              </div>
            )}
            {stats.topImplants.length > 0 && (
              <div>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Preferred implants:</span>
                {stats.topImplants.map(([name, count]) => (
                  <div key={name} style={{ fontSize: 12 }}>{name} ({count})</div>
                ))}
              </div>
            )}
            {stats.topReductionAids.length > 0 && (
              <div>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Common equipment:</span>
                {stats.topReductionAids.map(([name, count]) => (
                  <div key={name} style={{ fontSize: 12 }}>{name} ({count})</div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>{filtered.length} Cases</h3>
        </div>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <h3>No cases found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          filtered.map(c => {
            // Group header when sorted by attending
            const showGroupHeader = sortBy === 'attending'
            return (
              <div key={c.id} className="case-item" onClick={() => onSelectCase(c)} style={{ cursor: 'pointer' }}>
                <div className="case-icon" style={{ background: getCategoryColor(c.category) }}>
                  {getCategoryIcon(c.category)}
                </div>
                <div className="case-info">
                  <h4>{c.procedure}</h4>
                  <p>CPT {c.cptCode} · {c.attending.split(',')[0]}</p>
                  {c.implants && c.implants.length > 0 && (
                    <p style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                      🔩 {c.implants.slice(0, 2).join(', ')}{c.implants.length > 2 ? ` +${c.implants.length - 2}` : ''}
                    </p>
                  )}
                </div>
                <div className="case-meta">
                  <div className="date">{formatDate(c.date)}</div>
                  <span className={`badge badge-${c.role.includes('Primary') ? 'primary' : 'accent'}`} style={{ marginTop: 4 }}>
                    {c.role.includes('Primary') ? 'Primary' : 'Assist'}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

function getCategoryIcon(cat) {
  const c = Array.isArray(cat) ? cat[0] : cat
  const icons = { trauma: '🦴', recon: '🔧', sports: '⚽', spine: '🧬', peds: '👶', hand: '🤚', foot: '🦶' }
  return icons[c] || '📋'
}

function getCategoryColor(cat) {
  const c = Array.isArray(cat) ? cat[0] : cat
  const colors = { trauma: '#fee2e2', recon: '#dbeafe', sports: '#d1fae5', spine: '#e0e7ff', peds: '#fef3c7', hand: '#fce7f3', foot: '#f3e8ff' }
  return colors[c] || '#f3f4f6'
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
