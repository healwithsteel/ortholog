import React, { useState } from 'react'

export default function OnboardingScreen({ onComplete }) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    displayName: '',
    email: '',
    pgyYear: 1,
    classYear: 2031,
    program: 'UCF/HCA Florida Ocala Hospital',
  })

  const handleFinish = () => {
    if (!form.displayName) {
      alert('Please enter your name')
      return
    }
    onComplete(form)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 24 }}>
      {step === 0 && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 80, marginBottom: 16 }}>🦴</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--primary)', marginBottom: 8 }}>OrthoLog</h1>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', marginBottom: 8 }}>
            Orthopaedic Surgery Resident Case Tracker
          </p>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 40, lineHeight: 1.6 }}>
            Log cases · Share X-rays · Learn from peers<br/>
            Built for UCF/HCA Ocala residents
          </p>
          <button className="btn btn-primary btn-block" onClick={() => setStep(1)}>
            Get Started →
          </button>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 16 }}>
            By Dr. Karl F. Siebuhr, MD<br/>
            Reconstructive Orthopaedics of Central Florida
          </p>
        </div>
      )}

      {step === 1 && (
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Welcome, Resident 👋</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Let's set up your profile.</p>

          <div className="form-group">
            <label>Your Name</label>
            <input
              type="text"
              placeholder="e.g., Adam Daniel"
              value={form.displayName}
              onChange={e => setForm(f => ({...f, displayName: e.target.value}))}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="your.email@example.com"
              value={form.email}
              onChange={e => setForm(f => ({...f, email: e.target.value}))}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>PGY Year</label>
              <select value={form.pgyYear} onChange={e => setForm(f => ({...f, pgyYear: parseInt(e.target.value)}))}>
                {[1,2,3,4,5].map(y => <option key={y} value={y}>PGY-{y}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Class Year</label>
              <select value={form.classYear} onChange={e => setForm(f => ({...f, classYear: parseInt(e.target.value)}))}>
                {[2026,2027,2028,2029,2030,2031,2032].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Program</label>
            <select value={form.program} onChange={e => setForm(f => ({...f, program: e.target.value}))}>
              <option value="UCF/HCA Florida Ocala Hospital">UCF/HCA Florida Ocala Hospital</option>
              <option value="_other">Other...</option>
            </select>
          </div>

          <button className="btn btn-primary btn-block" onClick={() => setStep(2)} style={{ marginTop: 8 }}>
            Next →
          </button>
        </div>
      )}

      {step === 2 && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>You're all set, {form.displayName.split(' ')[0]}!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.6 }}>
            Here's what you can do:
          </p>

          <div style={{ textAlign: 'left', maxWidth: 320, margin: '0 auto 24px' }}>
            {[
              { icon: '📋', text: 'Log every case with CPT codes, implants, and approach' },
              { icon: '🩻', text: 'Upload de-identified X-rays (NO patient info!)' },
              { icon: '💡', text: 'Share tips and pearls with your co-residents' },
              { icon: '🔍', text: 'Search 120+ ortho CPT codes instantly' },
              { icon: '📊', text: 'Track your case volume and subspecialty exposure' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span style={{ fontSize: 14, lineHeight: 1.4 }}>{item.text}</span>
              </div>
            ))}
          </div>

          <div style={{ background: '#fef3c7', borderRadius: 12, padding: 16, marginBottom: 24, textAlign: 'left' }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#92400e', marginBottom: 4 }}>⚠️ Important</p>
            <p style={{ fontSize: 13, color: '#78350f', lineHeight: 1.5 }}>
              This app stores <strong>zero patient information</strong>. Never include patient names, MRNs, DOBs, or any identifiers in your case notes or X-ray uploads.
            </p>
          </div>

          <button className="btn btn-primary btn-block" onClick={handleFinish}>
            Start Logging Cases →
          </button>
        </div>
      )}
    </div>
  )
}
