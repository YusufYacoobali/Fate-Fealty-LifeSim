import { GameState, HoldingResource } from '@/types/game';
import {
  HOLDING_UNLOCK_AGE,
  holdingActionById,
  holdingTitle,
  holdingUpgradeById,
} from '@/data/holding';
import { applyEffects } from './consequenceEngine';
import { addMemory, addMoney, pushFeed } from './gameState';
import { pick } from './random';
import { C } from '@/theme/theme';
import { RANKS } from '@/data/ranks';

export interface HoldingAvailability {
  available: boolean;
  reason?: string;
}

function ownsUpgrade(s: GameState, id: string): boolean {
  return s.holding.upgrades.includes(id);
}

export function isHoldingUpgradeActive(s: GameState, id: string): boolean {
  const def = holdingUpgradeById(id);
  return !!def && ownsUpgrade(s, id) && s.rankIdx >= def.minRankIdx;
}

export function holdingPopulation(s: GameState): number {
  return Math.max(1, Math.floor(s.holding.population ?? 18));
}

export function holdingPopulationCapacity(s: GameState): number {
  return 30
    + s.rankIdx * 18
    + (isHoldingUpgradeActive(s, 'granary') ? 15 : 0)
    + (isHoldingUpgradeActive(s, 'stewards_hall') ? 12 : 0);
}

export function holdingYearlyUpkeep(s: GameState): { stores: number; security: number } {
  return {
    stores: 8
      - (isHoldingUpgradeActive(s, 'smokehouse') ? 2 : 0)
      - (isHoldingUpgradeActive(s, 'granary') ? 2 : 0),
    security: 6 - (isHoldingUpgradeActive(s, 'watchtower') ? 2 : 0),
  };
}

export function holdingProsperityReward(s: GameState): number {
  return 4
    + 2 * s.rankIdx
    + Math.floor(holdingPopulation(s) / 12)
    + (isHoldingUpgradeActive(s, 'watermill') ? 8 : 0);
}

function adjustPopulation(s: GameState, delta: number): void {
  s.holding.population = Math.max(
    1,
    Math.min(holdingPopulationCapacity(s), holdingPopulation(s) + delta),
  );
}

function premiumGate(minRankIdx: number, s: GameState): boolean {
  return minRankIdx >= 4 && !s.lifetimeUnlocked;
}

export function holdingActionAvailability(s: GameState, id: string): HoldingAvailability {
  const action = holdingActionById(id);
  if (!action) return { available: false, reason: 'Unknown action' };
  if (s.dead) return { available: false, reason: 'Thy life is ended' };
  if (s.event) return { available: false, reason: 'Resolve the current event' };
  if (s.actionClock.used >= s.actionClock.cap) return { available: false, reason: 'No actions remain this year' };
  if (s.age < HOLDING_UNLOCK_AGE) return { available: false, reason: `Unlocks at age ${HOLDING_UNLOCK_AGE}` };
  if (s.tags.includes('imprisoned')) return { available: false, reason: 'Imprisoned' };
  if (s.holding.lastActionAge === s.age) return { available: false, reason: 'Managed this year' };
  if (s.rankIdx < action.minRankIdx) return { available: false, reason: `Requires ${RANKS[action.minRankIdx].key}` };
  if (premiumGate(action.minRankIdx, s)) return { available: false, reason: 'Requires premium access' };

  switch (id) {
    case 'open_stores':
      if (s.holding.stores < 14) return { available: false, reason: 'Needs 14 Stores' };
      break;
    case 'sell_surplus':
      if (s.holding.stores < 30) return { available: false, reason: 'Needs 30 Stores' };
      break;
    case 'hold_feast':
      if (s.holding.stores < 12 || s.gold < 10) return { available: false, reason: 'Needs 12 Stores and 10g' };
      break;
    case 'muster_levy':
      if (s.holding.stores < 18 || s.holding.loyalty < 12) return { available: false, reason: 'Needs 18 Stores and 12 Loyalty' };
      break;
    case 'royal_progress': {
      const storesCost = isHoldingUpgradeActive(s, 'royal_road') ? 5 : 10;
      if (s.holding.stores < storesCost || s.gold < 25) return { available: false, reason: `Needs ${storesCost} Stores and 25g` };
      break;
    }
  }
  return { available: true };
}

