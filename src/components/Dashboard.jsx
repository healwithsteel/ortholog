import React from 'react'

export default function Dashboard({ stats, cases, tips, onSelectCase }) {
  const recentCases = cases.slice(0, 5)
  const recentTips = tips.slice(0, 2)

  return (
    <div>
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-number">{stats.totalCases}</div>
          <div className="stat-label">Total Cases</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.thisMonth}</div>
          <div className="stat-label">This Month</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.attendings}</div>
          <div className="stat-label">Attendings</div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700 }}>Recent Cases</h3>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{cases.length} total</span>
        </div>
        {recentCases.map(c => (
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
        ))}
      </div>

      {recentTips.length > 0 && (
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>💡 Latest Tips</h3>
          {recentTips.map(tip => (
            <div key={tip.id} className="tip-card">
              <h4>{tip.title}</h4>
              <p>{tip.body.substring(0, 150)}...</p>
              <div className="tip-meta">
                <span>By {tip.createdBy}</span>
                <span>❤️ {tip.likes}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function getCategoryIcon(cat) {
  const c = Array.isArray(cat) ? cat[0] : cat
  const icons = { trauma: '🦴', recon: '🔧', sports: '⚽', spine: '🧬', peds: '👶', hand: '🤚', foot: '🦶', upper: '💪', lower: '🦵' }
  return icons[c] || '📋'
}

function getCategoryColor(cat) {
  const c = Array.isArray(cat) ? cat[0] : cat
  const colors = { trauma: '#fee2e2', recon: '#dbeafe', sports: '#d1fae5', spine: '#e0e7ff', peds: '#fef3c7', hand: '#fce7f3', foot: '#f3e8ff', upper: '#dbeafe', lower: '#d1fae5' }
  return colors[c] || '#f3f4f6'
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
