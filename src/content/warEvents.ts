import { GameEvent } from '@/types/game';

/** Standalone war beats (the multi-popup campaign lives in storyArcs). */
export const WAR_EVENTS: GameEvent[] = [
  {
    id: 'war_levy',
    category: 'war',
    title: 'THE LEVY IS CALLED',
    text: 'War drums sound. Every able body is pressed into the militia — peasant and pauper alike. A rusty spear is shoved into your hands.',
    ageMin: 16,
    ranks: ['Peasant', 'Squire'],
    requires: { missingTags: ['at_war'] },
    weight: 1.2,
    choices: [
      { label: 'March with the levy', outcome: { text: 'You march off to war, one frightened spearman among hundreds. The mud is the only certainty.', effects: { addTags: ['at_war'], path: { martial: 2 }, health: -4 }, tone: 'plain', next: 'arc_war_1', nextWhen: 'now' } },
      { label: 'Hide in the turnip cellar', successChance: 0.6, success: { text: 'You hid among the turnips until the sergeants gave up looking. Coward? Survivor? Both.', effects: { charm: -3, faith: -2, memory: { tag: 'dodged_levy', weight: 2 } }, tone: 'plain' }, failure: { text: 'They found you cowering and dragged you out by the ankle. Now you march AND everyone knows.', effects: { addTags: ['at_war'], charm: -6, reputation: -4 }, tone: 'bad' } },
      { label: 'Pay the fine to stay (8g)', costGold: 8, outcome: { text: 'A few coins to the sergeant and you keep your skin and your turnips. Money well spent.', effects: { gold: -8 }, tone: 'plain' } },
    ],
  },
];
