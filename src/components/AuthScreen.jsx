import React, { useState } from 'react'
import { useAuth } from '../lib/auth'

export default function AuthScreen({ onAuthComplete }) {
  const { signUp, signIn, signInWithMagicLink } = useAuth()
  const [mode, setMode] = useState('login') // login | signup | magic
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [pgyYear, setPgyYear] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignUp = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    if (!email || !password || !displayName) {
      setError('Please fill in all required fields')
      setLoading(false)
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    const { data, error: err } = await signUp(email, password, {
      display_name: displayName,
      pgy_year: pgyYear ? parseInt(pgyYear) : null,
      invite_code: inviteCode || null
    })
    
    setLoading(false)
    if (err) {
      setError(err.message)
    } else {
      setSuccess('Check your email for a confirmation link! (Check spam folder too)')
    }
  }

  const handleSignIn = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    const { data, error: err } = await signIn(email, password)
    setLoading(false)
    
    if (err) {
      setError(err.message)
    }
    // Auth state listener in App.jsx will handle the redirect
  }

  const handleMagicLink = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    const { data, error: err } = await signInWithMagicLink(email)
    setLoading(false)
    
    if (err) {
      setError(err.message)
    } else {
      setSuccess('Check your email for a sign-in link!')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a1628 0%, #1a2a4a 50%, #0d1b2a 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    }}>
      {/* Logo & Title */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <img src="/ortholog/rocf-logo.png" alt="OrthoLog" style={{ width: 72, height: 72, objectFit: 'contain', borderRadius: 16, marginBottom: 12 }} />
        <h1 style={{ fontSize: 28, color: '#fff', fontWeight: 700, margin: 0 }}>OrthoLog</h1>
        <p style={{ color: '#8899aa', fontSize: 14, marginTop: 4 }}>Case Tracker for Orthopaedic Residents</p>
      </div>

      {/* Auth Card */}
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(10px)',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 380,
        border: '1px solid rgba(255,255,255,0.1)',
      }}>
        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)' }}>
          {[
            { key: 'login', label: 'Sign In' },
            { key: 'signup', label: 'Sign Up' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => { setMode(tab.key); setError(''); setSuccess('') }}
              style={{
                flex: 1,
                padding: '10px 0',
                background: mode === tab.key ? '#d4a843' : 'transparent',
                color: mode === tab.key ? '#0a1628' : '#8899aa',
                border: 'none',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Error / Success */}
        {error && (
          <div style={{ background: 'rgba(255,80,80,0.15)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: 8, padding: '10px 12px', marginBottom: 16, color: '#ff6b6b', fontSize: 13 }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ background: 'rgba(80,200,120,0.15)', border: '1px solid rgba(80,200,120,0.3)', borderRadius: 8, padding: '10px 12px', marginBottom: 16, color: '#50c878', fontSize: 13 }}>
            {success}
          </div>
        )}

        {/* Sign In Form */}
        {mode === 'login' && (
          <form onSubmit={handleSignIn}>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@hospital.com"
                style={inputStyle}
                required
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={inputStyle}
                required
              />
            </div>
            <button type="submit" disabled={loading} style={btnStyle}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => { setMode('magic'); setError(''); setSuccess('') }}
              style={{ ...linkBtnStyle, marginTop: 12 }}
            >
              Sign in with magic link instead
            </button>
          </form>
        )}

        {/* Sign Up Form */}
        {mode === 'signup' && (
          <form onSubmit={handleSignUp}>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Full Name *</label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Dr. Jane Smith"
                style={inputStyle}
                required
              />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Email *</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@hospital.com"
                style={inputStyle}
                required
              />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Password *</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                style={inputStyle}
                required
                minLength={6}
              />
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>PGY Year</label>
                <select
                  value={pgyYear}
                  onChange={e => setPgyYear(e.target.value)}
                  style={inputStyle}
                >
                  <option value="">Select...</option>
                  {[1,2,3,4,5,6,7,8].map(y => (
                    <option key={y} value={y}>PGY-{y}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Invite Code</label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={e => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="e.g. UCF-ORTHO-2026"
                  style={inputStyle}
                />
              </div>
            </div>
            <button type="submit" disabled={loading} style={btnStyle}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}

        {/* Magic Link */}
        {mode === 'magic' && (
          <form onSubmit={handleMagicLink}>
            <p style={{ color: '#8899aa', fontSize: 13, marginBottom: 16 }}>
              We'll send a sign-in link to your email — no password needed.
            </p>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@hospital.com"
                style={inputStyle}
                required
              />
            </div>
            <button type="submit" disabled={loading} style={btnStyle}>
              {loading ? 'Sending...' : 'Send Magic Link'}
            </button>
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); setSuccess('') }}
              style={{ ...linkBtnStyle, marginTop: 12 }}
            >
              Back to password sign-in
            </button>
          </form>
        )}
      </div>

      {/* Footer */}
      <p style={{ color: '#556677', fontSize: 11, marginTop: 24, textAlign: 'center' }}>
        Built with ✨ by Reconstructive Orthopaedics of Central Florida
      </p>
    </div>
  )
}

const labelStyle = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: '#8899aa',
  marginBottom: 4,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 8,
  color: '#fff',
  fontSize: 15,
  outline: 'none',
  boxSizing: 'border-box',
}

const btnStyle = {
  width: '100%',
  padding: '12px 0',
  background: '#d4a843',
  color: '#0a1628',
  border: 'none',
  borderRadius: 10,
  fontSize: 15,
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'all 0.2s',
}

const linkBtnStyle = {
  display: 'block',
  width: '100%',
  textAlign: 'center',
  background: 'none',
  border: 'none',
  color: '#d4a843',
  fontSize: 13,
  cursor: 'pointer',
  padding: 0,
}
