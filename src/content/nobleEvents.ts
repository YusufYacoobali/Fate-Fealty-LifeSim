import { GameEvent } from '@/types/game';

/** The rarefied air of nobility — power, plots, and the long fall. */
export const NOBLE_EVENTS: GameEvent[] = [
  {
    id: 'noble_petition',
    category: 'noble',
    title: 'THE PEASANTS’ PETITION',
    text: 'The villagers of your old home — Swineford — come to you, their newly-noble kin, begging relief from a cruel tax.',
    ageMin: 20,
    ranks: ['Noble'],
    choices: [
      { label: 'Forgive their taxes', outcome: { text: 'You waved the tax away. The village weeps with gratitude; your peers mutter about "soft sentiment".', effects: { gold: -10, faith: 6, reputation: 12, path: { court: 1 }, memory: { tag: 'good_lord', weight: 3 } }, tone: 'good' } },
      { label: 'Collect every coin', outcome: { text: 'Coin is coin. The village goes hungry and your coffers swell. Old Maud will not look at you.', effects: { gold: 18, reputation: -12, kinRel: { id: 'mother', delta: -25 }, memory: { tag: 'cruel_lord', weight: 3 } }, tone: 'bad' } },
      { label: 'Halve it, and look generous', outcome: { text: 'A middle path. You keep some coin and most of your good name. Very politic.', effects: { gold: 6, reputation: 4, wits: 2 }, tone: 'good' } },
    ],
  },
  {
    id: 'noble_conspiracy',
    category: 'noble',
    title: 'A WHISPER OF TREASON',
    text: 'A faction of nobles invites you into a plot against the cruel local baron. The reward is power; the price, should it fail, is your head.',
    ageMin: 22,
    ranks: ['Noble'],
    once: true,
    paths: ['court'],
    choices: [
      { label: 'Join the conspiracy', successChance: (s) => 0.4 + s.stats.wits / 250 + s.reputation / 400, success: { text: 'The plot succeeded! The baron is deposed and you stand among the victors. Lands and titles follow.', effects: { gold: 50, charm: 8, reputation: 15, path: { court: 6 }, memory: { tag: 'kingmaker', weight: 5 } }, tone: 'good' }, failure: { text: 'The plot was betrayed. Guards drag you to the block at dawn.', effects: { death: 'Beheaded for treason. The crowd, as ever, brought pies.' }, tone: 'bad' } },
      { label: 'Betray the plotters to the baron', outcome: { text: 'You sold them out. The baron rewards your "loyalty" handsomely, though you sleep with one eye open now.', effects: { gold: 40, reputation: -8, faith: -10, memory: { tag: 'betrayer', weight: 4 } }, tone: 'plain' } },
      { label: 'Refuse and stay clear', outcome: { text: 'You want no part of it. Wise — the plot collapses messily a year later, and you are untouched.', effects: { wits: 4, faith: 3 }, tone: 'good' } },
    ],
  },
  {
    id: 'noble_legacy',
    category: 'noble',
    title: 'BUILDING A LEGACY',
    text: 'You have wealth enough to leave a lasting mark. The mason awaits your commission.',
    ageMin: 30,
    ranks: ['Noble'],
    requires: { minGold: 50 },
    once: true,
    choices: [
      { label: 'Endow a grand chapel (40g)', costGold: 40, outcome: { text: 'A soaring chapel rises in your name. Your soul, and your reputation, are secured for the ages.', effects: { gold: -40, faith: 18, reputation: 15, memory: { tag: 'founder', weight: 5 } }, tone: 'good' } },
      { label: 'Build a hospital for the poor (40g)', costGold: 40, outcome: { text: 'The sick and starving will bless your name for generations. A rare and noble thing.', effects: { gold: -40, faith: 12, reputation: 20, health: 4, memory: { tag: 'founder', weight: 5 } }, tone: 'good' } },
      { label: 'Hoard it all in a great chest', outcome: { text: 'You sit upon your gold like a dragon. It is comforting, in a lonely sort of way.', effects: { wits: 2, faith: -4 }, tone: 'plain' } },
    ],
  },
];
