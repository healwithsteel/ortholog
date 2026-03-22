// PWA Install Prompt — shows a native-feeling banner when the app is installable
import { useState, useEffect } from 'react'

export function useInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true)
      return
    }

    // Check if user dismissed recently
    const dismissed = localStorage.getItem('ortholog_install_dismissed')
    if (dismissed) {
      const dismissedAt = parseInt(dismissed)
      const threeDays = 3 * 24 * 60 * 60 * 1000
      if (Date.now() - dismissedAt < threeDays) return
    }

    const handler = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
      // Show banner after 10 seconds of use
      setTimeout(() => setShowBanner(true), 10000)
    }

    window.addEventListener('beforeinstallprompt', handler)
    
    // Also detect iOS (no beforeinstallprompt event)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
    if (isIOS && !window.navigator.standalone) {
      setTimeout(() => setShowBanner(true), 10000)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const install = async () => {
    if (!installPrompt) return false
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setIsInstalled(true)
      setShowBanner(false)
    }
    setInstallPrompt(null)
    return outcome === 'accepted'
  }

  const dismiss = () => {
    setShowBanner(false)
    localStorage.setItem('ortholog_install_dismissed', Date.now().toString())
  }

  return { showBanner, isInstalled, install, dismiss, isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent) }
}

// Install Banner Component
export function InstallBanner({ onInstall, onDismiss, isIOS }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 70,
      left: 12,
      right: 12,
      background: 'linear-gradient(135deg, #1e3a5f, #2c5282)',
      borderRadius: 16,
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      zIndex: 9999,
      animation: 'slideUp 0.4s ease-out'
    }}>
      <div style={{ fontSize: 32 }}>📱</div>
      <div style={{ flex: 1 }}>
        <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>
          Install OrthoLog
        </div>
        <div style={{ color: '#a0c4e8', fontSize: 12, marginTop: 2 }}>
          {isIOS 
            ? 'Tap the share button ⬆ then "Add to Home Screen"'
            : 'Add to your home screen for quick access'
          }
        </div>
      </div>
      {!isIOS && (
        <button
          onClick={onInstall}
          style={{
            background: '#d69e2e',
            color: '#1a202c',
            border: 'none',
            borderRadius: 10,
            padding: '8px 16px',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer'
          }}
        >
          Install
        </button>
      )}
      <button
        onClick={onDismiss}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#a0c4e8',
          fontSize: 18,
          cursor: 'pointer',
          padding: '4px 8px'
        }}
      >
        ✕
      </button>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
