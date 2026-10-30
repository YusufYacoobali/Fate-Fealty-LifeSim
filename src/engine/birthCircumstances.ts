import { unlinkSpouse } from './characterState';
import type { Effects, GameState, NpcAmbition, WorldCharacter } from '@/types/game';
import { chance, clamp, pick, rnd } from './random';
import { spawnKin } from './kinFactory';
import { applyRelationshipShift } from './relationshipState';
import { CAREERS } from '@/data/careers';
import { appendFamilyMemory } from './worldJournal';

/** Link a newly created guardian into the actual maternal/paternal family tree. */
function linkRelativeGuardian(state: GameState, parent: WorldCharacter, guardian: WorldCharacter): void {
  const family = state.world.families[parent.birthFamilyId!];
  const household = state.world.households.find(h => h.id === parent.householdId)!;
  let grandparent = (parent.parentIds ?? []).map(id => state.world.characters[id]).find(Boolean);
  if (!grandparent) {
    const yearsDeceased = rnd(3,8);
    grandparent = spawnKin(state,{ kind: 'acquaintance',age: Math.max(parent.age,guardian.age) + rnd(20,30) - yearsDeceased,role: 'Late grandparent',bio: `The late parent of ${parent.name} and ${guardian.name}.` });
    grandparent.alive = false; grandparent.deathYear = state.world.currentYear - yearsDeceased; grandparent.deathCause = 'natural causes before your birth';
    parent.parentIds = [...(parent.parentIds ?? []),grandparent.id];
  }
  guardian.parentIds = [...new Set([...(guardian.parentIds ?? []),grandparent.id])];
  grandparent.childIds = [...new Set([...(grandparent.childIds ?? []),parent.id,guardian.id])];
  for (const person of [guardian,grandparent]) {
    const former = state.world.families[person.birthFamilyId ?? ''];
    if (former && former.id !== family.id) { former.memberIds = former.memberIds.filter(id => id !== person.id); if (!former.memberIds.length) delete state.world.families[former.id]; }
    person.birthFamilyId = family.id; family.memberIds = [...new Set([...family.memberIds,person.id])];
    if (person.background) person.background.familyId = family.id;
    const oldHouse = state.world.households.find(h => h.id === person.householdId);
    if (oldHouse && oldHouse.id !== household.id) { oldHouse.memberIds = oldHouse.memberIds.filter(id => id !== person.id); if (!oldHouse.memberIds.length) state.world.households = state.world.households.filter(h => h.id !== oldHouse.id); }
    person.householdId = household.id; household.memberIds = [...new Set([...household.memberIds,person.id])];
    if (parent.socialStatus?.estate === 'noble') { person.rankIdx = 3; person.socialStatus = { estate: 'noble',martialHonour: 'none',titles: ['Noble kin'],grants: ['birthright'] }; }
    const relation = applyRelationshipShift(state,person.id,{ affinity: 5 },{ affinity: 5 });
    relation.flags = [...new Set([...relation.flags,'family' as const])];
  }
  guardian.role = `${guardian.gender === 'woman' ? 'Aunt' : guardian.gender === 'man' ? 'Uncle' : 'Relative'} · household guardian`;
  guardian.ambition = 'protect_family';
  guardian.bio = `${guardian.name} is ${parent.name}'s sibling and shares the care of their child. Their family relationship is recorded through ${grandparent.name}.`;
}