export function manageHolding(s: GameState, id: string): GameState {
  const availability = holdingActionAvailability(s, id);
  const action = holdingActionById(id);
  if (!action || !availability.available) {
    pushFeed(s, 'HOLDING', C.amber, availability.reason ?? 'That order cannot be given.', 'plain');
    return s;
  }

  switch (id) {
    case 'work_land':
      applyEffects(s, {
        health: -4,
        holding: { stores: 22 + (isHoldingUpgradeActive(s, 'fenced_field') ? 5 : 0) },
        path: { labour: 2 },
      });
      pushFeed(s, 'HOLDING · HARVEST', C.good, 'You work the land from dawn until the moon rises. The barns grow fat; your back files a complaint.', 'good');
      break;
    case 'secure_bounds': {
      const stable = isHoldingUpgradeActive(s, 'stable');
      applyEffects(s, { health: stable ? 0 : -3, holding: { security: 20 + (stable ? 4 : 0) }, path: { martial: 1 } });
      pushFeed(s, 'HOLDING · WATCH', C.blue, stable ? 'Mounted riders mend the bounds and chase trouble beyond sight of the watchtower.' : 'You mend fences, set stout gates, and glare at the road until bandits reconsider their vocation.', 'good');
      break;
    }
    case 'open_stores':
      applyEffects(s, { holding: { stores: -14, loyalty: 18 }, faith: 2, reputation: 3 });
      adjustPopulation(s, 1);
      pushFeed(s, 'HOLDING · ALMS', C.faithDark, 'You open the stores to hungry hands. Supper is thin in your hall, but songs of your kindness travel far.', 'good');
      break;
    case 'sell_surplus': {
      const proceeds = 10 + 3 * s.rankIdx + (isHoldingUpgradeActive(s, 'royal_road') ? 15 : 0);
      applyEffects(s, { holding: { stores: -18 }, gold: proceeds });
      pushFeed(s, 'HOLDING · TRADE', C.good, `Carts carry thy surplus to market and return bearing ${proceeds} gold. Even the mule looks prosperous.`, 'good');
      break;
    }
    case 'collect_dues': {
      const proceeds = 12 + 5 * s.rankIdx;
      const loyaltyCost = isHoldingUpgradeActive(s, 'stewards_hall') ? -10 : -16;
      applyEffects(s, { holding: { loyalty: loyaltyCost }, gold: proceeds, reputation: -5, path: { court: 2 } });
      pushFeed(s, 'HOLDING · DUES', C.amber, `Your collectors return with ${proceeds} gold and a cart full of complaints. Coin is quieter.`, 'plain');
      break;
    }
    case 'hold_feast':
      applyEffects(s, { holding: { stores: -12, loyalty: 20 }, gold: -10, charm: 5, reputation: 4 });
      adjustPopulation(s, 2);
      pushFeed(s, 'HOLDING · FEAST', C.charmDark, 'Your tables groan with meat, bread, and competitive boasting. The people leave full and loudly loyal.', 'good');
      break;
    case 'muster_levy':
      applyEffects(s, { holding: { stores: -18, loyalty: -12, security: 25 }, charm: 5, path: { martial: 3 } });
      pushFeed(s, 'HOLDING · LEVY', C.blue, 'Bells ring, spears gather, and every village contributes somebody who claims to know which end is sharp.', 'plain');
      break;
    case 'royal_progress': {
      const storesCost = isHoldingUpgradeActive(s, 'royal_road') ? -5 : -10;
      applyEffects(s, { holding: { stores: storesCost, loyalty: 25 }, gold: -25, charm: 8, reputation: 6 });
      adjustPopulation(s, 2);
      pushFeed(s, 'HOLDING · PROGRESS', C.purpleDark, 'You tour the realm beneath snapping banners. Roads empty of potholes moments before the royal carriage reaches them.', 'good');
      break;
    }
  }

  s.holding.lastActionAge = s.age;
  return s;
}

