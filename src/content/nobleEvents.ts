import { GameEvent } from '@/types/game';

/** The rarefied air of nobility — power, plots, and the long fall. */
export const NOBLE_EVENTS: GameEvent[] = [
  {
id: 'noble_petition',
category: 'noble',
title: 'THE PEASANTS’ PETITION',
text: "Tenants bring a petition against a levy assessed on roofs, including two roofs that fell in last winter. Your steward calls the assessment consistent.",
ageMin: 20,
ranks: ['Noble'],
choices: [{
label: "Fund relief from the harsh assessment",
outcome: {
text: "You pay for relief and improve loyalty. Your household gives up coin and stores; the tenants receive an answer they can survive.",
effects: {
gold: -10,
faith: 6,
reputation: 12,
holding: { stores: -5, loyalty: 12 },
path: { court: 1 },
memory: { tag: 'good_lord', weight: 3 },
worldConditions: {"foodSecurity":4}
},
tone: 'good'
}
},
{
label: "Enforce the assessment without relief",
outcome: {
text: "Your coffers grow as household loyalty and stores fall. The cruelty is recorded in your reputation rather than blamed on a parent who may not be alive.",
effects: {
gold: 18,
reputation: -12,
holding: { stores: -4, loyalty: -15 },
kinRel: undefined,
memory: { tag: 'cruel_lord', weight: 3 },
householdState: {"food":-8}
},
tone: 'bad'
}
},
{
label: "Offer a smaller assessment and clear terms",
outcome: {
text: "You take a smaller return and improve loyalty. People can plan around an amount that no longer changes with the steward’s mood.",
effects: {
gold: 6,
reputation: 4,
wits: 2,
holding: { loyalty: 4 },
householdState: {"status":3}
},
tone: 'good'
}
}]
},
  {
id: 'noble_conspiracy',
category: 'noble',
title: 'A WHISPER OF TREASON',
text: "Plotters invite you to lend your name and evidence against a powerful baron. They promise to share the reward and are less exact about whose neck secures the attempt.",
ageMin: 22,
ranks: ['Noble'],
once: true,
paths: ['court'],
choices: [{ label: 'Join the conspiracy', successChance: (s) => 0.4 + s.stats.wits / 250 + s.reputation / 400, success: { text: 'Your evidence reaches the council and the plotters pay you fifty gold. The baron faces an inquiry; no new title has yet been granted.', effects: { gold: 50, charm: 8, reputation: 15, path: { court: 6 }, memory: { tag: 'kingmaker', weight: 5 } }, tone: 'good' }, failure: { text: 'The plot was betrayed. Guards drag you to the block at dawn.', effects: { death: 'Beheaded for treason. The crowd, as ever, brought pies.' }, tone: 'bad' } },
{ label: 'Betray the plotters to the baron', outcome: { text: 'You sold them out. The baron rewards your "loyalty" handsomely, though you sleep with one eye open now.', effects: { gold: 40, reputation: -8, faith: -10, memory: { tag: 'betrayer', weight: 4 } }, tone: 'plain' } },
{
label: "Refuse without inventing a later victory",
outcome: {
text: "You keep your name off the conspiracy. What the plotters do next is theirs; your legal record does not acquire their plan.",
effects: {
wits: 4,
faith: 3
},
tone: 'good'
}
}],
actorRoles: { other: { minAge:18, alive:true, excludePlayer:true, missingActor:'clear_event' } }
},
  {
id: 'noble_legacy',
category: 'noble',
title: 'BUILDING A LEGACY',
text: "A mason offers a public dedication worthy of your wealth. The relief wardens ask whether the money might also do something for people who cannot read the inscription.",
ageMin: 30,
ranks: ['Noble'],
requires: { minGold: 50 },
once: true,
choices: [{
label: "Fund chapel relief and a public dedication (40g)",
costGold: 40,
outcome: {
text: "You endow relief associated with the chapel. Food security and Church standing improve; the dedication does not pretend a new building rose in an afternoon.",
effects: {
gold: -40,
faith: 18,
reputation: 15,
memory: { tag: 'founder', weight: 5 },
worldConditions: {"foodSecurity":5},
faction: {"factionId":"church","playerStanding":8}
},
tone: 'good'
}
},
{
label: "Fund care for the sick and poor (40g)",
costGold: 40,
outcome: {
text: "You pay for practical relief and improve public health conditions. The people doing the work receive supplies rather than an expensive drawing of a hospital.",
effects: {
gold: -40,
faith: 12,
reputation: 20,
health: 4,
memory: { tag: 'founder', weight: 5 },
worldConditions: {"diseasePressure":-7,"foodSecurity":4},
householdState: {"status":6}
},
tone: 'good'
}
},
{
label: "Keep the reserve for your household",
outcome: {
text: "You retain the money and improve the household’s food reserve by careful planning. There will be no inscription recording the choice.",
effects: {
wits: 2,
faith: -4,
householdState: {"food":4}
},
tone: 'plain'
}
}]
},
];
