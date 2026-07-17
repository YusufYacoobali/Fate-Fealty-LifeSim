import { HoldingActionDef, HoldingState, HoldingUpgradeDef } from '@/types/game';

export const HOLDING_UNLOCK_AGE = 6;

export const HOLDING_TITLES = [
  'Family Croft',
  "Squire's Homestead",
  "Knight's Manor",
  'Noble Estate',
  'Barony',
  'Royal Realm',
] as const;

export function freshHolding(): HoldingState {
  return {
    stores: 60,
    security: 60,
    loyalty: 60,
    upgrades: [],
    lastActionAge: null,
    criticalYears: 0,
  };
}

export const HOLDING_ACTIONS: HoldingActionDef[] = [
  { id: 'work_land', name: 'WORK THE LAND', icon: '🌾', desc: 'Fill the stores through honest toil.', minRankIdx: 0 },
  { id: 'secure_bounds', name: 'SECURE BOUNDS', icon: '🛡️', desc: 'Mend fences and guard the roads.', minRankIdx: 0 },
  { id: 'open_stores', name: 'OPEN THE STORES', icon: '🍞', desc: 'Feed thy people and earn their love.', minRankIdx: 0 },
  { id: 'sell_surplus', name: 'SELL SURPLUS', icon: '🪙', desc: 'Turn a full storehouse into coin.', minRankIdx: 1 },
  { id: 'collect_dues', name: 'COLLECT DUES', icon: '📜', desc: 'Demand the coin owed to thy station.', minRankIdx: 2 },
  { id: 'hold_feast', name: 'HOLD A FEAST', icon: '🍗', desc: 'Win loyalty with a groaning table.', minRankIdx: 3 },
  { id: 'muster_levy', name: 'MUSTER THE LEVY', icon: '⚔️', desc: 'Call the barony to arms.', minRankIdx: 4 },
  { id: 'royal_progress', name: 'ROYAL PROGRESS', icon: '👑', desc: 'Tour the realm and be seen to rule.', minRankIdx: 5 },
];

export const HOLDING_UPGRADES: HoldingUpgradeDef[] = [
  { id: 'fenced_field', name: 'FENCED FIELD', icon: '🌱', price: 18, minRankIdx: 0, desc: 'Work the Land gains +5 Stores.' },
  { id: 'smokehouse', name: 'SMOKEHOUSE', icon: '🏚️', price: 24, minRankIdx: 0, desc: 'Annual Stores upkeep is reduced by 2.' },
  { id: 'stable', name: 'STABLE', icon: '🐴', price: 38, minRankIdx: 1, desc: 'Secure Bounds costs no Health and gains +4 Security.' },
  { id: 'granary', name: 'GRANARY', icon: '🌾', price: 60, minRankIdx: 2, desc: 'Annual Stores upkeep is reduced by another 2.' },
  { id: 'watchtower', name: 'WATCHTOWER', icon: '🗼', price: 70, minRankIdx: 2, desc: 'Annual Security upkeep is reduced by 2.' },
  { id: 'watermill', name: 'WATERMILL', icon: '⚙️', price: 95, minRankIdx: 3, desc: 'A flourishing Holding earns 8 extra gold.' },
  { id: 'stewards_hall', name: "STEWARD'S HALL", icon: '🏛️', price: 140, minRankIdx: 4, desc: 'Maintain adds Loyalty and Collect Dues is gentler.' },
  { id: 'royal_road', name: 'ROYAL ROAD', icon: '🛤️', price: 220, minRankIdx: 5, desc: 'Trade earns more and a Royal Progress uses fewer Stores.' },
];

export function holdingTitle(rankIdx: number): string {
  return HOLDING_TITLES[Math.max(0, Math.min(HOLDING_TITLES.length - 1, rankIdx))];
}

export function holdingActionById(id: string): HoldingActionDef | undefined {
  return HOLDING_ACTIONS.find((action) => action.id === id);
}

export function holdingUpgradeById(id: string): HoldingUpgradeDef | undefined {
  return HOLDING_UPGRADES.find((upgrade) => upgrade.id === id);
}
