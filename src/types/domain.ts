export const PARAMETER_KEYS = ['moisture', 'temperature', 'ec', 'ph', 'nitrogen', 'phosphorus', 'potassium'] as const;
export type ParameterKey = (typeof PARAMETER_KEYS)[number];

export type SessionStatus = 'active' | 'paused' | 'completed';
export type DataOrigin = 'demo' | 'ble' | 'manual';
export type DataQuality = 'good' | 'fair' | 'poor' | 'unknown';
export type Classification = 'low' | 'normal' | 'high' | 'unconfigured';

export interface ParameterMeta { key: ParameterKey; label: string; shortLabel: string; unit: string; color: string; description: string; }
export const PARAMETER_META: Record<ParameterKey, ParameterMeta> = {
  moisture: { key: 'moisture', label: 'Soil moisture', shortLabel: 'Moisture', unit: '%', color: '#3d8b75', description: 'Volumetric moisture reported by the sensor' },
  temperature: { key: 'temperature', label: 'Temperature', shortLabel: 'Temperature', unit: '°C', color: '#d0714f', description: 'Probe temperature' },
  ec: { key: 'ec', label: 'Electrical conductivity', shortLabel: 'EC', unit: 'raw', color: '#42759b', description: 'Sensor electrical conductivity value' },
  ph: { key: 'ph', label: 'Acidity', shortLabel: 'pH', unit: 'pH', color: '#8067ad', description: 'Soil acidity / alkalinity' },
  nitrogen: { key: 'nitrogen', label: 'Nitrogen', shortLabel: 'N', unit: 'raw', color: '#5c9c56', description: 'Nitrogen sensor value' },
  phosphorus: { key: 'phosphorus', label: 'Phosphorus', shortLabel: 'P', unit: 'raw', color: '#b1813b', description: 'Phosphorus sensor value' },
  potassium: { key: 'potassium', label: 'Potassium', shortLabel: 'K', unit: 'raw', color: '#4e6f9e', description: 'Potassium sensor value' },
};

export type ReadingValues = Record<ParameterKey, number>;
export interface SensorReading { id: string; sessionId?: string; recordedAt: string; origin: DataOrigin; quality: DataQuality; sequence?: number; raw: ReadingValues; values: ReadingValues; }
export interface ReferenceRange { id: string; parameter: ParameterKey; cropType: string; soilType: string; growthStage: string; min: number; max: number; unit: string; sourceNote: string; verified: boolean; }
export interface AnalysisFinding { parameter: ParameterKey; classification: Classification; value: number; unit: string; message: string; sourceNote?: string; }
export interface AnalysisSnapshot { id: string; createdAt: string; cropType: string; soilType: string; growthStage: string; findings: AnalysisFinding[]; recommendations: string[]; warnings: string[]; aiExplanation?: string; }
export interface SessionStats { min: ReadingValues; max: ReadingValues; average: ReadingValues; variation: ReadingValues; }
export interface MeasurementSession { id: string; name: string; status: SessionStatus; origin: DataOrigin; startedAt: string; endedAt?: string; pausedAt?: string; notes: string; location: string; readings: SensorReading[]; stats: SessionStats; analyses: AnalysisSnapshot[]; warningEvents: string[]; }
export interface DeviceSettings { serviceUuid: string; characteristicUuid: string; deviceName: string; autoReconnect: boolean; demoMode: boolean; }
export interface CalibrationRule { parameter: ParameterKey; scale: number; offset: number; unit: string; verified: boolean; provenance: string; }
export interface AppSettings { cropType: string; soilType: string; growthStage: string; device: DeviceSettings; calibration: Record<ParameterKey, CalibrationRule>; references: ReferenceRange[]; }
export interface RepositoryState { sessions: MeasurementSession[]; settings: AppSettings; }
export interface DeviceConnectionState { status: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error'; name?: string; message?: string; lastPacketAt?: string; packetCount: number; }
