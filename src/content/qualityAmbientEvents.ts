import { ContentDomain, Effects, EventCategory, GameEvent, GameState } from '@/types/game';
import { C } from '@/theme/theme';
import { defineEvent } from './factories';

interface ChainSpec {
  id: string;
  domain: ContentDomain;
  title: string;
  texts: string[];
}

const CHAINS: ChainSpec[] = [
  { id: 'broken_betrothal', domain: 'family', title: 'The Broken Betrothal', texts: [
    '{{other.name}} asks you to witness a betrothal made without affection but with two hungry households watching.',
    'The promised dowry has vanished. {{other.name}} suspects an elder quietly sold it to settle an older debt.',
    'One family demands the marriage proceed; the other bars its door. {{other.name}} is trapped between honour and fear.',
    'A former lover arrives with letters that could free {{other.name}} and disgrace everyone else.',
    'Years later, the children of the quarrelling houses ask whether the old promise should finally be buried.',
    'The last surviving witness offers to tell the truth, but only if both families agree to hear it together.',
  ] },
  { id: 'foster_oath', domain: 'family', title: 'The Foster Child’s Oath', texts: [
    '{{other.name}} brings an orphaned child to your threshold and asks for a place at your fire.',
    'The child’s birth family returns, not to reclaim them, but to demand service for the shelter they once provided.',
    '{{other.name}} discovers the child has hidden food for another hungry household.',
    'A place opens in a respected apprenticeship, though accepting it would split the foster household.',
    'Now grown, the former ward must decide which family name to carry into adulthood.',
  ] },
  { id: 'siblings_share', domain: 'family', title: 'A Sibling’s Share', texts: [
    '{{other.name}} claims the family has always measured affection in unequal bowls and unequal coins.',
    'An heirloom disappears after supper. Every sibling remembers a different promise about who deserved it.',
    '{{other.name}} offers evidence that a parent secretly altered the intended inheritance.',
    'The dispute follows the family into a public feast where silence would look like guilt.',
    'A death leaves the siblings alone with the property—and with everything said while fighting over it.',
  ] },
  { id: 'millers_fever', domain: 'health', title: 'Fever at the Mill', texts: [
    '{{other.name}} develops a fever after working beside the damp millrace, and neighbours begin avoiding the flour.',
    'The fever spreads through the mill household while the village argues whether hunger or sickness is the greater danger.',
    '{{other.name}} improves, but a frightened customer claims the mill concealed illness for profit.',
    'A healer asks to isolate the household just as the last sound grain needs grinding.',
    'The mill turns again, yet Swineford remembers who brought food and who brought blame.',
  ] },
  { id: 'wounded_midwife', domain: 'health', title: 'The Wounded Midwife', texts: [
    '{{other.name}}, who has attended half the village’s births, badly injures a hand on the winter road.',
    'Without the midwife, an inexperienced apprentice asks to use your household as a place to learn.',
    '{{other.name}} tries to return too early and hides how badly the wound still pains them.',
    'A difficult birth begins while master and apprentice accuse one another of dangerous pride.',
    'The village must decide whose knowledge will be trusted when the next child comes.',
  ] },
  { id: 'bellmakers_sight', domain: 'health', title: 'The Bellmaker’s Sight', texts: [
    '{{other.name}} can no longer see the fine marks used to tune the parish bell but refuses to surrender the workshop.',
    'An apprentice quietly corrects {{other.name}}’s work and receives neither credit nor gratitude.',
    'A cracked bell is blamed on failing sight, though the metal supplied by the guild was plainly poor.',
    '{{other.name}} asks you to read a contract that would preserve the workshop but transfer its ownership.',
    'The next bell rings cleanly, carrying the name of whoever Swineford believes truly made it.',
  ] },
  { id: 'stolen_chalice', domain: 'crime', title: 'The Stolen Chalice', texts: [
    'The parish chalice disappears, and {{other.name}} is seen leaving the church before dawn.',
    'A sliver of gilt is found in the market. {{other.name}} insists it was planted by someone who owes them money.',
    'A witness changes their account after receiving a new roof and several conspicuously fat hens.',
    'The reeve prepares a public trial while the Church demands the relic be recovered before judgment.',
    'The chalice returns in a sack without explanation, leaving guilt harder to settle than theft.',
    'A silversmith confesses to copying the chalice years ago, raising the question of which vessel was actually stolen.',
    'The final account is read before the parish, where silence from the innocent proves as costly as speech from the guilty.',
  ] },
  { id: 'forest_gang', domain: 'crime', title: 'The Forest Gang', texts: [
    '{{other.name}} knows who has been taking deer from the lord’s wood and feeding poor households with the meat.',
    'A forester is injured by a hidden snare, turning tolerated poaching into a hunt for blood.',
    'The gang offers you a share of its silver if you can divert the village patrol.',
    'One poacher seeks pardon in exchange for naming every accomplice, including {{other.name}}.',
    'The forest grows quiet after the trials, but several families still eat because of buried venison and older loyalties.',
    'A new forester offers amnesty for every hidden snare, provided the village names who organised the gang.',
    'When deer return to the coppice, the poorest households ask whether law has made the forest safer or merely emptier.',
  ] },
  { id: 'false_witness', domain: 'crime', title: 'The False Witness', texts: [
    '{{other.name}} asks you to confirm an alibi that you know is only partly true.',
    'The accused victim’s family produces a second witness whose story is cleaner and therefore more suspicious.',
    'A clerk reveals that testimony was altered after the hearing and offers the original for a price.',
    '{{other.name}} admits the lie protected someone else, though naming them may cause greater harm.',
    'Years after the judgment, the wronged household asks Swineford to correct the public record.',
    'The corrected record names no hero, only the many people who found a small lie easier than a difficult truth.',
  ] },
  { id: 'masterpiece', domain: 'career', title: 'The Masterpiece Commission', texts: [
    '{{other.name}} offers a prestigious commission with a deadline no honest craftsperson could promise.',
    'The finest materials arrive damaged, and the supplier insists your workshop caused it.',
    'An apprentice proposes a daring solution that would save the work but place their name beside yours.',
    'The patron demands a cheaper imitation while continuing to advertise the commission as a masterpiece.',
    'The finished work is unveiled before guild and village, along with the true history of who made it possible.',
  ] },
  { id: 'caravan_partnership', domain: 'career', title: 'The Caravan Partnership', texts: [
    '{{other.name}} proposes a shared caravan to a distant fair where profit is high and roads are uncertain.',
    'One cart vanishes overnight with goods belonging to every partner except {{other.name}}.',
    'The missing driver returns with a story about soldiers, mud and a bargain made under threat.',
    'A rival merchant offers safe passage if the partnership abandons its poorest member.',
    'The surviving caravan reaches Swineford with less silver but a reputation that may prove more valuable.',
  ] },
  { id: 'apprentice_revolt', domain: 'career', title: 'The Apprentices’ Revolt', texts: [
    '{{other.name}} speaks for apprentices who work longer hours than guild custom allows.',
    'A master dismisses the complaint and secretly offers you preferential contracts for silence.',
    'Tools are laid down across three workshops, and unfinished orders begin costing the village money.',
    'The guild threatens to blacklist every apprentice unless one leader accepts blame.',
    'A new workshop charter is read aloud, revealing exactly whose sacrifices became permanent rules.',
  ] },
  { id: 'tithe_dispute', domain: 'politics', title: 'The Tithe Dispute', texts: [
    '{{other.name}} argues that the parish tithe was weighed with a dishonest measure during a lean year.',
    'The priest opens the church granary but demands written submission from every household receiving grain.',
    'A bishop’s clerk arrives to inspect the accounts and seems more interested in loyalty than arithmetic.',
    'The Commons prepare to refuse the next collection while the Church threatens exclusion from the sacraments.',
    'A new tithe is proclaimed, carrying traces of every bargain, threat and bowl of grain that shaped it.',
  ] },
  { id: 'crown_levy', domain: 'politics', title: 'The Crown’s Levy', texts: [
    '{{other.name}} brings a royal demand for soldiers, carts and grain beyond what Swineford can easily spare.',
    'Several names vanish from the muster roll after wealthy households make private payments.',
    'The Commons demand a public drawing of lots while armed retainers gather near the hall.',
    'A royal inspector arrives after rumours that Swineford falsified both population and harvest records.',
    'The levy marches at last, and those remaining must decide whether the burden was shared or merely hidden.',
  ] },
  { id: 'guild_seal', domain: 'politics', title: 'The Guild Seal', texts: [
    '{{other.name}} discovers that two guild officers are issuing rival orders under copies of the same seal.',
    'Merchants begin refusing Swineford coin until someone proves which guild council is lawful.',
    'A charter fragment surfaces in a family chest, granting rights neither faction expected.',
    'The Crown offers recognition in exchange for taxes that would bind the guild for a generation.',
    'A single seal returns to the guild hall, though its authority now rests on a history everyone remembers differently.',
  ] },
  { id: 'winter_roof', domain: 'household', title: 'A Roof Before Winter', texts: [
    '{{other.name}} warns that the household roof will not survive another hard winter.',
    'The hired carpenter uncovers rotten beams hidden beneath a recent and dishonest repair.',
    'Rain ruins stored bedding while two families argue over who may sleep beside the hearth.',
    'Timber promised to the household is diverted to repair the lord’s granary.',
  ] },
  { id: 'granary_rats', domain: 'household', title: 'Rats in the Granary', texts: [
    '{{other.name}} finds grain sacks gnawed open and suspects the loss is greater than rats alone could explain.',
    'A child is caught carrying flour to a neighbouring household that has eaten nothing for two days.',
    'The remaining stores spoil after someone seals damp grain behind a repaired wall.',
    'At winter’s end, the household counts what was eaten, stolen, shared and saved.',
  ] },
  { id: 'neighbours_fire', domain: 'household', title: 'Fire Next Door', texts: [
    '{{other.name}} shouts that flames have taken the neighbouring roof and sparks are falling on your own.',
    'The fire is stopped, but three households now compete for two habitable rooms.',
    'A strongbox found in the ashes contains coins no neighbour admits owning.',
    'When rebuilding begins, the street must decide whether the poorest family receives a roof first.',
  ] },
  { id: 'strangers_map', domain: 'rare', title: 'The Stranger’s Map', texts: [
    '{{other.name}} buys a rain-soaked map marked with a path beneath Swineford’s oldest boundary stones.',
    'A night search finds a sealed chamber containing tools, bones and a much newer footprint.',
    'The map’s missing corner appears in the reeve’s archive beside records of confiscated land.',
    'The hidden path ends beneath a living family’s house, where treasure and ownership become the same argument.',
  ] },
  { id: 'saints_bone', domain: 'rare', title: 'The Saint’s Bone', texts: [
    '{{other.name}} arrives with a small reliquary and a large claim: the bone inside belongs to a forgotten saint.',
    'Pilgrims bring coin, sickness and competing stories about miracles performed near the relic.',
    'A scholar identifies the reliquary as genuine but refuses to speak about the bone itself.',
    'Two churches claim the relic while Swineford’s poor ask why holiness requires armed guards.',
  ] },
  { id: 'prophetic_child', domain: 'rare', title: 'The Child Who Dreamed', texts: [
    '{{other.name}} reports that a child described a coming flood before clouds appeared over Swineford.',
    'A second dream names a household secret the child could not reasonably know.',
    'Crowds gather for predictions while the frightened family asks that the child be left alone.',
    'The final dream contradicts the ambitions of both priest and lord, forcing everyone to reveal what they truly believe.',
    'Years later, the grown dreamer returns to hear which parts of the old story Swineford chose to remember.',
  ] },
];

