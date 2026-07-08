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
import { chance, pick, rnd } from './random';
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

function one(lines: readonly string[]): string {
  return pick(lines);
}

const HANDLERS: Record<string, Handler> = {
  tavern: (s) => {
    if (s.gold < 2) return blocked(s, 'TAVERN', 'You had no coin for ale, so you watched others drink. Bleak.');
    applyEffects(s, { gold: -2, charm: 5, health: -2, faith: -1, path: { court: 1 } });
    pushFeed(s, 'TAVERN', C.amber, one([
      'A night at the Sloshed Squire! You sang, spilled ale, and were applauded by a bench.',
      'You joined a tavern argument over whether soup can be sinful. Nobody won, but everyone shouted well.',
      'The ale was thin, the songs were thick, and you left with a new friend who may have been a hatter.',
    ]), 'good');
  },
  dice: (s) => {
    if (s.gold < 3) return blocked(s, 'DICE', "You can't gamble with an empty purse. The dice men shoo you away.");
    if (chance(0.45)) {
      applyEffects(s, { gold: 9, charm: 2, path: { court: 1 } });
      pushFeed(s, 'DICE', C.good, one([
        'You won at dice! The loser accused the cubes of treason.',
        'The dice loved you tonight. A monk nearby called it providence, then asked to borrow them.',
        'You threw sixes until the table went quiet and the tavern cat left in protest.',
      ]), 'good');
    } else {
      applyEffects(s, { gold: -5 });
      pushFeed(s, 'DICE', C.bad, one([
        'You lost at dice. The winner thanked your ancestors for raising a generous fool.',
        'The dice betrayed you with tiny square faces of innocence.',
        'You lost so neatly the table asked if you had practiced.',
      ]), 'bad');
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
    pushFeed(s, 'LABOUR', C.amber, one([
      'You toiled in the turnip fields all season. Your back hates you, your purse loves you.',
      'You pulled turnips until the earth seemed personally offended.',
      'Fieldwork paid well today, if one measures pay against blisters and despair.',
    ]), 'good');
  },
  blacksmith: (s) => {
    applyEffects(s, { gold: 6, health: -3, wits: 2, path: { labour: 2 } });
    pushFeed(s, 'THE FORGE', C.blue, 'You hammered iron at the forge all season. Sooty, sweaty, and a few coins richer.', 'good');
  },
  market: (s) => {
    if (chance(0.6)) {
      applyEffects(s, { gold: 5, charm: 1, path: { labour: 1 } });
      pushFeed(s, 'MARKET', C.good, one([
        "You sold pies and trinkets at your stall. A brisk day's trade!",
        'You sold a comb, two pies, and advice worth less than both.',
        'Your stall prospered after you labelled everything "nearly noble."',
      ]), 'good');
    } else {
      applyEffects(s, { gold: -1 });
      pushFeed(s, 'MARKET', C.amber, one([
        'Nobody bought a thing. You ate your own unsold pies. Bleakly profitable for your belly.',
        'A customer inspected every pie, blessed none of them, and left.',
        'Trade was so slow a fly landed, considered buying, and flew away.',
      ]), 'plain');
    }
  },
  church: (s) => {
    applyEffects(s, { faith: 8, charm: 1, path: { church: 2 } });
    pushFeed(s, 'CHAPEL', C.good, one([
      'You prayed earnestly. The stained glass was lovely. You feel cleansed and a bit hungry.',
      'The sermon was long, but so is eternity, which may have been the point.',
      'You knelt, prayed, and avoided thinking about lunch for almost seven whole minutes.',
    ]), 'good');
  },
  pilgrimage: (s) => {
    if (s.gold < 3) return blocked(s, 'PILGRIMAGE', 'You lacked the 3 gold for the road. The shrine remains un-pilgrimaged.');
    applyEffects(s, { gold: -3, faith: 14, health: -6, wits: 2, path: { church: 3 }, memory: { tag: 'pilgrim', weight: 2 } });
    pushFeed(s, 'PILGRIMAGE', C.good, 'You walked to the holy shrine and back. Blisters and blessings, in equal and abundant measure.', 'good');
  },
  train: (s) => {
    applyEffects(s, { wits: 5, charm: 4, health: -2, path: { martial: 3 }, rankProgress: 14 });
    pushFeed(s, 'TRAINING', C.blue, one([
      'You trained hard at the keep: sword, courtesy, and not tripping over your own cloak.',
      'You practiced blade work until the straw dummy looked personally disappointed.',
      'A veteran taught you three cuts, two bows, and one excellent way to fall with dignity.',
    ]), 'good');
  },
  quest: (s) => {
    if (chance(0.55)) {
      applyEffects(s, { gold: 10, charm: 7, health: -5, path: { martial: 2 }, rankProgress: 8, memory: { tag: 'hero', weight: 2 } });
      pushFeed(s, 'QUEST', C.good, one([
        'You answered a notice-board quest and returned a hero! A small one. A village hero.',
        'You solved the quest by bravery, luck, and misreading the map in a useful direction.',
        'The quest-giver paid you and asked no follow-up questions. Ideal heroism.',
      ]), 'good');
    } else {
      applyEffects(s, { health: -10, charm: 3 });
      pushFeed(s, 'QUEST', C.bad, one([
        "The quest was a trap. The 'dragon' was an angry cow. You have learned humility and a limp.",
        'The notice-board failed to mention mud, knives, or the man shouting about bees.',
        'You returned from the quest alive, which is a generous definition of success.',
      ]), 'bad');
    }
  },
  tournament: (s) => {
    if (s.gold < 5) return blocked(s, 'TOURNEY', 'Entry costs 5 gold you do not have. You watch the joust from the cheap mud.');
    if (chance(0.5)) {
      applyEffects(s, { gold: 5, charm: 12, health: -12, path: { martial: 3 }, rankProgress: 10 });
      pushFeed(s, 'TOURNEY', C.good, one([
        'You were unhorsed gloriously, but your scream thrilled the crowd. Bruised, but briefly famous!',
        'You survived the tilt and bowed to the wrong lord. The crowd loved both.',
        'Your lance shattered, your pride bent, and somehow people cheered.',
      ]), 'good');
    } else {
      applyEffects(s, { gold: -5, charm: 4, health: -6 });
      pushFeed(s, 'TOURNEY', C.bad, one([
        'You fell off before the joust even began. Polite, pitying applause.',
        'Your horse took one look at glory and walked sideways out of history.',
        'You lowered your lance, missed the knight, and offended a banner.',
      ]), 'bad');
    }
  },
  poach: (s) => {
    if (chance(0.5)) {
      applyEffects(s, { gold: 12, health: -2, path: { outlaw: 2 }, reputation: -3 });
      pushFeed(s, 'POACHING', C.good, one([
        "You poached a fat deer from the King's wood and sold it quietly. Delicious crime.",
        "You slipped through the royal wood and returned with meat, scratches, and no witnesses worth naming.",
        'The forest kept your secret. The stew did not.',
      ]), 'good');
    } else {
      applyEffects(s, { gold: -6, health: -8, charm: -3, path: { outlaw: 1 }, reputation: -6 });
      pushFeed(s, 'CAUGHT!', C.bad, one([
        "The King's foresters caught you mid-poach. You were fined, thrashed, and shamed.",
        'A forester found you whispering apologies to a snare. The fine was immediate.',
        'You escaped the deer but not the law, which is worse at running but better at paperwork.',
      ]), 'bad');
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
      pushFeed(s, 'BANDITRY', C.good, one([
        'You robbed a merchant on the lonely road! Rich, dashing, and thoroughly damned.',
        'Your ambush worked because the merchant was busy arguing with his mule.',
        'You took a purse and left a speech about fairness. The merchant hated both.',
      ]), 'good');
    } else {
      applyEffects(s, { gold: -5, health: -14, charm: -5, path: { outlaw: 2 }, reputation: -10 });
      pushFeed(s, 'AMBUSHED!', C.bad, one([
        "Your ambush failed spectacularly. The merchant's guards thrashed you into the ditch.",
        'You shouted "stand and deliver" from behind the wrong hedge.',
        'The merchant had guards, dogs, and a very hurtful laugh.',
      ]), 'bad');
    }
  },
  leech: (s) => {
    if (s.gold < 3) return blocked(s, 'DOCTOR', 'The leech-doctor demands 3 gold up front. You have not got it. You stay ill.');
    const good = chance(0.6);
    applyEffects(s, { gold: -3, health: good ? 9 : -5 });
    pushFeed(s, 'DOCTOR', C.bad, good ? one([
      'The leech-doctor applied eleven leeches. Astonishingly, you feel better.',
      'The doctor named each leech and charged by personality. It worked anyway.',
      'The leeches looked confident, which is more than can be said for you.',
    ]) : one([
      'The leech-doctor applied too many leeches. You feel considerably worse. He charged extra.',
      'The treatment removed several humours and most of your patience.',
      'The doctor says feeling worse proves the cure found something to fight.',
    ]), good ? 'good' : 'bad');
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
