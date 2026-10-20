import { describe, expect, it } from 'vitest';
import { analyzeReading } from '../src/lib/analysis';
import type { ReadingValues, ReferenceRange } from '../src/types/domain';

const values: ReadingValues = { moisture: 45, temperature: 21, ec: 600, ph: 6.4, nitrogen: 110, phosphorus: 42, potassium: 160 };
const context = { cropType: 'Tomato', soilType: 'Loam', growthStage: 'Vegetative' };
const range = (verified: boolean): ReferenceRange => ({ id: 'r1', parameter: 'moisture', cropType: 'Tomato', soilType: 'Loam', growthStage: 'Vegetative', min: 30, max: 60, unit: '%', sourceNote: 'Test source', verified });

describe('soil analysis guardrails', () => {
  it('does not classify an unverified range', () => { const result = analyzeReading(values, [range(false)], context); expect(result.findings.find((finding) => finding.parameter === 'moisture')?.classification).toBe('unconfigured'); });
  it('classifies only a verified matching range', () => { const result = analyzeReading(values, [range(true)], context); expect(result.findings.find((finding) => finding.parameter === 'moisture')?.classification).toBe('normal'); });
});
