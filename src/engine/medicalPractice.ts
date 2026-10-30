import type { GameState, ProfessionalRecord, WorldCharacter } from '@/types/game';
import { careerById } from '@/data/careers';
import { HEALTH_CONDITION_BY_ID } from '@/content/healthConditions';
import { spawnKin } from './kinFactory';
import { clamp } from './random';
import { pushFeed } from './gameState';
import { appendCharacterMemory, appendFamilyMemory } from './worldJournal';

export function medicalAdviser(state: GameState, record: ProfessionalRecord, patientId: string): WorldCharacter | undefined {
  const eligible = (c?: WorldCharacter): c is WorldCharacter => {
    const career = c ? careerById(c.occupation.careerId) : undefined;
    return !!c?.alive && c.age >= 18 && c.id !== state.playerCharacterId && c.id !== patientId && c.id !== record.rivalId && career?.family === 'medicine' && career.tier >= 1 && c.stats.health >= 35 && !['imprisoned','exiled'].includes(c.legalState?.status ?? 'free');
  };
  const retained = state.world.characters[record.adviserId ?? ''];
  return eligible(retained) ? retained : Object.values(state.world.characters).find(eligible);
}
export function retainMedicalAdviser(state: GameState, record: ProfessionalRecord, patientId: string): WorldCharacter {
  let adviser = medicalAdviser(state,record,patientId);
  if (!adviser) {
    adviser = spawnKin(state,{ kind: 'acquaintance',age: 38,role: 'Consulting physician',bio: 'A physician retained to review difficult symptoms and supervise care.' });
    adviser.occupation.careerId = 'physician'; adviser.occupation.performance = 75;
    adviser.stats.wits = Math.max(78,adviser.stats.wits);
    adviser.occupation.experience = Math.max(150,adviser.occupation.experience);
    adviser.skills!.scholarship.level = Math.max(4,adviser.skills!.scholarship.level);
    adviser.education!.qualifications = ['literacy','clerical_learning'];
  }
  record.adviserId = adviser.id;
  adviser.gold += 2;
  return adviser;
}
export function provideMedicalCare(patient: WorldCharacter, gain: number): void {
  const conditions = patient.healthConditions ?? [];
  const restorative = patient.stats.health < 65 || conditions.some(c => c.kind !== 'disability' && c.severity > 0);
  let supportive = false;
  for (const condition of conditions) {
    if (condition.severity <= 0) continue;
    condition.diagnosed = true;
    if (condition.kind === 'disability') {
      if (HEALTH_CONDITION_BY_ID[condition.conditionId]?.treatmentTags.includes('rest')) {
        condition.severity = Math.max(1,condition.severity - Math.min(4,gain)); supportive = true;
      }
    } else condition.severity = Math.max(0,condition.severity - gain * 2);
  }
  if (restorative || supportive) patient.stats.health = clamp(patient.stats.health + (restorative ? gain : 1));
  // Supportive care can ease chronic pain; it cannot erase a permanent disability.
  patient.healthConditions = conditions.filter(c => c.kind === 'disability' || c.severity > 0);
}
export function beginPatientCare(state: GameState, record: ProfessionalRecord, patient: WorldCharacter, succeeded: boolean, adviserId?: string): void {
  if (patient.stats.health >= 65 && !patient.healthConditions?.some(c => c.severity > 0)) return;
  const active = record.patientCare?.find(c => c.patientId === patient.id && c.clinicianId === state.playerCharacterId && c.status === 'awaiting_review');
  if (active) { active.treatmentSucceeded = succeeded; active.adviserId ??= adviserId; return; }
  record.patientCare = (record.patientCare ?? []).filter(c => c.status === 'awaiting_review').concat((record.patientCare ?? []).filter(c => c.status !== 'awaiting_review').slice(-20));
  record.patientCare.push({ id: `patient_care_${state.nextId++}`,patientId: patient.id,clinicianId: state.playerCharacterId,adviserId,startedYear: state.world.currentYear,reviewYear: state.world.currentYear + 1,baselineHealth: patient.stats.health,
    conditions: (patient.healthConditions ?? []).filter(c => c.severity > 0).map(c => ({ id: c.id,conditionId: c.conditionId,kind: c.kind,severity: c.severity })),treatmentSucceeded: succeeded,status: 'awaiting_review' });
}
export function recordMedicalFamilyGrievance(state: GameState, patient: WorldCharacter): void {
  const player = state.world.characters[state.playerCharacterId];
  const family = state.world.families[patient.birthFamilyId ?? ''], own = state.world.families[player.birthFamilyId ?? ''];
  if (!family || !own || family.id === own.id) return;
  family.inheritedMemories = appendFamilyMemory(family.inheritedMemories,{ id: `medical_grievance_${state.nextId++}`,year: state.world.currentYear,type: 'medical_grievance',sentiment: -30,salience: 5,summary: `${player.name}'s harmful intervention injured ${patient.name}; the household retains the complaint.` });
  if (patient.rankIdx >= 3) {
    family.enemyFamilyIds = [...new Set([...family.enemyFamilyIds,own.id])];
    own.enemyFamilyIds = [...new Set([...own.enemyFamilyIds,family.id])];
  }
}
/** Review actual health simulation results, once per saved case and at most twice per year. */
export function reviewPatientCare(state: GameState, record: ProfessionalRecord): void {
  if (record.lastCareReviewYear === state.world.currentYear) return;
  const due = (record.patientCare ?? []).filter(c => c.status === 'awaiting_review' && c.reviewYear <= state.world.currentYear).sort((a,b) => a.reviewYear - b.reviewYear || a.id.localeCompare(b.id)).slice(0,2);
  if (due.length) record.lastCareReviewYear = state.world.currentYear;
  for (const care of due) {
    const patient = state.world.characters[care.patientId], clinician = state.world.characters[care.clinicianId];
    care.reviewedYear = state.world.currentYear;
    if (!patient) { care.status = 'unavailable'; continue; }
    const active = (patient.healthConditions ?? []).filter(c => c.severity > 0);
    const current = active.filter(c => care.conditions.some(prior => prior.id === c.id));
    const newConditions = active.length - current.length;
    const priorSeverity = care.conditions.reduce((sum,c) => sum + c.severity,0), severity = current.reduce((sum,c) => sum + c.severity,0);
    if (!patient.alive) care.status = 'deceased';
    else if (severity > priorSeverity || patient.stats.health < care.baselineHealth - 4) care.status = 'declined';
    else if (!active.length && (care.conditions.length ? patient.stats.health >= care.baselineHealth : patient.stats.health >= 65)) care.status = 'recovered';
    else if (severity < priorSeverity || patient.stats.health > care.baselineHealth) care.status = 'improved';
    else care.status = 'stable';
    if (care.clinicianId === state.playerCharacterId && care.treatmentSucceeded) record.reputation = clamp(record.reputation + (care.status === 'recovered' ? 4 : care.status === 'improved' ? 2 : 0),-100,100);
    const summary = `${patient.name}: ${care.status === 'deceased' ? 'died before the planned review; the household is notified' : `${care.status} at follow-up; health ${patient.stats.health}, recorded symptom severity ${severity}${newConditions ? `; ${newConditions} other active condition(s) need examination` : ''}`}. Care was provided by ${clinician?.name ?? 'the previous practitioner'}${care.adviserId ? ` with ${state.world.characters[care.adviserId]?.name ?? 'a retained physician'}` : ''}.`;
    appendCharacterMemory(patient,{ id: `care_review_${state.nextId++}`,year: state.world.currentYear,type: 'medical_follow_up',actorIds: [care.clinicianId],sentiment: care.status === 'recovered' || care.status === 'improved' ? 15 : care.status === 'declined' ? -10 : 0,salience: 3,inherited: true,summary });
    pushFeed(state,'PATIENT FOLLOW-UP',care.status === 'recovered' || care.status === 'improved' ? '#387245' : '#a36a1f',summary,'plain');
  }
}

export function patientSummary(patient: WorldCharacter): string {
  const conditions = (patient.healthConditions ?? []).filter(c => c.severity > 0);
  return `${patient.name} · health ${patient.stats.health}. ${conditions.length ? conditions.map(c => `${c.diagnosed ? HEALTH_CONDITION_BY_ID[c.conditionId]?.name ?? c.conditionId.replaceAll('_',' ') : `Unconfirmed ${c.kind}`} (severity ${c.severity})`).join('; ') : patient.stats.health < 65 ? 'Low health; examine the cause before choosing care.' : 'No active condition is recorded. A preventive consultation does not create a diagnosis.'}`;
}
