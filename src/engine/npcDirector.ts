import { GameState, WorldCharacter } from '@/types/game';
import { deriveLifeRole } from '@/content/persistentStories';
import { chance, clamp, pickWeighted, rnd } from './random';
import { syncKinToWorld, syncPlayerToWorld } from './gameState';
import { appendCharacterMemory, appendFamilyMemory } from './worldJournal';

function developChild(state: GameState, child: WorldCharacter): void {
  if (![6, 12, 18].includes(child.age)) return;
  const household = state.world.households.find((item) => item.id === child.householdId);
  const security = household?.foodSecurity ?? 50;
  const parentRelations = Object.values(state.world.relationships).filter((relation) =>
    (child.parentIds ?? []).some((parentId) => (relation.aId === child.id && relation.bId === parentId) || (relation.bId === child.id && relation.aId === parentId)),
  );
  const parentalSupport = parentRelations.length
    ? parentRelations.reduce((total, relation) => total + relation.aToB.affinity + relation.bToA.affinity, 0) / (parentRelations.length * 2)
    : 50;
  const trauma = (child.worldMemories ?? []).filter((memory) => memory.sentiment < -15 && memory.salience >= 3).length;
  const family = child.birthFamilyId ? state.world.families[child.birthFamilyId] : undefined;
  child.stats.health = clamp(child.stats.health + (security >= 55 ? 4 : -4) - Math.min(3, trauma));
  child.stats.wits = clamp(child.stats.wits + (child.age === 12 ? 5 : 2) + (parentalSupport >= 65 ? 2 : 0));
  child.stats.charm = clamp(child.stats.charm + rnd(-1, 4));
  child.stats.faith = clamp(child.stats.faith + ((family?.reputation ?? 0) >= 20 ? 2 : 0));
  if (child.age === 12) child.personalityTraits = Array.from(new Set([...(child.personalityTraits ?? []), parentalSupport >= 65 ? 'confident' : trauma ? 'guarded' : 'independent'])).slice(0, 3);
  if (child.age === 18) {
    if (security < 40) child.ambition = 'become_wealthy';
    else if (parentalSupport >= 70) child.ambition = 'protect_family';
    child.importance = 'supporting';
  }
  appendCharacterMemory(child, {
    id: `memory_milestone_${state.nextId++}`, year: state.world.currentYear, type: `development_${child.age}`,
    actorIds: child.parentIds ?? [], sentiment: security >= 55 ? 20 : -20, salience: child.age === 18 ? 3 : 2,
    inherited: false, summary: security >= 55 ? `${child.name} was supported through a formative year.` : `${child.name} remembers hardship during a formative year.`,
  });
}

function performNpcAmbition(state: GameState, character: WorldCharacter): void {
  if (!character.alive || character.importance === 'background') return;
  const household = state.world.households.find((item) => item.id === character.householdId);
  const ambition = character.ambition ?? 'protect_family';
  const traits = new Set(character.personalityTraits ?? []);
  const rememberedHarm = (character.worldMemories ?? []).filter((memory) => memory.sentiment < -20 && memory.salience >= 3).length;
  const options = [
    { id: 'earn', weight: (ambition === 'become_wealthy' || ambition === 'master_craft' ? 8 : 2) + (traits.has('patient') ? 2 : 0) + (state.world.conditions.prosperity > 65 ? 2 : 0) + (character.secret === 'hidden_debt' || character.vulnerability === 'poverty' ? 3 : 0) },
    { id: 'status', weight: (ambition === 'gain_status' || ambition === 'gain_land' || ambition === 'join_clergy' ? 8 : 2) + (traits.has('ambitious') || traits.has('proud') ? 3 : 0) + (character.vulnerability === 'pride' || character.vulnerability === 'disputed_birth' ? 2 : 0) },
    { id: 'family', weight: (ambition === 'protect_family' || ambition === 'marry_well' ? 8 : (household?.foodSecurity ?? 50) < 40 ? 6 : 1) + (traits.has('loyal') || traits.has('generous') ? 3 : 0) + (character.vulnerability === 'sick_relative' || character.vulnerability === 'loneliness' ? 3 : 0) },
    { id: 'risk', weight: Math.max(1, (ambition === 'win_glory' || ambition === 'avenge_family' || ambition === 'seek_freedom' ? 8 : 1) + (traits.has('brave') || traits.has('cruel') ? 3 : 0) + rememberedHarm - (character.vulnerability === 'fear' ? 4 : 0)) },
  ];
  const decision = pickWeighted(options, (option) => option.weight);
  if (!decision) return;
  if (decision.id === 'earn') {
    character.gold += rnd(1, 3);
    if (household) household.wealth += 1;
  } else if (decision.id === 'status') {
    character.occupation.experience += 2;
    character.occupation.performance = clamp(character.occupation.performance + 2);
  } else if (decision.id === 'family' && household) {
    household.foodSecurity = clamp((household.foodSecurity ?? 50) + 2);
    if (character.gold > 0) character.gold -= 1;
  } else if (decision.id === 'risk') {
    character.stats.health = clamp(character.stats.health - 1);
    character.occupation.experience += 3;
    state.world.conditions.publicOrder = clamp(state.world.conditions.publicOrder + (ambition === 'win_glory' ? 1 : -1));
  }
  if (chance(0.04)) appendCharacterMemory(character, { id: `memory_ambition_${state.nextId++}`, year: state.world.currentYear, type: `ambition_${ambition}`, actorIds: [], sentiment: 10, salience: 2, inherited: false, summary: `${character.name} pursued the ambition to ${ambition.replaceAll('_', ' ')}.` });
}

