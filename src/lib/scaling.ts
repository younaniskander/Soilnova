import { PARAMETER_KEYS, PARAMETER_META, type CalibrationRule, type ParameterKey, type ReadingValues } from '../types/domain';

export const DEFAULT_CALIBRATION: Record<ParameterKey, CalibrationRule> = {
  moisture: { parameter: 'moisture', scale: 0.1, offset: 0, unit: '%', verified: false, provenance: 'Supplied ESP32 firmware divides register 0 by 10; verify against the sensor datasheet.' },
  temperature: { parameter: 'temperature', scale: 0.1, offset: 0, unit: '°C', verified: false, provenance: 'Supplied ESP32 firmware divides register 1 by 10; verify signed representation and units.' },
  ec: { parameter: 'ec', scale: 1, offset: 0, unit: 'raw', verified: false, provenance: 'Supplied ESP32 firmware displays register 2 raw; configure verified EC units and scale.' },
  ph: { parameter: 'ph', scale: 0.1, offset: 0, unit: 'pH', verified: false, provenance: 'Supplied ESP32 firmware divides register 3 by 10; verify probe mapping.' },
  nitrogen: { parameter: 'nitrogen', scale: 1, offset: 0, unit: 'raw', verified: false, provenance: 'Supplied ESP32 firmware displays register 4 raw; configure verified units.' },
  phosphorus: { parameter: 'phosphorus', scale: 1, offset: 0, unit: 'raw', verified: false, provenance: 'Supplied ESP32 firmware displays register 5 raw; configure verified units.' },
  potassium: { parameter: 'potassium', scale: 1, offset: 0, unit: 'raw', verified: false, provenance: 'Supplied ESP32 firmware displays register 6 raw; configure verified units.' },
};

export function applyCalibration(raw: ReadingValues, calibration: Record<ParameterKey, CalibrationRule>): ReadingValues {
  return Object.fromEntries(PARAMETER_KEYS.map((key) => [key, Number((raw[key] * calibration[key].scale + calibration[key].offset).toFixed(3))])) as ReadingValues;
}

export function formatValue(key: ParameterKey, value: number, calibration: Record<ParameterKey, CalibrationRule>): string {
  const unit = calibration[key]?.unit || PARAMETER_META[key].unit;
  const digits = key === 'temperature' || key === 'moisture' || key === 'ph' ? 1 : 0;
  return `${value.toFixed(digits)} ${unit}`;
}
