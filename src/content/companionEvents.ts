import { GameEvent } from '@/types/game';

/**
 * Companion events — the mechanics that GROW the Kin tab beyond the starting
 * household. Siblings, friends, rivals, mentors, and lieges arrive through
 * these; spouses and children arrive through marriage/family events.
 *
 * Balance rules of thumb:
 *  - every kin-adding event is gated by `kinCountAtMost` so the roster can't
 *    overflow (the goose counts as your first friend, Roderick as your first foe);
 *  - new bonds cost something (gold, health, a rival made) or demand a roll,
 *    since kin are mechanically valuable (favours lend gold, bonds buff moods);
 *  - most are `once` per life so a long life gathers a cast, not a crowd.
 */
export const COMPANION_EVENTS: GameEvent[] = [
  // --- a sibling arrives (early childhood) --------------------------------
  {
    id: 'family_sibling_born',
    category: 'family',
    title: 'A SQUALLING ARRIVAL',
    text: 'Maud sits you down with a strange smile. By harvest, you will not be the only small person in this cottage.',
    ageMin: 2,
    ageMax: 9,
    once: true,
    weight: 1.4,
    requires: {
      kinCountAtMost: { sibling: 0 },
      custom: (s) => s.kin.some((k) => k.id === 'mother' && k.alive),
    },
    choices: [
      { label: 'Rejoice — a playmate at last!', outcome: { text: 'A sibling is born! Loud, wrinkled, and immediately beloved. You vow to teach them everything about turnips.', effects: { addKin: { kind: 'sibling', rel: 70 }, kinRel: { id: 'mother', delta: 6 }, faith: 2, memory: { tag: 'sibling_born', weight: 2 } }, tone: 'good' } },
      { label: 'Sulk about sharing the porridge', outcome: { text: 'A sibling is born anyway. You sulk magnificently, but the baby grips your finger and your cold heart thaws a little.', effects: { addKin: { kind: 'sibling', rel: 45 }, charm: -2, memory: { tag: 'sibling_born', weight: 2 } }, tone: 'plain' } },
    ],
  },

  // --- a childhood friend --------------------------------------------------
  {
    id: 'child_first_friend',
    category: 'child',
    title: 'THE SMITH’S CHILD',
    text: 'The blacksmith’s child keeps loitering by your fence, kicking the same pebble and pretending not to look at you.',
    ageMin: 6,
    ageMax: 14,
    once: true,
    requires: { kinCountAtMost: { friend: 1 } },
    choices: [
      { label: 'Offer half your turnip', outcome: { text: 'You split your turnip and gained a friend for life. The finest trade you will ever make.', effects: { addKin: { kind: 'friend', role: 'Childhood Friend', trait: 'True as iron', rel: 72, age: 9 }, charm: 3, memory: { tag: 'made_friend', weight: 2 } }, tone: 'good' } },
      { label: 'Challenge them to a pebble contest', successChance: (s) => 0.45 + s.stats.charm / 200, success: { text: 'You lost the contest on purpose (mostly) and won a friend. Cunning diplomacy.', effects: { addKin: { kind: 'friend', role: 'Childhood Friend', trait: 'Competitive', rel: 62, age: 9 }, wits: 2, memory: { tag: 'made_friend', weight: 2 } }, tone: 'good' }, failure: { text: 'You won too hard and gloated too long. They stomped off. The pebble remains your only trophy.', effects: { charm: -3 }, tone: 'bad' } },
      { label: 'Hide behind the goose', outcome: { text: 'Sir Quackbeard hissed. The smith’s child fled. Your social circle remains: one goose.', effects: { kinRel: { id: 'goose', delta: 4 } }, tone: 'plain' } },
    ],
  },

  // --- a tavern comrade (adult) ---------------------------------------------
  {
    id: 'peasant_tavern_comrade',
    category: 'peasant',
    title: 'A KINDRED SPIRIT',
    text: 'A traveller at the Sloshed Squire laughs at your worst joke — genuinely. They wave you over to share a bench and a tale.',
    ageMin: 16,
    requires: { kinCountAtMost: { friend: 2 } },
    choices: [
      { label: 'Stand them a round (3g)', costGold: 3, outcome: { text: 'Ale flowed, tales grew taller, and by closing time you had sworn eternal friendship twice. Once even sober.', effects: { gold: -3, addKin: { kind: 'friend', role: 'Drinking Companion', trait: 'Laughs easily', rel: 60 }, charm: 2, memory: { tag: 'made_friend', weight: 2 } }, tone: 'good' } },
      { label: 'Swap stories but guard your purse', outcome: { text: 'A fine evening of talk. You part warmly, but strangers stay strangers when the purse stays shut.', effects: { charm: 2, wits: 1 }, tone: 'plain' } },
    ],
  },

  // --- a shield-brother (martial road) --------------------------------------
  {
    id: 'knight_shield_brother',
    category: 'knight',
    title: 'A DEBT OF STEEL',
    text: 'In the training yard, a falling practice beam nearly brains another squire — you shove them clear at the last instant.',
    ageMin: 15,
    once: true,
    paths: ['martial'],
    requires: { kinCountAtMost: { friend: 2 } },
    choices: [
      { label: 'Help them up and make light of it', outcome: { text: '"I owe you my skull," they grin, clasping your arm. You have gained a shield-brother — the kind of friend who stands beside you when it matters.', effects: { addKin: { kind: 'friend', role: 'Shield-Brother', emoji: '🛡️', trait: 'Unshakeable', rel: 78 }, health: -2, path: { martial: 2 }, memory: { tag: 'shield_brother', weight: 3 } }, tone: 'good' } },
      { label: 'Demand a favour in return', outcome: { text: 'They pay you a grudging coin and remember the price of your help more than the help itself.', effects: { gold: 6, charm: -3, reputation: -2 }, tone: 'plain' } },
    ],
  },

  // --- envy breeds a rival ---------------------------------------------------
  {
    id: 'peasant_jealous_rival',
    category: 'peasant',
    title: 'ENVY IN THE LANE',
    text: 'Your fortunes are rising, and Aldwin the cooper has noticed. Lately his greetings have curdled into something sharper.',
    ageMin: 15,
    once: true,
    weight: 1.2,
    requires: { kinCountAtMost: { foe: 1 }, minReputation: 5 },
    choices: [
      { label: 'Try to win him over', successChance: (s) => 0.35 + s.stats.charm / 180, success: { text: 'You disarmed his envy with honest flattery about barrels. Not a friend, perhaps, but no longer an enemy.', effects: { charm: 3, reputation: 2 }, tone: 'good' }, failure: { text: 'He took your kindness for gloating. The feud is now official; he has already composed insulting verses.', effects: { addKin: { kind: 'foe', name: 'Aldwin', role: 'The Jealous Cooper', trait: 'Nursing a grudge', rel: 18 }, memory: { tag: 'made_rival', weight: 2 } }, tone: 'bad' } },
      { label: 'Let him stew', outcome: { text: 'You ignore him. The grudge ferments nicely in its barrel. Aldwin is now, formally, your rival.', effects: { addKin: { kind: 'foe', name: 'Aldwin', role: 'The Jealous Cooper', trait: 'Nursing a grudge', rel: 15 }, wits: 1, memory: { tag: 'made_rival', weight: 2 } }, tone: 'plain' } },
      { label: 'Mock him first, publicly', outcome: { text: 'Your jibe about his wobbliest barrel drew roars of laughter. Aldwin will never, ever forgive it.', effects: { addKin: { kind: 'foe', name: 'Aldwin', role: 'The Sworn Enemy', trait: 'Vengeful', rel: 6 }, charm: 4, reputation: -3, memory: { tag: 'made_rival', weight: 2 } }, tone: 'plain' } },
    ],
  },

  // --- a mentor at court ------------------------------------------------------
  {
    id: 'court_greying_mentor',
    category: 'court',
    title: 'THE GREYING COURTIER',
    text: 'An aging courtier, sharp-eyed beneath the powder, beckons you aside. "You remind me of myself, before the mistakes. Shall I teach you the ones to skip?"',
    ageMin: 15,
    ageMax: 40,
    once: true,
    paths: ['court'],
    requires: { kinCountAtMost: { friend: 2 } },
    choices: [
      { label: 'Become their protégé', outcome: { text: 'You gain a mentor who knows where every body at court is buried — several literally. Invaluable.', effects: { addKin: { kind: 'friend', role: 'Court Mentor', emoji: '🎭', trait: 'Seen everything', rel: 66, age: 58 }, wits: 5, path: { court: 3 }, memory: { tag: 'found_mentor', weight: 3 } }, tone: 'good' } },
      { label: 'Suspect a trap and decline', outcome: { text: 'At court, kindness is usually bait. You bow out gracefully — and wonder, for years, what they knew.', effects: { wits: 2, faith: 1 }, tone: 'plain' } },
    ],
  },

  // --- sworn to a liege --------------------------------------------------------
  {
    id: 'knight_liege_oath',
    category: 'knight',
    title: 'A LORD TAKES NOTICE',
    text: 'Lord Bramwell has watched your rise with approval. He offers you a formal place in his retinue — his protection, in exchange for your oath.',
    ageMin: 18,
    once: true,
    ranks: ['Knight', 'Noble'],
    requires: { kinCountAtMost: { liege: 0 } },
    choices: [
      { label: 'Kneel and swear the oath', outcome: { text: 'You swear fealty before the hall. A liege’s favour opens doors — and his wars will now be your wars.', effects: { addKin: { kind: 'liege', name: 'Lord Bramwell', rel: 55 }, gold: 10, rankProgress: 12, reputation: 5, memory: { tag: 'sworn_liege', weight: 3 } }, tone: 'good' } },
      { label: 'Keep your independence', outcome: { text: 'You decline with careful courtesy. Bramwell nods slowly — freedom kept, favour lost.', effects: { wits: 2, reputation: -2 }, tone: 'plain' } },
    ],
  },
];
