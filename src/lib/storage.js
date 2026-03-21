// Storage abstraction layer
// Currently uses localStorage; swap to Supabase later with zero component changes

const STORAGE_KEYS = {
  cases: 'ortholog_cases',
  tips: 'ortholog_tips',
  user: 'ortholog_user',
  settings: 'ortholog_settings',
}

export function loadCases() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.cases)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveCases(cases) {
  localStorage.setItem(STORAGE_KEYS.cases, JSON.stringify(cases))
}

export function loadTips() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.tips)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveTips(tips) {
  localStorage.setItem(STORAGE_KEYS.tips, JSON.stringify(tips))
}

export function loadUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.user)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveUser(user) {
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user))
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.settings)
    return raw ? JSON.parse(raw) : { darkMode: false, notifications: true }
  } catch {
    return { darkMode: false, notifications: true }
  }
}

export function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings))
}

// Export all data as JSON (for backup/transfer)
export function exportAllData() {
  return {
    cases: loadCases() || [],
    tips: loadTips() || [],
    user: loadUser(),
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
  }
}

// Import data from JSON backup
export function importData(data) {
  if (data.cases) saveCases(data.cases)
  if (data.tips) saveTips(data.tips)
  if (data.user) saveUser(data.user)
}

// Clear all data
export function clearAllData() {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key))
}
