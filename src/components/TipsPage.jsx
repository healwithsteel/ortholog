import React, { useState } from 'react'

export default function TipsPage({ tips, onNewTip, onUpdateTip, onDeleteTip }) {
  const [expanded, setExpanded] = useState(null)
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [filter, setFilter] = useState('all')

  const categories = ['all', ...new Set(tips.map(t => t.category).filter(Boolean))]
  
  const filtered = filter === 'all' ? tips : tips.filter(t => t.category === filter)

  const handleLike = (tipId) => {
    const tip = tips.find(t => t.id === tipId)
    if (tip && onUpdateTip) {
      onUpdateTip({ ...tip, likes: (tip.likes || 0) + 1 })
    }
  }

  const startEdit = (tip) => {
    setEditing(tip.id)
    const tagArr = Array.isArray(tip.tags) ? tip.tags : []
    setEditForm({
      title: tip.title || '',
      body: tip.body || '',
      category: tip.category || 'trauma',
      procedure: tip.procedure || '',
      tags: tagArr.join(', '),
    })
  }

  const saveEdit = (tipId) => {
    try {
      const tip = tips.find(t => t.id === tipId)
      if (tip && onUpdateTip) {
        const tagsStr = editForm.tags || ''
        const parsedTags = typeof tagsStr === 'string' 
          ? tagsStr.split(',').map(t => t.trim()).filter(Boolean)
          : Array.isArray(tagsStr) ? tagsStr : []
        
        const updated = {
          ...tip,
          title: editForm.title || tip.title,
          body: editForm.body || tip.body,
          category: editForm.category || tip.category,
          procedure: editForm.procedure || tip.procedure,
          tags: parsedTags,
        }
        // Exit edit mode FIRST to prevent re-render conflict
        setEditing(null)
        setEditForm({})
        // Then update the tip
        onUpdateTip(updated)
      } else {
        setEditing(null)
        setEditForm({})
      }
    } catch (err) {
      console.error('Error saving tip edit:', err)
      setEditing(null)
      setEditForm({})
    }
  }

  const cancelEdit = () => {
    setEditing(null)
    setEditForm({})
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>💡 Tips & Tricks</h2>
        <button
          onClick={onNewTip}
          style={{
            background: 'var(--accent)', color: 'white', border: 'none',
            borderRadius: 8, padding: '6px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer'
          }}
        >
          + New Tip
        </button>
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 12, marginBottom: 12 }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              background: filter === cat ? 'var(--primary)' : 'var(--surface)',
              color: filter === cat ? 'white' : 'var(--text-muted)',
              border: `1px solid ${filter === cat ? 'var(--primary)' : 'var(--border)'}`,
              borderRadius: 20, padding: '4px 14px', fontSize: 12,
              fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
              textTransform: 'capitalize'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
        {filtered.length} tip{filtered.length !== 1 ? 's' : ''} · Tap to expand · Long-press to edit
      </p>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>💡</div>
          <p>No tips yet in this category</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>Be the first to share a pearl!</p>
        </div>
      )}

      {filtered.map(tip => (
        <div
          key={tip.id}
          className="tip-card"
          onClick={() => setExpanded(expanded === tip.id ? null : tip.id)}
          style={{ cursor: 'pointer', transition: 'all 0.2s' }}
        >
          {editing === tip.id ? (
            /* Edit mode */
            <div onClick={e => e.stopPropagation()}>
              <div className="form-group" style={{ marginBottom: 8 }}>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                  style={{ fontSize: 15, fontWeight: 700, width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border)' }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 8 }}>
                <select
                  value={editForm.category}
                  onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
                  style={{ width: '100%', padding: 6, borderRadius: 6, border: '1px solid var(--border)', fontSize: 13 }}
                >
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
              <div className="form-group" style={{ marginBottom: 8 }}>
                <textarea
                  value={editForm.body}
                  onChange={e => setEditForm(f => ({ ...f, body: e.target.value }))}
                  style={{ width: '100%', minHeight: 100, padding: 8, borderRadius: 6, border: '1px solid var(--border)', fontSize: 14, lineHeight: 1.6 }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 8 }}>
                <input
                  type="text"
                  value={editForm.tags}
                  onChange={e => setEditForm(f => ({ ...f, tags: e.target.value }))}
                  placeholder="Tags (comma separated)"
                  style={{ width: '100%', padding: 6, borderRadius: 6, border: '1px solid var(--border)', fontSize: 13 }}
                />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={cancelEdit}
                  style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid var(--border)', background: 'white', fontSize: 13, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => saveEdit(tip.id)}
                  style={{ flex: 1, padding: 8, borderRadius: 6, border: 'none', background: 'var(--primary)', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  ✓ Save
                </button>
              </div>
            </div>
          ) : (
            /* View mode */
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h4 style={{ flex: 1, fontSize: 15, fontWeight: 700 }}>{tip.title}</h4>
                {tip.category && (
                  <span className="badge badge-primary" style={{ flexShrink: 0, marginLeft: 8, textTransform: 'capitalize' }}>
                    {tip.category}
                  </span>
                )}
              </div>

              {/* Collapsed: show preview. Expanded: show full content */}
              <p style={{
                marginTop: 8, fontSize: 14, lineHeight: 1.6, color: 'var(--text)',
                ...(expanded !== tip.id ? {
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  overflow: 'hidden', textOverflow: 'ellipsis'
                } : {})
              }}>
                {tip.body}
              </p>

              {/* Expanded content */}
              {expanded === tip.id && (
                <div style={{ marginTop: 12 }}>
                  {tip.procedure && (
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>
                      🔧 <strong>Related procedure:</strong> {tip.procedure}
                    </p>
                  )}

                  {tip.tags && tip.tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                      {tip.tags.map((tag, i) => (
                        <span key={i} style={{
                          fontSize: 11, color: '#78350f', background: 'rgba(120,53,15,0.1)',
                          padding: '2px 8px', borderRadius: 12
                        }}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleLike(tip.id) }}
                      style={{
                        flex: 1, padding: '8px 0', borderRadius: 8,
                        border: '1px solid var(--border)', background: 'white',
                        fontSize: 13, cursor: 'pointer', fontWeight: 600
                      }}
                    >
                      ❤️ {tip.likes || 0}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); startEdit(tip) }}
                      style={{
                        flex: 1, padding: '8px 0', borderRadius: 8,
                        border: '1px solid var(--border)', background: 'white',
                        fontSize: 13, cursor: 'pointer', fontWeight: 600
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        const text = `💡 ${tip.title}\n\n${tip.body}\n${tip.tags?.length ? '\n#' + tip.tags.join(' #') : ''}\n\n— Shared via OrthoLog`
                        if (navigator.share) {
                          navigator.share({ title: tip.title, text })
                        } else {
                          navigator.clipboard.writeText(text)
                        }
                      }}
                      style={{
                        flex: 1, padding: '8px 0', borderRadius: 8,
                        border: '1px solid var(--border)', background: 'white',
                        fontSize: 13, cursor: 'pointer', fontWeight: 600
                      }}
                    >
                      📤 Share
                    </button>
                  </div>
                </div>
              )}

              <div className="tip-meta" style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                <span>By {tip.createdBy} · {formatDate(tip.createdAt)}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>❤️ {tip.likes || 0}</span>
                  <span>{expanded === tip.id ? '▲' : '▼'}</span>
                </span>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  )
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
