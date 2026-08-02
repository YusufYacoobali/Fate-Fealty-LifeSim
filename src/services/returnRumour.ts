import { STORY_TEMPLATE_BY_ID } from '@/content/persistentStories';
import { eventById } from '@/engine/eventPicker';
import { GameState, Tab, WorldConditionKey } from '@/types/game';

export const RETURN_RUMOUR_AFTER_MS = 4 * 60 * 60 * 1000;

export interface ReturnRumour {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  tab: Tab;
}

function words(id: string): string {
  return id.replace(/^story_/, '').replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function activeStoryRumour(state: GameState): ReturnRumour | null {
  const priority = { major: 0, medium: 1, relationship: 2 } as const;
  const story = state.world.activeStories
    .filter((candidate) => candidate.status === 'active' || candidate.status === 'paused')
    .sort((a, b) => priority[a.scale] - priority[b.scale] || b.lastBeatYear - a.lastBeatYear)[0];
  if (!story) return null;
  const template = STORY_TEMPLATE_BY_ID[story.templateId];
  const beat = template?.beats[story.currentBeatId];
  const event = beat ? eventById(beat.eventId) : undefined;
  const actorId = Object.values(story.bindings).find((id) => id !== state.playerCharacterId);
  const actor = actorId ? state.world.characters[actorId] : undefined;
  const title = event?.title ?? words(story.templateId);
  return {
    id: `story:${story.id}:${story.currentBeatId}`,
    eyebrow: `${story.scale.toUpperCase()} TALE`,
    title,
    body: actor?.alive
      ? `${actor.name} remains bound to this unfinished tale. The next choice may reshape more than one life.`
      : 'This unfinished tale is still gathering consequences across Swineford.',
    cta: 'RETURN TO THY LIFE',
    tab: 'life',
  };
}

function legalRumour(state: GameState): ReturnRumour | null {
  const legal = state.world.characters[state.playerCharacterId]?.legalState;
  if (!legal || legal.status === 'free') return null;
  const unresolved = legal.charges.find((charge) => !charge.resolved);
  return {
    id: `law:${legal.status}:${unresolved?.id ?? 'standing'}`,
    eyebrow: 'WORD FROM THE COURT',
    title: legal.status === 'awaiting_trial' ? 'A hearing draws near' : 'The law has not forgotten',
    body: unresolved
      ? `The charge of ${unresolved.offence.toLowerCase()} remains unresolved. Witnesses, evidence and reputation may decide what follows.`
      : `Thy legal standing is still ${legal.status.replaceAll('_', ' ')}. Swineford is watching what thou dost next.`,
    cta: 'REVIEW THY LIFE',
    tab: 'life',
  };
}

function healthRumour(state: GameState): ReturnRumour | null {
  const candidates = Object.values(state.world.characters)
    .filter((character) => character.alive && character.id !== state.playerCharacterId && (character.healthConditions?.length ?? 0) > 0)
    .map((character) => ({
      character,
      severity: Math.max(...(character.healthConditions ?? []).map((condition) => condition.severity)),
      related: character.kind !== 'acquaintance',
    }))
    .sort((a, b) => Number(b.related) - Number(a.related) || b.severity - a.severity);
  const sick = candidates[0];
  if (!sick || sick.severity < 35) return null;
  return {
    id: `health:${sick.character.id}:${Math.round(sick.severity / 10)}`,
    eyebrow: 'NEWS OF THY PEOPLE',
    title: `${sick.character.name} needs attention`,
    body: 'Illness changes household needs and the choices people make. Care, distance or duty may all be remembered.',
    cta: 'VISIT THY PEOPLE',
    tab: 'kin',
  };
}

const CONDITION_COPY: Record<WorldConditionKey, { low: string; high: string }> = {
  foodSecurity: { low: 'The granaries are running thin', high: 'The harvest has filled the barns' },
  prosperity: { low: 'Trade has slowed across Swineford', high: 'New wealth is changing old loyalties' },
  publicOrder: { low: 'Order is fraying in the streets', high: 'The reeve has tightened his grip' },
  warThreat: { low: 'The roads are unusually calm', high: 'Rumours of war have reached the market' },
  diseasePressure: { low: 'The village air has cleared', high: 'More doors bear marks of sickness' },
  religiousTension: { low: 'The parish has found a fragile peace', high: 'The chapel factions are hardening' },
};

function worldRumour(state: GameState): ReturnRumour {
  const [condition, value] = (Object.entries(state.world.conditions) as Array<[WorldConditionKey, number]>)
    .sort((a, b) => Math.abs(b[1] - 50) - Math.abs(a[1] - 50))[0];
  return {
    id: `world:${condition}:${Math.round(value / 10)}`,
    eyebrow: 'RUMOUR FROM SWINEFORD',
    title: value >= 50 ? CONDITION_COPY[condition].high : CONDITION_COPY[condition].low,
    body: `The village measure now stands at ${value}. Households, factions and future stories will respond to the pressure.`,
    cta: 'SEE WORLD STATUS',
    tab: 'life',
  };
}

/** A deterministic, state-derived reason to return. It never changes the world. */
export function buildReturnRumour(state: GameState): ReturnRumour {
  return activeStoryRumour(state) ?? legalRumour(state) ?? healthRumour(state) ?? worldRumour(state);
}
