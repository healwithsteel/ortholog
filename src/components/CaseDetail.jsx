import React, { useState } from 'react'
import MediaUploader from './MediaUploader'
import { CPT_CODES, REDUCTION_AIDS, IMPLANT_TYPES, APPROACHES, DEFAULT_ATTENDINGS } from '../data/cptCodes'

export default function CaseDetail({ caseData, onBack, onUpdateCase, onDeleteCase }) {
  const [c, setC] = useState(caseData)
  const [xrayImages, setXrayImages] = useState(c.xrayImages || c.mediaItems || [])
  const [shareStatus, setShareStatus] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState(null)
  const [cptSearch, setCptSearch] = useState('')
  const [showCptPicker, setShowCptPicker] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleXrayChange = (images) => {
    setXrayImages(images)
    if (onUpdateCase) {
      const updated = {
        ...c,
        xrayImages: images.filter(m => m.type !== 'video').map(img => ({
          id: img.id, url: img.url, viewType: img.viewType,
          caption: img.caption, uploadedAt: img.uploadedAt, category: img.category,
        })),
        mediaItems: images.map(m => ({
          id: m.id, url: m.url, type: m.type || 'image', viewType: m.viewType,
          caption: m.caption, uploadedAt: m.uploadedAt, category: m.category,
        }))
      }
      setC(updated)
      onUpdateCase(updated)
    }
  }

  // --- SHARE ---
  const generateShareText = () => {
    const lines = [
      `🦴 OrthoLog Case`, ``,
      `📋 ${c.procedure}`,
      `CPT ${c.cptCode} · ${formatDate(c.date)}`, ``,
      `👨‍⚕️ Attending: ${c.attending}`,
      `🔧 Approach: ${c.approach}`,
      `📂 Category: ${Array.isArray(c.category) ? c.category.join(', ') : c.category}`,
      `🦴 Region: ${c.bodyRegion}`,
      `🎯 Role: ${c.role}`,
    ]
    if (c.position) lines.push(`🛏️ Position: ${c.position}`)
    if (c.implants?.length) lines.push(`🔩 Implants: ${c.implants.join(', ')}`)
    if (c.reductionAids?.length) lines.push(`🛠️ Reduction Aids: ${c.reductionAids.join(', ')}`)
    if (c.notes) lines.push(``, `📝 Notes:`, c.notes)
    if (c.tips) lines.push(``, `💡 Tip:`, c.tips)
    if (xrayImages.length > 0) {
      const imgCount = xrayImages.filter(m => m.type !== 'video').length
      const vidCount = xrayImages.filter(m => m.type === 'video').length
      const parts = []
      if (imgCount > 0) parts.push(`${imgCount} image${imgCount > 1 ? 's' : ''}`)
      if (vidCount > 0) parts.push(`${vidCount} video${vidCount > 1 ? 's' : ''}`)
      lines.push(``, `🩻 ${parts.join(' + ')} attached`)
    }
    lines.push(``, `---`, `Shared via OrthoLog`)
    return lines.join('\n')
  }

  // Convert data URL to File object for Web Share API
  const dataUrlToFile = async (dataUrl, filename) => {
    const res = await fetch(dataUrl)
    const blob = await res.blob()
    return new File([blob], filename, { type: blob.type })
  }

  const handleShare = async () => {
    const text = generateShareText()
    const hasImages = xrayImages.length > 0

    // Try Web Share API with files (supports images on mobile)
    if (navigator.share) {
      try {
        const shareData = { title: `OrthoLog: ${c.procedure}`, text }

        // If we have images and canShare supports files
        if (hasImages && navigator.canShare) {
          const files = []
          for (let i = 0; i < xrayImages.length; i++) {
            const img = xrayImages[i]
            if (img.url && img.url.startsWith('data:')) {
              const file = await dataUrlToFile(
                img.url,
                `xray-${img.viewType}-${i + 1}.jpg`
              )
              files.push(file)
            }
          }
          if (files.length > 0) {
            const testShare = { ...shareData, files }
            if (navigator.canShare(testShare)) {
              shareData.files = files
            }
          }
        }

        await navigator.share(shareData)
        setShareStatus('shared')
        setTimeout(() => setShareStatus(null), 2000)
        return
      } catch (err) { if (err.name === 'AbortError') return }
    }

    // Fallback: copy text + offer image download
    try {
      await navigator.clipboard.writeText(text)
      setShareStatus('copied')
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'
      document.body.appendChild(ta); ta.select(); document.execCommand('copy')
      document.body.removeChild(ta)
      setShareStatus('copied')
    }

    // If images exist, also trigger download for desktop users
    if (hasImages) {
      xrayImages.forEach((img, i) => {
        if (img.url && img.url.startsWith('data:')) {
          const a = document.createElement('a')
          a.href = img.url
          a.download = `xray-${img.viewType}-${i + 1}.jpg`
          a.click()
        }
      })
    }

    setTimeout(() => setShareStatus(null), 2000)
  }

  // --- EDIT ---
  const startEdit = () => {
    setEditForm({
      date: c.date,
      cptCode: c.cptCode,
      procedure: c.procedure,
      category: Array.isArray(c.category) ? c.category[0] : c.category,
      bodyRegion: c.bodyRegion,
      approach: c.approach,
      attending: c.attending,
      role: c.role,
      position: c.position || '',
      implants: c.implants || [],
      reductionAids: c.reductionAids || [],
      notes: c.notes || '',
      tips: c.tips || '',
    })
    setIsEditing(true)
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setEditForm(null)
    setCptSearch('')
    setShowCptPicker(false)
  }

  const saveEdit = () => {
    if (!editForm.cptCode || !editForm.procedure) {
      alert('CPT code and procedure are required')
      return
    }
    const updated = { ...c, ...editForm }
    setC(updated)
    if (onUpdateCase) onUpdateCase(updated)
    setIsEditing(false)
    setEditForm(null)
    setSaveStatus('saved')
    setTimeout(() => setSaveStatus(null), 2000)
  }

  const toggleArrayItem = (field, item) => {
    setEditForm(f => ({
      ...f,
      [field]: f[field].includes(item) ? f[field].filter(x => x !== item) : [...f[field], item]
    }))
  }

  const filteredCpt = CPT_CODES.filter(cpt =>
    cptSearch && (cpt.code.includes(cptSearch) || cpt.desc.toLowerCase().includes(cptSearch.toLowerCase()))
  ).slice(0, 10)

  const handleCptSelect = (cpt) => {
    const cat = Array.isArray(cpt.category) ? cpt.category[0] : cpt.category
    setEditForm(f => ({ ...f, cptCode: cpt.code, procedure: cpt.desc, category: cat, bodyRegion: cpt.body }))
    setCptSearch('')
    setShowCptPicker(false)
  }

  // --- EDIT MODE RENDER ---
  if (isEditing && editForm) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <button onClick={cancelEdit} style={{ background: 'none', color: 'var(--text-muted)', fontWeight: 600, fontSize: 14 }}>
            ✕ Cancel
          </button>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>✏️ Edit Case</h2>
          <button onClick={saveEdit} style={{ background: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: 14 }}>
            ✓ Save
          </button>
        </div>

        <div className="card">
          <div className="form-group">
            <label style={labelStyle}>Date</label>
            <input type="date" value={editForm.date} onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))} style={inputStyle} />
          </div>

          <div className="form-group">
            <label style={labelStyle}>CPT Code & Procedure</label>
            <input
              type="text"
              placeholder="Search CPT code or procedure..."
              value={showCptPicker ? cptSearch : (editForm.cptCode ? `${editForm.cptCode} — ${editForm.procedure}` : '')}
              onChange={e => { setCptSearch(e.target.value); setShowCptPicker(true) }}
              onFocus={() => setShowCptPicker(true)}
              style={inputStyle}
            />
            {showCptPicker && filteredCpt.length > 0 && (
              <div style={{ border: '1px solid var(--border)', borderRadius: 8, marginTop: 4, maxHeight: 200, overflowY: 'auto', background: 'white' }}>
                {filteredCpt.map(cpt => (
                  <div key={cpt.code} onClick={() => handleCptSelect(cpt)}
                    style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border)', fontSize: 14 }}>
                    <strong>{cpt.code}</strong> — {cpt.desc}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label style={labelStyle}>Approach</label>
            <select value={editForm.approach} onChange={e => setEditForm(f => ({ ...f, approach: e.target.value }))} style={inputStyle}>
              <option value="">Select approach...</option>
              {APPROACHES.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label style={labelStyle}>Attending Surgeon</label>
            <select value={editForm.attending} onChange={e => setEditForm(f => ({ ...f, attending: e.target.value }))} style={inputStyle}>
              {DEFAULT_ATTENDINGS.map(a => <option key={a.name} value={a.name}>{a.name}</option>)}
              <option value="_other">Other...</option>
            </select>
          </div>

          <div className="form-group">
            <label style={labelStyle}>Your Role</label>
            <select value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))} style={inputStyle}>
              <option value="Primary surgeon (supervised)">Primary surgeon (supervised)</option>
              <option value="First assistant">First assistant</option>
              <option value="Second assistant">Second assistant</option>
              <option value="Observer">Observer</option>
            </select>
          </div>

          <div className="form-group">
            <label style={labelStyle}>Patient Position</label>
            <input type="text" placeholder="e.g., Supine on fracture table" value={editForm.position}
              onChange={e => setEditForm(f => ({ ...f, position: e.target.value }))} style={inputStyle} />
          </div>

          <div className="form-group">
            <label style={labelStyle}>Implants Used</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxHeight: 150, overflowY: 'auto' }}>
              {IMPLANT_TYPES.slice(0, 20).map(imp => (
                <button type="button" key={imp}
                  className={`category-pill ${editForm.implants.includes(imp) ? 'active' : ''}`}
                  onClick={() => toggleArrayItem('implants', imp)}
                  style={{ fontSize: 12 }}
                >{imp}</button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label style={labelStyle}>Reduction Aids / Equipment</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxHeight: 150, overflowY: 'auto' }}>
              {REDUCTION_AIDS.slice(0, 15).map(aid => (
                <button type="button" key={aid}
                  className={`category-pill ${editForm.reductionAids.includes(aid) ? 'active' : ''}`}
                  onClick={() => toggleArrayItem('reductionAids', aid)}
                  style={{ fontSize: 12 }}
                >{aid}</button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label style={labelStyle}>Case Notes</label>
            <textarea placeholder="Key observations, technique details, complications..."
              value={editForm.notes} onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
              style={{ ...inputStyle, minHeight: 100 }} />
          </div>

          <div className="form-group">
            <label style={labelStyle}>💡 Tip or Pearl</label>
            <textarea placeholder="Something you learned that would help others..."
              value={editForm.tips} onChange={e => setEditForm(f => ({ ...f, tips: e.target.value }))}
              style={{ ...inputStyle, minHeight: 80 }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button onClick={cancelEdit} className="btn btn-outline btn-sm" style={{ flex: 1 }}>Cancel</button>
          <button onClick={saveEdit} className="btn btn-sm" style={{ flex: 1, background: 'var(--primary)', color: 'white' }}>✓ Save Changes</button>
        </div>
      </div>
    )
  }

  // --- VIEW MODE RENDER ---
  return (
    <div>
      <button onClick={onBack}
        style={{ background: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 4 }}>
        ← Back to Cases
      </button>

      {saveStatus === 'saved' && (
        <div style={{ background: '#059669', color: 'white', padding: '8px 16px', borderRadius: 8, marginBottom: 12, fontSize: 14, fontWeight: 600, textAlign: 'center' }}>
          ✅ Changes saved!
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>{c.procedure}</h2>
            <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>CPT {c.cptCode} · {formatDate(c.date)}</p>
          </div>
          <span className={`badge badge-${c.role.includes('Primary') ? 'primary' : 'accent'}`}>{c.role}</span>
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
              {c.implants.map((imp, i) => <span key={i} className="badge badge-primary">{imp}</span>)}
            </div>
          </div>
        )}

        {c.reductionAids && c.reductionAids.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>Reduction Aids & Equipment</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {c.reductionAids.map((aid, i) => <span key={i} className="badge badge-accent">{aid}</span>)}
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
          <div className="tip-meta"><span>From: {c.createdBy}</span></div>
        </div>
      )}

      <div className="card">
        <MediaUploader caseId={c.id} existingImages={xrayImages} onImagesChange={handleXrayChange} />
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={handleShare}>
          {shareStatus === 'copied' ? '✅ Copied!' : shareStatus === 'shared' ? '✅ Shared!' : xrayImages.length > 0 ? `📤 Share + ${xrayImages.length} 📎` : '📤 Share Case'}
        </button>
        <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={startEdit}>
          ✏️ Edit
        </button>
      </div>

      {!showDeleteConfirm ? (
        <button
          onClick={() => setShowDeleteConfirm(true)}
          style={{
            width: '100%', marginTop: 12, padding: '10px 16px',
            background: 'none', border: '1px solid #ef4444', borderRadius: 8,
            color: '#ef4444', fontSize: 14, fontWeight: 600, cursor: 'pointer'
          }}
        >
          🗑️ Delete Case
        </button>
      ) : (
        <div style={{
          marginTop: 12, padding: 16, background: '#fef2f2', border: '1px solid #fecaca',
          borderRadius: 12, textAlign: 'center'
        }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#991b1b', marginBottom: 4 }}>
            Delete this case?
          </p>
          <p style={{ fontSize: 13, color: '#b91c1c', marginBottom: 12 }}>
            "{c.procedure}" — {formatDate(c.date)}
          </p>
          <p style={{ fontSize: 12, color: '#dc2626', marginBottom: 16 }}>
            This cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              style={{
                flex: 1, padding: '10px 16px', background: 'white',
                border: '1px solid var(--border)', borderRadius: 8,
                fontSize: 14, fontWeight: 600, cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => onDeleteCase && onDeleteCase(c.id)}
              style={{
                flex: 1, padding: '10px 16px', background: '#dc2626',
                border: 'none', borderRadius: 8, color: 'white',
                fontSize: 14, fontWeight: 700, cursor: 'pointer'
              }}
            >
              Yes, Delete
            </button>
          </div>
        </div>
      )}

      <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 16 }}>
        Logged by {c.createdBy} · {new Date(c.createdAt).toLocaleDateString()}
      </p>
    </div>
  )
}

const labelStyle = { fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }
const inputStyle = { width: '100%', padding: 10, borderRadius: 8, border: '1px solid var(--border)', fontSize: 15 }

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
