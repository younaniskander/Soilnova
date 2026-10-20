import { supabase } from './supabase';
import type { AppSettings, MeasurementSession, ReferenceRange, RepositoryState } from '../types/domain';

/**
 * Optional authenticated adapter. The running demo intentionally falls back to localStorage
 * until a Supabase session exists; this boundary keeps permanent persistence out of UI code.
 */
export async function getSupabaseUserId(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function persistSessionToSupabase(session: MeasurementSession): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const ownerId = await getSupabaseUserId();
  if (!ownerId) throw new Error('Sign in before saving to Supabase.');
  const { error: sessionError } = await supabase.from('measurement_sessions').upsert({
    id: session.id, owner_id: ownerId, name: session.name, status: session.status, origin: session.origin,
    started_at: session.startedAt, ended_at: session.endedAt ?? null, notes: session.notes, location: session.location,
  });
  if (sessionError) throw sessionError;
  const rows = session.readings.map((reading) => ({ id: reading.id, owner_id: ownerId, session_id: session.id, recorded_at: reading.recordedAt, origin: reading.origin, quality: reading.quality, sequence: reading.sequence ?? null, raw: reading.raw, values: reading.values }));
  if (rows.length) { const { error } = await supabase.from('readings').upsert(rows); if (error) throw error; }
}

export async function persistReferenceToSupabase(reference: ReferenceRange): Promise<void> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const ownerId = await getSupabaseUserId();
  if (!ownerId) throw new Error('Sign in before saving to Supabase.');
  const { error } = await supabase.from('reference_ranges').upsert({ id: reference.id, owner_id: ownerId, parameter: reference.parameter, crop_type: reference.cropType, soil_type: reference.soilType, growth_stage: reference.growthStage, min_value: reference.min, max_value: reference.max, unit: reference.unit, source_note: reference.sourceNote, verified: reference.verified });
  if (error) throw error;
}

export async function loadSupabaseState(fallback: RepositoryState): Promise<RepositoryState> {
  if (!supabase) return fallback;
  const ownerId = await getSupabaseUserId();
  if (!ownerId) return fallback;
  const { data: sessions, error } = await supabase.from('measurement_sessions').select('*, readings(*)').eq('owner_id', ownerId).order('started_at', { ascending: false });
  if (error || !sessions) return fallback;
  // The UI keeps its typed statistics locally; persisted rows remain the source of truth for readings.
  const mapped: MeasurementSession[] = sessions.map((row: any) => ({ ...fallback.sessions[0], id: row.id, name: row.name, status: row.status, origin: row.origin, startedAt: row.started_at, endedAt: row.ended_at ?? undefined, notes: row.notes ?? '', location: row.location ?? '', readings: (row.readings ?? []).map((reading: any) => ({ id: reading.id, sessionId: reading.session_id, recordedAt: reading.recorded_at, origin: reading.origin, quality: reading.quality, sequence: reading.sequence ?? undefined, raw: reading.raw, values: reading.values })), analyses: [], warningEvents: [] })) as MeasurementSession[];
  return { ...fallback, sessions: mapped };
}

export type { AppSettings };
