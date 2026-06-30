import { GameEvent } from '@/types/game';

/**
 * Family & kin events. The marriage arc continuation (arc_marriage_2) lives in
 * storyArcs; these are the standalone family beats.
 */
export const FAMILY_EVENTS: GameEvent[] = [
  {
    id: 'family_mother_ill',
    category: 'family',
    title: 'MAUD TAKES ILL',
    text: 'Your mother Maud has caught a wasting fever. The herb-wife says the cure is dear, but possible.',
    ageMin: 16,
    requires: { custom: (s) => !!s.kin.find((k) => k.id === 'mother' && k.alive) },
    once: true,
    choices: [
      { label: 'Spend all you can on her cure (15g)', costGold: 15, successChance: 0.7, success: { text: 'The cure worked. Maud recovers, scolds you for spending so much, and bakes you a fortifying loaf.', effects: { gold: -15, faith: 6, kinRel: { id: 'mother', delta: 25 }, memory: { tag: 'devoted_child', weight: 3 } }, tone: 'good' }, failure: { text: 'You spared no expense, but the fever took her anyway. You hold her hand at the end.', effects: { gold: -15, health: -6, faith: 4, killKin: 'mother', memory: { tag: 'mother_died', weight: 4 } }, tone: 'bad' } },
      { label: 'Pray and hope (free)', successChance: 0.4, success: { text: 'Whether by prayer or luck, the fever broke. Maud lives, and credits the Almighty entirely.', effects: { faith: 8, kinRel: { id: 'mother', delta: 8 } }, tone: 'good' }, failure: { text: 'Prayer was not enough. Maud passed in the night. The cottage feels impossibly empty.', effects: { faith: -4, health: -4, killKin: 'mother', memory: { tag: 'mother_died', weight: 4 } }, tone: 'bad' } },
    ],
  },
  {
    id: 'family_newborn',
    category: 'family',
    title: 'A CHILD IS BORN',
    text: 'Your spouse brings happy news: an heir! A small, loud, turnip-shaped heir.',
    ageMin: 18,
    ageMax: 45,
    requires: { hasTags: ['married'] },
    weight: 2,
    choices: [
      { label: 'Welcome the child with joy', outcome: { text: 'A healthy babe joins your household — your line continues. You weep, then panic about feeding it.', effects: { health: 2, charm: 2, faith: 4, addTags: ['has_heir'], addKin: { kind: 'child', isHeir: true, role: 'Thine Heir' }, memory: { tag: 'became_parent', weight: 3 } }, tone: 'good' } },
    ],
  },
  {
    id: 'family_roderick_truce',
    category: 'family',
    title: 'AN OLD FOE, HUMBLED',
    text: 'Sir Roderick — diminished, greyer, his lands lost — appears at your door. "I... was wrong about you," he mutters. "About the apple. About all of it."',
    ageMin: 30,
    requires: { custom: (s) => (s.kin.find((k) => k.id === 'roderick')?.rel ?? 0) >= 30 },
    once: true,
    choices: [
      { label: 'Forgive him at last', outcome: { text: 'You clasp his hand. Decades of grudge dissolve in a moment. He weeps; so, secretly, do you.', effects: { faith: 8, charm: 4, kinRel: { id: 'roderick', delta: 30 }, memory: { tag: 'reconciled', weight: 3 } }, tone: 'good' } },
      { label: 'Hand him a single apple, and shut the door', outcome: { text: 'You give him one apple. "Now we are even," you say. The door closes. Petty? Perhaps. Satisfying? Immensely.', effects: { charm: 2, wits: 2, memory: { tag: 'the_apple_returned', weight: 2 } }, tone: 'plain' } },
    ],
  },
];
