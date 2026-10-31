import { GameEvent } from '@/types/game';

/**
 * Family & kin events. The marriage arc continuation (arc_marriage_2) lives in
 * storyArcs; these are the standalone family beats.
 */
export const FAMILY_EVENTS: GameEvent[] = [
  {
id: 'family_mother_ill',
category: 'family',
title: "A MOTHER TAKES ILL",
text: "{{mother}} is seriously ill. The herb-wife offers a costly treatment without a promise. Your mother objects to the expense before allowing herself to ask whether it might work.",
ageMin: 16,
requires: {custom:s=>(s.world.characters[s.playerCharacterId].parentIds??[]).some(id=>s.world.characters[id]?.alive&&s.world.characters[id].gender==='woman')},
once: true,
choices: [{
label: "Fund the uncertain treatment (15g; she may die)",
costGold: 15,
successChance: 0.7,
success: {
text: "The treatment succeeds. {{mother}} recovers enough to complain about the fee, a sound you had been afraid of never hearing again.",
effects: {
gold: -15,
faith: 6,
kinRel: { id: 'mother', delta: 25 },
memory: { tag: 'devoted_child', weight: 3 },
removeHealthCondition: {"conditionId":"lung_fever","targetId":"mother"}
},
tone: 'good'
},
failure: {
text: "The treatment cannot save {{mother}}. You stay beside the bed and hold a hand no amount of spending can keep warm.",
effects: {
gold: -15,
health: -6,
faith: 4,
killKin: "mother",
memory: { tag: 'mother_died', weight: 4 }
},
tone: 'bad'
}
},
{
label: "Offer care and prayer without the treatment (she may die)",
successChance: 0.4,
success: {
text: "The fever breaks. {{mother}} credits your company before discussing anybody’s theology.",
effects: {
faith: 8,
kinRel: { id: 'mother', delta: 8 },
removeHealthCondition: {"conditionId":"lung_fever","targetId":"mother"}
},
tone: 'good'
},
failure: {
text: "{{mother}} dies despite the care you can give. You do not mistake being unable to pay for having been unwilling to love.",
effects: {
faith: -4,
health: -4,
killKin: "mother",
memory: { tag: 'mother_died', weight: 4 }
},
tone: 'bad'
}
}],
actorRoles: { mother: { relation:'parent', gender:'woman', minAge:18, alive:true, excludePlayer:true, missingActor:'clear_event' } },
stakes: "major"
},
  {
id: 'family_newborn',
category: 'family',
title: 'A CHILD IS BORN',
text: "A child has arrived in your household. The smallest person in the room has reorganised every task without speaking a comprehensible word.",
ageMin: 18,
ageMax: 45,
requires: {hasTags:['married'],custom:s=>!!s.world.characters[s.world.characters[s.playerCharacterId].spouseId??'']?.alive},
weight: 2,
choices: [
      { label: 'Welcome the child with joy', outcome: { text: 'A healthy babe joins your household and your line continues. You weep, then panic about feeding it.', effects: { health: 2, charm: 2, faith: 4, addTags: ['has_heir'], addKin: { kind: 'child', isHeir: true, role: 'Thine Heir' }, memory: { tag: 'became_parent', weight: 3 } }, tone: 'good' } },
      { label: 'Welcome the child quietly', outcome: { text: 'You keep the first days close to the household, making promises before making announcements.', effects: { faith: 2, addTags: ['has_heir'], addKin: { kind: 'child', isHeir: true, role: 'Thine Heir' }, memory: { tag: 'private_welcome', weight: 3 } }, tone: 'plain' } },
    ]
},
  {
    id: 'family_roderick_truce',
    actorRoles: { other: { characterId:'roderick', alive:true, excludePlayer:true, missingActor:'clear_event' } },
    category: 'family',
    title: 'AN OLD FOE, HUMBLED',
    text: 'Sir Roderick appears at your door, greyer and smaller and short of a manor. "I... was wrong about you," he mutters. "About the apple. About all of it."',
    ageMin: 30,
    requires: { custom: (s) => (s.kin.find((k) => k.id === 'roderick')?.rel ?? 0) >= 30 },
    once: true,
    choices: [
      { label: 'Forgive him at last', outcome: { text: 'You clasp his hand. Decades of grudge dissolve in a moment. He weeps; so, secretly, do you.', effects: { faith: 8, charm: 4, kinRel: { id: 'roderick', delta: 30 }, bond: { role:'other', clearRivalry:true, flag:'friend' }, memory: { tag: 'reconciled', weight: 3 } }, tone: 'good' } },
      { label: 'Hand him a single apple, and shut the door', outcome: { text: 'You give him one apple. "Now we are even," you say. The door closes. Petty? Perhaps. Satisfying? Immensely.', effects: { charm: 2, wits: 2, memory: { tag: 'the_apple_returned', weight: 2 } }, tone: 'plain' } },
    ],
  },
];
