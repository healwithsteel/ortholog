// Storage abstraction layer
// Hybrid: Supabase when configured + authenticated, localStorage as fallback
// Zero component changes needed — same API surface

import { supabase, isSupabaseConfigured } from './supabase'

const STORAGE_KEYS = {
  cases: 'ortholog_cases',
  tips: 'ortholog_tips',
  user: 'ortholog_user',
  settings: 'ortholog_settings',
}

// ─── Helper: get current auth user ID ───
function getUserId() {
  if (!isSupabaseConfigured() || !supabase) return null
  // Sync check — session is cached by supabase-js
  const session = supabase.auth?.session ?? null
  return session?.user?.id ?? null
}

// ─── CASES ───

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

// Async version for Supabase sync
export async function loadCasesAsync(userId) {
  if (!isSupabaseConfigured() || !userId) return loadCases()
  try {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
    if (error) throw error
    // Also cache locally for offline access
    if (data) localStorage.setItem(STORAGE_KEYS.cases, JSON.stringify(data))
    return data
  } catch (err) {
    console.warn('Supabase loadCases failed, falling back to localStorage:', err)
    return loadCases()
  }
}

export async function saveCaseAsync(caseData, userId) {
  // Always save locally first (offline-first)
  const cases = loadCases() || []
  const existing = cases.findIndex(c => c.id === caseData.id)
  if (existing >= 0) {
    cases[existing] = caseData
  } else {
    cases.unshift(caseData)
  }
  saveCases(cases)

  // Then sync to Supabase if available
  if (!isSupabaseConfigured() || !userId) return caseData
  try {
    const record = { ...caseData, user_id: userId }
    const { data, error } = await supabase
      .from('cases')
      .upsert(record, { onConflict: 'id' })
      .select()
      .single()
    if (error) throw error
    return data
  } catch (err) {
    console.warn('Supabase saveCaseAsync failed:', err)
    return caseData
  }
}

export async function deleteCaseAsync(caseId, userId) {
  // Remove locally
  const cases = loadCases() || []
  const filtered = cases.filter(c => c.id !== caseId)
  saveCases(filtered)

  // Remove from Supabase
  if (!isSupabaseConfigured() || !userId) return
  try {
    await supabase.from('cases').delete().eq('id', caseId).eq('user_id', userId)
  } catch (err) {
    console.warn('Supabase deleteCaseAsync failed:', err)
  }
}

// ─── TIPS ───

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

export async function loadTipsAsync(programId) {
  if (!isSupabaseConfigured() || !programId) return loadTips()
  try {
    const { data, error } = await supabase
      .from('tips')
      .select('*, tip_likes(count)')
      .eq('program_id', programId)
      .order('created_at', { ascending: false })
    if (error) throw error
    if (data) localStorage.setItem(STORAGE_KEYS.tips, JSON.stringify(data))
    return data
  } catch (err) {
    console.warn('Supabase loadTips failed, falling back to localStorage:', err)
    return loadTips()
  }
}

export async function saveTipAsync(tip, userId) {
  // Local first
  const tips = loadTips() || []
  tips.unshift(tip)
  saveTips(tips)

  if (!isSupabaseConfigured() || !userId) return tip
  try {
    const { data, error } = await supabase
      .from('tips')
      .insert({ ...tip, user_id: userId })
      .select()
      .single()
    if (error) throw error
    return data
  } catch (err) {
    console.warn('Supabase saveTipAsync failed:', err)
    return tip
  }
}

// ─── USER / PROFILE ───

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

export async function loadUserProfileAsync(userId) {
  if (!isSupabaseConfigured() || !userId) return loadUser()
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*, programs(*)')
      .eq('id', userId)
      .single()
    if (error) throw error
    if (data) saveUser(data)
    return data
  } catch (err) {
    console.warn('Supabase loadProfile failed:', err)
    return loadUser()
  }
}

export async function saveUserProfileAsync(profile, userId) {
  saveUser(profile)
  if (!isSupabaseConfigured() || !userId) return profile
  try {
    const { data, error } = await supabase
      .from('users')
      .upsert({ ...profile, id: userId }, { onConflict: 'id' })
      .select()
      .single()
    if (error) throw error
    return data
  } catch (err) {
    console.warn('Supabase saveProfile failed:', err)
    return profile
  }
}

// ─── SETTINGS ───

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

// ─── X-RAY STORAGE ───

export async function uploadXrayAsync(file, caseId, userId) {
  if (!isSupabaseConfigured() || !userId) {
    // Fallback: store as base64 in localStorage (existing behavior)
    return null
  }
  try {
    const fileName = `${userId}/${caseId}/${Date.now()}-${file.name}`
    const { data, error } = await supabase.storage
      .from('xrays')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false
      })
    if (error) throw error
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from('xrays')
      .getPublicUrl(data.path)
    
    return urlData.publicUrl
  } catch (err) {
    console.warn('Supabase xray upload failed:', err)
    return null
  }
}

// ─── EXPORT / IMPORT ───

export function exportAllData() {
  return {
    cases: loadCases() || [],
    tips: loadTips() || [],
    user: loadUser(),
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
  }
}

export function importData(data) {
  if (data.cases) saveCases(data.cases)
  if (data.tips) saveTips(data.tips)
  if (data.user) saveUser(data.user)
}

export function clearAllData() {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key))
}
