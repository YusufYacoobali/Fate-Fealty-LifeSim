import { GameEvent } from '@/types/game';

/** The martial road — squires and knights, glory and gore. */
export const KNIGHT_EVENTS: GameEvent[] = [
  {
    id: 'knight_vigil',
    category: 'knight',
    title: 'THE NIGHT VIGIL',
    text: 'To be dubbed a knight you must keep an overnight vigil in the cold chapel, armour on, praying till dawn.',
    ageMin: 15,
    ranks: ['Squire'],
    paths: ['martial'],
    once: true,
    choices: [
      { label: 'Endure the full vigil', successChance: (s) => 0.5 + s.stats.faith / 250, success: { text: 'You knelt unmoving till dawn, half-frozen and wholly resolved. The bishop is impressed.', effects: { faith: 8, health: -6, path: { martial: 3 }, rankProgress: 40, memory: { tag: 'kept_vigil', weight: 3 } }, tone: 'good' }, failure: { text: 'You nodded off and clattered to the floor at midnight. Mortifying, but you finished anyway.', effects: { faith: 3, health: -8, charm: -3 }, tone: 'bad' } },
      { label: 'Sneak a flask of wine for warmth', outcome: { text: 'The wine kept you warm and the vigil bearable. The bishop suspects nothing. The goose would be proud.', effects: { health: -2, faith: -4, path: { martial: 1 }, rankProgress: 25 }, tone: 'plain' } },
    ],
  },
  {
id: 'knight_duel',
actorRoles:{other:{characterId:'roderick',alive:true,excludePlayer:true,minAge:18,missingActor:'clear_event'}},
category: 'knight',
title: 'A CHALLENGE OF HONOUR',
text: "Sir Roderick produces a glove for a challenge of honour. The careful preparation suggests he has been finding the original quarrel insufficiently productive.",
ageMin: 17,
ranks: ['Squire', 'Knight'],
requires: {custom:s=>!!s.world.characters.roderick?.alive&&(s.kin.find(k=>k.id==='roderick')?.rel??100)<40},
weight: 2,
choices: [{
label: "Accept the duel (risk a serious cut)",
successChance: (s) => 0.35 + s.stats.health / 300 + s.paths.martial / 200,
success: {
text: "You disarm Roderick and stop with the weapon at his throat. He remains alive, humiliated and much less likely to call the next quarrel accidental.",
effects: { charm: 14, health: -10, path: { martial: 4 }, rankProgress: 20, reputation: 10, kinRel: { id: 'roderick', delta: -20 }, memory: { tag: 'beat_roderick', weight: 4 } },
tone: 'good'
},
failure: {
text: "Roderick cuts you badly. The injury is real; your refusal to pretend it was a victory earns a small measure of respect.",
effects: {
health: -22,
charm: 4,
reputation: 2,
healthCondition: {"conditionId":"deep_cut","severity":30}
},
tone: 'bad'
}
},
{ label: 'Refuse. It is beneath you', outcome: { text: 'You called the challenge childish and walked away. Some respect the restraint. Roderick crows victory.', effects: { charm: -6, reputation: -4, kinRel: { id: 'roderick', delta: -5 } }, tone: 'bad' } },
{ label: 'Propose a contest of wits instead', requires: { statAtLeast: { wits: 55 } }, outcome: { text: 'You out-argued him so thoroughly the crowd laughed Roderick out of the square. A bloodless rout.', effects: { wits: 4, charm: 8, reputation: 6, kinRel: { id: 'roderick', delta: -12 } }, tone: 'good' } }]
},
  {
id: 'knight_oath',
category: 'knight',
title: 'THE LORD’S SUMMONS',
text: "Your liege calls a muster over a disputed river crossing. The written claim is dry; the crossing, you are warned, will not be.",
ageMin: 18,
ranks: ['Knight', 'Noble'],
choices: [
      { label: 'Ride to war for your liege', outcome: { text: 'You don your armour and ride out. The road to glory is muddy and smells of fear.', effects: { addTags: ['at_war'], path: { martial: 3 }, faith: 2 }, tone: 'plain', next: 'arc_war_2', nextWhen: 'now' } },
      { label: 'Send coin in your stead (20g)', costGold: 20, outcome: { text: 'You paid scutage to avoid the muster. Pragmatic, if not glorious. Some call it cowardice.', effects: { gold: -20, reputation: -5, charm: -3 }, tone: 'plain' } },
    ]
},
];
