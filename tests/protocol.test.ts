import { describe, expect, it } from 'vitest';
import { decodeSnp1, encodeSnp1 } from '../src/lib/protocol';
import { applyCalibration, DEFAULT_CALIBRATION } from '../src/lib/scaling';
import type { ReadingValues } from '../src/types/domain';

const raw: ReadingValues = { moisture: 421, temperature: -53, ec: 655, ph: 64, nitrogen: 119, phosphorus: 42, potassium: 167 };

describe('SNP1 packet protocol', () => {
  it('round-trips the seven raw sensor values', () => { const result = decodeSnp1(encodeSnp1(raw, 7)); expect(result.ok).toBe(true); if (result.ok) { expect(result.packet.sequence).toBe(7); expect(result.packet.raw).toEqual(raw); expect(result.packet.dataValid).toBe(true); } });
  it('rejects malformed length and CRC', () => { expect(decodeSnp1(new Uint8Array([0x53, 0x4e]))).toMatchObject({ ok: false }); const packet = encodeSnp1(raw); packet[10] ^= 0xff; expect(decodeSnp1(packet)).toMatchObject({ ok: false, error: 'Packet CRC-8 validation failed.' }); });
  it('rejects an unsupported version', () => { const packet = encodeSnp1(raw); packet[2] = 9; expect(decodeSnp1(packet)).toMatchObject({ ok: false, error: 'Unsupported packet version 9.' }); });
  it('rejects unknown flag bits', () => { const packet = encodeSnp1(raw); packet[3] = 0x81; packet[19] = 0; expect(decodeSnp1(packet)).toMatchObject({ ok: false, error: 'Packet contains unknown flags.' }); });
});

describe('calibration', () => {
  it('applies supplied firmware scale defaults', () => { const scaled = applyCalibration(raw, DEFAULT_CALIBRATION); expect(scaled.moisture).toBe(42.1); expect(scaled.temperature).toBe(-5.3); expect(scaled.ph).toBe(6.4); expect(scaled.ec).toBe(655); });
  it('supports offsets without mutating raw data', () => { const calibration = { ...DEFAULT_CALIBRATION, moisture: { ...DEFAULT_CALIBRATION.moisture, offset: 2 } }; const scaled = applyCalibration(raw, calibration); expect(scaled.moisture).toBe(44.1); expect(raw.moisture).toBe(421); });
});
