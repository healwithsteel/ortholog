import React, { useState } from 'react'
import XRayUploader from './XRayUploader'

export default function CaseDetail({ caseData, onBack, onUpdateCase }) {
  const c = caseData
  const [xrayImages, setXrayImages] = useState(c.xrayImages || [])
  const [shareStatus, setShareStatus] = useState(null)

  const handleXrayChange = (images) => {
    setXrayImages(images)
    if (onUpdateCase) {
      onUpdateCase({
        ...c,
        xrayImages: images.map(img => ({
          id: img.id,
          url: img.url,
          viewType: img.viewType,
          caption: img.caption,
          uploadedAt: img.uploadedAt,
        }))
      })
    }
  }

  const generateShareText = () => {
    const lines = [
      `🦴 OrthoLog Case`,
      ``,
      `📋 ${c.procedure}`,
      `CPT ${c.cptCode} · ${formatDate(c.date)}`,
      ``,
      `👨‍⚕️ Attending: ${c.attending}`,
      `🔧 Approach: ${c.approach}`,
      `📂 Category: ${Array.isArray(c.category) ? c.category.join(', ') : c.category}`,
      `🦴 Region: ${c.bodyRegion}`,
      `🎯 Role: ${c.role}`,
    ]

    if (c.position) lines.push(`🛏️ Position: ${c.position}`)
    if (c.implants?.length) lines.push(`🔩 Implants: ${c.implants.join(', ')}`)
    if (c.reductionAids?.length) lines.push(`🛠️ Reduction Aids: ${c.reductionAids.join(', ')}`)
    
    if (c.notes) {
      lines.push(``, `📝 Notes:`, c.notes)
    }
    if (c.tips) {
      lines.push(``, `💡 Tip:`, c.tips)
    }

    lines.push(``, `---`, `Shared via OrthoLog`)

    return lines.join('\n')
  }

  const handleShare = async () => {
    const text = generateShareText()

    // Try Web Share API first (works on mobile Safari, Chrome, etc.)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `OrthoLog: ${c.procedure}`,
          text: text,
        })
        setShareStatus('shared')
        setTimeout(() => setShareStatus(null), 2000)
        return
      } catch (err) {
        // User cancelled or share failed — fall through to clipboard
        if (err.name === 'AbortError') return
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(text)
      setShareStatus('copied')
      setTimeout(() => setShareStatus(null), 2000)
    } catch (err) {
      // Last resort: textarea fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setShareStatus('copied')
      setTimeout(() => setShareStatus(null), 2000)
    }
  }
  
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

      {/* X-Ray Section */}
      <div className="card">
        <XRayUploader
          caseId={c.id}
          existingImages={xrayImages}
          onImagesChange={handleXrayChange}
        />
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
        <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={handleShare}>
          {shareStatus === 'copied' ? '✅ Copied!' : shareStatus === 'shared' ? '✅ Shared!' : '📤 Share Case'}
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
