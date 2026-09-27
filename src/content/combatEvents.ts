import { GameEvent } from '@/types/game';

export const COMBAT_EVENTS: GameEvent[] = [
  {
    id: 'rival_wagered_challenge', category: 'knight', domain: 'politics', ageMin: 16,
    title: 'YOUR RIVAL HAS HIRED A DRUMMER',
    text: '{{rival.name}} marches into the market behind a drummer and announces that you fight like a wet pillow. A merchant offers a 30g prize if you win. Your rival demands a 10g entry wager. The drummer has learned exactly one beat.',
    requires: { missingTags: ['imprisoned'] }, cooldownYears: 5, weight: 2,
    actorRoles: { rival: { kinds: ['foe'], minAge: 16, alive: true, excludePlayer: true, missingActor: 'clear_event' } },
    choices: [
      { id: 'fight', label: 'Take the challenge (10g)', costGold: 10,
        hint: 'Play a four-exchange duel. Win: 30g prize and duel honours. Lose or yield: your wager is gone. Injuries and reputation are at stake.',
        challenge: { role: 'rival', stakes: { win: { gold: 30 }, lose: {}, summary: 'Wager paid: 10g. Win the 30g purse and duel honours. Lose or yield: no refund; injury and reputation loss.' } },
        outcome: { text: 'The merchant holds your wager. The drummer discovers a second beat. You step into the ring.', effects: { gold: -10 }, tone: 'plain' } },
      { id: 'mock', label: 'Challenge the drummer to learn a second beat', outcome: { text: 'The crowd laughs. The drummer stops. Your rival must now provide their own dramatic entrance.', effects: { charm: 3, boundKinRel: { role: 'rival', delta: -4 } }, tone: 'good' } },
      { id: 'leave', label: 'Keep your gold and walk away', outcome: { text: 'You leave the wet-pillow debate to the experts. Your purse remains undefeated.', effects: { wits: 2 }, tone: 'plain' } },
    ],
  },
  {
    id: 'grain_cart_champion', category: 'peasant', domain: 'household', ageMin: 16,
    title: 'THE GRAIN CART CHAMPION',
    text: '{{challenger.name}} blocks the grain cart and demands a fight before letting it pass. The driver offers you 12g to clear the road. The challenger has painted a crown on a bucket and is wearing it.',
    requires: { missingTags: ['imprisoned'] }, cooldownYears: 7,
    actorRoles: { challenger: { kinds: ['foe'], minAge: 16, alive: true, excludePlayer: true, missingActor: 'clear_event' } },
    choices: [
      { id: 'fight', label: 'Fight for the grain', hint: 'Win: 12g and +15 Stores. Lose or yield: −10 Stores. Normal duel honours, injury and reputation also apply.',
        challenge: { role: 'challenger', stakes: { win: { gold: 12, holding: { stores: 15 } }, lose: { holding: { stores: -10 } }, summary: 'Win: 12g and +15 Stores. Lose or yield: −10 Stores. Duel honours, injury and reputation also apply.' } },
        outcome: { text: 'The driver lends you a blunted sword. The bucket king lowers the royal visor.', effects: {}, tone: 'plain' } },
      { id: 'detour', label: 'Take the muddy detour', outcome: { text: 'You lead the cart around the field. One sack gets soaked. The bucket king is left ruling an empty road.', effects: { holding: { stores: -3 }, wits: 2 }, tone: 'plain' } },
    ],
  },
];
