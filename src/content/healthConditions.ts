import { HealthConditionKind } from '@/types/game';

export interface HealthConditionDef {
  id: string;
  name: string;
  kind: HealthConditionKind;
  contagious: boolean;
  baseProgression: number;
  recoveryChance: number;
  mortalityAtSeverity: number;
  treatmentTags: string[];
  summary: string;
}

function condition(
  id: string,
  name: string,
  kind: HealthConditionKind,
  baseProgression: number,
  recoveryChance: number,
  mortalityAtSeverity: number,
  contagious = false,
  treatmentTags: string[] = ['rest'],
): HealthConditionDef {
  return { id, name, kind, contagious, baseProgression, recoveryChance, mortalityAtSeverity, treatmentTags, summary: `${name} can change health, work and household life from one year to the next.` };
}

export const HEALTH_CONDITIONS: HealthConditionDef[] = [
  condition('winter_fever', 'Winter Fever', 'illness', 4, 0.36, 86, true, ['rest', 'herbalist']),
  condition('flux', 'The Flux', 'illness', 7, 0.28, 78, true, ['rest', 'herbalist']),
  condition('pox', 'The Pox', 'illness', 5, 0.24, 82, true, ['rest']),
  condition('ague', 'Ague', 'illness', 3, 0.42, 88, true, ['rest', 'herbalist']),
  condition('consumption', 'Consumption', 'illness', 6, 0.12, 72, true, ['rest']),
  condition('infected_wound', 'Infected Wound', 'illness', 8, 0.22, 74, false, ['physician', 'herbalist']),
  condition('gut_sickness', 'Gut Sickness', 'illness', 4, 0.38, 84, true, ['rest', 'herbalist']),
  condition('lung_fever', 'Lung Fever', 'illness', 7, 0.2, 76, true, ['rest', 'physician']),
  condition('plague', 'Pestilence', 'illness', 12, 0.08, 58, true, ['isolation', 'physician']),
  condition('childbed_fever', 'Childbed Fever', 'illness', 9, 0.18, 68, false, ['rest', 'physician']),
  condition('broken_bone', 'Broken Bone', 'injury', 2, 0.44, 95, false, ['rest', 'physician']),
  condition('deep_cut', 'Deep Cut', 'injury', 5, 0.35, 82, false, ['physician', 'herbalist']),
  condition('burns', 'Burns', 'injury', 6, 0.24, 76, false, ['rest', 'physician']),
  condition('head_injury', 'Head Injury', 'injury', 5, 0.2, 72, false, ['rest']),
  condition('failing_sight', 'Failing Sight', 'disability', 1, 0, 101, false, []),
  condition('chronic_pain', 'Chronic Pain', 'disability', 1, 0, 101, false, ['rest']),
];

export const HEALTH_CONDITION_BY_ID = Object.fromEntries(HEALTH_CONDITIONS.map((item) => [item.id, item]));
