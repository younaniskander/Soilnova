import { PARAMETER_KEYS, PARAMETER_META, type AnalysisSnapshot, type Classification, type ReadingValues, type ReferenceRange } from '../types/domain';

export function classify(value: number, range?: ReferenceRange): Classification {
  if (!range) return 'unconfigured';
  return value < range.min ? 'low' : value > range.max ? 'high' : 'normal';
}

export function analyzeReading(values: ReadingValues, references: ReferenceRange[], context: Pick<AnalysisSnapshot, 'cropType' | 'soilType' | 'growthStage'>): AnalysisSnapshot {
  const findings = PARAMETER_KEYS.map((parameter) => {
    const range = references.find((item) => item.verified && item.parameter === parameter && item.cropType === context.cropType && item.soilType === context.soilType && item.growthStage === context.growthStage);
    const classification = classify(values[parameter], range);
    const value = values[parameter];
    const unit = range?.unit || PARAMETER_META[parameter].unit;
    const message = classification === 'unconfigured' ? 'Reference range not configured.' : classification === 'low' ? 'Below the configured reference range.' : classification === 'high' ? 'Above the configured reference range.' : 'Within the configured reference range.';
    return { parameter, classification, value, unit, message, sourceNote: range?.sourceNote };
  });
  const recommendations: string[] = [];
  const warnings: string[] = [];
  findings.forEach((finding) => {
    if (finding.classification === 'low') { recommendations.push(`${PARAMETER_META[finding.parameter].shortLabel} is below the configured range; review field conditions before making an amendment.`); }
    if (finding.classification === 'high') { warnings.push(`${PARAMETER_META[finding.parameter].shortLabel} is above the configured range; validate with a lab or agronomist before intervention.`); }
  });
  return { id: `analysis-${Date.now()}`, createdAt: new Date().toISOString(), ...context, findings, recommendations, warnings };
}
