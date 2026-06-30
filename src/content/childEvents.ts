import { GameEvent } from '@/types/game';
import { C } from '@/theme/theme';

/** Early-life events (roughly ages 4-12). They set early stat & path leanings. */
export const CHILD_EVENTS: GameEvent[] = [
  {
    id: 'child_first_lesson',
    category: 'child',
    title: 'THE WANDERING MONK',
    text: 'A travelling monk offers to teach the village children their letters. Your mother nudges you forward.',
    ageMin: 5,
    ageMax: 11,
    once: true,
    choices: [
      { label: 'Sit and learn diligently', outcome: { text: 'You learned your letters and the smell of old parchment. Knowledge!', effects: { wits: 8, path: { church: 1 }, memory: { tag: 'lettered', weight: 2 } }, tone: 'good' } },
      { label: 'Sneak off to play with the goose', outcome: { text: 'You and Sir Quackbeard had a glorious afternoon. Letters can wait forever, you decided.', effects: { health: 3, kinRel: { id: 'goose', delta: 6 }, charm: 2 }, tone: 'good' } },
      { label: 'Put a frog in the monk’s hood', outcome: { text: 'The monk shrieked. The village laughed. You are a legend among the under-tens.', effects: { charm: 5, faith: -4, path: { outlaw: 1 } }, tone: 'plain' } },
    ],
  },
  {
    id: 'child_chores',
    category: 'child',
    title: 'A MOUNTAIN OF TURNIPS',
    text: 'Old Cedric points at the fields. "Work builds character," he grunts. The turnips are endless.',
    ageMin: 6,
    ageMax: 12,
    choices: [
      { label: 'Work hard to please Father', outcome: { text: 'You toiled until dusk. Cedric grunted approvingly — the highest praise he gives.', effects: { health: -3, path: { labour: 2 }, kinRel: { id: 'father', delta: 8 } }, tone: 'good' } },
      { label: 'Do half, then nap in the hay', outcome: { text: 'You did just enough and napped magnificently. Refreshed, if unproductive.', effects: { health: 4, kinRel: { id: 'father', delta: -4 } }, tone: 'plain' } },
    ],
  },
  {
    id: 'child_bully',
    category: 'child',
    title: 'THE MILLER’S BIG SON',
    text: 'The miller’s enormous son blocks the lane and demands your lunch — a single, beloved turnip.',
    ageMin: 6,
    ageMax: 12,
    choices: [
      { label: 'Stand your ground', successChance: (s) => 0.3 + s.stats.health / 250, success: { text: 'You stood firm and he backed down! Word spreads that you are not to be trifled with.', effects: { charm: 6, path: { martial: 2 }, reputation: 3 }, tone: 'good' }, failure: { text: 'He sat on you. You lost the turnip and some dignity, but gained a grudge.', effects: { health: -5, charm: -2, memory: { tag: 'humiliated', weight: 1 } }, tone: 'bad' } },
      { label: 'Hand over the turnip', outcome: { text: 'You surrendered the turnip. Peace, but a hollow, turnipless peace.', effects: { charm: -2 }, tone: 'plain' } },
      { label: 'Set the goose on him', outcome: { text: 'Sir Quackbeard descended like a feathered demon. The miller’s son fled screaming. Glorious.', effects: { charm: 4, kinRel: { id: 'goose', delta: 5 } }, tone: 'good' } },
    ],
  },
];
