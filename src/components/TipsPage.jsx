import React from 'react'

export default function TipsPage({ tips, onNewTip }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>💡 Tips & Tricks</h2>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{tips.length} tips</span>
      </div>

      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.5 }}>
        Pearls and techniques shared by residents and faculty. Tap + to add your own.
      </p>

      {tips.map(tip => (
        <div key={tip.id} className="tip-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h4>{tip.title}</h4>
            {tip.category && (
              <span className="badge badge-primary" style={{ flexShrink: 0, marginLeft: 8 }}>
                {tip.category}
              </span>
            )}
          </div>
          <p style={{ marginTop: 8 }}>{tip.body}</p>
          {tip.tags && tip.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
              {tip.tags.map((tag, i) => (
                <span key={i} style={{ fontSize: 11, color: '#78350f', background: 'rgba(120,53,15,0.1)', padding: '2px 8px', borderRadius: 12 }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
          <div className="tip-meta">
            <span>By {tip.createdBy} · {formatDate(tip.createdAt)}</span>
            <span>❤️ {tip.likes}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
