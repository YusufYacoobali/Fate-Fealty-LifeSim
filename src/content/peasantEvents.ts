import { GameEvent } from '@/types/game';
import { C } from '@/theme/theme';

/** The bread-and-mud staples of village life. Available to low ranks. */
export const PEASANT_EVENTS: GameEvent[] = [
  {
id: 'peasant_quack_doctor',
category: 'peasant',
title: 'THE QUACK DOCTOR',
text: "{{other}} offers a heated “healing stone” for six gold. The stone is ordinary; the explanation of its value requires a much rarer temperature.",
ageMin: 8,
ranks: ['Peasant', 'Squire'],
choices: [{
label: "Buy the warmed stone (6g)",
costGold: 6,
outcome: {
text: "You pay for a warm stone and a rest beside the brazier. The rest helps a little; no illness is cured by the salesmanship.",
effects: {
gold: -6,
health: 3,
wits: -3,
bond: {"role":"other","trust":-8}
},
tone: 'plain'
}
},
{
label: "Ask what happens when the stone cools",
outcome: {
text: "{{other}} recommends another appointment. You decline with a better understanding of which part of the treatment needs constant warming.",
effects: {
wits: 4,
bond: {"role":"other","affinity":-5}
},
tone: 'good'
}
},
{
label: "Take the stone without paying",
outcome: {
text: "You take the stone and create a theft complaint. It remains ordinary, but your legal record is now more interesting.",
effects: {
gold: undefined,
faith: -5,
charm: -2,
path: { outlaw: 1 },
health: undefined,
legal: {"suspicion":38,"charge":{"offence":"Taking a healer’s goods without payment","severity":20,"evidence":45,"victimIds":["other"],"witnessIds":["other"]}}
},
tone: 'plain'
}
}],
actorRoles: { other: { minAge:18, alive:true, excludePlayer:true, missingActor:'clear_event' } }
},
  {
id: 'peasant_rat_granary',
category: 'peasant',
title: 'A RAT IN THE GRANARY',
text: "{{other}} has declared the granary’s rat an unofficial watchman because it frightens mice. The arrangement is paid entirely in your household’s winter grain.",
ageMin: 8,
ranks: ['Peasant', 'Squire'],
choices: [{
label: "Remove the rat and mend the opening",
outcome: {
text: "You drive the rat out and repair the gap, losing a little blood to the work. Household stores and security improve under a watchman that is now a plank.",
effects: {
health: -4,
charm: 6,
gold: 3,
reputation: 2,
holding: { stores: 4, security: 2 },
householdState: {"food":5},
bond: {"role":"other","trust":5}
},
tone: 'good'
}
},
{
label: "Support the rat’s appointment",
outcome: {
text: "The household loses stored food and {{other}} likes you better. The rat’s performance improves in exactly the wrong direction.",
effects: {
charm: 4,
wits: -2,
holding: { stores: -8 },
householdState: {"food":-8},
bond: {"role":"other","affinity":7}
},
tone: 'plain'
}
},
{
label: "Blame Sir Quackbeard for the arrangement",
outcome: {
text: "You blame the goose and lose its affection. The opening remains unmended, so the household’s stores continue to suffer.",
effects: {
faith: -4,
kinRel: { id: 'goose', delta: -10 },
holding: { stores: -5, loyalty: -3 },
householdState: {"food":-5}
},
tone: 'bad'
},
requires: { custom:s=>s.world.characters.goose?.alive===true }
}],
actorRoles: { other: { minAge:18, alive:true, excludePlayer:true, missingActor:'clear_event' } }
},
  {
id: 'peasant_lords_tourney',
category: 'peasant',
title: 'THE LORD’S TOURNEY',
text: "The tourney steward offers a discount entry because the horse is small. The opposing knight has not been discounted, which seems a serious omission.",
ageMin: 14,
ranks: ['Peasant', 'Squire'],
choices: [{
label: "Enter the uneven joust (5g; risk injury)",
costGold: 5,
successChance: 0.4,
success: {
text: "You unhorse the opponent and earn a net eight gold after the entry fee. The steward objects only to how many people saw the small horse win.",
effects: {
gold: 8,
charm: 12,
health: -8,
path: { martial: 3 },
rankProgress: 12,
reputation: 5,
skillXp: {"arms":10}
},
tone: 'good'
},
failure: {
text: "You land badly and leave with a real broken bone. The steward assures you that the entry fee included the fall.",
effects: {
gold: -5,
charm: 6,
health: -12,
healthCondition: {"conditionId":"broken_bone","severity":30}
},
tone: 'bad'
}
},
{
label: "Sell pies where the losers come down",
outcome: {
text: "You earn nine gold supplying an audience with no shortage of dramatic landings. The best customers eat without taking their eyes off the field.",
effects: {
gold: 9,
charm: 2,
path: { labour: 1 }
},
tone: 'good'
}
},
{
label: "Watch the horsemanship from the safe end",
outcome: {
text: "You study the riders without entering. A little judgement is gained without giving the healer a new customer.",
effects: {
wits: 3,
skillXp: {"arms":4}
},
tone: 'plain'
}
}],
stakes: "major"
},
  {
id: 'peasant_confession',
category: 'peasant',
title: 'CONFESSION TIME',
text: "The priest asks whether you have wronged anyone. You begin with a harmless example; the priest asks why you rehearsed that one first.",
ageMin: 10,
choices: [{
label: "Confess the inconvenient part as well",
outcome: {
text: "You admit the truth and gain faith. The admission does not settle debts or erase charges; it merely stops the priest waiting for the missing part.",
effects: {
faith: 12,
charm: -3,
path: { church: 2 },
familyReputation: {"delta":2}
},
tone: 'good'
}
},
{
label: "Claim a remarkably spotless conscience",
outcome: {
text: "You offer the account of a person nobody in the room has met. The priest hears you out, and you keep a secret about the omission.",
effects: {
faith: -8,
wits: 3,
charm: 4,
path: { court: 1 },
createSecret: {"type":"hidden_debt","severity":20}
},
tone: 'plain'
}
},
{
label: "Give alms without pretending they answer the question (4g)",
costGold: 4,
outcome: {
text: "You give four gold and gain some faith. The priest accepts the donation and repeats the question, now that you have finished changing the subject.",
effects: {
gold: -4,
faith: 6,
familyReputation: {"delta":2}
},
tone: 'plain'
}
}]
},
  {
id: 'peasant_wandering_knight',
category: 'peasant',
title: 'A WANDERING KNIGHT',
text: "A travelling knight seeks someone to carry armour, remember messages and receive blame in that order. He calls the post an education, which suggests the wages will be small.",
ageMin: 12,
ageMax: 18,
ranks: ['Peasant'],
once: true,
choices: [{ label: 'Beg to be his squire', successChance: 0.6, success: { text: 'He grunted approval. You are on the path to knighthood, or at the very least to heavy lifting.', effects: { charm: 5, wits: 4, path: { martial: 4 }, rankProgress: 60, memory: { tag: 'took_squire_path', weight: 3 } }, tone: 'good' }, failure: { text: 'He looked you up and down, sighed, and chose the blacksmith’s daughter instead.', effects: { charm: -3 }, tone: 'bad' } },
{
label: "Ask what the work actually pays",
outcome: {
text: "You insist on a clear wage and receive five gold for a day carrying equipment. The knight leaves without an oath from you.",
effects: {
charm: -3,
gold: 5
},
tone: 'plain'
}
},
{
label: "Decline the offer without a quarrel",
outcome: {
text: "You decline the post. The road remains open, and you have not promised to carry someone else’s mistakes.",
effects: {
charm: -4,
kinRel: undefined,
wits: 3
},
tone: 'plain'
}
}]
},
  {
id: 'peasant_lucky_streak',
category: 'peasant',
title: 'AN UNCANNY STREAK',
text: "You keep winning at dice. The other players have reached the point of blaming sorcery rather than their own arithmetic, a stage at which leaving may be the cleverest throw.",
ageMin: 14,
requires: { hasTraits: ['lucky'] },
weight: 1.5,
choices: [
      { label: 'Ride the luck for all it is worth', successChance: 0.8, success: { text: 'You cleaned out the whole table and walked home whistling, pockets jingling.', effects: { gold: 16, charm: 4, path: { court: 1 } }, tone: 'good' }, failure: { text: 'Your luck finally blinked. You lost the lot, and a tooth, to a sore loser.', effects: { gold: -8, health: -5 }, tone: 'bad' } },
      { label: 'Quit while you are ahead', outcome: { text: 'You pocketed your winnings and left. The gamblers glared; fortune, like milk, can turn.', effects: { gold: 7, wits: 3 }, tone: 'good' } },
    ]
},
  {
    id: 'peasant_sickly_winter',
    category: 'peasant',
    title: 'A CRUEL WINTER',
    text: 'The cold settles deep in your frail chest, as it always does. The herb-wife eyes you with pity and a price.',
    ageMin: 10,
    requires: { hasTraits: ['sickly'] },
    weight: 1.3,
    choices: [
      { label: 'Buy the strongest tonic (7g)', costGold: 7, outcome: { text: 'The tonic was vile and dear, but you saw the spring. For a sickly soul, that is a victory. The herb-wife now greets you by name across the market, which is not the compliment it sounds like.', effects: { gold: -7, health: 14, faith: 2, memory: { tag: 'the_herb_wifes_regular', weight: 2 } }, tone: 'good' } },
      { label: 'Endure it by the hearth', successChance: 0.55, success: { text: 'You wrapped in every blanket you own and outlasted the cold. Barely.', effects: { health: -4, faith: 3, householdState: { food: -2 }, memory: { tag: 'outlasted_a_cruel_winter', weight: 2 } }, tone: 'plain' }, failure: { text: 'The fever took hold and very nearly took you. You emerge in spring, hollow-eyed, with a cough that never entirely leaves.', effects: { health: -16, healthCondition: { conditionId: 'consumption', severity: 20 }, memory: { tag: 'the_winter_that_nearly_took_you', weight: 4 } }, tone: 'bad' } },
    ],
  },
  {
id: 'peasant_sweating_sickness',
category: 'peasant',
title: 'THE SWEATING SICKNESS',
text: "A real fever has reached your household. The herb-wife is frank about what she can attempt, which makes her prices less comforting and her advice more credible.",
ageMin: 10,
requires: { missingTags: ['ill', 'imprisoned'] },
choices: [
      { label: 'Pay the herb-wife at once (6g)', costGold: 6, outcome: { text: 'Her tonic is bitter but swift. The fever breaks before it can take root.', effects: { gold: -6, health: -3 }, tone: 'good' } },
      { label: 'Sweat it out and pray', successChance: 0.5, success: { text: 'You sweated through three foul nights and woke clear-eyed. Spared, this time.', effects: { health: -6, faith: 4 }, tone: 'plain' }, failure: { text: 'The fever digs in for the long haul. This sickness will not pass quickly.', effects: { health: -8, addTags: ['ill'] }, tone: 'bad' } },
    ]
},
  {
id: 'outlaw_arrest',
category: 'peasant',
title: 'THE REEVE COMES KNOCKING',
text: "The reeve’s men bring questions about your misdeeds. One has brought irons in case the answers prove inconvenient; the other has brought a receipt book.",
ageMin: 14,
weight: 1.4,
requires: { missingTags: ['imprisoned'], maxReputation: -15 },
choices: [
      { label: 'Bribe your way out (15g)', costGold: 15, outcome: { text: 'A heavy purse changes hands. The reeve discovers he was quite mistaken. Funny, that.', effects: { gold: -15, reputation: 2 }, tone: 'plain' } },
      { label: 'Make a run for it', successChance: 0.45, success: { text: 'Out the back and over three fences. Free, filthy, and faster than you look.', effects: { health: -4, path: { outlaw: 2 } }, tone: 'good' }, failure: { text: 'They caught you at the treeline and clapped you in irons.', effects: { prison: true, health: -6 }, tone: 'bad' } },
      { label: 'Surrender with dignity', outcome: { text: 'You go quietly. The dungeon door clangs shut behind you.', effects: { prison: true }, tone: 'bad' } },
    ]
},
  {
id: 'peasant_marriage_offer',
category: 'peasant',
title: 'A MATCH IS PROPOSED',
text: "A matchmaker offers an introduction to someone kind, capable and tired of being valued by the contents of a dowry chest. Consent, rather than a wedding, is the first business.",
ageMin: 16,
ageMax: 40,
once: true,
requires: { missingTags: ['married'] },
choices: [{
label: "Consent to the proposed household match",
outcome: {
text: "You marry by mutual consent and welcome a real spouse into the household. The settlement begins a life together, not a transfer of somebody’s belongings.",
effects: {
health: 4,
charm: 4,
addTags: ['married'],
addKin: { kind: 'spouse' },
memory: { tag: 'married', weight: 3 }
},
tone: 'good',
next: 'arc_marriage_2',
nextWhen: 'nextYear'
}
},
{ label: 'Hold out for nobility', requires: { statAtLeast: { charm: 50 } }, outcome: { text: 'You spurned the match, eyes fixed on a grander union. Ambitious. Possibly foolish.', effects: { charm: 2, path: { court: 2 } }, tone: 'plain' } },
{
label: "Decline the match without insulting the suitor",
outcome: {
text: "You refuse kindly and leave the other person free to choose another life. No animal is required to explain the decision.",
effects: {
kinRel: undefined,
faith: 2
},
tone: 'plain'
}
}]
},
];
