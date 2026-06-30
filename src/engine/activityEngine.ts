/**
 * Activity resolution. Activities are the player-driven counterpart to the
 * Director's annual events: chosen freely, they nudge stats/gold and quietly
 * feed the hidden path system (e.g. training -> martial, crime -> outlaw).
 *
 * Each activity returns its outcome through the consequence engine, so death,
 * promotion, and memories all work uniformly.
 */

import { GameState } from '@/types/game';
import { applyEffects } from './consequenceEngine';
import { hasTag, pushFeed, removeTag } from './gameState';
import { checkLifeGoal } from './goalEngine';
import { chance, rnd } from './random';
import { C } from '@/theme/theme';

/** Shared cure: clears the ongoing illness state and announces it. */
function cureIllness(s: GameState): void {
  if (hasTag(s, 'ill')) {
    removeTag(s, 'ill');
    pushFeed(s, 'CURED', C.good, 'The treatment drives out the lingering sickness. You are whole once more.', 'good');
  }
}

type Handler = (s: GameState) => void;

function blocked(s: GameState, tag: string, text: string) {
  pushFeed(s, tag, C.amber, text, 'plain');
}

const HANDLERS: Record<string, Handler> = {
  tavern: (s) => {
    if (s.gold < 2) return blocked(s, 'TAVERN', 'You had no coin for ale, so you watched others drink. Bleak.');
    applyEffects(s, { gold: -2, charm: 5, health: -2, faith: -1, path: { court: 1 } });
    pushFeed(s, 'TAVERN', C.amber, 'A night at the Sloshed Squire! You sang, you spilled, you made three new friends and one new enemy.', 'good');
  },
  dice: (s) => {
    if (s.gold < 3) return blocked(s, 'DICE', "You can't gamble with an empty purse. The dice men shoo you away.");
    if (chance(0.45)) {
      applyEffects(s, { gold: 9, charm: 2, path: { court: 1 } });
      pushFeed(s, 'DICE', C.good, 'You won at dice! The other peasants are suspicious of your luck. So are you.', 'good');
    } else {
      applyEffects(s, { gold: -5 });
      pushFeed(s, 'DICE', C.bad, 'You lost at dice. Again. The dice men thank you for your generous donation.', 'bad');
    }
  },
  feast: (s) => {
    if (s.gold < 4) return blocked(s, 'FEAST', 'A feast needs coin and you have none. You gnaw a turnip alone. Festive.');
    applyEffects(s, { gold: -4, health: 6, charm: 3, faith: -1, path: { court: 2 } });
    pushFeed(s, 'FEAST', C.amber, 'You hosted a roaring feast — roast goose (NOT Sir Quackbeard), much mead, more merriment.', 'good');
  },
  fair: (s) => {
    applyEffects(s, { charm: 4, health: 2 });
    pushFeed(s, 'VILLAGE FAIR', C.purpleDark, 'You juggled turnips at the fair. Two children cheered, one threw a beet. A triumph.', 'good');
  },
  fields: (s) => {
    applyEffects(s, { gold: 5, health: -4, path: { labour: 2 } });
    pushFeed(s, 'LABOUR', C.amber, 'You toiled in the turnip fields all season. Your back hates you, your purse loves you.', 'good');
  },
  blacksmith: (s) => {
    applyEffects(s, { gold: 6, health: -3, wits: 2, path: { labour: 2 } });
    pushFeed(s, 'THE FORGE', C.blue, 'You hammered iron at the forge all season. Sooty, sweaty, and a few coins richer.', 'good');
  },
  market: (s) => {
    if (chance(0.6)) {
      applyEffects(s, { gold: 5, charm: 1, path: { labour: 1 } });
      pushFeed(s, 'MARKET', C.good, "You sold pies and trinkets at your stall. A brisk day's trade!", 'good');
    } else {
      applyEffects(s, { gold: -1 });
      pushFeed(s, 'MARKET', C.amber, 'Nobody bought a thing. You ate your own unsold pies. Bleakly profitable for your belly.', 'plain');
    }
  },
  church: (s) => {
    applyEffects(s, { faith: 8, charm: 1, path: { church: 2 } });
    pushFeed(s, 'CHAPEL', C.good, 'You prayed earnestly. The stained glass was lovely. You feel cleansed and a bit hungry.', 'good');
  },
  pilgrimage: (s) => {
    if (s.gold < 3) return blocked(s, 'PILGRIMAGE', 'You lacked the 3 gold for the road. The shrine remains un-pilgrimaged.');
    applyEffects(s, { gold: -3, faith: 14, health: -6, wits: 2, path: { church: 3 }, memory: { tag: 'pilgrim', weight: 2 } });
    pushFeed(s, 'PILGRIMAGE', C.good, 'You walked to the holy shrine and back. Blisters and blessings, in equal and abundant measure.', 'good');
  },
  train: (s) => {
    applyEffects(s, { wits: 5, charm: 4, health: -2, path: { martial: 3 }, rankProgress: 14 });
    pushFeed(s, 'TRAINING', C.blue, 'You trained hard at the keep — sword, courtesy, and not tripping over your own cloak.', 'good');
  },
  quest: (s) => {
    if (chance(0.55)) {
      applyEffects(s, { gold: 10, charm: 7, health: -5, path: { martial: 2 }, rankProgress: 8, memory: { tag: 'hero', weight: 2 } });
      pushFeed(s, 'QUEST', C.good, 'You answered a notice-board quest and returned a hero! A small one. A village hero.', 'good');
    } else {
      applyEffects(s, { health: -10, charm: 3 });
      pushFeed(s, 'QUEST', C.bad, "The quest was a trap. The 'dragon' was an angry cow. You have learned humility and a limp.", 'bad');
    }
  },
  tournament: (s) => {
    if (s.gold < 5) return blocked(s, 'TOURNEY', 'Entry costs 5 gold you do not have. You watch the joust from the cheap mud.');
    if (chance(0.5)) {
      applyEffects(s, { gold: 5, charm: 12, health: -12, path: { martial: 3 }, rankProgress: 10 });
      pushFeed(s, 'TOURNEY', C.good, 'You were unhorsed gloriously, but your scream thrilled the crowd. Bruised, but briefly famous!', 'good');
    } else {
      applyEffects(s, { gold: -5, charm: 4, health: -6 });
      pushFeed(s, 'TOURNEY', C.bad, 'You fell off before the joust even began. Polite, pitying applause. The horse seemed embarrassed for you.', 'bad');
    }
  },
  poach: (s) => {
    if (chance(0.5)) {
      applyEffects(s, { gold: 12, health: -2, path: { outlaw: 2 }, reputation: -3 });
      pushFeed(s, 'POACHING', C.good, "You poached a fat deer from the King's wood and sold it quietly. Delicious crime.", 'good');
    } else {
      applyEffects(s, { gold: -6, health: -8, charm: -3, path: { outlaw: 1 }, reputation: -6 });
      pushFeed(s, 'CAUGHT!', C.bad, "The King's foresters caught you mid-poach. You were fined, thrashed, and shamed. The deer escaped smugly.", 'bad');
    }
  },
  pickpocket: (s) => {
    if (chance(0.55)) {
      applyEffects(s, { gold: 7, faith: -3, path: { outlaw: 2 }, reputation: -2 });
      pushFeed(s, 'PICKPOCKET', C.good, "Light fingers, fat purse. You lifted a merchant's coin and whistled away innocently.", 'good');
    } else {
      applyEffects(s, { gold: -3, health: -5, charm: -3, path: { outlaw: 1 }, reputation: -5 });
      pushFeed(s, 'CAUGHT!', C.bad, 'A guard caught your hand in a stranger’s pocket. A public ear-flicking ensued. Humbling.', 'bad');
    }
  },
  banditry: (s) => {
    if (chance(0.45)) {
      applyEffects(s, { gold: 18, charm: 3, faith: -8, path: { outlaw: 4 }, reputation: -8, memory: { tag: 'bandit', weight: 2 } });
      pushFeed(s, 'BANDITRY', C.good, 'You robbed a merchant on the lonely road! Rich, dashing, and thoroughly damned.', 'good');
    } else {
      applyEffects(s, { gold: -5, health: -14, charm: -5, path: { outlaw: 2 }, reputation: -10 });
      pushFeed(s, 'AMBUSHED!', C.bad, "Your ambush failed spectacularly. The merchant's guards thrashed you into the ditch.", 'bad');
    }
  },
  leech: (s) => {
    if (s.gold < 3) return blocked(s, 'DOCTOR', 'The leech-doctor demands 3 gold up front. You have not got it. You stay ill.');
    const good = chance(0.6);
    applyEffects(s, { gold: -3, health: good ? 9 : -5 });
    pushFeed(s, 'DOCTOR', C.bad, good ? 'The leech-doctor applied eleven leeches. Astonishingly, you feel better.' : 'The leech-doctor applied too many leeches. You feel considerably worse. He charged extra.', good ? 'good' : 'bad');
    if (good) cureIllness(s);
  },
  bathhouse: (s) => {
    if (s.gold < 2) return blocked(s, 'BATHHOUSE', 'A bath costs 2 gold. You cannot afford to be clean. You remain fragrant.');
    applyEffects(s, { gold: -2, health: 5, charm: 5 });
    pushFeed(s, 'BATHHOUSE', C.good, 'A rare hot bath! You emerge smelling of lavender instead of livestock. People stare, impressed.', 'good');
  },
  herbalist: (s) => {
    if (s.gold < 4) return blocked(s, 'HERBALIST', 'The herb-wife wants 4 gold for her tonic. Your purse says no.');
    applyEffects(s, { gold: -4, health: 10, wits: 1 });
    pushFeed(s, 'HERBALIST', C.good, 'The herb-wife brewed you a tonic. It tastes of regret and pondwater, but it works wonders.', 'good');
    cureIllness(s);
  },
};

export function doActivity(s: GameState, id: string): GameState {
  if (s.dead || s.event) return s;
  s.tab = 'life';
  s.selectedKinId = null;
  if (s.tags.includes('imprisoned')) {
    pushFeed(s, 'IMPRISONED', C.amber, 'You languish behind iron bars; such pursuits must wait for freedom.', 'plain');
    return s;
  }
  const handler = HANDLERS[id];
  if (handler) handler(s);
  checkLifeGoal(s);
  return s;
}
