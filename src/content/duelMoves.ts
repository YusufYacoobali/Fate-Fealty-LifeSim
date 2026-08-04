import { DuelKind } from '@/types/game';

export type DuelStat = 'health' | 'charm' | 'wits' | 'faith';

export interface DuelResponse {
  id: string;
  label: string;
  /** Short read on what the choice is trading. */
  hint: string;
  /** Which attribute carries it. */
  stat: DuelStat;
  /** Odds before attributes and the opponent's skill are applied. */
  base: number;
  /** Composure stripped from the opponent when it lands. */
  hit: number;
  /** Composure lost when it fails. */
  cost: number;
  /** Composure recovered on success — a few answers buy breathing room. */
  recover?: number;
  success: string;
  failure: string;
}

export interface DuelMove {
  id: string;
  /** Which kinds of fight this exchange can appear in. */
  kinds: DuelKind[];
  /** What the opponent is visibly about to do. */
  telegraph: string;
  responses: DuelResponse[];
}

/**
 * Telegraph-and-answer exchanges. Every attack is announced before it lands, so
 * a fight is a series of legible reads rather than a coin flip: the player is
 * choosing which attribute to bet on against a visible threat.
 *
 * `{him}` and `{name}` are substituted with the opponent's pronoun and name.
 */
export const DUEL_MOVES: DuelMove[] = [
  {
    id: 'high_swing',
    kinds: ['duel', 'brawl'],
    telegraph: '{name} raises high and steps in. The blow is coming down hard and slow.',
    responses: [
      {
        id: 'duck_inside', label: 'DUCK INSIDE', hint: 'wits · slip under and punish', stat: 'wits',
        base: 0.42, hit: 26, cost: 16,
        success: 'Thou steps inside the arc before it falls and drives an elbow into {his} ribs.',
        failure: 'Thou steps in too early. The swing catches thee across the shoulder.',
      },
      {
        id: 'parry_high', label: 'PARRY HIGH', hint: 'strength · meet it head on', stat: 'health',
        base: 0.56, hit: 14, cost: 11,
        success: 'Steel meets steel above thy head. {name} feels the shock to the elbow.',
        failure: 'The blow beats thy guard down and rings off thy skull.',
      },
      {
        id: 'give_ground', label: 'GIVE GROUND', hint: 'safe · lets {him} tire', stat: 'wits',
        base: 0.74, hit: 6, cost: 5, recover: 6,
        success: 'Thou gives ground cleanly. The swing finds nothing but air, and {name} is breathing hard.',
        failure: 'Thou backs into the crowd and takes the blow on thy raised arm.',
      },
    ],
  },
  {
    id: 'low_cut',
    kinds: ['duel'],
    telegraph: '{name} drops the point and cuts low at thy legs.',
    responses: [
      {
        id: 'stamp_the_blade', label: 'STAMP THE BLADE', hint: 'strength · pin it down', stat: 'health',
        base: 0.4, hit: 28, cost: 18,
        success: "Thy boot pins the blade to the dirt. {name}'s face changes entirely.",
        failure: 'Thou stamps on nothing and the edge opens thy shin.',
      },
      {
        id: 'hop_back', label: 'HOP CLEAR', hint: 'wits · read the range', stat: 'wits',
        base: 0.66, hit: 10, cost: 8,
        success: 'Thou lifts clear by a finger-width and comes down inside {his} reach.',
        failure: 'Thou jumps late and the cut takes thee across the calf.',
      },
      {
        id: 'beat_aside', label: 'BEAT IT ASIDE', hint: 'strength · open {him} up', stat: 'health',
        base: 0.52, hit: 18, cost: 12,
        success: "Thou beats the cut wide and {name}'s whole side is open for a heartbeat.",
        failure: 'Thy beat misses and the blade continues on into thee.',
      },
    ],
  },
  {
    id: 'feint',
    kinds: ['duel', 'brawl'],
    telegraph: '{name} shows thee an opening. It is far too generous to be real.',
    responses: [
      {
        id: 'refuse_bait', label: 'REFUSE THE BAIT', hint: 'wits · make {him} commit', stat: 'wits',
        base: 0.62, hit: 16, cost: 7, recover: 4,
        success: 'Thou does not move. The feint dies of embarrassment and {name} has to commit for real.',
        failure: 'Thou hesitates a moment too long and it was not a feint at all.',
      },
      {
        id: 'take_it', label: 'TAKE IT ANYWAY', hint: 'strength · huge if right', stat: 'health',
        base: 0.33, hit: 34, cost: 22,
        success: 'It was a feint, and thou went through it anyway. {name} folds around the blow.',
        failure: 'Thou takes the bait exactly as intended and pays for it.',
      },
      {
        id: 'feint_back', label: 'FEINT IN RETURN', hint: 'charm · out-trick {him}', stat: 'charm',
        base: 0.47, hit: 22, cost: 13,
        success: 'Thou answers the lie with a better one. {name} defends against nothing.',
        failure: 'Thy trick is read instantly. {name} was waiting for exactly that.',
      },
    ],
  },
  {
    id: 'grapple',
    kinds: ['duel', 'brawl'],
    telegraph: '{name} closes to grappling range and reaches for thy collar.',
    responses: [
      {
        id: 'throw_him', label: 'THROW {HIM}', hint: 'strength · end it now', stat: 'health',
        base: 0.44, hit: 27, cost: 17,
        success: 'Thou takes the grip, turns thy hip, and puts {name} into the dirt.',
        failure: 'Thou is the one who ends up in the dirt, with {him} on top.',
      },
      {
        id: 'break_grip', label: 'BREAK AND STEP', hint: 'wits · reset the range', stat: 'wits',
        base: 0.63, hit: 11, cost: 9, recover: 5,
        success: 'Thou breaks the grip and steps out before it becomes a wrestling match.',
        failure: 'The grip holds. Thou is dragged in close and struck twice.',
      },
      {
        id: 'talk_him_down', label: 'SPEAK TO {HIM}', hint: 'charm · shame {him} off', stat: 'charm',
        base: 0.4, hit: 20, cost: 10, recover: 8,
        success: 'Thou says something quiet that only {name} hears. {he} loosens the grip.',
        failure: 'Whatever thou said, it made {him} angrier.',
      },
    ],
  },
  {
    id: 'shield_press',
    kinds: ['duel'],
    telegraph: '{name} hides behind the shield and drives forward, trying to walk thee down.',
    responses: [
      {
        id: 'hook_the_rim', label: 'HOOK THE RIM', hint: 'wits · pull it open', stat: 'wits',
        base: 0.45, hit: 25, cost: 15,
        success: 'Thou hooks the rim and hauls it aside. {name} is standing in the open.',
        failure: 'The hook slips and the shield edge catches thee in the mouth.',
      },
      {
        id: 'brace', label: 'BRACE AND HOLD', hint: 'strength · refuse to move', stat: 'health',
        base: 0.58, hit: 13, cost: 10,
        success: 'Thou plants and does not move. {name} runs out of ground and out of ideas.',
        failure: 'Thou is walked backwards over thy own heels.',
      },
      {
        id: 'sidestep', label: 'SIDESTEP', hint: 'wits · let {him} pass', stat: 'wits',
        base: 0.68, hit: 9, cost: 7, recover: 5,
        success: 'Thou steps offline and {name} charges into empty air and a fence.',
        failure: 'Thou steps the wrong way, straight into the shield.',
      },
    ],
  },
  {
    id: 'wild_flurry',
    kinds: ['duel', 'brawl'],
    telegraph: '{name} abandons all form and comes at thee in a flurry.',
    responses: [
      {
        id: 'weather_it', label: 'WEATHER IT', hint: 'resolve · outlast the storm', stat: 'faith',
        base: 0.55, hit: 12, cost: 12, recover: 7,
        success: 'Thou covers up and lets it break over thee. It cannot last, and it does not.',
        failure: 'It lasts longer than thou does.',
      },
      {
        id: 'meet_fury', label: 'MEET FURY WITH FURY', hint: 'strength · trade everything', stat: 'health',
        base: 0.38, hit: 32, cost: 24,
        success: 'Thou throws thy own storm back. {name} is not ready for how bad thou wants this.',
        failure: 'Two fools swing wildly. Only thou is hurt by it.',
      },
      {
        id: 'step_offline', label: 'STEP OFFLINE', hint: 'wits · make {him} miss', stat: 'wits',
        base: 0.6, hit: 15, cost: 10,
        success: 'Thou drifts sideways through it and lets {him} punch the air until {he} is spent.',
        failure: 'There is nowhere to drift to, and thou learns this painfully.',
      },
    ],
  },
  {
    id: 'crowd_play',
    kinds: ['duel', 'brawl'],
    telegraph: '{name} pauses to play to the crowd, arms wide, entirely certain of {him}self.',
    responses: [
      {
        id: 'strike_now', label: 'STRIKE NOW', hint: 'wits · no honour, all effect', stat: 'wits',
        base: 0.72, hit: 24, cost: 14,
        success: 'Thou hits {him} mid-bow. The crowd gasps, then laughs, and not at thee.',
        failure: 'It was bait. {name} was never bowing at all.',
      },
      {
        id: 'take_the_crowd', label: 'TAKE THE CROWD', hint: 'charm · steal the moment', stat: 'charm',
        base: 0.5, hit: 18, cost: 8, recover: 10,
        success: 'Thou says something better and louder. The crowd changes sides mid-cheer.',
        failure: 'Nobody laughs. The silence costs thee more than a blow would.',
      },
      {
        id: 'catch_breath', label: 'CATCH THY BREATH', hint: 'safe · recover composure', stat: 'faith',
        base: 0.8, hit: 4, cost: 4, recover: 14,
        success: 'Thou uses the moment to breathe, plant thy feet, and remember thou are not dead yet.',
        failure: 'Thou breathes, and {name} uses the moment better than thou did.',
      },
    ],
  },
];

export const DUEL_MOVE_BY_ID = Object.fromEntries(DUEL_MOVES.map((move) => [move.id, move]));

export function movesForKind(kind: DuelKind): DuelMove[] {
  return DUEL_MOVES.filter((move) => move.kinds.includes(kind));
}
