import React, { useState, useRef, useCallback } from 'react'
import XRayAnnotator from './XRayAnnotator'

const MEDIA_CATEGORIES = [
  { key: 'preop', label: 'Pre-op X-rays', emoji: '🩻', hint: 'AP, Lateral, Oblique views' },
  { key: 'intraop', label: 'Intraoperative Fluoro', emoji: '📡', hint: 'C-arm shots during surgery' },
  { key: 'postop', label: 'Post-op X-rays', emoji: '✅', hint: 'Final AP & Lateral views' },
  { key: 'video', label: 'CT / MRI / Video', emoji: '🎬', hint: 'Short clips, scroll-throughs' },
  { key: 'other', label: 'Additional', emoji: '📎', hint: 'Clinical photos, other imaging' },
]

const IMAGE_VIEW_TYPES = ['AP', 'Lateral', 'Oblique', 'Mortise', 'Inlet', 'Outlet', 'Judet', 'Traction', 'Other']

export default function MediaUploader({ caseId, existingImages = [], onImagesChange }) {
  const [media, setMedia] = useState(() => {
    // Migrate old flat images to categorized format
    if (existingImages.length > 0 && !existingImages[0]?.category) {
      return existingImages.map(img => ({ ...img, category: img.category || 'other' }))
    }
    return existingImages
  })
  const [showViewer, setShowViewer] = useState(null)
  const [annotatingImage, setAnnotatingImage] = useState(null)
  const [showWarning, setShowWarning] = useState(false)
  const [activeCategory, setActiveCategory] = useState(null)
  const [expandedSections, setExpandedSections] = useState(() => {
    const exp = {}
    MEDIA_CATEGORIES.forEach(c => { exp[c.key] = true })
    return exp
  })
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const videoInputRef = useRef(null)

  const stripExif = useCallback((file) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const maxDim = 1200
          let w = img.width
          let h = img.height
          if (w > maxDim || h > maxDim) {
            if (w > h) { h = Math.round(h * maxDim / w); w = maxDim }
            else { w = Math.round(w * maxDim / h); h = maxDim }
          }
          canvas.width = w
          canvas.height = h
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, w, h)
          canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.70)
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    })
  }, [])

  const blobToDataUrl = useCallback((blob) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.readAsDataURL(blob)
    })
  }, [])

  const fileToDataUrl = useCallback((file) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.readAsDataURL(file)
    })
  }, [])

  const handleFiles = useCallback(async (files, category) => {
    setActiveCategory(category)
    setShowWarning(true)
    window._pendingMediaFiles = Array.from(files)
  }, [])

  const confirmUpload = useCallback(async () => {
    const files = window._pendingMediaFiles || []
    const category = activeCategory || 'other'
    setShowWarning(false)

    const newMedia = []
    for (const file of files) {
      const isVideo = file.type.startsWith('video/')
      let dataUrl
      let fileSize

      if (isVideo) {
        // Video: convert directly to data URL (no EXIF stripping needed)
        // Cap at 50MB for localStorage feasibility
        if (file.size > 50 * 1024 * 1024) {
          alert(`Video "${file.name}" exceeds 50MB limit. Please trim the clip.`)
          continue
        }
        dataUrl = await fileToDataUrl(file)
        fileSize = file.size
      } else {
        // Image: strip EXIF and resize
        const stripped = await stripExif(file)
        dataUrl = await blobToDataUrl(stripped)
        fileSize = stripped.size
      }

      newMedia.push({
        id: 'med_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        url: dataUrl,
        type: isVideo ? 'video' : 'image',
        category,
        viewType: isVideo ? 'Video' : 'AP',
        caption: '',
        uploadedAt: new Date().toISOString(),
        originalName: file.name,
        size: fileSize,
      })
    }

    const updated = [...media, ...newMedia]
    setMedia(updated)
    onImagesChange?.(updated)
    window._pendingMediaFiles = null
    setActiveCategory(null)
  }, [media, activeCategory, stripExif, blobToDataUrl, fileToDataUrl, onImagesChange])

  const cancelUpload = useCallback(() => {
    setShowWarning(false)
    window._pendingMediaFiles = null
    setActiveCategory(null)
  }, [])

  const removeMedia = (id) => {
    const updated = media.filter(m => m.id !== id)
    setMedia(updated)
    onImagesChange?.(updated)
  }

  const updateField = (id, field, value) => {
    const updated = media.map(m => m.id === id ? { ...m, [field]: value } : m)
    setMedia(updated)
    onImagesChange?.(updated)
  }

  const handleAnnotationSave = (annotatedImage) => {
    const updated = media.map(m => m.id === annotatedImage.id ? annotatedImage : m)
    setMedia(updated)
    onImagesChange?.(updated)
    setAnnotatingImage(null)
  }

  const toggleSection = (key) => {
    setExpandedSections(s => ({ ...s, [key]: !s[key] }))
  }

  const getMediaForCategory = (key) => media.filter(m => m.category === key)
  const totalCount = media.length
  const imageCount = media.filter(m => m.type !== 'video').length
  const videoCount = media.filter(m => m.type === 'video').length

  return (
    <div>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>🩻 Case Imaging & Media</h3>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
        De-identified only — NO patient names, MRNs, or identifiers
      </p>
      {totalCount > 0 && (
        <p style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, marginBottom: 12 }}>
          {imageCount} image{imageCount !== 1 ? 's' : ''}{videoCount > 0 ? ` · ${videoCount} video${videoCount !== 1 ? 's' : ''}` : ''}
        </p>
      )}

      {/* Category Sections */}
      {MEDIA_CATEGORIES.map(cat => {
        const catMedia = getMediaForCategory(cat.key)
        const isExpanded = expandedSections[cat.key]
        const isVideoCategory = cat.key === 'video'

        return (
          <div key={cat.key} style={{
            marginBottom: 12,
            border: '1px solid var(--border)',
            borderRadius: 12,
            overflow: 'hidden',
          }}>
            {/* Section header */}
            <div
              onClick={() => toggleSection(cat.key)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', cursor: 'pointer',
                background: catMedia.length > 0 ? 'rgba(30, 64, 175, 0.04)' : 'var(--surface)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>{cat.emoji}</span>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{cat.label}</span>
                  {catMedia.length > 0 && (
                    <span style={{
                      marginLeft: 8, fontSize: 11, fontWeight: 700,
                      background: 'var(--primary)', color: 'white',
                      padding: '1px 7px', borderRadius: 10
                    }}>
                      {catMedia.length}
                    </span>
                  )}
                </div>
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                ▼
              </span>
            </div>

            {/* Section content */}
            {isExpanded && (
              <div style={{ padding: '8px 14px 14px' }}>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>{cat.hint}</p>

                {/* Upload buttons */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                  {!isVideoCategory && (
                    <>
                      <button
                        className="btn btn-outline btn-sm"
                        style={{ flex: 1, fontSize: 12, padding: '6px 0' }}
                        onClick={() => {
                          setActiveCategory(cat.key)
                          cameraInputRef.current?.click()
                        }}
                      >
                        📸 Camera
                      </button>
                      <button
                        className="btn btn-outline btn-sm"
                        style={{ flex: 1, fontSize: 12, padding: '6px 0' }}
                        onClick={() => {
                          setActiveCategory(cat.key)
                          fileInputRef.current?.click()
                        }}
                      >
                        🖼️ Gallery
                      </button>
                    </>
                  )}
                  {isVideoCategory && (
                    <>
                      <button
                        className="btn btn-outline btn-sm"
                        style={{ flex: 1, fontSize: 12, padding: '6px 0' }}
                        onClick={() => {
                          setActiveCategory(cat.key)
                          videoInputRef.current?.click()
                        }}
                      >
                        🎬 Video
                      </button>
                      <button
                        className="btn btn-outline btn-sm"
                        style={{ flex: 1, fontSize: 12, padding: '6px 0' }}
                        onClick={() => {
                          setActiveCategory(cat.key)
                          fileInputRef.current?.click()
                        }}
                      >
                        🖼️ Image
                      </button>
                    </>
                  )}
                </div>

                {/* Media grid */}
                {catMedia.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
                    {catMedia.map(item => (
                      <MediaCard
                        key={item.id}
                        item={item}
                        onRemove={removeMedia}
                        onUpdateField={updateField}
                        onView={setShowViewer}
                        onAnnotate={setAnnotatingImage}
                      />
                    ))}
                  </div>
                ) : (
                  <div style={{
                    border: '1px dashed var(--border)', borderRadius: 8, padding: 12,
                    textAlign: 'center', color: 'var(--text-muted)', fontSize: 12
                  }}>
                    No {isVideoCategory ? 'videos' : 'images'} yet
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}

      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files, activeCategory || 'other')
          e.target.value = ''
        }}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files, activeCategory || 'other')
          e.target.value = ''
        }}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files, activeCategory || 'video')
          e.target.value = ''
        }}
      />

      {/* PHI Warning Modal */}
      {showWarning && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
        }}>
          <div style={{
            background: 'white', borderRadius: 16, padding: 24, maxWidth: 360, width: '100%'
          }}>
            <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 12 }}>⚠️</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, textAlign: 'center', marginBottom: 8, color: '#dc2626' }}>
              PHI Check Required
            </h3>
            <p style={{ fontSize: 14, lineHeight: 1.6, textAlign: 'center', color: '#374151', marginBottom: 16 }}>
              Before uploading, confirm this {activeCategory === 'video' ? 'video' : 'image'} contains <strong>NO patient-identifying information</strong>:
            </p>
            <ul style={{ fontSize: 13, lineHeight: 1.8, color: '#374151', marginBottom: 20, paddingLeft: 20 }}>
              <li>No patient name visible</li>
              <li>No MRN or DOB on the image</li>
              <li>No hospital stickers or labels</li>
              <li>No identifiable body features (face, tattoos)</li>
              <li>Radiographs, C-arm shots, or clinical anatomy only</li>
            </ul>
            <p style={{ fontSize: 12, color: '#6b7280', textAlign: 'center', marginBottom: 16 }}>
              All EXIF metadata (GPS, device info, timestamps) will be automatically stripped from images.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={cancelUpload}>
                Cancel
              </button>
              <button className="btn btn-sm" style={{ flex: 1, background: '#059669', color: 'white' }} onClick={confirmUpload}>
                ✅ Confirm — No PHI
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-screen viewer */}
      {showViewer && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.95)', zIndex: 1000,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
          }}
          onClick={() => setShowViewer(null)}
        >
          {showViewer.type === 'video' ? (
            <video
              src={showViewer.url}
              controls
              autoPlay
              style={{ maxWidth: '95vw', maxHeight: '80vh' }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <img
              src={showViewer.url}
              alt={showViewer.caption || 'X-ray'}
              style={{ maxWidth: '95vw', maxHeight: '80vh', objectFit: 'contain' }}
              onClick={(e) => e.stopPropagation()}
            />
          )}
          <div style={{ color: 'white', marginTop: 12, textAlign: 'center' }}>
            <p style={{ fontSize: 16, fontWeight: 600 }}>
              {MEDIA_CATEGORIES.find(c => c.key === showViewer.category)?.label || 'Media'} — {showViewer.viewType}
            </p>
            {showViewer.caption && <p style={{ fontSize: 14, color: '#9ca3af', marginTop: 4 }}>{showViewer.caption}</p>}
            {showViewer.type !== 'video' && (
              <button
                onClick={(e) => { e.stopPropagation(); setShowViewer(null); setAnnotatingImage(showViewer) }}
                style={{
                  marginTop: 12, background: 'rgba(255,255,255,0.15)', color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8,
                  padding: '8px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer'
                }}
              >
                ✏️ Annotate This Image
              </button>
            )}
          </div>
          <button
            onClick={() => setShowViewer(null)}
            style={{
              position: 'absolute', top: 16, right: 16,
              background: 'rgba(255,255,255,0.2)', color: 'white',
              border: 'none', borderRadius: '50%', width: 40, height: 40,
              fontSize: 20, cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Annotation editor */}
      {annotatingImage && (
        <XRayAnnotator
          image={annotatingImage}
          onSave={handleAnnotationSave}
          onCancel={() => setAnnotatingImage(null)}
        />
      )}
    </div>
  )
}

