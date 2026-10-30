import { GameState, WorldCharacter } from '@/types/game';

export function cloneWorldCharacter(character: WorldCharacter): WorldCharacter {
  return {
    ...character,
    tradeJourney: character.tradeJourney ? { ...character.tradeJourney, choices: [...character.tradeJourney.choices] } : undefined,
    annualNarrativeYears: character.annualNarrativeYears ? { ...character.annualNarrativeYears } : undefined,
    skills: character.skills ? Object.fromEntries(Object.entries(character.skills).map(([id, value]) => [id, { ...value }])) as typeof character.skills : undefined,
    pronouns: { ...character.pronouns }, stats: { ...character.stats }, traits: [...character.traits],
    occupation: { ...character.occupation }, debts: character.debts.map((debt) => ({ ...debt })),
    healthTags: [...character.healthTags], memories: [...character.memories],
    parentIds: [...(character.parentIds ?? [])], childIds: [...(character.childIds ?? [])],
    personalityTraits: [...(character.personalityTraits ?? [])],
    worldMemories: (character.worldMemories ?? []).map((memory) => ({ ...memory, actorIds: [...memory.actorIds] })),
    healthConditions: (character.healthConditions ?? []).map((condition) => ({ ...condition })),
    legalState: character.legalState ? { ...character.legalState, charges: character.legalState.charges.map((charge) => ({ ...charge, victimIds: [...charge.victimIds], witnessIds: [...charge.witnessIds] })) } : undefined,
    secrets: (character.secrets ?? []).map((secret) => ({ ...secret, knownByIds: [...secret.knownByIds] })),
    guardianIds: [...(character.guardianIds ?? [])],
    childDevelopment: character.childDevelopment ? { ...character.childDevelopment, completedMilestones: [...character.childDevelopment.completedMilestones] } : undefined,
  };
}

export function syncControlledCharacterToWorld(state: GameState): GameState {
  const player = state.world.characters[state.playerCharacterId];
  if (!player) return state;
  Object.assign(player, {
    name: state.first, age: state.age, alive: !state.dead, gender: state.gender,
    pronouns: { ...state.pronouns }, attraction: state.attraction, stats: { ...state.stats },
    traits: [...state.traits], gold: state.gold, rankIdx: state.rankIdx,
    occupation: { ...state.occupation }, debts: state.debts.map((debt) => ({ ...debt })),
  });
  return state;
}

export function syncControlledCharacterFromWorld(state: GameState): GameState {
  const player = state.world.characters[state.playerCharacterId];
  if (!player) return state;
  Object.assign(state, {
    first: player.name, age: player.age, dead: !player.alive, gender: player.gender,
    pronouns: { ...player.pronouns }, attraction: player.attraction, stats: { ...player.stats },
    traits: [...player.traits], gold: player.gold, rankIdx: player.rankIdx,
    occupation: { ...player.occupation }, debts: player.debts.map((debt) => ({ ...debt })),
  });
  return state;
}

export function rebuildKinProjection(state: GameState): GameState {
  state.kin = Object.values(state.world.characters).filter((character) => character.id !== state.playerCharacterId);
  return state;
}

export function kinCharacters(state: GameState): WorldCharacter[] {
  return Object.values(state.world.characters).filter((character) => character.id !== state.playerCharacterId);
}

/** End a live spouse link while retaining the historical relationship record. */
export function unlinkSpouse(state: GameState, characterId: string): void {
  const character = state.world.characters[characterId];
  const spouseId = character?.spouseId;
  if (!character || !spouseId) return;
  const spouse = state.world.characters[spouseId];
  delete character.spouseId;
  if (spouse?.spouseId === characterId) delete spouse.spouseId;
  const relationship = Object.values(state.world.relationships).find((item) =>
    (item.aId === characterId && item.bId === spouseId) || (item.aId === spouseId && item.bId === characterId),
  );
  if (relationship) {
    relationship.flags = relationship.flags.filter((flag) => flag !== 'spouse');
    if (!relationship.flags.includes('former_spouse')) relationship.flags.push('former_spouse');
  }
}
