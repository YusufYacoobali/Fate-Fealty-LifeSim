import { GameEvent } from '@/types/game';

/** Matters of the soul — open to anyone, but they reward the devout. */
export const FAITH_EVENTS: GameEvent[] = [
  {
    id: 'faith_relic_vendor',
    category: 'faith',
    title: 'A PEDLAR OF RELICS',
    text: 'A pedlar offers "a genuine feather from the Archangel Gabriel" for 8 gold. It is, unmistakably, a goose feather.',
    ageMin: 12,
    choices: [
      { label: 'Buy it faithfully (8g)', costGold: 8, outcome: { text: 'You bought the feather and prayed over it nightly. Faith asks no questions. Strangely, you feel comforted.', effects: { gold: -8, faith: 10, wits: -2, path: { church: 1 } }, tone: 'good' } },
      { label: 'Expose him as a fraud', successChance: (s) => 0.4 + s.stats.wits / 200, success: { text: 'You proved the feather was Sir Quackbeard’s own. The crowd ran the pedlar out of town.', effects: { wits: 5, reputation: 4, charm: 4 }, tone: 'good' }, failure: { text: 'The crowd sided with the pedlar and called YOU the blasphemer. Awkward.', effects: { faith: -4, charm: -3 }, tone: 'bad' } },
      { label: 'Steal it for the goose', outcome: { text: 'You returned the "holy feather" to its rightful owner. Sir Quackbeard accepted it with regal indifference.', effects: { kinRel: { id: 'goose', delta: 6 }, faith: -3, path: { outlaw: 1 } }, tone: 'plain' } },
    ],
  },
  {
    id: 'faith_calling',
    category: 'faith',
    title: 'A CALLING TO THE CLOISTER',
    text: 'The abbot, noting your devotion, asks if you would take holy orders and join the monastery.',
    ageMin: 16,
    paths: ['church'],
    requires: { statAtLeast: { faith: 55 }, missingTags: ['ordained'] },
    once: true,
    choices: [
      { label: 'Take holy orders', outcome: { text: 'You took your vows. The world grows quieter, the prayers longer, the soul — they promise — lighter.', effects: { faith: 20, charm: -4, gold: -2, addTags: ['ordained'], path: { church: 6 }, memory: { tag: 'ordained', weight: 4 } }, tone: 'good' } },
      { label: 'Decline — the world calls louder', outcome: { text: 'You thanked the abbot but kept your feet on the muddy road of the world. He blessed you anyway.', effects: { faith: 4 }, tone: 'good' } },
    ],
  },
  {
    id: 'faith_miracle',
    category: 'faith',
    title: 'A VILLAGER CRIES MIRACLE',
    text: 'A sick child recovers after you happen to pray nearby. The villagers fall to their knees, calling YOU blessed.',
    ageMin: 20,
    requires: { statAtLeast: { faith: 70 } },
    once: true,
    choices: [
      { label: 'Accept the role of holy figure', outcome: { text: 'You let them believe. Pilgrims now seek your blessing — and leave coin in gratitude.', effects: { faith: 8, gold: 12, reputation: 14, path: { church: 4 }, memory: { tag: 'living_saint', weight: 5 } }, tone: 'good' } },
      { label: 'Insist it was God’s work, not yours', outcome: { text: 'Your humility only convinces them further of your holiness. There is no escaping sainthood now.', effects: { faith: 14, reputation: 8 }, tone: 'good' } },
    ],
  },
];