export function holdingUpgradeAvailability(s: GameState, id: string): HoldingAvailability {
  const upgrade = holdingUpgradeById(id);
  if (!upgrade) return { available: false, reason: 'Unknown upgrade' };
  if (s.dead || s.event) return { available: false, reason: 'Unavailable just now' };
  if (s.actionClock.used >= s.actionClock.cap) return { available: false, reason: 'No actions remain this year' };
  if (s.age < HOLDING_UNLOCK_AGE) return { available: false, reason: `Unlocks at age ${HOLDING_UNLOCK_AGE}` };
  if (s.tags.includes('imprisoned')) return { available: false, reason: 'Imprisoned' };
  if (ownsUpgrade(s, id)) return { available: false, reason: isHoldingUpgradeActive(s, id) ? 'Owned' : 'Owned · dormant' };
  if (s.rankIdx < upgrade.minRankIdx) return { available: false, reason: `Requires ${RANKS[upgrade.minRankIdx].key}` };
  if (premiumGate(upgrade.minRankIdx, s)) return { available: false, reason: 'Requires premium access' };
  if (s.gold < upgrade.price) return { available: false, reason: `Needs ${upgrade.price}g` };
  return { available: true };
}

export function buyHoldingUpgrade(s: GameState, id: string): GameState {
  const availability = holdingUpgradeAvailability(s, id);
  const upgrade = holdingUpgradeById(id);
  if (!upgrade || !availability.available) {
    pushFeed(s, 'HOLDING', C.amber, availability.reason ?? 'That work cannot begin.', 'plain');
    return s;
  }
  addMoney(s, -upgrade.price);
  s.holding.upgrades = [...s.holding.upgrades, upgrade.id];
  pushFeed(s, 'HOLDING · BUILT', C.good, `${upgrade.name} completed for ${upgrade.price} gold. ${upgrade.desc}`, 'good');
  return s;
}

function lowestResource(s: GameState): HoldingResource {
  const order: HoldingResource[] = ['stores', 'security', 'loyalty'];
  return order.reduce((lowest, key) => (s.holding[key] < s.holding[lowest] ? key : lowest), order[0]);
}

function firstCriticalWarning(s: GameState, lowest: HoldingResource): void {
  if (lowest === 'stores') {
    adjustPopulation(s, -Math.max(2, Math.ceil(holdingPopulation(s) * 0.2)));
    applyEffects(s, { health: -8, holding: { loyalty: -5 } });
    pushFeed(s, 'HOLDING · HUNGER', C.bad, 'The stores run bare. Hunger creeps from cottage to hall, and patience thins with the pottage.', 'bad');
  } else if (lowest === 'security') {
    adjustPopulation(s, -Math.max(1, Math.ceil(holdingPopulation(s) * 0.1)));
    applyEffects(s, { gold: -5, health: -4 });
    pushFeed(s, 'HOLDING · LAWLESS', C.bad, 'Thieves test every weak gate. They leave with five gold and your confidence in local policing.', 'bad');
  } else {
    adjustPopulation(s, -Math.max(1, Math.ceil(holdingPopulation(s) * 0.15)));
    applyEffects(s, { gold: -5, reputation: -8 });
    pushFeed(s, 'HOLDING · MURMURS', C.bad, 'The people mutter openly and pay poorly. Five gold vanishes beneath a remarkably united shrug.', 'bad');
  }
}

