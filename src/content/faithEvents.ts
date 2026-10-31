import { GameEvent } from '@/types/game';

/** Matters of the soul — open to anyone, but they reward the devout. */
export const FAITH_EVENTS: GameEvent[] = [
  {
id: 'faith_relic_vendor',
category: 'faith',
title: 'A PEDLAR OF RELICS',
text: "A pedlar offers a supposedly angelic feather. The story is magnificent; the object is the sort a barnyard bird leaves without an audience.",
ageMin: 12,
choices: [{ label: 'Buy it faithfully (8g)', costGold: 8, outcome: { text: 'You bought the feather and prayed over it nightly. Faith asks no questions. Strangely, you feel comforted.', effects: { gold: -8, faith: 10, wits: -2, path: { church: 1 } }, tone: 'good' } },
{
label: 'Expose him as a fraud',
successChance: (s) => 0.4 + s.stats.wits / 200,
success: {
text: "You show why the feather is an ordinary bird’s feather. Your reputation improves and {{other}} loses your trust rather than vanishing from the town.",
effects: {
wits: 5,
reputation: 4,
charm: 4,
bond: {"role":"other","trust":-15,"flag":"rival"}
},
tone: 'good'
},
failure: {
text: "Your objection fails to convince the onlookers. {{other}} keeps the advantage and you keep the memory of being contradicted by people who never examined the feather.",
effects: {
faith: -4,
charm: -3,
bond: {"role":"other","trust":-8}
},
tone: 'bad'
}
},
{
label: 'Steal it for the goose',
outcome: {
text: "You take the feather for Sir Quackbeard, who does not recognise a need to have it back. {{other}} has a genuine theft to complain about.",
effects: {
kinRel: { id: 'goose', delta: 6 },
faith: -3,
path: { outlaw: 1 },
legal: {"suspicion":38,"charge":{"offence":"Taking a relic seller’s goods without payment","severity":15,"evidence":40,"victimIds":["other"],"witnessIds":["other"]}}
},
tone: 'plain'
},
requires: {custom:s=>s.world.characters.goose?.alive===true}
}],
actorRoles: { other: { minAge:18, alive:true, excludePlayer:true, missingActor:'clear_event' } }
},
  {
id: 'faith_calling',
category: 'faith',
title: 'A CALLING TO THE CLOISTER',
text: "The abbot offers you holy orders, long work and a small place in a community that will know when you are avoiding either. You are allowed time to answer.",
ageMin: 16,
paths: ['church'],
requires: { statAtLeast: { faith: 55 }, missingTags: ['ordained'] },
once: true,
choices: [{
label: "Take the vows and duties",
outcome: {
text: "You take holy orders and gain Church standing. The vows do not appoint you to a paid post; service and qualifications must still earn one.",
effects: {
faith: 20,
charm: -4,
gold: -2,
addTags: ['ordained'],
path: { church: 6 },
memory: { tag: 'ordained', weight: 4 },
faction: {"factionId":"church","playerStanding":7}
},
tone: 'good'
}
},
{
label: "Decline while offering ordinary help",
outcome: {
text: "You decline the vows and offer practical service. The abbot accepts an honest answer more readily than a beautiful promise.",
effects: {
faith: 4,
familyReputation: {"delta":2}
},
tone: 'good'
}
}]
},
  {
id: 'faith_miracle',
category: 'faith',
title: 'A VILLAGER CRIES MIRACLE',
text: "A child’s recovery is being attributed to your nearby prayer. The people praising you have forgotten the person who carried water through the night.",
ageMin: 20,
requires: { statAtLeast: { faith: 70 } },
once: true,
choices: [{
label: "Accept the attention and its donations",
outcome: {
text: "You receive donations and public standing. The prayer is remembered, together with your willingness to stand beside its collection bowl.",
effects: {
faith: 8,
gold: 12,
reputation: 14,
path: { church: 4 },
memory: { tag: 'living_saint', weight: 5 },
createSecret: {"type":"hidden_debt","severity":20}
},
tone: 'good'
}
},
{
label: "Credit the care and decline the claim",
outcome: {
text: "You insist that care deserves thanks as well as prayer. Church standing improves; you do not manufacture a new miracle to explain your humility.",
effects: {
faith: 14,
reputation: 8,
faction: {"factionId":"church","playerStanding":6}
},
tone: 'good'
}
}],
actorRoles: { other: { minAge:18, alive:true, excludePlayer:true, missingActor:'clear_event' } }
},
];
