import React, { useState, useRef, useCallback } from 'react'
import XRayAnnotator from './XRayAnnotator'

export default function XRayUploader({ caseId, existingImages = [], onImagesChange }) {
  const [images, setImages] = useState(existingImages)
  const [showViewer, setShowViewer] = useState(null)
  const [annotatingImage, setAnnotatingImage] = useState(null)
  const [showWarning, setShowWarning] = useState(false)
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  const stripExif = useCallback((file) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          // Draw to canvas — this strips ALL EXIF/metadata
          const canvas = document.createElement('canvas')
          // Limit max dimension to 2048px for storage efficiency
          const maxDim = 2048
          let w = img.width
          let h = img.height
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round(h * maxDim / w)
              w = maxDim
            } else {
              w = Math.round(w * maxDim / h)
              h = maxDim
            }
          }
          canvas.width = w
          canvas.height = h
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, w, h)
          // Convert to blob — JPEG at 85% quality, all metadata stripped
          canvas.toBlob((blob) => {
            resolve(blob)
          }, 'image/jpeg', 0.85)
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    })
  }, [])

  const handleFiles = useCallback(async (files) => {
    setShowWarning(true)
  
    const pendingFiles = Array.from(files)
    
    // Store files temporarily, wait for user confirmation
    window._pendingXrayFiles = pendingFiles
  }, [])

  const confirmUpload = useCallback(async () => {
    const files = window._pendingXrayFiles || []
    setShowWarning(false)
    
    const newImages = []
    for (const file of files) {
      const stripped = await stripExif(file)
      const url = URL.createObjectURL(stripped)
      newImages.push({
        id: 'xr_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        url,
        blob: stripped,
        viewType: 'AP',
        caption: '',
        uploadedAt: new Date().toISOString(),
        originalName: file.name,
        size: stripped.size,
      })
    }
    
    const updated = [...images, ...newImages]
    setImages(updated)
    onImagesChange?.(updated)
    window._pendingXrayFiles = null
  }, [images, stripExif, onImagesChange])

  const cancelUpload = useCallback(() => {
    setShowWarning(false)
    window._pendingXrayFiles = null
  }, [])

  const removeImage = (id) => {
    const updated = images.filter(img => img.id !== id)
    setImages(updated)
    onImagesChange?.(updated)
  }

  const updateCaption = (id, caption) => {
    const updated = images.map(img => img.id === id ? { ...img, caption } : img)
    setImages(updated)
    onImagesChange?.(updated)
  }

  const handleAnnotationSave = (annotatedImage) => {
    const updated = images.map(img => img.id === annotatedImage.id ? annotatedImage : img)
    setImages(updated)
    onImagesChange?.(updated)
    setAnnotatingImage(null)
  }

  const updateViewType = (id, viewType) => {
    const updated = images.map(img => img.id === id ? { ...img, viewType } : img)
    setImages(updated)
    onImagesChange?.(updated)
  }

  const viewTypes = ['AP', 'Lateral', 'Oblique', 'Intraop', 'Postop', 'CT', 'Other']

  return (
    <div>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>🩻 X-Ray Images</h3>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
        De-identified only — NO patient names, MRNs, or identifiers
      </p>

      {/* Upload buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          className="btn btn-outline btn-sm"
          style={{ flex: 1 }}
          onClick={() => cameraInputRef.current?.click()}
        >
          📸 Camera
        </button>
        <button
          className="btn btn-outline btn-sm"
          style={{ flex: 1 }}
          onClick={() => fileInputRef.current?.click()}
        >
          🖼️ Gallery
        </button>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={(e) => e.target.files?.length && handleFiles(e.target.files)}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => e.target.files?.length && handleFiles(e.target.files)}
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
              Before uploading, confirm this image contains <strong>NO patient-identifying information</strong>:
            </p>
            <ul style={{ fontSize: 13, lineHeight: 1.8, color: '#374151', marginBottom: 20, paddingLeft: 20 }}>
              <li>No patient name visible</li>
              <li>No MRN or DOB on the image</li>
              <li>No hospital stickers or labels</li>
              <li>No identifiable body features (face, tattoos)</li>
              <li>Image is a radiograph, C-arm shot, or clinical photo of anatomy only</li>
            </ul>
            <p style={{ fontSize: 12, color: '#6b7280', textAlign: 'center', marginBottom: 16 }}>
              All EXIF metadata (GPS, device info, timestamps) will be automatically stripped.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn-outline btn-sm"
                style={{ flex: 1 }}
                onClick={cancelUpload}
              >
                Cancel
              </button>
              <button
                className="btn btn-sm"
                style={{ flex: 1, background: '#059669', color: 'white' }}
                onClick={confirmUpload}
              >
                ✅ Confirm — No PHI
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
          {images.map((img) => (
            <div key={img.id} style={{
              borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)',
              background: 'black'
            }}>
              <div style={{ position: 'relative' }}>
                <img
                  src={img.url}
                  alt={img.caption || 'X-ray'}
                  style={{ width: '100%', height: 140, objectFit: 'cover', cursor: 'pointer' }}
                  onClick={() => setShowViewer(img)}
                />
                <button
                  onClick={() => removeImage(img.id)}
                  style={{
                    position: 'absolute', top: 4, right: 4,
                    background: 'rgba(220,38,38,0.9)', color: 'white',
                    border: 'none', borderRadius: '50%', width: 24, height: 24,
                    fontSize: 12, cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  ✕
                </button>
                <span style={{
                  position: 'absolute', bottom: 4, left: 4,
                  background: 'rgba(0,0,0,0.7)', color: 'white',
                  fontSize: 10, padding: '2px 6px', borderRadius: 4,
                  fontWeight: 700
                }}>
                  {img.viewType}
                </span>
              </div>
              <div style={{ padding: 8, background: 'white' }}>
                <select
                  value={img.viewType}
                  onChange={(e) => updateViewType(img.id, e.target.value)}
                  style={{ width: '100%', fontSize: 12, padding: 4, marginBottom: 4, borderRadius: 4, border: '1px solid var(--border)' }}
                >
                  {viewTypes.map(vt => <option key={vt} value={vt}>{vt}</option>)}
                </select>
                <input
                  type="text"
                  placeholder="Caption..."
                  value={img.caption}
                  onChange={(e) => updateCaption(img.id, e.target.value)}
                  style={{ width: '100%', fontSize: 12, padding: 4, borderRadius: 4, border: '1px solid var(--border)', marginBottom: 4 }}
                />
                <button
                  onClick={() => setAnnotatingImage(img)}
                  style={{
                    width: '100%', fontSize: 11, padding: '4px 0', borderRadius: 4,
                    border: '1px solid var(--primary)', background: 'transparent',
                    color: 'var(--primary)', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  ✏️ Annotate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div style={{
          border: '2px dashed var(--border)', borderRadius: 12, padding: 24,
          textAlign: 'center', color: 'var(--text-muted)'
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🩻</div>
          <p style={{ fontSize: 14 }}>No X-rays attached</p>
          <p style={{ fontSize: 12 }}>Tap Camera or Gallery to add de-identified images</p>
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
          <img
            src={showViewer.url}
            alt={showViewer.caption || 'X-ray'}
            style={{ maxWidth: '95vw', maxHeight: '80vh', objectFit: 'contain' }}
            onClick={(e) => e.stopPropagation()}
          />
          <div style={{ color: 'white', marginTop: 12, textAlign: 'center' }}>
            <p style={{ fontSize: 16, fontWeight: 600 }}>{showViewer.viewType}</p>
            {showViewer.caption && <p style={{ fontSize: 14, color: '#9ca3af', marginTop: 4 }}>{showViewer.caption}</p>}
            <button
              onClick={(e) => { e.stopPropagation(); setShowViewer(null); setAnnotatingImage(showViewer); }}
              style={{
                marginTop: 12, background: 'rgba(255,255,255,0.15)', color: 'white',
                border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8,
                padding: '8px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer'
              }}
            >
              ✏️ Annotate This Image
            </button>
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
