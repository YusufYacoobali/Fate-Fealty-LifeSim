import { Effects, GameState, KinMember, WorldConditionKey } from '@/types/game';
import { C } from '@/theme/theme';
import { applyEffects } from './consequenceEngine';
import { pushFeed } from './gameState';
import { applyRelationshipShift } from './relationshipEngine';
import { pick, pickWeighted } from './random';

type Tone = 'good' | 'bad' | 'plain';

interface OutcomeSpec {
  text: string | ((other: KinMember) => string);
  effects: Effects;
  tone?: Tone;
  relationship?: number;
}

interface ContextualActivitySpec {
  tag: string;
  color: string;
  condition: WorldConditionKey;
  /** True when a high condition value favours the first outcome. */
  highIsGood: boolean;
  good: OutcomeSpec;
  social: OutcomeSpec;
  problem: OutcomeSpec & { eventId: string };
}

function partner(state: GameState): KinMember {
  const candidates = state.kin.filter((kin) => kin.alive && kin.id !== 'goose' && kin.id !== state.playerCharacterId);
  return candidates.length ? pick(candidates) : state.kin.find((kin) => kin.alive) ?? state.kin[0];
}

function unresolved(state: GameState, eventId: string): boolean {
  return !state.memories.some((memory) => memory.tag === `${eventId}_resolved`);
}

function resolveActivity(state: GameState, spec: ContextualActivitySpec): void {
  const other = partner(state);
  const condition = state.world.conditions[spec.condition];
  const favourable = spec.highIsGood ? condition : 100 - condition;
  const pressure = 100 - favourable;
  const chosen = pickWeighted(
    [spec.good, spec.social, spec.problem],
    (outcome) => outcome === spec.good
      ? 2 + favourable / 18
      : outcome === spec.social
        ? 2 + other.rel / 24
        : unresolved(state, spec.problem.eventId) ? 0.55 + pressure / 38 : 0,
  ) ?? spec.good;

  applyEffects(state, chosen.effects);
  if (chosen.relationship) {
    applyRelationshipShift(
      state,
      other.id,
      { affinity: Math.round(chosen.relationship / 2), trust: Math.round(chosen.relationship / 3) },
      { affinity: chosen.relationship, trust: Math.round(chosen.relationship / 2) },
    );
  }
  pushFeed(state, spec.tag, spec.color, typeof chosen.text === 'function' ? chosen.text(other) : chosen.text, chosen.tone ?? 'plain');
  if (chosen === spec.problem && unresolved(state, spec.problem.eventId)) {
    state.pendingEvent = { eventId: spec.problem.eventId, bindings: { other: other.id } };
  }
}

