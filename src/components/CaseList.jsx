import React, { useState } from 'react'

export default function CaseList({ cases, onSelectCase }) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

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

  const filtered = cases.filter(c => {
    const matchesSearch = search === '' || 
      c.procedure.toLowerCase().includes(search.toLowerCase()) ||
      c.cptCode.includes(search) ||
      c.attending.toLowerCase().includes(search.toLowerCase())
    
    const cat = Array.isArray(c.category) ? c.category : [c.category]
    const matchesCategory = activeCategory === 'all' || cat.includes(activeCategory)
    
    return matchesSearch && matchesCategory
  })

  return (
    <div>
      <div className="search-bar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input 
          type="text" 
          placeholder="Search procedures, CPT codes, attendings..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

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

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>{filtered.length} Cases</h3>
        </div>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <h3>No cases found</h3>
            <p>Try adjusting your search or category filter</p>
          </div>
        ) : (
          filtered.map(c => (
            <div key={c.id} className="case-item" onClick={() => onSelectCase(c)} style={{ cursor: 'pointer' }}>
              <div className="case-icon" style={{ background: getCategoryColor(c.category) }}>
                {getCategoryIcon(c.category)}
              </div>
              <div className="case-info">
                <h4>{c.procedure}</h4>
                <p>CPT {c.cptCode} · {c.attending.split(',')[0]}</p>
              </div>
              <div className="case-meta">
                <div className="date">{formatDate(c.date)}</div>
                <span className={`badge badge-${c.role.includes('Primary') ? 'primary' : 'accent'}`} style={{ marginTop: 4 }}>
                  {c.role.includes('Primary') ? 'Primary' : 'Assist'}
                </span>
              </div>
            </div>
          ))
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
