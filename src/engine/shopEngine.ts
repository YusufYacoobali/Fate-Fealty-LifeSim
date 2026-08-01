/** Shop purchasing logic. Consumables apply at once; perms join the estate. */

import { GameState, ShopItem } from '@/types/game';
import { applyEffects } from './consequenceEngine';
import { addMoney, pushFeed } from './gameState';
import { checkLifeGoal } from './goalEngine';
import { C } from '@/theme/theme';

export interface ShopAvailability {
  available: boolean;
  reason?: string;
}

export function shopAvailability(s: GameState, item: ShopItem): ShopAvailability {
  if (s.dead) return { available: false, reason: 'Thy life is ended' };
  if (s.pendingEvent) return { available: false, reason: 'Resolve the current event' };
  if (s.actionClock.used >= s.actionClock.cap) return { available: false, reason: 'No actions remain this year' };
  if (item.minAge != null && s.age < item.minAge) return { available: false, reason: `Requires age ${item.minAge}` };
  if (item.type === 'perm' && s.inventory.includes(item.id)) return { available: false, reason: 'Already owned' };
  if (s.gold < item.price) return { available: false, reason: `Needs ${item.price} gold` };
  return { available: true };
}

export function buyItem(s: GameState, item: ShopItem): GameState {
  if (s.dead) return s;
  s.tab = 'shop';

  if (item.minAge != null && s.age < item.minAge) {
    pushFeed(s, 'SHOP', C.amber, `The merchant peers down at you. "No ${item.name.toLowerCase()} for young'uns. Come back at ${item.minAge}."`, 'plain');
    return s;
  }
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
