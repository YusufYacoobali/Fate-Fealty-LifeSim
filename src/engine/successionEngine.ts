import { initializeLifeDepth, legacyStatus } from './lifeDepthState';
import { reconcileCourt } from './courtEngine';
import { settleRoyalSuccession } from './royalSuccessionEngine';
import { professionalRecord } from './careerSpecializationEngine';
import { careerById } from '@/data/careers';
import { GameState, WorldCharacter } from '@/types/game';
import { appendWorldHistory, pushFeed, syncKinToWorld } from './gameState';
import { C } from '@/theme/theme';
import { freshRpg } from '@/data/rpg';

export function eligibleHeirs(state: GameState): WorldCharacter[] {
  const player = state.world.characters[state.playerCharacterId];
  // Explicit genealogy is canonical. The relationship fallback recovers early
  // v3 children whose family tie survived but whose reciprocal ids did not.
  const legacyFamilyChildren = Object.values(state.world.characters).filter((character) => {
    if (!character.alive || character.kind !== 'child') return false;
    return Object.values(state.world.relationships).some((relationship) =>
      ((relationship.aId === state.playerCharacterId && relationship.bId === character.id)
        || (relationship.bId === state.playerCharacterId && relationship.aId === character.id))
      && relationship.flags.includes('family'));
  });
  const ids = new Set([
    ...(player?.childIds ?? []),
    ...Object.values(state.world.characters).filter((kin) => kin.parentIds?.includes(state.playerCharacterId)).map((kin) => kin.id),
    ...legacyFamilyChildren.map((kin) => kin.id),
  ]);
  return [...ids]
    .map((id) => state.world.characters[id])
    .filter((character): character is WorldCharacter => Boolean(character?.alive))
    .sort((a, b) => Number(Boolean(b.isHeir)) - Number(Boolean(a.isHeir)) || b.age - a.age || a.id.localeCompare(b.id));
}

