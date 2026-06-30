/** Relationship interactions with kin (and foes, and one notable goose). */

import { GameState } from '@/types/game';
import { applyEffects } from './consequenceEngine';
import { addMoney, pushFeed } from './gameState';
import { checkLifeGoal } from './goalEngine';
import { clamp, rnd } from './random';
import { C } from '@/theme/theme';

export type KinAction = 'time' | 'praise' | 'gift' | 'favour' | 'insult' | 'plot' | 'divorce';

export function interactKin(s: GameState, id: string, kind: KinAction): GameState {
  if (s.dead) return s;
  s.tab = 'kin';
  s.selectedKinId = id;

  const k = s.kin.find((m) => m.id === id);
  if (!k || !k.alive) return s;
  const isGoose = k.id === 'goose';

  switch (kind) {
    case 'time':
      k.rel = clamp(k.rel + rnd(4, 9));
      applyEffects(s, { health: 1 });
      pushFeed(s, 'KIN · TIME', C.good, `You spent the season with ${k.name}. ${isGoose ? 'You fed it bread and it honked contentedly.' : 'Pleasant, if a little quiet.'}`, 'good');
      break;
    case 'praise':
      k.rel = clamp(k.rel + rnd(6, 12));
      applyEffects(s, { charm: 1 });
      pushFeed(s, 'KIN · PRAISE', C.good, `You praised ${k.name}. ${isGoose ? 'The goose honked, deeply moved.' : 'They blushed and called you ‘not the worst’.'}`, 'good');
      break;
    case 'gift':
      if (s.gold < 5) {
        pushFeed(s, 'KIN', C.amber, `You wished to gift ${k.name} but lacked 5 gold. Awkward.`, 'plain');
        break;
      }
      addMoney(s, -5);
      k.rel = clamp(k.rel + rnd(12, 20));
      pushFeed(s, 'KIN · GIFT', C.good, `You gave ${k.name} a fine gift. ${k.id === 'roderick' ? 'Even the apple thief was touched.' : 'Their heart grew three sizes.'}`, 'good');
      break;
    case 'favour':
      if (k.rel >= 55) {
        const g = rnd(3, 9);
        addMoney(s, g);
        k.rel = clamp(k.rel - rnd(2, 5));
        pushFeed(s, 'KIN · FAVOUR', C.good, `${k.name} lent you ${g} gold. ${isGoose ? '(The goose has surprising savings.)' : '"Pay it back," they said. You will not.'}`, 'good');
      } else {
        k.rel = clamp(k.rel - rnd(4, 8));
        pushFeed(s, 'KIN · FAVOUR', C.bad, `You begged ${k.name} for coin. They refused, and now think less of you.`, 'bad');
      }
      break;
    case 'insult':
      k.rel = clamp(k.rel - rnd(10, 18));
      applyEffects(s, { charm: -2, faith: -1, reputation: -1 });
      pushFeed(s, 'KIN · INSULT', C.bad, `You insulted ${k.name} thoroughly. ${isGoose ? 'The goose will plot against you now.' : 'They are NOT pleased.'}`, 'bad');
      break;
    case 'plot':
      k.rel = clamp(k.rel - rnd(6, 12));
      applyEffects(s, { wits: 3, faith: -4, path: { court: 1 }, reputation: -1 });
      pushFeed(s, 'KIN · SCHEME', C.purpleDark, `You schemed against ${k.name}. Petty and a touch wicked, but oh, so satisfying.`, 'plain');
      break;
    case 'divorce':
      if (k.kind !== 'spouse') break; // only spouses can be divorced
      k.alive = false; // they leave the household
      s.selectedKinId = null;
      applyEffects(s, {
        charm: -3,
        faith: -4,
        reputation: -5,
        removeTags: ['married'],
        addTags: ['divorced'],
        memory: { tag: 'divorced', weight: 2 },
      });
      pushFeed(s, 'KIN · DIVORCE', C.bad, `You and ${k.name} part ways for good. The village clucks its tongue; you sleep diagonally at last.`, 'bad');
      break;
  }
  checkLifeGoal(s);
  return s;
}
