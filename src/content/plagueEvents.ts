import { GameEvent } from '@/types/game';

/** The Black Death looms over the 14th century. These can be lethal. */
export const PLAGUE_EVENTS: GameEvent[] = [
  {
    id: 'plague_arrives',
    category: 'plague',
    title: 'THE PESTILENCE COMES',
    text: 'A traveller collapses in the square, black-fingered and raving. By nightfall, three more are sick. The great Pestilence has reached Swineford.',
    ageMin: 14,
    once: true,
    weight: 1.5,
    requires: { custom: (s) => s.bornYear + s.age >= 1347 },
    choices: [
      { label: 'Flee to the hills at once', successChance: 0.75, success: { text: 'You fled to the high pastures and waited it out. Lonely, hungry — but breathing.', effects: { health: -6, gold: -4, faith: 2, addTags: ['plague_survivor'], memory: { tag: 'survived_plague', weight: 4 } }, tone: 'good' }, failure: { text: 'You fled, but carried the sickness with you. The fever finds you on the road.', effects: { death: 'Taken by the Pestilence on a lonely hill road.' }, tone: 'bad' } },
      { label: 'Stay and tend the sick', successChance: (s) => 0.4 + s.stats.faith / 300, success: { text: 'You nursed the dying with rags and prayers and somehow did not fall ill. The village calls you blessed.', effects: { health: -10, faith: 16, reputation: 18, path: { church: 4 }, addTags: ['plague_survivor'], memory: { tag: 'plague_saint', weight: 5 } }, tone: 'good' }, failure: { text: 'You tended the sick, and the sickness took you in turn. A merciful death, the priest says. He is lying.', effects: { death: 'Died of the Pestilence, tending those who could not be saved.' }, tone: 'bad' } },
      { label: 'Barricade yourself indoors', successChance: 0.6, success: { text: 'You sealed the door and rationed turnips for a grim season. The Pestilence passed you by.', effects: { health: -8, charm: -4, addTags: ['plague_survivor'], memory: { tag: 'survived_plague', weight: 4 } }, tone: 'plain' }, failure: { text: 'It came through the rats, through the very walls. There was no barricade against it.', effects: { death: 'Died of the Pestilence, alone behind a barred door.' }, tone: 'bad' } },
    ],
  },
  {
    id: 'plague_aftermath',
    category: 'plague',
    title: 'A WORLD MADE EMPTY',
    text: 'The Pestilence has passed. Half the village lies in fresh graves. But the survivors — you among them — find their labour is suddenly worth far more.',
    ageMin: 15,
    requires: { hasTags: ['plague_survivor'] },
    once: true,
    choices: [
      { label: 'Demand higher wages for your work', outcome: { text: 'With so few hands left, you name your price — and the lord must pay it. The old order is cracking.', effects: { gold: 20, charm: 4, path: { labour: 3 }, reputation: 3, memory: { tag: 'rose_after_plague', weight: 3 } }, tone: 'good' } },
      { label: 'Claim an abandoned cottage', outcome: { text: 'You move into a fine empty cottage, its owners gone to God. Grim fortune, but fortune nonetheless.', effects: { health: 6, charm: 4, memory: { tag: 'inherited_emptiness', weight: 2 } }, tone: 'plain' } },
      { label: 'Mourn, and rebuild quietly', outcome: { text: 'You bury your dead, plant the spring turnips, and carry on. Someone must.', effects: { faith: 8, health: 2, kinRel: { id: 'goose', delta: 5 } }, tone: 'good' } },
    ],
  },
];