export function continueAsHeir(state: GameState, requestedHeirId?: string, lifetimeUnlocked = state.lifetimeUnlocked): GameState {
  if (!state.dead) return state;
  initializeLifeDepth(state);
  const heirs = eligibleHeirs(state);
  if (!heirs.length) return state;
  const heir = heirs.find((candidate) => candidate.id === requestedHeirId) ?? heirs[0];
  const formerPlayer = state.world.characters[state.playerCharacterId];
  const formerCause = state.deathCause || 'the death of the previous player';
  if (formerPlayer) {
    formerPlayer.alive = false;
    formerPlayer.deathYear = state.world.currentYear;
    formerPlayer.deathCause = state.deathCause;
    formerPlayer.kind = formerPlayer.gender === 'woman' ? 'mother' : formerPlayer.gender === 'man' ? 'father' : 'acquaintance';
    formerPlayer.role = 'Thy Late Parent';
  }

  const inheritedGold = Math.floor(state.gold / 2);
  heir.gold += inheritedGold;
  const parentStatus = formerPlayer?.socialStatus ?? legacyStatus(state.rankIdx);
  if (['noble', 'baronial', 'royal'].includes(parentStatus.estate)) {
    heir.socialStatus!.estate = parentStatus.estate === 'baronial' && !lifetimeUnlocked ? 'noble' : parentStatus.estate;
    heir.socialStatus!.grants = [...new Set([...heir.socialStatus!.grants, 'inheritance'])];
    heir.rankIdx = heir.socialStatus!.estate === 'baronial' && lifetimeUnlocked ? 4 : 3;
  }
  // A profession leaves household credit and unfinished matters, not a free job.
  for (const [family, inherited] of Object.entries(formerPlayer?.professionalHistory ?? {})) {
    const record = professionalRecord(heir, family as import('@/types/game').CareerFamily);
    record.reputation = Math.max(record.reputation, Math.floor(inherited.reputation / 2));
    record.contactIds = [...new Set([...record.contactIds, ...inherited.contactIds])];
    record.rivalId ??= inherited.rivalId;
    record.adviserId ??= inherited.adviserId;
    for (const care of inherited.patientCare ?? []) if (care.status === 'awaiting_review' && !record.patientCare?.some(c => c.id === care.id)) (record.patientCare ??= []).push({ ...care,conditions: care.conditions.map(c => ({ ...c })) });
    for (const matter of inherited.matters.filter(m => !m.resolved)) if (!record.matters.some(m => m.id === matter.id)) record.matters.push({ ...matter, ...(matter.kind === 'practice' ? { ownerId: heir.id } : {}) });
  }
  state.lifetimeUnlocked = lifetimeUnlocked;
  if (state.world.court?.rulerId === heir.id && !lifetimeUnlocked) settleRoyalSuccession(state, [heir.id]);
  heir.isHeir = true;
  state.playerCharacterId = heir.id;
  if (state.rpg.stewardId === heir.id) state.rpg.stewardId = null;
  state.rpg.forge = null;
  state.rpg.forgeBonuses = { ownerId: heir.id, year: state.world.currentYear, used: 0 };
  state.rpg.mission = null;
  state.rpg.expedition = null;
  state.rpg.board = freshRpg().board;
  state.rpg.branches = freshRpg().branches;
  state.duel = null;
  state.playerRun = { startedYear: state.world.currentYear, generation: state.playerRun.generation + 1, roleProgress: {} };
  state.first = heir.name;
  state.epithet = 'the Heir';
  state.gender = heir.gender;
  state.pronouns = { ...heir.pronouns };
  state.attraction = heir.attraction;
  state.age = heir.age;
  state.bornYear = state.world.currentYear - heir.age;
  state.gold = heir.gold;
  state.stats = { ...heir.stats };
  state.traits = [...heir.traits];
  state.occupation = { ...heir.occupation };
  state.debts = heir.debts.map((debt) => ({ ...debt }));
  state.rankIdx = heir.rankIdx;
  if (!lifetimeUnlocked && state.rankIdx >= 4) state.rankIdx = heir.rankIdx = 3;
  if (!lifetimeUnlocked && careerById(heir.occupation.careerId)?.premium) { heir.occupation = { careerId: null, experience: 0, performance: 50, workedThisYear: 0 }; state.occupation = { ...heir.occupation }; }
  state.rankProgress = 0;
  state.reputation = Math.floor(state.reputation / 2);
  state.paths = { martial: 0, court: 0, church: 0, labour: 0, outlaw: 0 };
  state.tags = heir.age < 18 ? ['regency', 'inherited_world'] : ['inherited_world'];
  state.memories = [];
  state.activeArcs = [];
  state.firedOnce = [];
  state.actionClock = { used: 0, cap: state.actionClock.cap, lifetimeUsed: 0, fullYears: 0 };
  state.goalId = null;
  state.goalDone = false;
  state.dead = false;
  state.deathCause = '';
  state.epitaph = '';
  state.heirContinued = true;
  state.lifeNo += 1;
  state.pendingEvent = null;
  state.tab = 'life';
  state.selectedKinId = null;
  state.feed = [];
  state.income = 0;
  state.expenses = 0;
  state.holding = {
    ...state.holding,
    stores: Math.floor(state.holding.stores * 0.75),
    security: Math.floor(state.holding.security * 0.75),
    loyalty: Math.floor(state.holding.loyalty * 0.75),
    population: Math.max(1, Math.floor((state.holding.population ?? 18) * 0.75)),
    lastActionAge: null,
    criticalYears: 0,
  };

  reconcileCourt(state);
  syncKinToWorld(state);
  state.world.proposalFromId = null;
  state.world.pacing = { lastMajorYear: null, lastImportantYear: null, quietYearsSinceStory: 0, majorEventsThisLife: 0, mediumStoriesStarted: 0, immediateChainDepth: 0 };
  appendWorldHistory(state, {
    id: `history_succession_${state.nextId++}`,
    year: state.world.currentYear,
    type: 'succession',
    participantIds: [formerPlayer?.id ?? '', heir.id].filter(Boolean),
    familyIds: [heir.birthFamilyId ?? ''].filter(Boolean),
    causes: [formerCause],
    summary: `${heir.name} inherited the unfinished story of Swineford.`,
    salience: 5,
  });
  const rivalHeirs = heirs.filter((candidate) => candidate.id !== heir.id);
  if (rivalHeirs.length) {
    state.world.scheduledConsequences.push({
      id: `consequence_inheritance_${state.nextId++}`,
      dueYear: state.world.currentYear + 1,
      scope: 'family',
      targetIds: [heir.birthFamilyId ?? ''].filter(Boolean),
      resolution: {
        type: 'history',
        historyType: 'inheritance_dispute',
        summary: `${rivalHeirs[0].name} questioned ${heir.name}'s share of the inheritance.`,
        salience: 4,
      },
      explanation: `A competing heir remembers that property rarely passes without argument.`,
    });
  }
  pushFeed(state, `YEAR ${state.world.currentYear} · SUCCESSION`, C.charmDark, `${heir.name} inherits ${inheritedGold} gold, old loyalties, and older grudges. This is chapter two, not a new world.`, 'good');
  return state;
}
