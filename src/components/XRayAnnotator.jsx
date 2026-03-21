import React, { useState, useRef, useEffect, useCallback } from 'react'

const TOOLS = [
  { id: 'arrow', icon: '➡️', label: 'Arrow' },
  { id: 'circle', icon: '⭕', label: 'Circle' },
  { id: 'line', icon: '📏', label: 'Line' },
  { id: 'text', icon: '🔤', label: 'Text' },
  { id: 'freehand', icon: '✏️', label: 'Draw' },
]

const COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#ffffff']

export default function XRayAnnotator({ image, onSave, onCancel }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [tool, setTool] = useState('arrow')
  const [color, setColor] = useState('#ef4444')
  const [lineWidth, setLineWidth] = useState(3)
  const [annotations, setAnnotations] = useState([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPoint, setStartPoint] = useState(null)
  const [currentPoint, setCurrentPoint] = useState(null)
  const [freehandPoints, setFreehandPoints] = useState([])
  const [textInput, setTextInput] = useState('')
  const [showTextInput, setShowTextInput] = useState(false)
  const [textPosition, setTextPosition] = useState(null)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgEl, setImgEl] = useState(null)

  // Load image
  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      setImgEl(img)
      setImgLoaded(true)
    }
    img.src = image.url
  }, [image.url])

  // Draw everything
  useEffect(() => {
    if (!imgLoaded || !canvasRef.current || !imgEl) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const container = containerRef.current
    
    const maxW = container.clientWidth
    const maxH = window.innerHeight * 0.65
    const scale = Math.min(maxW / imgEl.width, maxH / imgEl.height)
    
    canvas.width = imgEl.width * scale
    canvas.height = imgEl.height * scale
    
    // Draw image
    ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height)
    
    // Draw saved annotations
    annotations.forEach(a => drawAnnotation(ctx, a, scale))
    
    // Draw current annotation in progress
    if (isDrawing && startPoint && currentPoint) {
      drawAnnotation(ctx, {
        tool,
        color,
        lineWidth,
        start: startPoint,
        end: currentPoint,
        points: tool === 'freehand' ? freehandPoints : undefined,
      }, scale)
    }
  }, [imgLoaded, imgEl, annotations, isDrawing, startPoint, currentPoint, freehandPoints, tool, color, lineWidth])

  const drawAnnotation = (ctx, a, scale = 1) => {
    ctx.strokeStyle = a.color
    ctx.fillStyle = a.color
    ctx.lineWidth = a.lineWidth
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    
    switch (a.tool) {
      case 'arrow':
        drawArrow(ctx, a.start, a.end)
        break
      case 'circle':
        drawCircle(ctx, a.start, a.end)
        break
      case 'line':
        ctx.beginPath()
        ctx.moveTo(a.start.x, a.start.y)
        ctx.lineTo(a.end.x, a.end.y)
        ctx.stroke()
        break
      case 'text':
        ctx.font = `bold ${Math.max(16, 20 * scale)}px sans-serif`
        ctx.fillStyle = a.color
        // Text shadow for readability
        ctx.strokeStyle = 'black'
        ctx.lineWidth = 3
        ctx.strokeText(a.text, a.start.x, a.start.y)
        ctx.fillText(a.text, a.start.x, a.start.y)
        break
      case 'freehand':
        if (a.points && a.points.length > 1) {
          ctx.beginPath()
          ctx.moveTo(a.points[0].x, a.points[0].y)
          for (let i = 1; i < a.points.length; i++) {
            ctx.lineTo(a.points[i].x, a.points[i].y)
          }
          ctx.stroke()
        }
        break
    }
  }

  const drawArrow = (ctx, from, to) => {
    const headLen = 15
    const angle = Math.atan2(to.y - from.y, to.x - from.x)
    
    // Line
    ctx.beginPath()
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(to.x, to.y)
    ctx.stroke()
    
    // Arrowhead
    ctx.beginPath()
    ctx.moveTo(to.x, to.y)
    ctx.lineTo(
      to.x - headLen * Math.cos(angle - Math.PI / 6),
      to.y - headLen * Math.sin(angle - Math.PI / 6)
    )
    ctx.moveTo(to.x, to.y)
    ctx.lineTo(
      to.x - headLen * Math.cos(angle + Math.PI / 6),
      to.y - headLen * Math.sin(angle + Math.PI / 6)
    )
    ctx.stroke()
  }

  const drawCircle = (ctx, from, to) => {
    const radius = Math.sqrt(
      Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2)
    )
    ctx.beginPath()
    ctx.arc(from.x, from.y, radius, 0, 2 * Math.PI)
    ctx.stroke()
  }

  const getPoint = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    }
  }

  const handleStart = (e) => {
    e.preventDefault()
    const pt = getPoint(e)
    
    if (tool === 'text') {
      setTextPosition(pt)
      setShowTextInput(true)
      return
    }
    
    setIsDrawing(true)
    setStartPoint(pt)
    setCurrentPoint(pt)
    
    if (tool === 'freehand') {
      setFreehandPoints([pt])
    }
  }

  const handleMove = (e) => {
    if (!isDrawing) return
    e.preventDefault()
    const pt = getPoint(e)
    setCurrentPoint(pt)
    
    if (tool === 'freehand') {
      setFreehandPoints(prev => [...prev, pt])
    }
  }

  const handleEnd = (e) => {
    if (!isDrawing) return
    e.preventDefault()
    
    const annotation = {
      id: 'ann_' + Date.now(),
      tool,
      color,
      lineWidth,
      start: startPoint,
      end: currentPoint,
      points: tool === 'freehand' ? freehandPoints : undefined,
    }
    
    setAnnotations(prev => [...prev, annotation])
    setIsDrawing(false)
    setStartPoint(null)
    setCurrentPoint(null)
    setFreehandPoints([])
  }

  const handleTextSubmit = () => {
    if (!textInput.trim() || !textPosition) return
    
    setAnnotations(prev => [...prev, {
      id: 'ann_' + Date.now(),
      tool: 'text',
      color,
      lineWidth,
      start: textPosition,
      text: textInput.trim(),
    }])
    
    setTextInput('')
    setShowTextInput(false)
    setTextPosition(null)
  }

  const undo = () => {
    setAnnotations(prev => prev.slice(0, -1))
  }

  const clearAll = () => {
    setAnnotations([])
  }

  const handleSave = () => {
    if (!canvasRef.current) return
    canvasRef.current.toBlob((blob) => {
      const url = URL.createObjectURL(blob)
      onSave({
        ...image,
        url,
        annotatedBlob: blob,
        annotations: annotations.length,
        annotatedAt: new Date().toISOString(),
      })
    }, 'image/jpeg', 0.9)
  }

  if (!imgLoaded) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading image...</p>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: '#111', zIndex: 1001, display: 'flex', flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '8px 12px', background: '#1a1a1a', borderBottom: '1px solid #333'
      }}>
        <button onClick={onCancel} style={{ color: '#9ca3af', background: 'none', border: 'none', fontSize: 14, fontWeight: 600 }}>
          Cancel
        </button>
        <span style={{ color: 'white', fontSize: 14, fontWeight: 700 }}>✏️ Annotate X-Ray</span>
        <button onClick={handleSave} style={{ color: '#22c55e', background: 'none', border: 'none', fontSize: 14, fontWeight: 700 }}>
          Save ✓
        </button>
      </div>

      {/* Canvas area */}
      <div ref={containerRef} style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 8, overflow: 'hidden', touchAction: 'none'
      }}>
        <canvas
          ref={canvasRef}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
          style={{ borderRadius: 8, maxWidth: '100%', maxHeight: '100%' }}
        />
      </div>

      {/* Text input overlay */}
      {showTextInput && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          background: 'white', borderRadius: 12, padding: 16, zIndex: 1002, width: 280
        }}>
          <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Add Label</p>
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="e.g., Fracture line, K-wire entry..."
            autoFocus
            style={{
              width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ddd',
              fontSize: 14, marginBottom: 8
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => { setShowTextInput(false); setTextPosition(null) }}
              style={{ flex: 1, padding: 8, borderRadius: 6, border: '1px solid #ddd', background: 'white', fontSize: 13 }}
            >
              Cancel
            </button>
            <button
              onClick={handleTextSubmit}
              style={{ flex: 1, padding: 8, borderRadius: 6, border: 'none', background: 'var(--primary)', color: 'white', fontSize: 13, fontWeight: 600 }}
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Tool bar */}
      <div style={{ background: '#1a1a1a', borderTop: '1px solid #333', padding: '8px 12px' }}>
        {/* Tools */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 8 }}>
          {TOOLS.map(t => (
            <button
              key={t.id}
              onClick={() => setTool(t.id)}
              style={{
                background: tool === t.id ? '#333' : 'transparent',
                border: tool === t.id ? '2px solid #3b82f6' : '2px solid transparent',
                borderRadius: 8, padding: '6px 10px', fontSize: 12,
                color: 'white', cursor: 'pointer', display: 'flex',
                flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 52
              }}
            >
              <span style={{ fontSize: 18 }}>{t.icon}</span>
              <span style={{ fontSize: 10 }}>{t.label}</span>
            </button>
          ))}
        </div>
        
        {/* Colors + actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{
                  width: 28, height: 28, borderRadius: '50%', background: c,
                  border: color === c ? '3px solid #3b82f6' : '2px solid #555',
                  cursor: 'pointer'
                }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={undo}
              disabled={annotations.length === 0}
              style={{
                background: '#333', color: annotations.length ? 'white' : '#555',
                border: 'none', borderRadius: 6, padding: '6px 12px',
                fontSize: 12, fontWeight: 600, cursor: annotations.length ? 'pointer' : 'default'
              }}
            >
              ↩ Undo
            </button>
            <button
              onClick={clearAll}
              disabled={annotations.length === 0}
              style={{
                background: annotations.length ? '#dc2626' : '#333',
                color: annotations.length ? 'white' : '#555',
                border: 'none', borderRadius: 6, padding: '6px 12px',
                fontSize: 12, fontWeight: 600, cursor: annotations.length ? 'pointer' : 'default'
              }}
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