function categoryFor(domain: ContentDomain): EventCategory {
  if (domain === 'family') return 'family';
  if (domain === 'health') return 'plague';
  if (domain === 'politics') return 'court';
  return 'peasant';
}

function render(state: GameState, source: string): string {
  const actor = state.world.characters[state.pendingEvent?.bindings?.other ?? ''];
  return source.replaceAll('{{other.name}}', actor?.name ?? 'a familiar face');
}

function lastingEffects(domain: ContentDomain, stage: number): Effects {
  const memory = { tag: `${domain}_chain_${stage}`, weight: stage >= 3 ? 3 : 2 };
  switch (domain) {
    case 'family': return { memory, boundKinRel: { role: 'other', delta: 5 }, familyReputation: { delta: 1 } };
    case 'health': return { memory, worldConditions: { diseasePressure: -2 }, boundKinRel: { role: 'other', delta: 4 } };
    case 'crime': return { memory, legal: { suspicion: 4, notoriety: stage >= 3 ? 2 : 0 }, boundKinRel: { role: 'other', delta: 3 } };
    case 'career': return { memory, gold: stage >= 3 ? 4 : 2, faction: { factionId: 'guilds', playerStanding: 2 } };
    case 'politics': return { memory, reputation: 2, faction: { factionId: stage % 2 ? 'commons' : 'crown', playerStanding: 2 } };
    case 'household': return { memory, householdState: { quality: 2, food: 2 }, boundKinRel: { role: 'other', delta: 3 } };
    case 'rare': return { memory, wits: 2, createSecret: { type: 'false_lineage', severity: 25, knownByIds: [] } };
  }
}

