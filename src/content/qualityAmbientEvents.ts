/**
 * The long ambient chains — multi-year village stories that remember what you
 * did in them.
 *
 * These used to be generated. Each beat was one premise sentence, and then the
 * same two choices ("Stand with them and accept the cost" / "Protect thy
 * position first") were bolted onto all ninety-odd of them with the same two
 * outcome lines. A stolen chalice, a rat-eaten granary and a child prophet all
 * resolved through an identical button, which is why none of it felt like
 * anything. Every beat now carries its own passage and choices, written for
 * that situation and no other; the copy lives in `./chains`.
 *
 * The chain wiring is unchanged. A beat is gated on the exact title of the beat
 * before it, because resolving an event writes its title into world history as
 * a cause (see `storyGraph`). Titles are load-bearing.
 */

import { ContentDomain, Effects, EventCategory, GameEvent, GameState } from '@/types/game';
import { C } from '@/theme/theme';
import { defineEvent } from './factories';
import { Beat, BeatChoice, ChainSpec } from './chains/types';
import { FAMILY_CHAINS } from './chains/family';
import { HEALTH_CHAINS } from './chains/health';
import { CRIME_CHAINS } from './chains/crime';
import { CAREER_CHAINS } from './chains/career';
import { POLITICS_CHAINS } from './chains/politics';
import { HOUSEHOLD_CHAINS } from './chains/household';
import { RARE_CHAINS } from './chains/rare';

const CHAINS: ChainSpec[] = [
  ...FAMILY_CHAINS,
  ...HEALTH_CHAINS,
  ...CRIME_CHAINS,
  ...CAREER_CHAINS,
  ...POLITICS_CHAINS,
  ...HOUSEHOLD_CHAINS,
  ...RARE_CHAINS,
];

function categoryFor(domain: ContentDomain): EventCategory {
  if (domain === 'family') return 'family';
  if (domain === 'health') return 'plague';
  if (domain === 'politics') return 'court';
  return 'peasant';
}

function tagColorFor(domain: ContentDomain): string {
  if (domain === 'crime') return C.health;
  if (domain === 'health') return C.teal;
  if (domain === 'household') return C.amber;
  return C.purpleDark;
}

/** Substitutes the bound actor's name into passage and outcome text alike. */
function render(state: GameState, source: string): string {
  const actor = state.world.characters[state.pendingEvent?.bindings?.other ?? ''];
  return source.replaceAll('{{other.name}}', actor?.name ?? 'a familiar face');
}

function riskOf(choice: BeatChoice): 'low' | 'medium' | 'high' {
  const effects = choice.effects;
  if (effects.death || effects.prison || effects.exile) return 'high';
  const severe = (effects.legal?.suspicion ?? 0) >= 5
    || (effects.boundKinRel?.delta ?? 0) <= -12
    || (effects.health ?? 0) <= -6
    || Boolean(effects.createSecret);
  return severe ? 'high' : choice.costGold || choice.tone === 'bad' ? 'medium' : 'low';
}

function choiceFor(choice: BeatChoice): GameEvent['choices'][number] {
  return {
    id: choice.id,
    label: choice.label,
    costGold: choice.costGold,
    forecast: {
      risk: riskOf(choice),
      positive: [],
      negative: [],
      warnsDelayedConsequence: Boolean(choice.effects.createSecret || choice.effects.schedule),
    },
    outcome: {
      text: choice.text,
      effects: choice.effects,
      tone: choice.tone ?? 'plain',
    },
  };
}

function eventFor(spec: ChainSpec, beat: Beat, stage: number, previous?: Beat): GameEvent {
  return defineEvent({
    id: `quality_${spec.id}_${stage + 1}`,
    category: categoryFor(spec.domain),
    domain: spec.domain,
    rarity: stage >= 3 ? 'uncommon' : 'common',
    title: beat.title,
    text: (state: GameState) => render(state, beat.text),
    tagColor: tagColorFor(spec.domain),
    requires: previous
      ? { minAge: spec.minAge, hasWorldMemoryType: [previous.title] }
      : { minAge: spec.minAge },
    cooldownYears: 15,
    repetitionGroup: spec.id,
    actorRoles: {
      other: { minAge: 12, alive: true, excludePlayer: true, importance: ['core', 'supporting'], missingActor: 'substitute' },
    },
    // Chain beats are no longer scored above hand-written one-shot events. The
    // registry does not curate on this any more; it survives as a hint only.
    editorialScore: 4,
    chain: { id: spec.id, index: stage, total: spec.beats.length },
    choices: beat.choices.map(choiceFor),
  });
}

export const QUALITY_AMBIENT_EVENTS: GameEvent[] = CHAINS.flatMap((spec) =>
  spec.beats.map((beat, stage) => eventFor(spec, beat, stage, spec.beats[stage - 1])),
);

/** Exported so content tests can assert the chain gating is not broken. */
export const QUALITY_CHAIN_SPECS = CHAINS;
