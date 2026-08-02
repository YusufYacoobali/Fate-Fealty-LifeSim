import { GameEvent, GameState, WorldCharacter } from '@/types/game';
import { chance, clamp, pick } from './random';
import { pushFeed } from './gameState';
import { C } from '@/theme/theme';

export const LEGAL_SYSTEM_EVENTS: GameEvent[] = [{
  id: 'system_legal_trial', category: 'arc', arc: 'legal_trial', arcNodeOnly: true, domain: 'crime', title: 'JUDGMENT BEFORE SWINEFORD',
  text: (state) => {
    const legal = state.world.characters[state.playerCharacterId]?.legalState;
    const charge = legal?.charges.find((item) => !item.resolved);
    return `The reeve reads the charge of ${charge?.offence ?? 'an offence against local law'}. Evidence, reputation and old enemies now carry as much weight as truth.`;
  },
  choices: [
    { id: 'defend', label: 'Answer every charge', successChance: (state) => {
      const legal = state.world.characters[state.playerCharacterId]?.legalState;
      const evidence = legal?.charges.find((item) => !item.resolved)?.evidence ?? 40;
      return Math.max(0.12, Math.min(0.88, 0.45 + state.stats.wits / 250 + state.reputation / 400 - evidence / 180));
    }, forecast: { risk: 'medium', positive: ['Wits', 'Reputation'], negative: ['Evidence', 'Prior notoriety'] }, success: { text: 'Your defence exposes enough doubt for the charge to fail.', effects: { legal: { status: 'free', suspicion: -20 } }, tone: 'good' }, failure: { text: 'The court rejects your defence and orders imprisonment.', effects: { legal: { status: 'imprisoned', notoriety: 8, sentenceYears: 3 }, prison: true }, tone: 'bad' } },
    { id: 'confess', label: 'Confess and seek mercy', forecast: { risk: 'low', positive: ['A shorter sentence'], negative: ['Notoriety', 'Restitution'] }, outcome: { text: 'Your confession shortens the hearing, though not the memory of it.', effects: { gold: -12, legal: { status: 'imprisoned', notoriety: 5, suspicion: -10, sentenceYears: 1 }, prison: true }, tone: 'plain' } },
    { id: 'buy_favour', label: 'Purchase favourable testimony', costGold: 20, successChance: 0.62, forecast: { risk: 'high', positive: ['Possible acquittal'], negative: ['20 gold', 'A second crime if exposed'] }, success: { text: 'Coin changes a witness’s certainty, and the charge collapses.', effects: { gold: -20, legal: { status: 'free', suspicion: -12, notoriety: 3 }, faith: -4 }, tone: 'plain' }, failure: { text: 'The bribe is exposed before the court. The new charge proves easier than the old one.', effects: { gold: -20, legal: { status: 'imprisoned', suspicion: 20, notoriety: 15, sentenceYears: 4 }, prison: true }, tone: 'bad' } },
  ], cooldownYears: 0, repetitionGroup: 'mandatory_trial', editorialScore: 5,
}];

function normalizeLegal(character: WorldCharacter) {
  character.legalState ??= { status: 'free', suspicion: 0, notoriety: 0, charges: [], sentenceYearsRemaining: 0 };
  return character.legalState;
}

export function tickLegalSystem(state: GameState): GameState {
  for (const character of Object.values(state.world.characters)) {
    if (!character.alive) continue;
    const legal = normalizeLegal(character);
    legal.suspicion = clamp(legal.suspicion - 2);
    if (legal.status === 'imprisoned') {
      legal.sentenceYearsRemaining = Math.max(0, legal.sentenceYearsRemaining - 1);
      if (character.id === state.playerCharacterId) {
        if (legal.sentenceYearsRemaining === 0) {
          legal.status = 'free';
          state.tags = state.tags.filter((tag) => tag !== 'imprisoned');
          pushFeed(state, 'RELEASED', C.good, 'The sentence ends. Swineford opens its gates, though not every door.', 'good');
        }
      }
    }
    if (character.id !== state.playerCharacterId && character.importance !== 'background' && legal.status === 'free' && chance(Math.max(0, (legal.notoriety + (character.factionId === 'outlaws' ? 15 : 0)) / 1200))) {
      legal.suspicion = clamp(legal.suspicion + 12);
      const others = Object.values(state.world.characters).filter((candidate) => candidate.alive && candidate.id !== character.id);
      const victim = others.length ? pick(others) : undefined;
      const witnesses = others.filter((candidate) => candidate.id !== victim?.id);
      legal.charges.push({ id: `charge_${state.nextId++}`, offence: `theft from ${victim?.name ?? 'a neighbour'}`, severity: 25, evidence: 35, victimIds: victim ? [victim.id] : [], witnessIds: witnesses.length ? [pick(witnesses).id] : [], year: state.world.currentYear, resolved: false });
    }
  }
  return state;
}

/**
 * Whether a trial is owed this year. Pure: the charge is only consumed once the
 * Life Director has actually committed to opening the trial, so a year that
 * cannot show it does not silently discard the charge.
 */
export function dueLegalEvent(state: GameState): GameEvent | null {
  const legal = state.world.characters[state.playerCharacterId]?.legalState;
  if (!legal || legal.status === 'imprisoned') return null;
  if (legal.suspicion < 35 || !legal.charges.some((charge) => !charge.resolved)) return null;
  return LEGAL_SYSTEM_EVENTS[0];
}

/** Consume the pending charge. Call only when the trial is being presented. */
export function beginLegalTrial(state: GameState): void {
  const legal = state.world.characters[state.playerCharacterId]?.legalState;
  const unresolved = legal?.charges.find((charge) => !charge.resolved);
  if (!legal || !unresolved) return;
  legal.status = 'awaiting_trial';
  unresolved.resolved = true;
}