/** Called only inside seeded birth creation, never migration. */
export function varyBirthHousehold(state: GameState, inheritedGold = 0): void {
  const p = state.world.characters[state.playerCharacterId], bg = p.background!;
  const household = state.world.households.find(h => h.id === p.householdId)!;
  const family = state.world.families[p.birthFamilyId!];
  const parents = ['mother', 'father'].map(id => state.world.characters[id]);
  const ambitions: NpcAmbition[] = ['protect_family', 'gain_status', 'become_wealthy', 'master_craft', 'seek_freedom'];
  for (const parent of parents) {
    parent.personalityTraits = [pick(['loyal', 'ambitious', 'cautious', 'generous', 'cunning', 'brave']), pick(['patient', 'proud', 'envious', 'honest'])];
    parent.ambition = bg.origin === 'military' && chance(0.4) ? 'win_glory' : pick(ambitions);
    const familyCareer = CAREERS.find(c => c.id === parent.occupation.careerId)?.family;
    if (chance(0.3)) parent.occupation.careerId = pick(CAREERS.filter(c => c.family === familyCareer && c.minAge <= parent.age && !c.premium)).id;
    parent.stats.wits = rnd(28, 85); parent.occupation.performance = rnd(25, 85);
    applyRelationshipShift(state, parent.id, { affinity: rnd(-12, 15), trust: rnd(-8, 12) }, { affinity: rnd(-12, 15), trust: rnd(-8, 12) });
  }
  // Common variations dominate; unusual circumstances remain origin-specific.
  const roll = rnd(1, 100);
  let circumstance = 'ordinary', multiplier = rnd(85, 115) / 100;
  if (roll <= 7 && bg.origin === 'merchant') { circumstance = 'struggling_trade'; multiplier = 0.24; }
  else if (roll <= 7 && bg.origin === 'artisan') { circumstance = 'thriving_workshop'; multiplier = 1.8; }
  else if (roll <= 10 && bg.origin === 'noble') { circumstance = 'cash_poor_estate'; multiplier = 0.18; }
  else if (roll <= 8 && bg.origin === 'military') { circumstance = 'disgraced_service'; multiplier = 0.4; family.reputation -= 18; state.world.factions.crown.playerStanding -= 8; }
  else if (roll <= 15 && bg.origin === 'royal') { circumstance = 'divided_palace'; family.reputation -= 8; state.holding.loyalty = 30; }
  household.wealth = Math.max(1, Math.round(Math.max(0, household.wealth - inheritedGold) * multiplier) + inheritedGold);
  state.gold = p.gold = household.wealth; bg.householdWealth = household.wealth;
  if (['struggling_trade', 'cash_poor_estate', 'disgraced_service'].includes(circumstance)) {
    parents[1].debts.push({ id: `birth_debt_${state.nextId++}`, principal: rnd(10, 24), interestRate: 0.08, lenderId: bg.contactId });
  }
  if (bg.origin !== 'royal' && chance(0.06)) {
    const deceased = pick(parents); deceased.alive = false; deceased.deathYear = state.world.currentYear; deceased.deathCause = 'illness before your earliest memory'; unlinkSpouse(state,deceased.id);
    const survivor = parents.find(c => c.alive)!;
    p.guardianIds = [survivor.id]; household.headId = survivor.id;
    circumstance = 'surviving_parent';
    if (chance(0.35)) {
      const guardian = spawnKin(state, { kind: 'acquaintance', age: rnd(Math.max(18,survivor.age - 6),survivor.age + 10), role: 'Aunt or uncle · household guardian', bio: `A relative sharing the care of ${p.name} with ${survivor.name}.` });
      linkRelativeGuardian(state,survivor,guardian);
      p.guardianIds.push(guardian.id); circumstance = 'relative_guardians';
    }
  }
  bg.guardianIds = [...p.guardianIds!]; bg.circumstance = circumstance;
  const contact = state.world.characters[bg.contactId ?? ''];
  if (contact?.birthFamilyId && contact.birthFamilyId !== family.id && bg.origin !== 'merchant') {
    const other = state.world.families[contact.birthFamilyId];
    if (chance(0.75)) { family.allyFamilyIds = [...new Set([...family.allyFamilyIds, other.id])]; other.allyFamilyIds = [...new Set([...other.allyFamilyIds, family.id])]; }
    else { family.enemyFamilyIds = [...new Set([...family.enemyFamilyIds, other.id])]; other.enemyFamilyIds = [...new Set([...other.enemyFamilyIds, family.id])]; contact.rel = 28; }
  }
  family.wealthTier = Math.min(4, Math.floor(household.wealth / 30));
  if (circumstance !== 'ordinary') {
    const details: Record<string, string> = {
      struggling_trade: 'A failed shipment leaves the counting house short of cash and in debt.', thriving_workshop: 'A large commission leaves the workshop prosperous enough to fund an apprenticeship.',
      cash_poor_estate: 'The family retains its noble standing, but debts have emptied the purse available for tutors.', disgraced_service: 'A disputed campaign account stains the family’s service and reduces its access to Crown patrons.',
      divided_palace: 'Two palace households dispute your elder sibling’s precedence; loyalty is already divided.', surviving_parent: 'A surviving parent keeps the household together after an early bereavement.', relative_guardians: 'A surviving parent and a relative share your upbringing; your birth parents remain in the family record.',
    };
    state.feed[0].text += ` ${details[circumstance]}`;
    family.inheritedMemories = appendFamilyMemory(family.inheritedMemories, { id: `birth_circumstance_${state.nextId++}`, year: state.world.currentYear, type: circumstance, sentiment: multiplier < 1 ? -15 : 15, salience: 4, summary: details[circumstance] });
    if (circumstance === 'divided_palace') {
      const sibling = Object.values(state.world.characters).find(c => c.id !== p.id && c.parentIds?.includes('father') && c.parentIds.includes('mother'));
      if (sibling) applyRelationshipShift(state, sibling.id, { trust: -15 }, { affinity: -20, trust: -20 });
    }
  }
  for (const relation of Object.values(state.world.relationships)) relation.interactionsThisYear = 0;
  p.bio = state.feed[0].text;
}
export function birthBindings(state: GameState, householdLesson = false): Record<string, string> {
  const p = state.world.characters[state.playerCharacterId];
  const adult = (id: string) => state.world.characters[id]?.alive && state.world.characters[id].age >= 18;
  const guardian = p.guardianIds?.find(adult) ?? state.world.households.find(h => h.id === p.householdId)?.memberIds.find(id => id !== p.id && adult(id));
  const contact = householdLesson ? guardian : p.background?.contactId && adult(p.background.contactId) ? p.background.contactId : guardian;
  return { ...(guardian ? { guardian } : {}), ...(contact ? { contact } : {}), mother: 'mother', father: 'father' };
}
export function applyHouseholdLesson(state: GameState, effect: NonNullable<Effects['householdLesson']>): void {
  const p = state.world.characters[state.playerCharacterId], household = state.world.households.find(h => h.id === p.householdId);
  if (household) household.wealth = Math.max(0, household.wealth + (effect.wealth ?? 0));
  const contactId = state.pendingEvent?.bindings?.contact ?? p.background?.contactId;
  if (contactId && state.world.characters[contactId]?.alive && effect.contactBond) applyRelationshipShift(state, contactId, { trust: effect.contactBond }, { trust: effect.contactBond, affinity: effect.contactBond });
  if (effect.progress && p.education?.track) p.education.progress = clamp(p.education.progress + effect.progress);
}
