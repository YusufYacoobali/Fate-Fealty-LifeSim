import type { CareerFamily, Effects, GameState, ProfessionalRecord, WorldCharacter } from '@/types/game';
import { CAREER_SPECIALIZATIONS, CareerSpecialization } from '@/data/careerSpecializations';
import { careerById } from '@/data/careers';
import { addMoney, pushFeed } from './gameState';
import { spawnKin } from './kinFactory';
import { clamp } from './random';
import { grantSkillXp, skillLevel } from './rpgProgress';
import { applyRelationshipShift } from './relationshipState';
import { appendCharacterMemory, appendFamilyMemory } from './worldJournal';
import { timedActionAvailability } from './actionClock';

export function professionalRecord(character: WorldCharacter, family: CareerFamily): ProfessionalRecord {
  character.professionalHistory ??= {};
  return character.professionalHistory[family] ??= { reputation: 0, completedActions: [], milestones: [], contactIds: [], actionsYear: -1, actionsUsed: 0, lastWorkedYear: -1, matters: [] };
}
export function specializationAvailability(state: GameState, id: string): string | null {
  const time = timedActionAvailability(state); if (!time.available) return time.reason!;
  const def = CAREER_SPECIALIZATIONS.find(a => a.id === id);
  if (!def) return 'Unknown professional action';
  const career = careerById(state.occupation.careerId);
  if (!career || career.family !== def.family) return 'Requires this profession';
  if (career.premium && !state.lifetimeUnlocked) return 'Requires Premium access';
  if (state.gold < def.cost) return `Needs ${def.cost}g`;
  const record = state.world.characters[state.playerCharacterId].professionalHistory?.[def.family];
  if (record?.actionsYear === state.world.currentYear && record.actionsUsed >= 3) return 'Three professional matters per year';
  if (record?.actionYears?.[id] === state.world.currentYear) return 'Already undertaken this year';
  if (record?.matters.some(m => !m.resolved)) return 'Conclude your current professional matter first';
  if (def.qualification && !state.world.characters[state.playerCharacterId].education?.qualifications.includes(def.qualification)) return `Needs ${def.qualification.replaceAll('_', ' ')}`;
  return null;
}
function contactFor(state: GameState, def: CareerSpecialization, record: ProfessionalRecord): WorldCharacter {
  record.contactIds = record.contactIds.filter(id => !!state.world.characters[id]);
  const existing = record.contactIds.map(id => state.world.characters[id]).find(c => c.alive && c.id !== state.playerCharacterId);
  const contact = existing ?? Object.values(state.world.characters).find(c => c.id !== state.playerCharacterId && c.alive && c.age >= 18 && c.occupation.careerId === def.contactCareer)
    ?? spawnKin(state, { kind: 'acquaintance', age: 30, role: `${def.family} client`, bio: 'A recurring professional contact with a household and a long memory.' });
  if (!record.contactIds.includes(contact.id)) record.contactIds.push(contact.id);
  return contact;
}
export function recordProfessionalWork(state: GameState): void {
  const career = careerById(state.occupation.careerId); if (!career) return;
  const r = professionalRecord(state.world.characters[state.playerCharacterId], career.family);
  r.lastWorkedYear = state.world.currentYear;
  r.shifts = (r.shifts ?? 0) + 1;
  if (state.occupation.workedThisYear <= 6) r.reputation = clamp(r.reputation + 1, -100, 100);
  if (r.shifts >= 8 && !r.milestones.includes('field_training')) r.milestones.push('field_training');
}
export function performSpecialization(state: GameState, id: string): GameState {
  if (specializationAvailability(state, id)) return state;
  const def = CAREER_SPECIALIZATIONS.find(a => a.id === id)!;
  const p = state.world.characters[state.playerCharacterId];
  const r = professionalRecord(p, def.family);
  if (r.actionsYear !== state.world.currentYear) { r.actionsYear = state.world.currentYear; r.actionsUsed = 0; }
  r.actionsUsed++; (r.actionYears ??= {})[id] = state.world.currentYear;
  addMoney(state, -def.cost);
  const contact = contactFor(state, def, r);
  if (!r.rivalId || !state.world.characters[r.rivalId]?.alive) {
    r.rivalId = Object.values(state.world.characters).find(c => c.id !== p.id && c.id !== contact.id && c.alive && (c.worldMemories?.some(m => m.type === 'school_grudge' && m.actorIds.includes(p.id)) || c.birthFamilyId && state.world.families[p.birthFamilyId ?? '']?.enemyFamilyIds.includes(c.birthFamilyId)))?.id
      ?? spawnKin(state, { kind: 'foe', age: Math.max(18, state.age), role: `${def.family} rival`, bio: 'A professional competitor who keeps copies of every agreement.' }).id;
  }
  const sign = ['diseasePressure', 'warThreat', 'religiousTension'].includes(def.condition) || def.family === 'outlaw' ? -1 : 1;
  state.world.conditions[def.condition] = clamp(state.world.conditions[def.condition] + sign * 3);
  state.world.factions[def.faction].playerStanding = clamp(state.world.factions[def.faction].playerStanding + 3, -100, 100);
  const household = state.world.households.find(h => h.id === p.householdId);
  switch (def.mechanism) {
    case 'crops': state.holding.stores = clamp(state.holding.stores + 9); grantSkillXp(state, 'husbandry', 4, 'crop rotation'); break;
    case 'tenancy': if (household) { household.wealth += 4; household.foodSecurity = clamp((household.foodSecurity ?? 50) + 5); } break;
    case 'livestock': state.holding.stores = clamp(state.holding.stores + 5); break;
    case 'commission': state.rpg.materials.iron += 1; addMoney(state, 4); break;
    case 'apprentice': {
      let apprentice = r.apprenticeId ? state.world.characters[r.apprenticeId] : undefined;
      if (!apprentice?.alive) { apprentice = spawnKin(state, { kind: 'acquaintance', age: 12, role: 'Your workshop apprentice', bio: 'Learning under your care and paid from your workshop.' }); r.apprenticeId = apprentice.id; }
      apprentice.education!.track = 'guild'; apprentice.education!.progress = clamp(apprentice.education!.progress + 18);
      apprentice.education!.mentorId = p.id; apprentice.education!.startedYear ??= state.world.currentYear;
      apprentice.childDevelopment!.education = 'craft'; apprentice.childDevelopment!.investment += 4;
      apprentice.gold += 2; break;
    }
    case 'guild': r.reputation += 3; state.occupation.guildStanding = clamp((state.occupation.guildStanding ?? 0) + 7); break;
    case 'deal': contact.gold = Math.max(0, contact.gold - 3); addMoney(state, 5); break;
    case 'route': state.holding.security = clamp(state.holding.security + 6); break;
    case 'rival': applyRelationshipShift(state, r.rivalId, { affinity: -6 }, { affinity: -10, respect: 4 }); break;
    case 'sermon': state.stats.faith = clamp(state.stats.faith + 2); break;
    case 'dispute': applyRelationshipShift(state, contact.id, { trust: 5 }, { trust: 8 }); break;
    case 'appointment': if (r.reputation >= 15) { state.occupation.patronId = contact.id; r.milestones = [...new Set([...r.milestones, 'parish_responsibility'])]; } break;
    case 'patrol': state.holding.security = clamp(state.holding.security + 7); state.stats.health = Math.max(1, state.stats.health - 3); break;
    case 'troops': state.holding.security = clamp(state.holding.security + 5); break;
    case 'mission': state.holding.stores = clamp(state.holding.stores + 7); state.stats.health = Math.max(1, state.stats.health - 4); break;
    case 'patron': if (contact.rel >= 45) { state.occupation.patronId = contact.id; r.milestones = [...new Set([...r.milestones, 'patronage'])]; } break;
    case 'advice': contact.factionInfluence = clamp((contact.factionInfluence ?? 0) + 4); break;
    case 'audit': if (state.world.court) state.world.court.treasury += 6; break;
    case 'diagnose': {
      const condition = contact.healthConditions?.[0]; if (condition) condition.diagnosed = true;
      else if (contact.stats.health >= 65) { contact.stats.health = 55; contact.healthConditions!.push({ id: `ill_${state.nextId++}`, conditionId: 'fever', kind: 'illness', severity: 25, diagnosed: true, startedYear: state.world.currentYear, nextReviewYear: state.world.currentYear + 1 }); }
      break;
    }
    case 'treat': {
      const gain = 4 + skillLevel(state, 'scholarship'); contact.stats.health = clamp(contact.stats.health + gain);
      for (const condition of contact.healthConditions ?? []) { condition.diagnosed = true; condition.severity = Math.max(0, condition.severity - gain * 2); }
      contact.healthConditions = (contact.healthConditions ?? []).filter(c => c.severity > 0); break;
    }
    case 'epidemic': for (const c of Object.values(state.world.characters).filter(c => c.alive && c.stats.health < 60).slice(0, 4)) c.stats.health = clamp(c.stats.health + 3); break;
    case 'perform': addMoney(state, Math.min(7, 3 + skillLevel(state, 'scholarship'))); break;
    case 'satire': applyRelationshipShift(state, r.rivalId, { affinity: -4 }, { affinity: -8 }); break;
    case 'defend': if (contact.legalState) { contact.legalState.status = 'free'; contact.legalState.suspicion = Math.max(0, contact.legalState.suspicion - 15); for (const charge of contact.legalState.charges) charge.resolved = true; } break;
    case 'investigate': for (const secret of contact.secrets ?? []) { if (!secret.knownByIds.includes(p.id)) secret.knownByIds.push(p.id); } break;
    case 'judgment': if (contact.legalState) { contact.legalState.suspicion = Math.max(0, contact.legalState.suspicion - 8); } state.world.factions.crown.playerStanding += 2; break;
    case 'recruit': contact.factionId = 'outlaws'; contact.factionInfluence = clamp((contact.factionInfluence ?? 0) + 5); break;
    case 'operation': addMoney(state, 7); p.legalState!.suspicion = clamp(p.legalState!.suspicion + 18); break;
    case 'betrayal': applyRelationshipShift(state, r.rivalId, { trust: -12 }, { affinity: -8 }); break;
  }
  state.occupation.experience += 8;
  state.occupation.workedThisYear++;
  r.lastWorkedYear = state.world.currentYear;
  r.reputation = clamp(r.reputation + 4, -100, 100);
  if (!r.completedActions.includes(id)) r.completedActions.push(id);
  if (!r.milestones.includes(id)) r.milestones.push(id);
  applyRelationshipShift(state, contact.id, { affinity: 3 }, { affinity: 4, respect: 2 });
  appendCharacterMemory(contact, { id: `profession_${state.nextId++}`, year: state.world.currentYear, type: `professional_${id}`, actorIds: [p.id], sentiment: 12, salience: 3, inherited: true, summary: `${p.name}: ${def.text}` });
  grantSkillXp(state, def.skill, 7, def.name.toLowerCase());
  pushFeed(state, 'PROFESSION', '#365f88', `${def.text} ${contact.name} records the agreement. Cost ${def.cost}g.`, 'good');
  return state;
}
export function tickProfessionalStanding(state: GameState): void {
  const p = state.world.characters[state.playerCharacterId];
  for (const r of Object.values(p.professionalHistory ?? {})) if (state.world.currentYear - r.lastWorkedYear > 2 && r.reputation > 0) r.reputation--;
}