function guardedEffects(domain: ContentDomain, stage: number): Effects {
  const memory = { tag: `${domain}_guarded_${stage}`, weight: 2 };
  switch (domain) {
    case 'family': return { memory, boundKinRel: { role: 'other', delta: -3 }, householdState: { food: 3 } };
    case 'health': return { memory, worldConditions: { diseasePressure: 2 }, householdState: { food: 2 } };
    case 'crime': return { memory, legal: { suspicion: -3 }, reputation: -1, boundKinRel: { role: 'other', delta: -2 } };
    case 'career': return { memory, gold: 5, faction: { factionId: 'guilds', playerStanding: -1 } };
    case 'politics': return { memory, faction: { factionId: 'crown', playerStanding: 1 } };
    case 'household': return { memory, householdState: { wealth: -2, quality: 4 } };
    case 'rare': return { memory, faith: 2, boundKinRel: { role: 'other', delta: -2 } };
  }
}

function eventFor(spec: ChainSpec, text: string, stage: number): GameEvent {
  const id = `quality_${spec.id}_${stage + 1}`;
  const previousTitle = stage === 0 ? undefined : `${spec.title}: ${stage}`;
  const standEffects = lastingEffects(spec.domain, stage);
  if (spec.id === 'foster_oath' && stage === 0) standEffects.expectChild = { route: 'adoption', dueInYears: 1 };
  return defineEvent({
    id,
    category: categoryFor(spec.domain),
    domain: spec.domain,
    rarity: stage >= 3 ? 'uncommon' : 'common',
    title: `${spec.title}: ${stage + 1}`,
    text: (state) => render(state, text),
    tagColor: spec.domain === 'crime' ? C.health : spec.domain === 'health' ? C.teal : C.purpleDark,
    requires: previousTitle ? { minAge: 8, hasWorldMemoryType: [previousTitle] } : { minAge: 8 },
    cooldownYears: 15,
    repetitionGroup: spec.id,
    actorRoles: { other: { minAge: 12, alive: true, excludePlayer: true, importance: ['core', 'supporting'], missingActor: 'substitute' } },
    editorialScore: 5,
    choices: [
      {
        id: 'stand_with_them', label: 'Stand with them and accept the cost',
        forecast: { risk: stage >= 3 ? 'high' : 'medium', positive: ['Trust', 'A remembered commitment'], negative: ['Coin or reputation may suffer'], warnsDelayedConsequence: stage >= 2 },
        outcome: { text: 'You make a public commitment. The decision enters both household memory and village argument.', effects: standEffects, tone: 'good' },
      },
      {
        id: 'protect_your_position', label: 'Protect thy position first',
        forecast: { risk: 'low', positive: ['Immediate security'], negative: ['Trust', 'The choice may return later'], warnsDelayedConsequence: true },
        outcome: { text: 'You choose the safer position. It protects something immediate and leaves another debt unpaid.', effects: guardedEffects(spec.domain, stage), tone: 'plain' },
      },
    ],
  });
}

export const QUALITY_AMBIENT_EVENTS: GameEvent[] = CHAINS.flatMap((spec) => spec.texts.map((text, stage) => eventFor(spec, text, stage)));
