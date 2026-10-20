import { DEFAULT_CHARACTERISTIC_UUID, DEFAULT_SERVICE_UUID } from '../types/protocol';
import { PARAMETER_KEYS, type AppSettings, type MeasurementSession, type RepositoryState } from '../types/domain';
import { DEFAULT_CALIBRATION } from './scaling';
import { makeDemoSession } from './session';

const STORAGE_KEY = 'soilnova-state-v1';
export function defaultSettings(): AppSettings { return { cropType: 'Unspecified crop', soilType: 'Unspecified soil', growthStage: 'Unspecified stage', device: { serviceUuid: DEFAULT_SERVICE_UUID, characteristicUuid: DEFAULT_CHARACTERISTIC_UUID, deviceName: 'SoilNova ESP32', autoReconnect: true, demoMode: true }, calibration: { ...DEFAULT_CALIBRATION }, references: [] }; }
export function createInitialState(): RepositoryState { return { sessions: [makeDemoSession(0), makeDemoSession(1)], settings: defaultSettings() }; }
export function loadState(): RepositoryState { if (typeof window === 'undefined') return createInitialState(); try { const stored = window.localStorage.getItem(STORAGE_KEY); if (!stored) return createInitialState(); const parsed = JSON.parse(stored) as RepositoryState; return parsed.sessions?.length && parsed.settings ? parsed : createInitialState(); } catch { return createInitialState(); } }
export function saveState(state: RepositoryState): void { if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
export function isSupabaseConfigured(): boolean { return Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY); }
export function settingsCoverage(settings: AppSettings): number { return Math.round((PARAMETER_KEYS.filter((key) => settings.calibration[key].verified).length / PARAMETER_KEYS.length) * 100); }
export const persistenceLabel = isSupabaseConfigured() ? 'Supabase connected' : 'Offline demo storage';
export type { MeasurementSession };
