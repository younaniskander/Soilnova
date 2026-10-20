import { describe, expect, it } from 'vitest';
import { calculateStats, makeReading, updateSession } from '../src/lib/session';
import type { MeasurementSession, ReadingValues } from '../src/types/domain';

const values = (moisture: number): ReadingValues => ({ moisture, temperature: 20, ec: 600, ph: 6.3, nitrogen: 100, phosphorus: 40, potassium: 150 });
const session = (id: string, readingValues: ReadingValues): MeasurementSession => { const reading = makeReading(readingValues, readingValues, 'manual', 1, id); return { id, name: id, status: 'active', origin: 'manual', startedAt: new Date().toISOString(), notes: '', location: '', readings: [reading], stats: calculateStats([reading]), analyses: [], warningEvents: [] }; };

describe('session storage semantics', () => {
  it('calculates min, max, average and variation', () => { const readings = [makeReading(values(20), values(20), 'manual'), makeReading(values(40), values(40), 'manual')]; const stats = calculateStats(readings); expect(stats.min.moisture).toBe(20); expect(stats.max.moisture).toBe(40); expect(stats.average.moisture).toBe(30); expect(stats.variation.moisture).toBe(20); });
  it('appends a reading instead of overwriting the prior one', () => { const first = session('session-a', values(22)); const next = makeReading(values(25), values(25), 'manual', 2, first.id); const updated = updateSession(first, { readings: [...first.readings, next] }); expect(updated.readings).toHaveLength(2); expect(updated.readings[0].values.moisture).toBe(22); expect(updated.readings[1].values.moisture).toBe(25); });
  it('keeps separate session ids isolated', () => { const a = session('session-a', values(10)); const b = session('session-b', values(90)); const reading = makeReading(values(20), values(20), 'manual', 2, a.id); const updatedA = updateSession(a, { readings: [...a.readings, reading] }); expect(updatedA.readings).toHaveLength(2); expect(b.readings).toHaveLength(1); expect(b.readings[0].sessionId).toBe('session-b'); });
});