// --- MediaCard sub-component ---
function MediaCard({ item, onRemove, onUpdateField, onView, onAnnotate }) {
  const isVideo = item.type === 'video'
  const viewTypes = isVideo
    ? ['Video', 'CT Scroll', 'MRI Scroll', 'Clip']
    : IMAGE_VIEW_TYPES

  return (
    <div style={{
      borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)',
      background: 'black'
    }}>
      <div style={{ position: 'relative' }}>
        {isVideo ? (
          <div
            style={{
              width: '100%', height: 120, display: 'flex', alignItems: 'center',
              justifyContent: 'center', background: '#111', cursor: 'pointer',
              position: 'relative'
            }}
            onClick={() => onView(item)}
          >
            <video
              src={item.url}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              muted
              preload="metadata"
            />
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              background: 'rgba(0,0,0,0.6)', borderRadius: '50%',
              width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <span style={{ color: 'white', fontSize: 16, marginLeft: 2 }}>▶</span>
            </div>
          </div>
        ) : (
          <img
            src={item.url}
            alt={item.caption || 'X-ray'}
            style={{ width: '100%', height: 120, objectFit: 'cover', cursor: 'pointer' }}
            onClick={() => onView(item)}
          />
        )}
        <button
          onClick={() => onRemove(item.id)}
          style={{
            position: 'absolute', top: 4, right: 4,
            background: 'rgba(220,38,38,0.9)', color: 'white',
            border: 'none', borderRadius: '50%', width: 22, height: 22,
            fontSize: 11, cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
          }}
        >
          ✕
        </button>
        <span style={{
          position: 'absolute', bottom: 4, left: 4,
          background: 'rgba(0,0,0,0.7)', color: 'white',
          fontSize: 9, padding: '2px 5px', borderRadius: 4, fontWeight: 700
        }}>
          {item.viewType}
        </span>
      </div>
      <div style={{ padding: 6, background: 'white' }}>
        <select
          value={item.viewType}
          onChange={(e) => onUpdateField(item.id, 'viewType', e.target.value)}
          style={{ width: '100%', fontSize: 11, padding: 3, marginBottom: 3, borderRadius: 4, border: '1px solid var(--border)' }}
        >
          {viewTypes.map(vt => <option key={vt} value={vt}>{vt}</option>)}
        </select>
        <input
          type="text"
          placeholder="Caption..."
          value={item.caption}
          onChange={(e) => onUpdateField(item.id, 'caption', e.target.value)}
          style={{ width: '100%', fontSize: 11, padding: 3, borderRadius: 4, border: '1px solid var(--border)', marginBottom: 3 }}
        />
        {!isVideo && (
          <button
            onClick={() => onAnnotate(item)}
            style={{
              width: '100%', fontSize: 10, padding: '3px 0', borderRadius: 4,
              border: '1px solid var(--primary)', background: 'transparent',
              color: 'var(--primary)', fontWeight: 600, cursor: 'pointer'
            }}
          >
            ✏️ Annotate
          </button>
        )}
      </div>
    </div>
  )
}
