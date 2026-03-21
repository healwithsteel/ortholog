import React from 'react'

export default function CaseDetail({ caseData, onBack }) {
  const c = caseData
  
  return (
    <div>
      <button 
        onClick={onBack} 
        style={{ background: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 4 }}
      >
        ← Back to Cases
      </button>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>{c.procedure}</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>CPT {c.cptCode} · {formatDate(c.date)}</p>
          </div>
          <span className={`badge badge-${c.role.includes('Primary') ? 'primary' : 'accent'}`}>
            {c.role}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <InfoBlock label="Attending" value={c.attending} />
          <InfoBlock label="Approach" value={c.approach} />
          <InfoBlock label="Category" value={Array.isArray(c.category) ? c.category.join(', ') : c.category} />
          <InfoBlock label="Body Region" value={c.bodyRegion} />
        </div>

        {c.position && (
          <div style={{ marginBottom: 16 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Patient Position</h4>
            <p style={{ fontSize: 15 }}>{c.position}</p>
          </div>
        )}

        {c.implants && c.implants.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Implants</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {c.implants.map((imp, i) => (
                <span key={i} className="badge badge-primary">{imp}</span>
              ))}
            </div>
          </div>
        )}

        {c.reductionAids && c.reductionAids.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Reduction Aids & Equipment</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {c.reductionAids.map((aid, i) => (
                <span key={i} className="badge badge-accent">{aid}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {c.notes && (
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>📝 Case Notes</h3>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--text)' }}>{c.notes}</p>
        </div>
      )}

      {c.tips && (
        <div className="tip-card">
          <h4>💡 Tip</h4>
          <p>{c.tips}</p>
          <div className="tip-meta">
            <span>From: {c.createdBy}</span>
          </div>
        </div>
      )}

      {c.xrayUrls && c.xrayUrls.length > 0 && (
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>🩻 X-Rays</h3>
          <div className="image-grid">
            {c.xrayUrls.map((url, i) => (
              <img key={i} src={url} alt={`Case X-ray ${i + 1}`} />
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button className="btn btn-outline btn-sm" style={{ flex: 1 }}>
          📤 Share Case
        </button>
        <button className="btn btn-outline btn-sm" style={{ flex: 1 }}>
          ✏️ Edit
        </button>
      </div>

      <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 16 }}>
        Logged by {c.createdBy} · {new Date(c.createdAt).toLocaleDateString()}
      </p>
    </div>
  )
}

function InfoBlock({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 500, marginTop: 2 }}>{value}</div>
    </div>
  )
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}
