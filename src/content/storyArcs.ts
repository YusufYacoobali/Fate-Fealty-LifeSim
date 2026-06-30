import { GameEvent } from '@/types/game';

/**
 * Multi-popup story arcs. These nodes are reached ONLY via an outcome's
 * `next` pointer (never picked at random) — hence `arcNodeOnly: true`.
 *
 *  - arc_war_*      : a short battlefield campaign reached from the levy/oath.
 *  - arc_marriage_2 : the year-after-the-wedding beat.
 */
export const STORY_ARCS: GameEvent[] = [
  // --- The campaign -------------------------------------------------------
  {
    id: 'arc_war_1',
    category: 'arc',
    arc: 'war',
    arcNodeOnly: true,
    title: 'THE EVE OF BATTLE',
    text: 'Dawn. The enemy host gathers across the muddy field. Your sergeant bellows the order to form ranks. Your hands will not stop shaking.',
    choices: [
      { label: 'Hold the line bravely', outcome: { text: 'You locked shields with the men beside you and held. The first charge breaks against your wall of spears.', effects: { path: { martial: 3 }, charm: 4, health: -8 }, tone: 'good', next: 'arc_war_2', nextWhen: 'now' } },
      { label: 'Pray for deliverance', outcome: { text: 'You prayed harder than you have ever prayed. Whether God listened, the battle will decide.', effects: { faith: 8, health: -6 }, tone: 'plain', next: 'arc_war_2', nextWhen: 'now' } },
      { label: 'Slip toward the baggage train', outcome: { text: 'You edged away from the front toward the wagons. Safer — if anyone notices, far more dangerous.', effects: { path: { outlaw: 2 }, reputation: -3, health: -2 }, tone: 'plain', next: 'arc_war_2', nextWhen: 'now' } },
    ],
  },
  {
    id: 'arc_war_2',
    category: 'arc',
    arc: 'war',
    arcNodeOnly: true,
    title: 'THE ROUT',
    text: 'The lines dissolve into screaming chaos. A mounted knight in enemy colours bears down on you, lance lowered. There is no time to think.',
    choices: [
      { label: 'Stand and brace your spear', successChance: (s) => 0.35 + s.paths.martial / 150 + s.stats.health / 300, success: { text: 'You set your spear and the charging horse impaled itself. You stand, blood-soaked and alive, a hero of the field. The lord himself learns your name.', effects: { charm: 16, health: -14, path: { martial: 5 }, rankProgress: 45, reputation: 14, removeTags: ['at_war'], memory: { tag: 'war_hero', weight: 5 } }, tone: 'good' }, failure: { text: 'The lance took you in the shoulder and the world went white. You wake days later in a surgeon’s tent, ruined but breathing.', effects: { health: -30, charm: 4, removeTags: ['at_war'], memory: { tag: 'war_wounded', weight: 4 } }, tone: 'bad' } },
      { label: 'Dive into the mud and play dead', successChance: 0.7, success: { text: 'You lay among the fallen, unmoving, until the horses thundered past. Survival has no honour, but it has a pulse.', effects: { health: -6, charm: -4, faith: -3, removeTags: ['at_war'], memory: { tag: 'war_survivor', weight: 3 } }, tone: 'plain' }, failure: { text: 'A looter found you "dead" and was most surprised when you flinched. The scuffle did not go your way.', effects: { death: 'Cut down by a battlefield looter while feigning death.' }, tone: 'bad' } },
      { label: 'Surrender and beg ransom', requires: { rankAtLeast: 2 }, outcome: { text: 'As a knight, you are worth more alive. You yield your sword and are held for ransom — humiliating, but survivable.', effects: { gold: -25, charm: -6, removeTags: ['at_war'], reputation: -4, memory: { tag: 'ransomed', weight: 3 } }, tone: 'plain' } },
    ],
  },

  // --- Marriage, one year on ---------------------------------------------
  {
    id: 'arc_marriage_2',
    category: 'arc',
    arc: 'marriage',
    arcNodeOnly: true,
    title: 'A YEAR OF MARRIED LIFE',
    text: 'A year wed. The first flush has settled into something steadier. Your spouse asks, gently, what you both should build toward.',
    choices: [
      { label: 'A houseful of children', outcome: { text: 'You agree to fill the cottage with noise and turnip-stained little hands. Terrifying. Wonderful.', effects: { faith: 4, health: -2, addTags: ['wants_children'], memory: { tag: 'chose_family', weight: 2 } }, tone: 'good' } },
      { label: 'Saving toward a better life', outcome: { text: 'You both resolve to scrimp and climb. Every coin saved is a brick in a grander future.', effects: { gold: 6, wits: 3, path: { labour: 2 } }, tone: 'good' } },
      { label: 'Admit you are restless', outcome: { text: 'You confess a wandering heart. The conversation is hard, and honest, and leaves a small crack that may yet widen.', effects: { charm: -2, wits: 2, memory: { tag: 'restless_marriage', weight: 2 } }, tone: 'plain' } },
    ],
  },
];