const ACTIVITIES: Record<string, ContextualActivitySpec> = {
  village_service: {
    tag: 'VILLAGE DUTY', color: C.good, condition: 'publicOrder', highIsGood: false,
    good: { text: 'You stop a quarrel at the well before insults become heirlooms. Both households leave dissatisfied enough to accept the settlement.', effects: { charm: 3, reputation: 4, rankProgress: 3, path: { labour: 1 }, worldConditions: { publicOrder: 3 } }, tone: 'good' },
    social: { text: (other) => `${other.name} brings neighbours to mend the footbridge with you. Shared work turns an unsafe crossing into village property again.`, effects: { health: -2, reputation: 5, holding: { loyalty: 3 }, worldConditions: { publicOrder: 2 } }, relationship: 7, tone: 'good' },
    problem: { eventId: 'activity_village_dispute', text: 'A routine day of village service becomes a public argument over a boundary hedge.', effects: { charm: 1, path: { labour: 1 } } },
  },
  gather_fuel: {
    tag: 'HOUSEHOLD', color: C.amber, condition: 'foodSecurity', highIsGood: false,
    good: { text: 'You range farther than usual for deadwood and return bent beneath enough fuel to make a hard winter survivable.', effects: { health: -4, holding: { stores: 8 }, householdState: { food: 3 }, path: { labour: 1 } }, tone: 'good' },
    social: { text: (other) => `${other.name} helps split and stack the wood. The work is lighter, and the household gains a neighbour likely to answer next time.`, effects: { health: -1, holding: { stores: 5 }, householdState: { quality: 2 } }, relationship: 8, tone: 'good' },
    problem: { eventId: 'activity_village_dispute', text: 'A landholder challenges where the common wood ends and private right begins.', effects: { health: -2, holding: { stores: 3 } } },
  },
  manage_workshop: {
    tag: 'WORKSHOP', color: C.good, condition: 'prosperity', highIsGood: true,
    good: { text: 'Good orders arrive together. You organise the benches, meet every promise, and finish the season with a waiting list.', effects: { gold: 12, wits: 2, rankProgress: 5, path: { labour: 2 }, worldConditions: { prosperity: 2 } }, tone: 'good' },
    social: { text: (other) => `${other.name} helps you repair old work and train careful hands while trade is thin. Skill grows where profit does not.`, effects: { gold: 3, wits: 4, rankProgress: 3, path: { labour: 1 } }, relationship: 6, tone: 'plain' },
    problem: { eventId: 'activity_guild_pact', text: 'The other masters invite you to a closed meeting about prices and obedience.', effects: { gold: 5, rankProgress: 2 } },
  },
  guild_bargain: {
    tag: 'GUILD', color: C.charmDark, condition: 'prosperity', highIsGood: true,
    good: { text: 'You trade concessions clause by clause and leave with better access to materials without surrendering your independence.', effects: { gold: -2, charm: 4, reputation: 4, rankProgress: 6, path: { labour: 2 }, faction: { factionId: 'guilds', playerStanding: 3 } }, tone: 'good' },
    social: { text: (other) => `${other.name} backs your proposal when the room turns against it. The bargain is narrower than you hoped but stronger than you could have won alone.`, effects: { gold: -2, charm: 3, rankProgress: 5, faction: { factionId: 'guilds', playerStanding: 2 } }, relationship: 7, tone: 'good' },
    problem: { eventId: 'activity_guild_pact', text: 'The bargaining stops being about dues and becomes a proposal to fix every price in town.', effects: { gold: -2, charm: 2 } },
  },
  hear_confession: {
    tag: 'CONFESSION', color: C.faithDark, condition: 'religiousTension', highIsGood: false,
    good: { text: 'A frightened parishioner speaks honestly because you listen without reaching for punishment. They leave lighter and the parish grows calmer.', effects: { faith: 5, charm: 2, rankProgress: 4, path: { church: 2 }, worldConditions: { religiousTension: -3 } }, tone: 'good' },
    social: { text: (other) => `${other.name} trusts you with a shame that requires counsel rather than judgment. You protect both the person and the confidence.`, effects: { faith: 5, wits: 2, rankProgress: 4, path: { church: 2 } }, relationship: 10, tone: 'good' },
    problem: { eventId: 'activity_confession_secret', text: 'One confession contains a threat that cannot be ignored without danger or repeated without betrayal.', effects: { faith: 2, wits: 1 } },
  },
  copy_manuscript: {
    tag: 'SCRIPTORIUM', color: C.blue, condition: 'diseasePressure', highIsGood: true,
    good: { text: 'You copy a physician’s notes instead of another sermon. The margins contain remedies and warnings written during an epidemic.', effects: { wits: 5, faith: 1, health: 3, rankProgress: 3, path: { church: 1 }, worldConditions: { diseasePressure: -1 } }, tone: 'good' },
    social: { text: (other) => `${other.name} checks names and dates while you illuminate the page. The work becomes both more accurate and less lonely.`, effects: { wits: 4, faith: 2, rankProgress: 3, path: { church: 1 } }, relationship: 6, tone: 'good' },
    problem: { eventId: 'activity_forbidden_manuscript', text: 'A censored passage and a familiar hand leave you holding knowledge somebody meant to bury.', effects: { wits: 3, faith: -1 } },
  },
  lead_patrol: {
    tag: 'PATROL', color: C.blue, condition: 'publicOrder', highIsGood: false,
    good: { text: 'The patrol breaks up an ambush before the first cart reaches it. The roads become safer because somebody was watching early.', effects: { health: -4, rankProgress: 5, reputation: 4, worldConditions: { publicOrder: 5 } }, tone: 'good' },
    social: { text: (other) => `${other.name} guides you along paths the regular patrol ignores. You find no thieves, but gain a reliable pair of eyes.`, effects: { health: -2, wits: 3, worldConditions: { publicOrder: 2 } }, relationship: 8, tone: 'good' },
    problem: { eventId: 'activity_levy_deserter', text: 'The patrol finds a missing levy spear and its frightened owner behind the tithe barn.', effects: { rankProgress: 2 } },
  },
  drill_levy: {
    tag: 'LEVY', color: C.healthDark, condition: 'warThreat', highIsGood: true,
    good: { text: 'War feels close enough to sharpen attention. The levy learns to hold a line, turn together, and stop staring at the opposing spear points.', effects: { health: -5, charm: 3, rankProgress: 7, worldConditions: { warThreat: -3, publicOrder: 1 } }, tone: 'good' },
    social: { text: (other) => `${other.name} questions why planting hands are carrying spears. You shorten the drill and teach only what may keep them alive.`, effects: { health: -2, wits: 2, rankProgress: 3, faction: { factionId: 'commons', playerStanding: 3 } }, relationship: 6, tone: 'plain' },
    problem: { eventId: 'activity_levy_deserter', text: 'One name is missing at roll call, and the reason is waiting behind the tithe barn.', effects: { rankProgress: 2 } },
  },
  hear_petitions: {
    tag: 'PETITIONS', color: C.purpleDark, condition: 'foodSecurity', highIsGood: false,
    good: { text: 'Most petitions concern grain, rent, and which obligation may be postponed without destroying a household. You grant time where law permits it.', effects: { charm: 3, reputation: 6, rankProgress: 5, path: { court: 2 }, holding: { loyalty: 6 }, worldConditions: { foodSecurity: 2 } }, tone: 'good' },
    social: { text: (other) => `${other.name} brings a dispute small enough to solve and old enough to matter. Your judgment repairs more trust than land.`, effects: { wits: 3, rankProgress: 4, holding: { loyalty: 3 } }, relationship: 8, tone: 'good' },
    problem: { eventId: 'activity_petition_feud', text: 'Two households arrive with incompatible claims to the same meadow.', effects: { charm: 1, rankProgress: 2 } },
  },
  host_court: {
    tag: 'COURT', color: C.charmDark, condition: 'prosperity', highIsGood: true,
    good: { text: 'A prosperous season fills the hall with guests worth introducing. Food, ceremony, and careful seating become three new alliances.', effects: { gold: -5, charm: 7, rankProgress: 7, path: { court: 3 }, familyReputation: { delta: 4 }, householdState: { status: 3 } }, tone: 'good' },
    social: { text: (other) => `${other.name} stays after the formal guests leave. A candid conversation achieves what the grand seating plan could not.`, effects: { gold: -5, charm: 4, faith: 2, reputation: 4, familyReputation: { delta: 2 } }, relationship: 9, tone: 'good' },
    problem: { eventId: 'activity_petition_feud', text: 'Two guests turn a question of precedence into a legal claim over land.', effects: { gold: -5, charm: 1 } },
  },
  hold_council: {
    tag: 'ROYAL COUNCIL', color: C.purpleDark, condition: 'warThreat', highIsGood: true,
    good: { text: 'The council argues over roads, musters, and supplies. You force every proposal to include what it costs the villages providing it.', effects: { wits: 4, charm: 2, rankProgress: 7, path: { court: 3 }, worldConditions: { warThreat: -3, publicOrder: 2 } }, tone: 'good' },
    social: { text: (other) => `${other.name} helps draft a settlement neither faction can call victory. That is precisely why it holds.`, effects: { wits: 3, faith: 3, worldConditions: { religiousTension: -4 }, faction: { factionId: 'church', playerStanding: 2 } }, relationship: 7, tone: 'good' },
    problem: { eventId: 'activity_council_crisis', text: 'The council’s grain figures reveal that one of the realm’s promises must be broken.', effects: { wits: 2 } },
  },
  royal_audience: {
    tag: 'AUDIENCE', color: C.charmDark, condition: 'prosperity', highIsGood: false,
    good: { text: 'Petitioners bring debts, failed harvests, and officials who mistake collection for theft. You remit enough to restore hope without emptying the treasury.', effects: { charm: 5, faith: 3, reputation: 6, rankProgress: 6, worldConditions: { prosperity: 2, publicOrder: 2 } }, tone: 'good' },
    social: { text: (other) => `${other.name} presents a difficult request with unusual honesty. Your answer disappoints them, but your attention earns respect.`, effects: { wits: 3, charm: 4, rankProgress: 5, path: { court: 2 } }, relationship: 8, tone: 'good' },
    problem: { eventId: 'activity_council_crisis', text: 'The audience chamber fills with delegations asking for grain that the council says does not exist.', effects: { charm: 1, reputation: -1 } },
  },
  plan_heist: {
    tag: 'HEIST', color: C.purpleDark, condition: 'prosperity', highIsGood: true,
    good: { text: 'Prosperous merchants become careless with routines. You map a rich target, three exits, and a night when every guard expects to be elsewhere.', effects: { wits: 5, faith: -2, path: { outlaw: 3 }, addTags: ['crime_prepared'] }, tone: 'good' },
    social: { text: (other) => `${other.name} notices a witness route you missed. The plan grows smaller, safer, and dependent on mutual trust.`, effects: { wits: 5, path: { outlaw: 2 }, legal: { suspicion: -3 }, addTags: ['crime_prepared'] }, relationship: 7, tone: 'plain' },
    problem: { eventId: 'activity_gang_betrayal', text: 'Before the plan is finished, part of the gang’s shared purse disappears.', effects: { wits: 2, faith: -1 } },
  },
  rally_gang: {
    tag: 'OUTLAW BAND', color: C.healthDark, condition: 'publicOrder', highIsGood: false,
    good: { text: 'Discontent has filled the roads with recruits. You choose the ones who can follow a plan and send the loudest home.', effects: { charm: 5, reputation: -4, path: { outlaw: 3 }, worldConditions: { publicOrder: -2 }, faction: { factionId: 'outlaws', playerStanding: 4 } }, tone: 'good' },
    social: { text: (other) => `${other.name} warns that half the volunteers are frightened farmers and the other half are informers. You keep the loyal core.`, effects: { wits: 3, charm: 2, path: { outlaw: 2 }, legal: { suspicion: -3 } }, relationship: 8, tone: 'plain' },
    problem: { eventId: 'activity_gang_betrayal', text: 'The loyalty speech ends when somebody notices the shared purse is light.', effects: { reputation: -2, path: { outlaw: 1 } } },
  },
  arrange_gathering: {
    tag: 'HOUSEHOLD GATHERING', color: C.charmDark, condition: 'foodSecurity', highIsGood: true,
    good: { text: 'The table is full, the guests stay late, and two households discover they agree on more than the seating plan.', effects: { gold: -3, charm: 5, rankProgress: 3, path: { court: 1 }, familyReputation: { delta: 4 }, householdState: { status: 3 } }, tone: 'good' },
    social: { text: (other) => `${other.name} brings extra bread when the meal proves thinner than the guest list. Scarcity becomes a shared table instead of a humiliation.`, effects: { gold: -3, faith: 4, charm: 2, familyReputation: { delta: 2 }, householdState: { food: -2, status: 1 }, worldConditions: { foodSecurity: 1 } }, relationship: 9, tone: 'good' },
    problem: { eventId: 'activity_gathering_quarrel', text: 'An old insult reaches the table before the bread does, and one guest refuses their seat.', effects: { gold: -3, charm: 1 } },
  },
  preach_sermon: {
    tag: 'SERMON', color: C.faithDark, condition: 'religiousTension', highIsGood: false,
    good: { text: 'You preach practical mercy rather than punishment. The parish organises broth, clean bedding, and help for isolated households.', effects: { faith: 5, charm: 3, rankProgress: 4, path: { church: 2 }, worldConditions: { diseasePressure: -2, religiousTension: -3 }, faction: { factionId: 'church', playerStanding: 3 } }, tone: 'good' },
    social: { text: (other) => `${other.name} answers your call for alms first. The sermon becomes a collection, and the collection becomes grain in hungry households.`, effects: { faith: 4, charm: 4, reputation: 4, rankProgress: 4, worldConditions: { foodSecurity: 2, religiousTension: -1 }, faction: { factionId: 'commons', playerStanding: 3 } }, relationship: 7, tone: 'good' },
    problem: { eventId: 'activity_sermon_unrest', text: 'A warning against hidden sin becomes an accusation when the congregation decides it has heard a name.', effects: { faith: 3, charm: 1, worldConditions: { religiousTension: 2 } } },
  },
};

/** Returns true when this engine owns and resolves the activity id. */
export function handleContextualActivity(state: GameState, id: string): boolean {
  const spec = ACTIVITIES[id];
  if (!spec) return false;
  resolveActivity(state, spec);
  return true;
}

export const CONTEXTUAL_ACTIVITY_IDS = Object.freeze(Object.keys(ACTIVITIES));