function directAncestors(state: GameState): Set<string> {
  const result = new Set<string>();
  const visit = (id: string) => {
    for (const parentId of state.world.characters[id]?.parentIds ?? []) {
      if (result.has(parentId)) continue;
      result.add(parentId);
      visit(parentId);
    }
  };
  visit(state.playerCharacterId);
  return result;
}

function archiveOldBackgroundCharacters(state: GameState): void {
  const retained = directAncestors(state);
  const bound = new Set(state.world.activeStories.filter((story) => ['active', 'paused'].includes(story.status)).flatMap((story) => Object.values(story.bindings)));
  for (const character of Object.values(state.world.characters)) {
    if (character.alive || character.importance !== 'background' || character.deathYear == null) continue;
    if (state.world.currentYear - character.deathYear < 25 || retained.has(character.id) || bound.has(character.id)) continue;
    for (const other of Object.values(state.world.characters)) {
      if (other.id === character.id) continue;
      other.parentIds = (other.parentIds ?? []).filter((id) => id !== character.id);
      other.childIds = (other.childIds ?? []).filter((id) => id !== character.id);
      if (other.spouseId === character.id) delete other.spouseId;
    }
    delete state.world.characters[character.id];
    for (const [id, relationship] of Object.entries(state.world.relationships)) if (relationship.aId === character.id || relationship.bId === character.id) delete state.world.relationships[id];
    for (const family of Object.values(state.world.families)) family.memberIds = family.memberIds.filter((id) => id !== character.id);
    for (const household of state.world.households) household.memberIds = household.memberIds.filter((id) => id !== character.id);
  }

  state.world.households = state.world.households.filter((household) => household.memberIds.length > 0);
  for (const [familyId, family] of Object.entries(state.world.families)) {
    if (family.memberIds.length === 0) delete state.world.families[familyId];
  }
}

function boundSettledStories(state: GameState): void {
  const ongoing = state.world.activeStories.filter((story) => story.status === 'active' || story.status === 'paused');
  const recentSettled = state.world.activeStories
    .filter((story) => story.status !== 'active' && story.status !== 'paused' && state.world.currentYear - story.startedYear <= 40)
    .slice(-54);
  state.world.activeStories = [...recentSettled, ...ongoing];
}

export function tickPersistentSociety(state: GameState): GameState {
  syncPlayerToWorld(state);
  const player = state.world.characters[state.playerCharacterId];
  if (player) player.lifeRole = deriveLifeRole(state);
  for (const character of Object.values(state.world.characters)) {
    if (character.id === state.playerCharacterId) continue;
    developChild(state, character);
    performNpcAmbition(state, character);
    character.worldMemories = (character.worldMemories ?? []).filter((memory) => memory.salience >= 3 || state.world.currentYear - memory.year <= 15).slice(-60);
    if (!character.alive && character.birthFamilyId) {
      const family = state.world.families[character.birthFamilyId];
      for (const memory of character.worldMemories.filter((item) => item.salience >= 4 && item.inherited)) {
        if (family) family.inheritedMemories = appendFamilyMemory(family.inheritedMemories, { id: memory.id, year: memory.year, type: memory.type, sentiment: memory.sentiment, salience: memory.salience, summary: memory.summary });
      }
    }
  }
  for (const household of state.world.households) {
    const living = household.memberIds.map((id) => state.world.characters[id]).filter((person) => person?.alive);
    household.headId = living.sort((a, b) => b.age - a.age)[0]?.id ?? household.headId;
    household.foodSecurity = clamp((household.foodSecurity ?? 50) + Math.round((state.world.conditions.foodSecurity - 50) / 15));
    household.status = clamp((household.status ?? 50) + Math.round((state.world.conditions.prosperity - 50) / 25));
  }
  archiveOldBackgroundCharacters(state);
  boundSettledStories(state);
  return syncKinToWorld(state);
}
