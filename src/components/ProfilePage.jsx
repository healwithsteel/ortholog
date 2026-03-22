import React, { useState } from 'react'

export default function ProfilePage({ user, onUpdateUser, cases, onExport, onSignOut }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ ...user })

  const casesByCategory = {}
  cases.forEach(c => {
    const cats = Array.isArray(c.category) ? c.category : [c.category]
    cats.forEach(cat => {
      casesByCategory[cat] = (casesByCategory[cat] || 0) + 1
    })
  })

  const casesByAttending = {}
  cases.forEach(c => {
    const name = c.attending.split(',')[0]
    casesByAttending[name] = (casesByAttending[name] || 0) + 1
  })

  const casesByRole = {
    primary: cases.filter(c => c.role.includes('Primary')).length,
    assist: cases.filter(c => c.role.includes('assistant') || c.role.includes('assist')).length,
    observer: cases.filter(c => c.role.includes('Observer')).length,
  }

  const handleSave = () => {
    onUpdateUser(form)
    setEditing(false)
  }

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700 }}>{user.displayName}</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: 2 }}>
              PGY-{user.pgyYear} · Class of {user.classYear}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{user.program}</p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => setEditing(!editing)}>
            {editing ? 'Cancel' : '✏️ Edit'}
          </button>
        </div>

        {editing && (
          <div style={{ marginTop: 16 }}>
            <div className="form-group">
              <label>Display Name</label>
              <input value={form.displayName} onChange={e => setForm(f => ({...f, displayName: e.target.value}))} />
            </div>
            <div className="form-group">
              <label>PGY Year</label>
              <select value={form.pgyYear} onChange={e => setForm(f => ({...f, pgyYear: parseInt(e.target.value)}))}>
                {[1,2,3,4,5].map(y => <option key={y} value={y}>PGY-{y}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Email</label>
              <input value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} />
            </div>
            <button className="btn btn-primary btn-sm" onClick={handleSave}>Save</button>
          </div>
        )}
      </div>

      <div className="card">
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>📊 Case Analytics</h3>
        
        <div style={{ marginBottom: 16 }}>
          <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>By Category</h4>
          {Object.entries(casesByCategory).sort((a,b) => b[1] - a[1]).map(([cat, count]) => (
            <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, textTransform: 'capitalize', minWidth: 80 }}>{cat}</span>
              <div style={{ flex: 1, background: 'var(--bg)', borderRadius: 4, height: 20, overflow: 'hidden' }}>
                <div style={{ 
                  width: `${(count / cases.length) * 100}%`, 
                  height: '100%', 
                  background: 'var(--primary)',
                  borderRadius: 4,
                  minWidth: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  paddingRight: 6
                }}>
                  <span style={{ fontSize: 11, color: 'white', fontWeight: 700 }}>{count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 16 }}>
          <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>By Role</h4>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1, background: '#e0e7ff', borderRadius: 8, padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--primary)' }}>{casesByRole.primary}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>PRIMARY</div>
            </div>
            <div style={{ flex: 1, background: '#fef3c7', borderRadius: 8, padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#92400e' }}>{casesByRole.assist}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>ASSIST</div>
            </div>
            <div style={{ flex: 1, background: '#d1fae5', borderRadius: 8, padding: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#065f46' }}>{casesByRole.observer}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>OBSERVE</div>
            </div>
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>By Attending</h4>
          {Object.entries(casesByAttending).sort((a,b) => b[1] - a[1]).map(([name, count]) => (
            <div key={name} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 14 }}>{name}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>⚙️ Settings</h3>
        <button className="btn btn-outline btn-block btn-sm" onClick={onExport} style={{ marginBottom: 8 }}>
          📥 Export All Data (JSON)
        </button>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
          Download a backup of all your cases, tips, and profile data
        </p>
      </div>

      {onSignOut && (
        <button
          onClick={onSignOut}
          style={{
            display: 'block',
            width: '100%',
            padding: '12px 16px',
            background: 'rgba(255,80,80,0.1)',
            border: '1px solid rgba(255,80,80,0.3)',
            borderRadius: 10,
            color: '#ff6b6b',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            marginTop: 16,
          }}
        >
          Sign Out
        </button>
      )}

      <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 20, marginBottom: 20 }}>
        OrthoLog v1.0 · Built for UCF/HCA Ocala Orthopaedic Surgery
      </p>
    </div>
  )
}
