import { PROFESSIONAL_STORIES } from '@/data/professionalStories';
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
  if (def.story && (state.world.characters[state.playerCharacterId].professionalHistory?.[def.family]?.completedActions.length ?? 0) < 2) return 'Complete two professional milestones first';
  if (def.story && state.world.characters[state.playerCharacterId].professionalHistory?.[def.family]?.matters.some(m => m.id === id && m.resolved)) return 'This matter is concluded';
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
  const noblePatient = def.id === 'noble_fever' ? Object.values(state.world.characters).find(c => c.alive && c.age >= 18 && c.rankIdx >= 3 && c.id !== state.playerCharacterId) : undefined;
  const contact = noblePatient ?? existing ?? Object.values(state.world.characters).find(c => c.id !== state.playerCharacterId && c.alive && c.age >= 18 && c.occupation.careerId === def.contactCareer)
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
  if (def.story) {
    if (['medicine'].includes(def.family)) { contact.stats.health = Math.min(contact.stats.health, 50); }
    r.matters.push({ id, actorId: contact.id, stage: 0, openedYear: state.world.currentYear, resolved: false });
    state.pendingEvent = { eventId: `profession_${id}`, bindings: { client: contact.id, rival: r.rivalId } };
    pushFeed(state, 'PROFESSIONAL MATTER', '#7a4f9a', `${def.name}: ${contact.name} requests your decision.`, 'plain');
    return state;
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
      else if (contact.stats.health >= 65) { contact.stats.health = 55; contact.healthConditions!.push({ id: `ill_${state.nextId++}`, conditionId: 'winter_fever', kind: 'illness', severity: 25, diagnosed: true, startedYear: state.world.currentYear, nextReviewYear: state.world.currentYear + 1 }); }
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

/** Resolve authored branches once. The saved matter, rather than event text, owns rewards. */
export function applyProfessionalEffect(state: GameState, effect: NonNullable<Effects['professional']>): void {
  const p = state.world.characters[state.playerCharacterId];
  const r = professionalRecord(p, effect.family);
  const matter = r.matters.find(m => m.id === effect.caseId && !m.resolved);
  const story = PROFESSIONAL_STORIES.find(s => s.id === effect.caseId && s.family === effect.family);
  if (!matter || !story) return;
  let client = state.world.characters[matter.actorId];
  if (!client?.alive) {
    const def = CAREER_SPECIALIZATIONS.find(a => a.id === story.id)!;
    client = contactFor(state, def, r); matter.actorId = client.id;
  }
  if (effect.stage === 'approach') {
    if (matter.stage !== 0) return;
    matter.decision = String(effect.choice); matter.stage = 1;
    if (effect.choice === 1) applyRelationshipShift(state, client.id, { trust: -4 }, { trust: -8 });
    return;
  }
  if (matter.stage !== 1) return;
  let approach = Number(matter.decision ?? 0);
  if (effect.choice === 1) { if (state.gold < 6) return; addMoney(state, -6); approach = 0; }
  const honest = approach !== 1;
  r.reputation = clamp(r.reputation + (honest ? 12 : -8), -100, 100);
  const milestone = honest ? story.milestone : `${story.milestone}_ruthless`;
  r.milestones = [...new Set([...r.milestones, milestone])];
  r.completedActions = [...new Set([...r.completedActions, story.id])];
  addMoney(state, honest ? 6 : 14);
  if (effect.family === 'medicine') {
    client.stats.health = clamp(client.stats.health + (honest ? 20 : -18));
    for (const condition of client.healthConditions ?? []) condition.severity = Math.max(0, condition.severity - (honest ? 30 : 0));
    client.healthConditions = (client.healthConditions ?? []).filter(c => c.severity > 0);
    state.world.conditions.diseasePressure = clamp(state.world.conditions.diseasePressure + (honest ? -8 : 5));
    if (!honest) state.stats.health = Math.max(1, state.stats.health - 8);
  }
  if (effect.family === 'church') state.world.conditions.religiousTension = clamp(state.world.conditions.religiousTension + (honest ? -10 : 10));
  if (effect.family === 'martial') { state.world.conditions.warThreat = clamp(state.world.conditions.warThreat + (honest ? -8 : 5)); if (!honest) client.stats.health = clamp(client.stats.health - 15); }
  if (effect.family === 'court') { if (state.world.court) state.world.court.treasury += honest ? 30 : -12; p.factionInfluence = clamp((p.factionInfluence ?? 0) + (honest ? 10 : 5)); }
  if (effect.family === 'trade') { const h = state.world.households.find(h => h.id === p.householdId); if (h) h.wealth += honest ? 10 : 5; }
  if (effect.family === 'craft') state.occupation.guildStanding = clamp((state.occupation.guildStanding ?? 0) + (honest ? 12 : -10));
  if (approach === 2) {
    let assistant = r.apprenticeId ? state.world.characters[r.apprenticeId] : undefined;
    if (!assistant?.alive) { assistant = spawnKin(state, { kind: 'acquaintance', age: 16, role: `${effect.family} assistant`, bio: 'Retained and paid during a consequential professional commission.' }); r.apprenticeId = assistant.id; }
    assistant.occupation.careerId = CAREER_SPECIALIZATIONS.find(a => a.family === effect.family)!.contactCareer;
    assistant.gold += 4;
    assistant.education!.mentorId = p.id;
    assistant.education!.progress = clamp(assistant.education!.progress + 25);
    assistant.childDevelopment!.investment += 4;
  }
  applyRelationshipShift(state, client.id, { respect: honest ? 8 : -5 }, { affinity: honest ? 12 : -20, trust: honest ? 10 : -20 });
  if (!honest && r.rivalId && state.world.characters[r.rivalId]) {
    applyRelationshipShift(state, r.rivalId, { trust: -5 }, { affinity: -15 });
    state.world.scheduledConsequences.push({ id: `profession_evidence_${state.nextId++}`, dueYear: state.world.currentYear + 2, scope: 'family', targetIds: [p.birthFamilyId ?? ''].filter(Boolean), resolution: { type: 'relationship', aId: p.id, bId: r.rivalId, affinity: -12, trust: -10 }, explanation: 'Your professional rival produces the retained evidence.' });
  }
  matter.resolved = true; matter.stage = 2;
  const text = story.ending[approach];
  appendCharacterMemory(client, { id: `professional_verdict_${state.nextId++}`, year: state.world.currentYear, type: milestone, actorIds: [p.id], sentiment: honest ? 30 : -30, salience: 5, inherited: true, summary: text });
  const family = state.world.families[p.birthFamilyId ?? ''];
  if (family) { family.reputation = clamp(family.reputation + (honest ? 5 : -5), -100, 100); family.inheritedMemories = appendFamilyMemory(family.inheritedMemories, { id: `legacy_${state.nextId++}`, year: state.world.currentYear, type: milestone, sentiment: honest ? 25 : -25, salience: 4, summary: text }); }
  pushFeed(state, 'PROFESSIONAL LEGACY', '#7a4f9a', text, honest ? 'good' : 'bad');
}

export function dueProfessionalEventId(state: GameState): string | undefined {
  const p = state.world.characters[state.playerCharacterId];
  for (const r of Object.values(p.professionalHistory ?? {})) {
    const matter = r.matters.find(m => !m.resolved && (m.stage === 0 || state.world.currentYear > (m.openedYear ?? state.world.currentYear - 1)));
    if (matter) return `profession_${matter.id}${matter.stage === 1 ? '_verdict' : ''}`;
  }
}
export function bindProfessionalEvent(state: GameState, eventId: string): Record<string, string> | undefined {
  const story = PROFESSIONAL_STORIES.find(s => eventId === `profession_${s.id}` || eventId === `profession_${s.id}_verdict`);
  if (!story) return undefined;
  const r = professionalRecord(state.world.characters[state.playerCharacterId], story.family);
  const matter = r.matters.find(m => m.id === story.id && !m.resolved);
  if (!matter) return undefined;
  if (!state.world.characters[matter.actorId]?.alive) matter.actorId = contactFor(state, CAREER_SPECIALIZATIONS.find(a => a.id === story.id)!, r).id;
  const rival = r.rivalId && state.world.characters[r.rivalId] ? r.rivalId : matter.actorId;
  return { client: matter.actorId, rival };
}
