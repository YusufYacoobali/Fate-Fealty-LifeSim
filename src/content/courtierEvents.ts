import { GameEvent } from '@/types/game';

/** Court intrigue — charm, scheming, and the slippery climb toward nobility. */
export const COURTIER_EVENTS: GameEvent[] = [
  {
    id: 'court_invitation',
    category: 'court',
    title: 'AN INVITATION TO THE HALL',
    text: 'Word of your wit has reached the lord’s steward. You are invited to dine at the high table — a rare honour for one of your station.',
    ageMin: 14,
    paths: ['court'],
    requires: { statAtLeast: { charm: 45 } },
    weight: 2,
    choices: [
      { label: 'Charm the whole table', successChance: (s) => 0.4 + s.stats.charm / 200, success: { text: 'You had them roaring with laughter. The lord himself toasted you. Doors are opening.', effects: { charm: 6, path: { court: 4 }, rankProgress: 16, reputation: 6, memory: { tag: 'courtly_favour', weight: 2 } }, tone: 'good' }, failure: { text: 'You used the wrong spoon, then the wrong fork, then insulted a baroness. A long carriage ride home.', effects: { charm: -5, reputation: -4 }, tone: 'bad' } },
      { label: 'Quietly observe and learn', outcome: { text: 'You said little and watched much. You now know who hates whom, and that is power.', effects: { wits: 6, path: { court: 2 } }, tone: 'good' } },
    ],
  },
  {
    id: 'court_rivalry',
    category: 'court',
    title: 'A RIVAL AT COURT',
    text: 'A silken-tongued rival is spreading whispers that you are "merely a jumped-up turnip-picker." The whispers are gaining traction.',
    ageMin: 16,
    paths: ['court'],
    requires: { minReputation: 0 },
    choices: [
      { label: 'Outwit them with a clever scheme', successChance: (s) => 0.35 + s.stats.wits / 200, success: { text: 'You laid a trap of gossip and watched your rival walk into it. They are disgraced; you are admired.', effects: { wits: 5, path: { court: 4 }, reputation: 8, memory: { tag: 'won_intrigue', weight: 2 } }, tone: 'good' }, failure: { text: 'Your scheme unravelled publicly. Now BOTH of you look petty, but only you look foolish.', effects: { charm: -4, reputation: -6 }, tone: 'bad' } },
      { label: 'Buy their silence (12g)', costGold: 12, outcome: { text: 'Coin, the universal solvent. The whispers stop. For now.', effects: { gold: -12, reputation: 2 }, tone: 'plain' } },
      { label: 'Challenge them publicly', outcome: { text: 'You denounced them at dinner. Bold! Half the court respects you; the other half is now afraid of you.', effects: { charm: 3, reputation: -2, path: { court: 2 } }, tone: 'plain' } },
    ],
  },
  {
    id: 'court_proposal',
    category: 'court',
    title: 'A NOBLE PROPOSAL',
    text: 'A widowed minor noble, charmed by your ascent, proposes marriage. It would vault you into the gentry overnight.',
    ageMin: 18,
    paths: ['court'],
    once: true,
    requires: { rankAtLeast: 1, missingTags: ['married'], statAtLeast: { charm: 55 } },
    choices: [
      { label: 'Accept the union', outcome: { text: 'You wed into the gentry. The turnip fields feel very far away now.', effects: { gold: 25, charm: 6, rankProgress: 50, addTags: ['married', 'married_noble'], addKin: { kind: 'spouse', role: 'Noble Spouse', emoji: '🤵', trait: 'Well-bred', rel: 60 }, path: { court: 5 }, memory: { tag: 'married_up', weight: 4 } }, tone: 'good' } },
      { label: 'Decline gracefully', outcome: { text: 'You declined with such grace that they admired you more for it. Curious tactic.', effects: { charm: 4, reputation: 4 }, tone: 'good' } },
    ],
  },
];
