// Supabase data service — bridges local storage with cloud persistence
import { supabase, isSupabaseConfigured } from './supabase'

// ─── USER PROFILE ───
export async function upsertUserProfile(authUser, metadata = {}) {
  if (!isSupabaseConfigured() || !authUser) return null
  
  const profile = {
    id: authUser.id,
    email: authUser.email,
    display_name: metadata.display_name || authUser.user_metadata?.display_name || authUser.email.split('@')[0],
    pgy_year: metadata.pgy_year || authUser.user_metadata?.pgy_year || null,
    role: 'resident',
    tier: 'free',
  }
  
  // Try to resolve invite code to program
  const inviteCode = metadata.invite_code || authUser.user_metadata?.invite_code
  if (inviteCode) {
    const { data: prog } = await supabase
      .from('programs')
      .select('id')
      .eq('invite_code', inviteCode)
      .single()
    if (prog) profile.program_id = prog.id
  }
  
  const { data, error } = await supabase
    .from('users')
    .upsert(profile, { onConflict: 'id' })
    .select()
    .single()
  
  if (error) console.error('upsertUserProfile error:', error)
  return data
}

export async function getUserProfile(userId) {
  if (!isSupabaseConfigured()) return null
  const { data, error } = await supabase
    .from('users')
    .select('*, programs(*)')
    .eq('id', userId)
    .single()
  if (error) console.error('getUserProfile error:', error)
  return data
}

// ─── CASES ───
export async function loadCasesFromSupabase(userId) {
  if (!isSupabaseConfigured()) return null
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
  if (error) { console.error('loadCases error:', error); return null }
  return data
}

export async function saveCaseToSupabase(caseData, userId) {
  if (!isSupabaseConfigured()) return null
  const record = {
    id: caseData.id,
    user_id: userId,
    date: caseData.date,
    patient_age: caseData.patientAge || null,
    patient_sex: caseData.patientSex || null,
    diagnosis: caseData.diagnosis || caseData.category || 'Unknown',
    icd10: caseData.icd10 || null,
    procedures: caseData.procedures || [],
    approach: caseData.approach || null,
    implants: caseData.implants || [],
    reduction_aid: caseData.reductionAid || null,
    attending: caseData.attending || null,
    role: caseData.role || 'Primary Surgeon',
    complications: caseData.complications || null,
    notes: caseData.notes || null,
    is_emergency: caseData.isEmergency || false,
    blood_loss_ml: caseData.bloodLossMl || null,
    operative_time_min: caseData.operativeTimeMin || null,
  }
  
  const { data, error } = await supabase
    .from('cases')
    .upsert(record, { onConflict: 'id' })
    .select()
    .single()
  
  if (error) console.error('saveCase error:', error)
  return data
}

export async function deleteCaseFromSupabase(caseId) {
  if (!isSupabaseConfigured()) return
  const { error } = await supabase.from('cases').delete().eq('id', caseId)
  if (error) console.error('deleteCase error:', error)
}

// ─── TIPS ───
export async function loadTipsFromSupabase(programId) {
  if (!isSupabaseConfigured()) return null
  const query = supabase.from('tips').select('*, users(display_name)').order('created_at', { ascending: false })
  if (programId) query.eq('program_id', programId)
  const { data, error } = await query
  if (error) { console.error('loadTips error:', error); return null }
  return data
}

export async function saveTipToSupabase(tip, userId, programId) {
  if (!isSupabaseConfigured()) return null
  const record = {
    id: tip.id,
    user_id: userId,
    program_id: programId || null,
    title: tip.title,
    body: tip.body || tip.content || '',
    category: tip.category || null,
    tags: tip.tags || [],
    cpt_codes: tip.cptCodes || [],
  }
  const { data, error } = await supabase
    .from('tips')
    .upsert(record, { onConflict: 'id' })
    .select()
    .single()
  if (error) console.error('saveTip error:', error)
  return data
}

// ─── TIP LIKES ───
export async function toggleTipLike(tipId, userId) {
  if (!isSupabaseConfigured()) return
  const { data: existing } = await supabase
    .from('tip_likes')
    .select('id')
    .eq('tip_id', tipId)
    .eq('user_id', userId)
    .single()
  
  if (existing) {
    await supabase.from('tip_likes').delete().eq('id', existing.id)
    return false // unliked
  } else {
    await supabase.from('tip_likes').insert({ tip_id: tipId, user_id: userId })
    return true // liked
  }
}

// ─── CODING PROGRESS ───
export async function loadCodingProgress(userId) {
  if (!isSupabaseConfigured()) return null
  const { data, error } = await supabase
    .from('coding_progress')
    .select('*')
    .eq('user_id', userId)
  if (error) { console.error('loadCodingProgress error:', error); return null }
  return data
}

export async function saveCodingProgress(userId, scenarioId, score) {
  if (!isSupabaseConfigured()) return null
  const { data, error } = await supabase
    .from('coding_progress')
    .upsert({
      user_id: userId,
      scenario_id: scenarioId,
      completed: true,
      score,
      attempts: 1, // will increment via RPC later
      last_attempt_at: new Date().toISOString(),
    }, { onConflict: 'user_id,scenario_id' })
    .select()
    .single()
  if (error) console.error('saveCodingProgress error:', error)
  return data
}

// ─── XRAYS ───
export async function uploadXRay(file, caseId, userId, metadata = {}) {
  if (!isSupabaseConfigured()) return null
  
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${userId}/${caseId}/${Date.now()}.${ext}`
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('xrays')
    .upload(path, file, { contentType: file.type })
  
  if (uploadError) { console.error('uploadXRay error:', uploadError); return null }
  
  const { data: urlData } = supabase.storage.from('xrays').getPublicUrl(path)
  
  const { data, error } = await supabase
    .from('xrays')
    .insert({
      case_id: caseId,
      user_id: userId,
      storage_path: path,
      public_url: urlData?.publicUrl || null,
      description: metadata.description || null,
      timing: metadata.timing || null,
      phi_confirmed_clean: metadata.phiConfirmedClean || false,
    })
    .select()
    .single()
  
  if (error) console.error('xray record error:', error)
  return data
}

export async function loadXRaysForCase(caseId) {
  if (!isSupabaseConfigured()) return null
  const { data, error } = await supabase
    .from('xrays')
    .select('*')
    .eq('case_id', caseId)
    .order('created_at', { ascending: true })
  if (error) { console.error('loadXRays error:', error); return null }
  return data
}
