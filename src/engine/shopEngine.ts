/** Shop purchasing logic. Consumables apply at once; perms join the estate. */

import { GameState, ShopItem } from '@/types/game';
import { applyEffects } from './consequenceEngine';
import { addMoney, pushFeed } from './gameState';
import { checkLifeGoal } from './goalEngine';
import { C } from '@/theme/theme';

export function buyItem(s: GameState, item: ShopItem): GameState {
  if (s.dead) return s;
  s.tab = 'shop';

  if (item.type === 'perm' && s.inventory.includes(item.id)) {
    pushFeed(s, 'SHOP', C.amber, `You already own a ${item.name.toLowerCase()}. One is plenty.`, 'plain');
    return s;
  }
  if (s.gold < item.price) {
    pushFeed(s, 'SHOP', C.amber, `You cannot afford the ${item.name.toLowerCase()} (${item.price}g). The merchant sneers.`, 'plain');
    return s;
  }

  addMoney(s, -item.price);
  applyEffects(s, item.eff);
  if (item.type === 'perm') s.inventory = [...s.inventory, item.id];

  pushFeed(
    s,
    'PURCHASE',
    C.good,
    `You bought a ${item.name.toLowerCase()} for ${item.price} gold. ${
      item.type === 'perm' ? 'A fine addition to your estate.' : 'Best used at once!'
    }`,
    'good',
  );
  checkLifeGoal(s); // buying a cottage / stat item can complete a goal
  return s;
}
