import React, { useState } from 'react'

export default function NewTipForm({ onSubmit, onClose }) {
  const [form, setForm] = useState({
    title: '',
    body: '',
    category: 'trauma',
    procedure: '',
    tags: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title || !form.body) {
      alert('Title and content are required')
      return
    }
    onSubmit({
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>💡 Share a Tip</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input 
              type="text" 
              placeholder="e.g., Cephalomedullary nail start point"
              value={form.title}
              onChange={e => setForm(f => ({...f, title: e.target.value}))}
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}>
              <option value="trauma">Trauma</option>
              <option value="recon">Reconstruction</option>
              <option value="sports">Sports</option>
              <option value="spine">Spine</option>
              <option value="peds">Pediatrics</option>
              <option value="hand">Hand/Wrist</option>
              <option value="foot">Foot/Ankle</option>
              <option value="general">General</option>
            </select>
          </div>

          <div className="form-group">
            <label>Related Procedure (optional)</label>
            <input 
              type="text" 
              placeholder="e.g., ORIF distal radius"
              value={form.procedure}
              onChange={e => setForm(f => ({...f, procedure: e.target.value}))}
            />
          </div>

          <div className="form-group">
            <label>Your Tip</label>
            <textarea 
              placeholder="Share what you learned — technique details, pearls, things to watch out for..."
              value={form.body}
              onChange={e => setForm(f => ({...f, body: e.target.value}))}
              style={{ minHeight: 150 }}
            />
          </div>

          <div className="form-group">
            <label>Tags (comma separated)</label>
            <input 
              type="text" 
              placeholder="e.g., femur, nail, start point"
              value={form.tags}
              onChange={e => setForm(f => ({...f, tags: e.target.value}))}
            />
          </div>

          <button type="submit" className="btn btn-accent btn-block" style={{ marginTop: 8 }}>
            💡 Share Tip
          </button>
        </form>
      </div>
    </div>
  )
}