function severeCrisis(s: GameState, lowest: HoldingResource): void {
  if (lowest === 'stores') {
    adjustPopulation(s, -Math.max(3, Math.ceil(holdingPopulation(s) * 0.3)));
    applyEffects(s, { health: -25, holding: { stores: 25 - s.holding.stores, loyalty: -10 } });
    addMemory(s, 'holding_famine', 4);
    pushFeed(s, 'HOLDING · FAMINE', C.bad, 'Famine takes the land by the throat. Seed grain is broken open at last, saving some and weakening all.', 'bad');
  } else if (lowest === 'security') {
    adjustPopulation(s, -Math.max(2, Math.ceil(holdingPopulation(s) * 0.2)));
    const active = s.holding.upgrades.filter((id) => isHoldingUpgradeActive(s, id));
    const destroyed = active.length ? pick(active) : null;
    if (destroyed) s.holding.upgrades = s.holding.upgrades.filter((id) => id !== destroyed);
    applyEffects(s, { health: -15, holding: { security: 25 - s.holding.security } });
    addMemory(s, 'holding_disaster', 4, destroyed ?? undefined);
    const lostText = destroyed ? ` The ${holdingUpgradeById(destroyed)?.name.toLowerCase()} is destroyed.` : '';
    pushFeed(s, 'HOLDING · DISASTER', C.bad, `Fire and raiders tear through the undefended holding.${lostText}`, 'bad');
  } else {
    adjustPopulation(s, -Math.max(2, Math.ceil(holdingPopulation(s) * 0.25)));
    const loss = Math.floor(s.gold * 0.25);
    const wasRanked = s.rankIdx > 0;
    applyEffects(s, { gold: -loss, holding: { loyalty: 25 - s.holding.loyalty }, ...(s.rankIdx > 0 ? { demote: true } : { prison: true }) });
    addMemory(s, 'holding_revolt', 5);
    pushFeed(
      s,
      'HOLDING · REVOLT',
      C.bad,
      wasRanked
        ? `The banners come down and the gates open from within. You lose ${loss} gold and a station in the reckoning.`
        : `The crofters rise, seize ${loss} gold, and deliver you to the reeve in your own turnip cart.`,
      'bad',
    );
  }
}

/** Resolve the outgoing year's Holding upkeep after age has incremented. */
export function tickHoldingYear(s: GameState): GameState {
  const outgoingAge = s.age - 1;
  if (outgoingAge < HOLDING_UNLOCK_AGE) return s;
  adjustPopulation(s, 0);

  if (s.holding.lastActionAge !== outgoingAge) {
    applyEffects(s, {
      holding: {
        stores: 8,
        security: 6,
        loyalty: isHoldingUpgradeActive(s, 'stewards_hall') ? 3 : 0,
      },
    });
  }

  // Judge the year's result before ordinary upkeep so the visible 75 target is
  // the real target. Upkeep becomes the starting pressure for the next year.
  const lowest = Math.min(s.holding.stores, s.holding.security, s.holding.loyalty);
  if (lowest >= 60) {
    adjustPopulation(s, s.holding.stores >= 75 && s.holding.security >= 75 && s.holding.loyalty >= 75 ? 2 : 1);
  } else if (lowest >= 15 && lowest < 25) {
    adjustPopulation(s, -Math.max(1, Math.ceil(holdingPopulation(s) * 0.1)));
  }

  if (s.holding.stores >= 75 && s.holding.security >= 75 && s.holding.loyalty >= 75) {
    const reward = holdingProsperityReward(s);
    applyEffects(s, { gold: reward, reputation: 2 });
    pushFeed(s, `HOLDING · ${holdingTitle(s.rankIdx).toUpperCase()}`, C.good, `The holding flourishes. Full stores, safe roads, and loyal voices bring ${reward} gold to thy purse.`, 'good');
  }

  const upkeep = holdingYearlyUpkeep(s);
  applyEffects(s, { holding: { stores: -upkeep.stores, security: -upkeep.security } });

  if (Math.min(s.holding.stores, s.holding.security, s.holding.loyalty) < 15) {
    s.holding.criticalYears += 1;
    const lowest = lowestResource(s);
    if (s.holding.criticalYears >= 2) {
      severeCrisis(s, lowest);
      s.holding.criticalYears = 0;
    } else {
      firstCriticalWarning(s, lowest);
    }
  } else {
    s.holding.criticalYears = 0;
  }

  return s;
}
