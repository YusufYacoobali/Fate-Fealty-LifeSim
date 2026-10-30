import { CareerDef, GameState } from '@/types/game';

export const CAREERS: CareerDef[] = [
  { id: 'farmhand', family: 'agriculture', title: 'Farmhand', icon: '🌾', tier: 0, minAge: 6, minRankIdx: 0, wage: 5, healthRisk: 2, promotesTo: 'tenant_farmer', desc: 'Work another person’s soil for honest coin.' },
  { id: 'tenant_farmer', family: 'agriculture', title: 'Tenant Farmer', icon: '🚜', tier: 1, minAge: 16, minRankIdx: 0, minStats: { health: 45 }, wage: 8, healthRisk: 2, promotesTo: 'reeve', desc: 'Manage fields, rents, and a deeply judgmental ox.' },
  { id: 'reeve', family: 'agriculture', title: 'Reeve', icon: '📜', tier: 2, minAge: 24, minRankIdx: 0, minStats: { wits: 58 }, wage: 13, promotesTo: 'estate_bailiff', desc: 'Keep the village accounts and the villagers guessing.' },
  { id: 'apprentice', family: 'craft', title: 'Craft Apprentice', icon: '🔨', tier: 0, minAge: 10, minRankIdx: 0, wage: 5, healthRisk: 1, promotesTo: 'artisan', desc: 'Learn a trade while being blamed for every bent nail.' },
  { id: 'artisan', family: 'craft', title: 'Journeyman Artisan', icon: '⚒️', tier: 1, minAge: 16, minRankIdx: 0, minStats: { wits: 48 }, wage: 9, healthRisk: 1, promotesTo: 'master_artisan', desc: 'Turn skill, sweat, and raw materials into coin.' },
  { id: 'master_artisan', family: 'craft', title: 'Master Artisan', icon: '🛠️', tier: 2, minAge: 24, minRankIdx: 0, minStats: { wits: 65 }, wage: 15, promotesTo: 'guildmaster', desc: 'Run a respected workshop and complain about apprentices.' },
  { id: 'hawker', family: 'trade', title: 'Market Hawker', icon: '🧺', tier: 0, minAge: 8, minRankIdx: 0, wage: 5, promotesTo: 'trader', desc: 'Sell pies, cloth, and confidence in equal measure.' },
  { id: 'trader', family: 'trade', title: 'Trader', icon: '🪙', tier: 1, minAge: 16, minRankIdx: 0, minStats: { charm: 48 }, wage: 10, promotesTo: 'merchant', desc: 'Buy low, sell high, and remember which mule is yours.' },
  { id: 'merchant', family: 'trade', title: 'Guild Merchant', icon: '⚖️', tier: 2, minAge: 25, minRankIdx: 0, minStats: { charm: 62, wits: 58 }, wage: 17, promotesTo: 'trade_magnate', desc: 'Move goods across the realm and make arithmetic look noble.' },
  { id: 'acolyte', family: 'church', title: 'Acolyte', icon: '🕯️', tier: 0, minAge: 8, minRankIdx: 0, minStats: { faith: 35 }, wage: 4, promotesTo: 'cleric', desc: 'Tend candles, copy prayers, and resist eating the altar bread.' },
  { id: 'cleric', family: 'church', title: 'Cleric', icon: '⛪', tier: 1, minAge: 18, minRankIdx: 0, minStats: { faith: 55, wits: 45 }, wage: 9, promotesTo: 'prior', desc: 'Guide souls while balancing a surprisingly earthly ledger.' },
  { id: 'prior', family: 'church', title: 'Prior', icon: '✝️', tier: 2, minAge: 30, minRankIdx: 0, minStats: { faith: 72, wits: 58 }, wage: 15, promotesTo: 'abbot', desc: 'Lead a religious house and settle disputes over soup.' },
  { id: 'levy', family: 'martial', title: 'Levy Hand', icon: '🗡️', tier: 0, minAge: 14, minRankIdx: 0, minStats: { health: 42 }, wage: 6, healthRisk: 4, promotesTo: 'guard', desc: 'Carry a spear and hope the other side stays home.' },
  { id: 'guard', family: 'martial', title: 'Man-at-Arms', icon: '🛡️', tier: 1, minAge: 18, minRankIdx: 0, minStats: { health: 55, wits: 42 }, wage: 11, healthRisk: 3, promotesTo: 'marshal', desc: 'Keep roads safe and tavern furniture nervous.' },
  { id: 'marshal', family: 'martial', title: 'Marshal', icon: '⚔️', tier: 2, minAge: 28, minRankIdx: 0, minStats: { charm: 55, wits: 60 }, wage: 18, healthRisk: 2, promotesTo: 'captain_general', desc: 'Command soldiers who all claim to know a shorter road.' },
  { id: 'clerk', family: 'court', title: 'Court Clerk', icon: '🪶', tier: 0, minAge: 14, minRankIdx: 0, minStats: { wits: 45 }, wage: 7, promotesTo: 'steward', desc: 'Copy laws, letters, and other people’s poor decisions.' },
  { id: 'steward', family: 'court', title: 'Steward', icon: '🔑', tier: 1, minAge: 21, minRankIdx: 0, minStats: { wits: 58, charm: 48 }, wage: 13, promotesTo: 'chancellor', desc: 'Manage a household large enough to have politics.' },
  { id: 'chancellor', family: 'court', title: 'Chancellor', icon: '👑', tier: 2, minAge: 32, minRankIdx: 0, minStats: { wits: 72, charm: 68 }, wage: 21, promotesTo: 'royal_minister', desc: 'Advise the powerful and survive being correct.' },
  { id: 'poacher_job', family: 'outlaw', title: 'Poacher', icon: '🦌', tier: 0, minAge: 12, minRankIdx: 0, wage: 8, healthRisk: 3, promotesTo: 'cutpurse', desc: 'Earn illegal venison and legal-looking excuses.' },
  { id: 'cutpurse', family: 'outlaw', title: 'Cutpurse', icon: '🤏', tier: 1, minAge: 16, minRankIdx: 0, minStats: { wits: 48 }, wage: 12, healthRisk: 4, promotesTo: 'bandit_chief', desc: 'Separate purses from owners with professional delicacy.' },
  { id: 'bandit_chief', family: 'outlaw', title: 'Bandit Chief', icon: '🗡️', tier: 2, minAge: 24, minRankIdx: 0, minStats: { charm: 55, wits: 58 }, wage: 19, healthRisk: 5, promotesTo: 'outlaw_legend', desc: 'Lead outlaws, divide loot, and distrust everyone equally.' },
  { id: 'herb_gatherer', family: 'medicine', title: 'Herb Gatherer', icon: '🌿', tier: 0, minAge: 8, minRankIdx: 0, minStats: { wits: 32 }, wage: 5, promotesTo: 'barber_surgeon', desc: 'Learn which leaves soothe fever and which merely improve a funeral.' },
  { id: 'barber_surgeon', family: 'medicine', title: 'Barber-Surgeon', icon: '🩹', tier: 1, minAge: 17, minRankIdx: 0, minStats: { wits: 50, health: 42 }, wage: 11, healthRisk: 2, promotesTo: 'physician', desc: 'Set bones, stitch wounds and keep thy instruments convincingly clean.' },
  { id: 'physician', family: 'medicine', title: 'Physician', icon: '⚕️', tier: 2, minAge: 27, minRankIdx: 0, minStats: { wits: 68 }, wage: 19, desc: 'Treat difficult patients while easier ones question the fee.' },
  { id: 'busker', family: 'entertainment', title: 'Village Busker', icon: '🪕', tier: 0, minAge: 8, minRankIdx: 0, minStats: { charm: 35 }, wage: 5, promotesTo: 'minstrel', desc: 'Turn songs, stories and shamelessness into supper.' },
  { id: 'minstrel', family: 'entertainment', title: 'Travelling Minstrel', icon: '🎵', tier: 1, minAge: 16, minRankIdx: 0, minStats: { charm: 52 }, wage: 10, promotesTo: 'court_poet', desc: 'Carry news between halls and improve it wherever necessary.' },
  { id: 'court_poet', family: 'entertainment', title: 'Court Poet', icon: '🎭', tier: 2, minAge: 24, minRankIdx: 0, minStats: { charm: 66, wits: 55 }, wage: 17, desc: 'Praise powerful people in metre while insulting their enemies in rhyme.' },
  { id: 'copyist', family: 'law', title: 'Legal Copyist', icon: '📜', tier: 0, minAge: 12, minRankIdx: 0, minStats: { wits: 40 }, wage: 6, promotesTo: 'advocate', desc: 'Copy claims, contracts and errors that later become precedent.' },
  { id: 'advocate', family: 'law', title: 'Advocate', icon: '⚖️', tier: 1, minAge: 19, minRankIdx: 0, minStats: { wits: 58, charm: 50 }, wage: 13, promotesTo: 'justice', desc: 'Argue law before people who already have opinions.' },
  { id: 'justice', family: 'law', title: 'Justice', icon: '🏛️', tier: 2, minAge: 30, minRankIdx: 0, minStats: { wits: 72, charm: 58 }, wage: 20, desc: 'Turn testimony, custom and power into judgments that outlive the hearing.' },
  { id: 'estate_bailiff', family: 'agriculture', title: 'Estate Bailiff', icon: '🏡', tier: 3, minAge: 32, minRankIdx: 0, minStats: { wits: 68 }, wage: 24, premium: true, prestige: true, desc: 'Direct the fields and rents of an estate large enough to have enemies.' },
  { id: 'guildmaster', family: 'craft', title: 'Guildmaster', icon: '🏅', tier: 3, minAge: 32, minRankIdx: 0, minStats: { wits: 70, charm: 58 }, wage: 25, premium: true, prestige: true, desc: 'Set standards, settle disputes and decide whose work receives the guild seal.' },
  { id: 'trade_magnate', family: 'trade', title: 'Trade Magnate', icon: '💰', tier: 3, minAge: 34, minRankIdx: 0, minStats: { charm: 72, wits: 64 }, wage: 28, premium: true, prestige: true, desc: 'Move enough goods that lords begin asking thy opinion.' },
  { id: 'abbot', family: 'church', title: 'Abbot', icon: '⛪', tier: 3, minAge: 36, minRankIdx: 0, minStats: { faith: 78, wits: 62 }, wage: 23, premium: true, prestige: true, desc: 'Lead a wealthy religious house and answer for every soul, field and cellar.' },
  { id: 'captain_general', family: 'martial', title: 'Captain-General', icon: '⚔️', tier: 3, minAge: 34, minRankIdx: 0, minStats: { health: 68, charm: 64 }, wage: 29, healthRisk: 2, premium: true, prestige: true, desc: 'Command the forces others merely promise to provide.' },
  { id: 'royal_minister', family: 'court', title: 'Royal Minister', icon: '👑', tier: 3, minAge: 36, minRankIdx: 0, minStats: { wits: 76, charm: 70 }, wage: 30, premium: true, prestige: true, desc: 'Shape decrees before the monarch discovers they were thy idea.' },
  { id: 'outlaw_legend', family: 'outlaw', title: 'Outlaw Legend', icon: '🏴', tier: 3, minAge: 30, minRankIdx: 0, minStats: { charm: 66, wits: 68 }, wage: 27, healthRisk: 5, premium: true, prestige: true, desc: 'Become the name whispered by travellers and cursed by sheriffs.' },
];

export const ENTRY_CAREERS = CAREERS.filter((career) => career.tier === 0);

export function careerById(id: string | null): CareerDef | undefined {
  return id ? CAREERS.find((career) => career.id === id) : undefined;
}

export function careerAvailability(state: GameState, career: CareerDef): string | null {
  if (state.dead) return 'Thy life is ended';
  if (career.premium && !state.lifetimeUnlocked) return 'Requires the Lifetime Pass';
  if (state.age < career.minAge) return `Requires age ${career.minAge}`;
  if (career.minReputation != null && state.reputation < career.minReputation) return 'Thy reputation is too low';
  for (const [key, value] of Object.entries(career.minStats ?? {})) {
    if (state.stats[key as keyof typeof state.stats] < (value ?? 0)) return `Needs ${key} ${value}`;
  }
  return null;
}
