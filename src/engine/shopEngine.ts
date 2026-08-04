/** Shop purchasing logic. Consumables apply at once; perms join the estate. */

import { GameState, ShopItem } from '@/types/game';
import { itemStockedInYear } from '@/data/shop';
import { RANKS } from '@/data/ranks';
import { applyEffects } from './consequenceEngine';
import { addMoney, pushFeed } from './gameState';
import { checkLifeGoal } from './goalEngine';
import { C } from '@/theme/theme';

export interface ShopAvailability {
  available: boolean;
  reason?: string;
}

/**
 * What a trader actually asks this year.
 *
 * A fixed price list made the village simulation invisible at the stall: a
 * famine year and a boom year cost the same. Prices now follow Swineford's
 * prosperity, and the stalls that sell food also follow the harvest.
 */
export function marketPrice(state: GameState, item: ShopItem): number {
  const prosperity = state.world.conditions.prosperity;
  // 0.8x in a rich year, 1.2x in a destitute one.
  let modifier = 1 + (50 - prosperity) / 250;
  if (item.market === 'market' || item.market === 'pedlar' || item.market === 'beastmarket') {
    modifier += (50 - state.world.conditions.foodSecurity) / 250;
  }

  // Cheap goods need care in both directions. Rounding to nearest alone hides a
  // famine on a 2-gold loaf; rounding away from the base price turns an
  // ordinary year's 2% drift into a halving. So: round to nearest, but once the
  // year is a genuine swing, guarantee at least a coin of movement.
  const rounded = Math.round(item.price * modifier);
  if (modifier >= 1.08) return Math.max(1, rounded, item.price + 1);
  if (modifier <= 0.92) return Math.max(1, Math.min(rounded, item.price - 1));
  return Math.max(1, rounded);
}

/** Whether this ware is laid out at all this year. */
export function itemInStock(state: GameState, item: ShopItem): boolean {
  return itemStockedInYear(item, state.world.currentYear);
}

export function shopAvailability(s: GameState, item: ShopItem): ShopAvailability {
  if (s.dead) return { available: false, reason: 'Thy life is ended' };
  if (s.pendingEvent) return { available: false, reason: 'Resolve the current event' };
  if (s.duel) return { available: false, reason: 'Finish the fight first' };
  if (s.actionClock.used >= s.actionClock.cap) return { available: false, reason: 'No actions remain this year' };
  if (item.type === 'perm' && s.inventory.includes(item.id)) return { available: false, reason: 'Already owned' };
  if (!itemInStock(s, item)) return { available: false, reason: 'Not stocked this year' };
  if (item.minAge != null && s.age < item.minAge) return { available: false, reason: `Requires age ${item.minAge}` };
  if (item.minRankIdx != null && s.rankIdx < item.minRankIdx) {
    return { available: false, reason: `Sold only to a ${RANKS[item.minRankIdx].key}` };
  }
  const price = marketPrice(s, item);
  if (s.gold < price) return { available: false, reason: `Needs ${price} gold` };
  return { available: true };
}

export function buyItem(s: GameState, item: ShopItem): GameState {
  if (s.dead) return s;
  s.tab = 'shop';

  if (!itemInStock(s, item)) {
    pushFeed(s, 'SHOP', C.amber, `No ${item.name.toLowerCase()} is to be had in Swineford this year. Try again when the roads change.`, 'plain');
    return s;
  }
  if (item.minAge != null && s.age < item.minAge) {
    pushFeed(s, 'SHOP', C.amber, `The merchant peers down at you. "No ${item.name.toLowerCase()} for young'uns. Come back at ${item.minAge}."`, 'plain');
    return s;
  }
  if (item.minRankIdx != null && s.rankIdx < item.minRankIdx) {
    pushFeed(s, 'SHOP', C.amber, `"This is not sold to your sort," the agent says, without looking up. A ${RANKS[item.minRankIdx].key} might ask again.`, 'plain');
    return s;
  }
  if (item.type === 'perm' && s.inventory.includes(item.id)) {
    pushFeed(s, 'SHOP', C.amber, `You already own a ${item.name.toLowerCase()}. One is plenty.`, 'plain');
    return s;
  }
  const price = marketPrice(s, item);
  if (s.gold < price) {
    pushFeed(s, 'SHOP', C.amber, `You cannot afford the ${item.name.toLowerCase()} (${price}g). The merchant sneers.`, 'plain');
    return s;
  }

  addMoney(s, -price);
  applyEffects(s, item.eff);
  if (item.type === 'perm') s.inventory = [...s.inventory, item.id];

  pushFeed(
    s,
    'PURCHASE',
    C.good,
    `You bought a ${item.name.toLowerCase()} for ${price} gold. ${
      item.type === 'perm' ? 'A fine addition to your estate.' : 'Best used at once!'
    }`,
    'good',
  );
  checkLifeGoal(s); // buying a cottage / stat item can complete a goal
  return s;
}
