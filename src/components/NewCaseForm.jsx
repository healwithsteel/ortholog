import React, { useState } from 'react'

export default function NewCaseForm({ onSubmit, onClose, cptCodes, reductionAids, implantTypes, approaches, attendings }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    cptCode: '',
    procedure: '',
    category: 'trauma',
    bodyRegion: '',
    approach: '',
    attending: attendings[0]?.name || '',
    role: 'First assistant',
    position: '',
    implants: [],
    reductionAids: [],
    notes: '',
    tips: '',
    shared: true,
    xrayUrls: [],
  })
  const [cptSearch, setCptSearch] = useState('')
  const [showCptPicker, setShowCptPicker] = useState(false)

  const filteredCpt = cptCodes.filter(c => 
    cptSearch && (
      c.code.includes(cptSearch) || 
      c.desc.toLowerCase().includes(cptSearch.toLowerCase())
    )
  ).slice(0, 10)

  const handleCptSelect = (cpt) => {
    const cat = Array.isArray(cpt.category) ? cpt.category[0] : cpt.category
    setForm(f => ({
      ...f,
      cptCode: cpt.code,
      procedure: cpt.desc,
      category: cat,
      bodyRegion: cpt.body,
    }))
    setCptSearch('')
    setShowCptPicker(false)
  }

  const toggleArrayItem = (field, item) => {
    setForm(f => ({
      ...f,
      [field]: f[field].includes(item)
        ? f[field].filter(x => x !== item)
        : [...f[field], item]
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.cptCode || !form.procedure) {
      alert('Please select a CPT code')
      return
    }
    onSubmit(form)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Log New Case</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Date</label>
            <input 
              type="date" 
              value={form.date} 
              onChange={e => setForm(f => ({...f, date: e.target.value}))} 
            />
          </div>

          <div className="form-group">
            <label>CPT Code & Procedure</label>
            <input 
              type="text" 
              placeholder="Search CPT code or procedure name..."
              value={showCptPicker ? cptSearch : (form.cptCode ? `${form.cptCode} — ${form.procedure}` : '')}
              onChange={e => { setCptSearch(e.target.value); setShowCptPicker(true); }}
              onFocus={() => setShowCptPicker(true)}
            />
            {showCptPicker && filteredCpt.length > 0 && (
              <div style={{ border: '1px solid var(--border)', borderRadius: 8, marginTop: 4, maxHeight: 200, overflowY: 'auto', background: 'white' }}>
                {filteredCpt.map(cpt => (
                  <div 
                    key={cpt.code} 
                    onClick={() => handleCptSelect(cpt)}
                    style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border)', fontSize: 14 }}
                  >
                    <strong>{cpt.code}</strong> — {cpt.desc}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Approach</label>
            <select value={form.approach} onChange={e => setForm(f => ({...f, approach: e.target.value}))}>
              <option value="">Select approach...</option>
              {approaches.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Attending Surgeon</label>
            <select value={form.attending} onChange={e => setForm(f => ({...f, attending: e.target.value}))}>
              {attendings.map(a => <option key={a.name} value={a.name}>{a.name}</option>)}
              <option value="_other">Other...</option>
            </select>
          </div>

          <div className="form-group">
            <label>Your Role</label>
            <select value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value}))}>
              <option value="Primary surgeon (supervised)">Primary surgeon (supervised)</option>
              <option value="First assistant">First assistant</option>
              <option value="Second assistant">Second assistant</option>
              <option value="Observer">Observer</option>
            </select>
          </div>

          <div className="form-group">
            <label>Patient Position</label>
            <input 
              type="text" 
              placeholder="e.g., Supine on fracture table"
              value={form.position}
              onChange={e => setForm(f => ({...f, position: e.target.value}))}
            />
          </div>

          <div className="form-group">
            <label>Implants Used</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxHeight: 150, overflowY: 'auto' }}>
              {implantTypes.slice(0, 20).map(imp => (
                <button
                  type="button"
                  key={imp}
                  className={`category-pill ${form.implants.includes(imp) ? 'active' : ''}`}
                  onClick={() => toggleArrayItem('implants', imp)}
                  style={{ fontSize: 12 }}
                >
                  {imp}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Reduction Aids / Equipment</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxHeight: 150, overflowY: 'auto' }}>
              {reductionAids.slice(0, 15).map(aid => (
                <button
                  type="button"
                  key={aid}
                  className={`category-pill ${form.reductionAids.includes(aid) ? 'active' : ''}`}
                  onClick={() => toggleArrayItem('reductionAids', aid)}
                  style={{ fontSize: 12 }}
                >
                  {aid}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Case Notes</label>
            <textarea 
              placeholder="Key observations, technique details, complications..."
              value={form.notes}
              onChange={e => setForm(f => ({...f, notes: e.target.value}))}
            />
          </div>

          <div className="form-group">
            <label>💡 Tip or Pearl (optional)</label>
            <textarea 
              placeholder="Something you learned that would help others..."
              value={form.tips}
              onChange={e => setForm(f => ({...f, tips: e.target.value}))}
              style={{ minHeight: 80 }}
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input 
                type="checkbox" 
                checked={form.shared} 
                onChange={e => setForm(f => ({...f, shared: e.target.checked}))}
                style={{ width: 18, height: 18 }}
              />
              Share with fellow residents
            </label>
          </div>

          <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: 8 }}>
            📋 Log Case
          </button>
        </form>
      </div>
    </div>
  )
}
