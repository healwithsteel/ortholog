import React, { useState, useMemo } from 'react'
import { CPT_CODES, CPT_CATEGORIES } from '../data/cptCodes'

export default function CPTLibrary() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  const filtered = useMemo(() => {
    return CPT_CODES.filter(c => {
      const matchesSearch = search === '' ||
        c.code.includes(search) ||
        c.desc.toLowerCase().includes(search.toLowerCase()) ||
        c.body.toLowerCase().includes(search.toLowerCase())

      const cats = Array.isArray(c.category) ? c.category : [c.category]
      const matchesCategory = activeCategory === 'all' || cats.includes(activeCategory)

      return matchesSearch && matchesCategory
    })
  }, [search, activeCategory])

  const grouped = useMemo(() => {
    const groups = {}
    filtered.forEach(c => {
      const key = c.body || 'other'
      if (!groups[key]) groups[key] = []
      groups[key].push(c)
    })
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
  }, [filtered])

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>🔍 CPT Code Library</h2>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
        {CPT_CODES.length} orthopaedic CPT codes · Search by code, procedure, or body region
      </p>

      <div className="search-bar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          type="text"
          placeholder="Search CPT code, procedure, body region..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="category-pills">
        {CPT_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className={`category-pill ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
        {filtered.length} codes found
      </p>

      {grouped.map(([region, codes]) => (
        <div key={region} className="card" style={{ marginBottom: 12 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: 'capitalize', color: 'var(--primary)', marginBottom: 8 }}>
            {region}
          </h3>
          {codes.map(c => (
            <div key={c.code} style={{ 
              padding: '10px 0', 
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              gap: 12,
              alignItems: 'flex-start'
            }}>
              <span style={{ 
                fontFamily: 'monospace', 
                fontWeight: 700, 
                fontSize: 14,
                color: 'var(--primary)',
                flexShrink: 0,
                minWidth: 52
              }}>
                {c.code}
              </span>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 14 }}>{c.desc}</span>
                <div style={{ marginTop: 4, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {(Array.isArray(c.category) ? c.category : [c.category]).map(cat => (
                    <span key={cat} style={{
                      fontSize: 10,
                      padding: '2px 6px',
                      borderRadius: 8,
                      background: 'var(--bg)',
                      color: 'var(--text-muted)',
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}>
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="empty-state">
          <h3>No codes found</h3>
          <p>Try adjusting your search or category filter</p>
        </div>
      )}
    </div>
  )
}
