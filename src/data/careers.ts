import { CareerDef, GameState } from '@/types/game';
import { RANKS } from './ranks';

export const CAREERS: CareerDef[] = [
  { id: 'farmhand', family: 'agriculture', title: 'Farmhand', icon: '🌾', tier: 0, minAge: 6, minRankIdx: 0, wage: 5, healthRisk: 2, promotesTo: 'tenant_farmer', desc: 'Work another person’s soil for honest coin.' },
  { id: 'tenant_farmer', family: 'agriculture', title: 'Tenant Farmer', icon: '🚜', tier: 1, minAge: 16, minRankIdx: 0, minStats: { health: 45 }, wage: 8, healthRisk: 2, promotesTo: 'reeve', desc: 'Manage fields, rents, and a deeply judgmental ox.' },
  { id: 'reeve', family: 'agriculture', title: 'Reeve', icon: '📜', tier: 2, minAge: 24, minRankIdx: 1, minStats: { wits: 58 }, wage: 13, desc: 'Keep the village accounts and the villagers guessing.' },
  { id: 'apprentice', family: 'craft', title: 'Craft Apprentice', icon: '🔨', tier: 0, minAge: 10, minRankIdx: 0, wage: 5, healthRisk: 1, promotesTo: 'artisan', desc: 'Learn a trade while being blamed for every bent nail.' },
  { id: 'artisan', family: 'craft', title: 'Journeyman Artisan', icon: '⚒️', tier: 1, minAge: 16, minRankIdx: 0, minStats: { wits: 48 }, wage: 9, healthRisk: 1, promotesTo: 'master_artisan', desc: 'Turn skill, sweat, and raw materials into coin.' },
  { id: 'master_artisan', family: 'craft', title: 'Master Artisan', icon: '🛠️', tier: 2, minAge: 24, minRankIdx: 1, minStats: { wits: 65 }, wage: 15, desc: 'Run a respected workshop and complain about apprentices.' },
  { id: 'hawker', family: 'trade', title: 'Market Hawker', icon: '🧺', tier: 0, minAge: 8, minRankIdx: 0, wage: 5, promotesTo: 'trader', desc: 'Sell pies, cloth, and confidence in equal measure.' },
  { id: 'trader', family: 'trade', title: 'Trader', icon: '🪙', tier: 1, minAge: 16, minRankIdx: 0, minStats: { charm: 48 }, wage: 10, promotesTo: 'merchant', desc: 'Buy low, sell high, and remember which mule is yours.' },
  { id: 'merchant', family: 'trade', title: 'Guild Merchant', icon: '⚖️', tier: 2, minAge: 25, minRankIdx: 1, minStats: { charm: 62, wits: 58 }, wage: 17, desc: 'Move goods across the realm and make arithmetic look noble.' },
  { id: 'acolyte', family: 'church', title: 'Acolyte', icon: '🕯️', tier: 0, minAge: 8, minRankIdx: 0, minStats: { faith: 35 }, wage: 4, promotesTo: 'cleric', desc: 'Tend candles, copy prayers, and resist eating the altar bread.' },
  { id: 'cleric', family: 'church', title: 'Cleric', icon: '⛪', tier: 1, minAge: 18, minRankIdx: 0, minStats: { faith: 55, wits: 45 }, wage: 9, promotesTo: 'prior', desc: 'Guide souls while balancing a surprisingly earthly ledger.' },
  { id: 'prior', family: 'church', title: 'Prior', icon: '✝️', tier: 2, minAge: 30, minRankIdx: 2, minStats: { faith: 72, wits: 58 }, wage: 15, desc: 'Lead a religious house and settle disputes over soup.' },
  { id: 'levy', family: 'martial', title: 'Levy Hand', icon: '🗡️', tier: 0, minAge: 14, minRankIdx: 0, minStats: { health: 42 }, wage: 6, healthRisk: 4, promotesTo: 'guard', desc: 'Carry a spear and hope the other side stays home.' },
  { id: 'guard', family: 'martial', title: 'Man-at-Arms', icon: '🛡️', tier: 1, minAge: 18, minRankIdx: 1, minStats: { health: 55, wits: 42 }, wage: 11, healthRisk: 3, promotesTo: 'marshal', desc: 'Keep roads safe and tavern furniture nervous.' },
  { id: 'marshal', family: 'martial', title: 'Marshal', icon: '⚔️', tier: 2, minAge: 28, minRankIdx: 2, minStats: { charm: 55, wits: 60 }, wage: 18, healthRisk: 2, desc: 'Command soldiers who all claim to know a shorter road.' },
  { id: 'clerk', family: 'court', title: 'Court Clerk', icon: '🪶', tier: 0, minAge: 14, minRankIdx: 0, minStats: { wits: 45 }, wage: 7, promotesTo: 'steward', desc: 'Copy laws, letters, and other people’s poor decisions.' },
  { id: 'steward', family: 'court', title: 'Steward', icon: '🔑', tier: 1, minAge: 21, minRankIdx: 1, minStats: { wits: 58, charm: 48 }, wage: 13, promotesTo: 'chancellor', desc: 'Manage a household large enough to have politics.' },
  { id: 'chancellor', family: 'court', title: 'Chancellor', icon: '👑', tier: 2, minAge: 32, minRankIdx: 3, minStats: { wits: 72, charm: 68 }, wage: 21, desc: 'Advise the powerful and survive being correct.' },
  { id: 'poacher_job', family: 'outlaw', title: 'Poacher', icon: '🦌', tier: 0, minAge: 12, minRankIdx: 0, wage: 8, healthRisk: 3, promotesTo: 'cutpurse', desc: 'Earn illegal venison and legal-looking excuses.' },
  { id: 'cutpurse', family: 'outlaw', title: 'Cutpurse', icon: '🤏', tier: 1, minAge: 16, minRankIdx: 0, minStats: { wits: 48 }, wage: 12, healthRisk: 4, promotesTo: 'bandit_chief', desc: 'Separate purses from owners with professional delicacy.' },
  { id: 'bandit_chief', family: 'outlaw', title: 'Bandit Chief', icon: '🗡️', tier: 2, minAge: 24, minRankIdx: 0, minStats: { charm: 55, wits: 58 }, wage: 19, healthRisk: 5, desc: 'Lead outlaws, divide loot, and distrust everyone equally.' },
];

export const ENTRY_CAREERS = CAREERS.filter((career) => career.tier === 0);

export function careerById(id: string | null): CareerDef | undefined {
  return id ? CAREERS.find((career) => career.id === id) : undefined;
}

export function careerAvailability(state: GameState, career: CareerDef): string | null {
  if (state.dead) return 'Thy life is ended';
  if (state.age < career.minAge) return `Requires age ${career.minAge}`;
  if (state.rankIdx < career.minRankIdx) return `Requires ${RANKS[career.minRankIdx].key}`;
  if (career.minReputation != null && state.reputation < career.minReputation) return 'Thy reputation is too low';
  for (const [key, value] of Object.entries(career.minStats ?? {})) {
    if (state.stats[key as keyof typeof state.stats] < (value ?? 0)) return `Needs ${key} ${value}`;
  }
  return null;
}
