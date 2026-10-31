import type { Choice, Effects, EventActorRole, GameEvent } from '@/types/game';

export const ADULT: EventActorRole = { minAge: 18, alive: true, excludePlayer: true, missingActor: 'clear_event' };
export const PARENT: EventActorRole = { ...ADULT, relation: 'parent' };
export const SPOUSE: EventActorRole = { ...ADULT, relation: 'spouse' };
export const CHILD: EventActorRole = { minAge: 4, maxAge: 17, alive: true, excludePlayer: true, relation: 'child', missingActor: 'clear_event' };
export const SIBLING: EventActorRole = { ...ADULT, relation: 'sibling' };
export const RIVAL: EventActorRole = { ...ADULT, relation: 'rival' };
export const LORD: EventActorRole = { ...ADULT, rankAtLeast: 3 };

/** Formatting only: every premise, decision and outcome is individually authored. */
export function reply(id: string, label: string, text: string, effects: Effects, options: Partial<Choice> = {}): Choice {
  const negative = [
    effects.death ? 'Death' : '', effects.prison ? 'Imprisonment' : '',
    effects.endMarriage ? 'The marriage ends' : '', effects.employment ? 'Loss of employment' : '',
    effects.legal?.charge ? 'A legal charge' : '', effects.healthCondition ? 'Illness or lasting injury' : '',
    effects.debt ? 'A debt remains to be repaid' : '', effects.familyFeud ? 'A lasting family feud' : '',
  ].filter(Boolean);
  return { id, label, forecast:{ risk:negative.length ? 'high' : 'low', positive:[], negative, warnsDelayedConsequence:Boolean(effects.createSecret || effects.familyFeud) }, outcome: { text, effects, tone: effects.death || effects.prison || effects.endMarriage ? 'bad' : 'plain' }, ...options };
}
export function scene(id: string, category: GameEvent['category'], domain: GameEvent['domain'], title: string, text: string, choices: Choice[], options: Partial<GameEvent> = {}): GameEvent {
  const event: GameEvent = { id, category, domain, title, text, choices, ageMin: 16, stakes: 'meaningful', actorRoles: { other: ADULT }, repetitionGroup: 'local_disputes', ...options };
  for (const choice of choices) for (const outcome of [choice.outcome,choice.success,choice.failure]) {
    const role = outcome?.effects?.familyFeud?.role;
    if (role && event.actorRoles?.[role]) event.actorRoles[role] = { ...event.actorRoles[role], outsideFamily: true };
  }
  return event;
}
export const fraud = (offence: string, victim = 'other'): Effects['legal'] => ({ suspicion: 38, charge: { offence, severity: 35, evidence: 55, victimIds: [], witnessIds: [victim] } });
export function risk(id: string, label: string, chance: NonNullable<Choice['successChance']>, good: string, gain: Effects, bad: string, loss: Effects, options: Partial<Choice> = {}): Choice {
  return { id, label, successChance:chance, success:{text:good,effects:gain,tone:'good'}, failure:{text:bad,effects:loss,tone:'bad'}, forecast:{risk:'high',positive:[],negative:[],warnsDelayedConsequence:!!loss.legal}, ...options };
}
