import { ActivityCategory, ActivityDef } from '@/types/game';
import { C } from '@/theme/theme';

/**
 * Age minimums are balanced against the rank gates (Squire needs age 14,
 * Knight 20): training opens at 8 so a dedicated child can build toward
 * squirehood, crime opens gradually, and adult vices wait for 14. BODY care
 * stays open from birth so an ailing babe can always be treated.
 */
export const ACTIVITY_DEFS: ActivityDef[] = [
  { id: 'tavern', cat: 'leisure', name: 'TAVERN', icon: '🍺', iconBg: C.charm, desc: 'Drink, sing, brawl', minAge: 14 },
  { id: 'dice', cat: 'leisure', name: 'DICE', icon: '🎲', iconBg: C.health, desc: 'Gamble thy coin', minAge: 10 },
  { id: 'feast', cat: 'leisure', name: 'FEAST', icon: '🍗', iconBg: C.orange, desc: 'Host a merry feast', minAge: 14 },
  { id: 'fair', cat: 'leisure', name: 'FAIR', icon: '🎪', iconBg: C.purple, desc: 'Juggle at the fair', minAge: 4 },
  { id: 'fields', cat: 'work', name: 'FIELDS', icon: '🌾', iconBg: '#cda35f', desc: 'Honest turnip toil', minAge: 6 },
  { id: 'blacksmith', cat: 'work', name: 'FORGE', icon: '🔨', iconBg: C.light, desc: 'Sweat for coin', minAge: 10 },
  { id: 'market', cat: 'work', name: 'MARKET', icon: '🧺', iconBg: C.faith, desc: 'Sell thy wares', minAge: 8 },
  { id: 'church', cat: 'faith', name: 'CHAPEL', icon: '⛪', iconBg: C.faith, desc: 'Pray for thy soul', minAge: 4 },
  { id: 'pilgrimage', cat: 'faith', name: 'PILGRIM', icon: '🧎', iconBg: C.light, desc: 'Walk to the shrine', minAge: 12 },
  { id: 'train', cat: 'martial', name: 'THE KEEP', icon: '🛡️', iconBg: C.light, desc: 'Train for knighthood', minAge: 8 },
  { id: 'quest', cat: 'martial', name: 'QUEST', icon: '📜', iconBg: C.purple, desc: 'Heed the notice board', minAge: 12 },
  { id: 'tournament', cat: 'martial', name: 'TOURNEY', icon: '🐎', iconBg: C.charm, desc: 'Joust for glory', minAge: 14 },
  { id: 'poach', cat: 'crime', name: 'POACH', icon: '🦌', iconBg: '#9bc46a', desc: 'Hunt royal deer', minAge: 10 },
  { id: 'pickpocket', cat: 'crime', name: 'PICKPOCKET', icon: '🤲', iconBg: C.health, desc: 'Lift a fat purse', minAge: 8 },
  { id: 'banditry', cat: 'crime', name: 'BANDITRY', icon: '🗡️', iconBg: '#cda35f', desc: 'Rob the road', minAge: 14 },
  { id: 'torch_holding', cat: 'crime', name: 'TORCH A HOLDING', icon: '🔥', iconBg: C.health, desc: 'HIGH RISK · arson, injury and the gallows', minAge: 14, danger: 'high' },
  { id: 'bloody_raid', cat: 'crime', name: 'LEAD A BLOODY RAID', icon: '⚔️', iconBg: '#7a1f2a', desc: 'EXTREME · wealth, wounds and outlawry', minAge: 16, danger: 'extreme' },
  { id: 'ale_binge', cat: 'vice', name: 'DRINK TO OBLIVION', icon: '🍺', iconBg: C.amber, desc: 'HIGH RISK · lose health, coin and dignity', minAge: 14, danger: 'high' },
  { id: 'poppy_draught', cat: 'vice', name: 'ABUSE POPPY DRAUGHT', icon: '🌺', iconBg: C.purple, desc: 'HIGH RISK · stupor and lasting sickness', minAge: 14, danger: 'high' },
  { id: 'reckless_brawl', cat: 'vice', name: 'FIGHT THE WHOLE TAVERN', icon: '👊', iconBg: C.health, desc: 'EXTREME · catastrophic injury likely', minAge: 11, danger: 'extreme' },
  { id: 'winter_exposure', cat: 'vice', name: 'SLEEP IN THE WINTER ROAD', icon: '❄️', iconBg: C.blue, desc: 'EXTREME · exposure can kill quickly', minAge: 11, danger: 'extreme' },
  { id: 'monkshood_vial', cat: 'vice', name: 'QUAFF THE BLACK VIAL', icon: '☠️', iconBg: '#7a1f2a', desc: 'FATAL · death is certain', minAge: 11, danger: 'extreme' },
  { id: 'leech', cat: 'health', name: 'DOCTOR', icon: '🩸', iconBg: '#f3a0a0', desc: 'Leeches cure all' },
  { id: 'bathhouse', cat: 'health', name: 'BATHHOUSE', icon: '🛁', iconBg: C.teal, desc: 'A rare hot bath' },
  { id: 'herbalist', cat: 'health', name: 'HERBALIST', icon: '🌿', iconBg: C.faith, desc: 'A potent tonic' },
  { id: 'village_service', cat: 'work', name: 'VILLAGE DUTY', icon: '🧺', iconBg: C.faith, desc: 'Help thy neighbours', minAge: 8, roles: ['commoner'] },
  { id: 'gather_fuel', cat: 'work', name: 'GATHER FUEL', icon: '🪵', iconBg: C.charm, desc: 'Prepare the household', minAge: 6, roles: ['commoner'] },
  { id: 'manage_workshop', cat: 'work', name: 'WORKSHOP', icon: '⚒️', iconBg: C.light, desc: 'Build thy trade', minAge: 16, roles: ['artisan_merchant'] },
  { id: 'guild_bargain', cat: 'work', name: 'GUILD', icon: '⚖️', iconBg: C.charm, desc: 'Win guild influence', minAge: 18, roles: ['artisan_merchant'] },
  { id: 'hear_confession', cat: 'faith', name: 'CONFESSION', icon: '🕯️', iconBg: C.faith, desc: 'Guide a troubled soul', minAge: 18, roles: ['clergy'] },
  { id: 'copy_manuscript', cat: 'faith', name: 'SCRIPTORIUM', icon: '📜', iconBg: C.light, desc: 'Preserve wisdom', minAge: 12, roles: ['clergy'] },
  { id: 'lead_patrol', cat: 'martial', name: 'PATROL', icon: '🛡️', iconBg: C.light, desc: 'Keep the roads safe', minAge: 16, roles: ['martial'] },
  { id: 'drill_levy', cat: 'martial', name: 'DRILL LEVY', icon: '⚔️', iconBg: C.health, desc: 'Prepare for war', minAge: 18, roles: ['martial'] },
  { id: 'hear_petitions', cat: 'work', name: 'PETITIONS', icon: '📜', iconBg: C.purple, desc: 'Judge local disputes', minAge: 18, roles: ['landed_noble'] },
  { id: 'host_court', cat: 'leisure', name: 'HOST COURT', icon: '🏰', iconBg: C.charm, desc: 'Manage alliances', minAge: 18, roles: ['landed_noble'] },
  { id: 'hold_council', cat: 'work', name: 'COUNCIL', icon: '👑', iconBg: C.purple, desc: 'Rule through counsel', minAge: 18, roles: ['monarch'] },
  { id: 'royal_audience', cat: 'leisure', name: 'AUDIENCE', icon: '⚜️', iconBg: C.charm, desc: 'Shape legitimacy', minAge: 18, roles: ['monarch'] },
  { id: 'plan_heist', cat: 'crime', name: 'PLAN HEIST', icon: '🗝️', iconBg: C.health, desc: 'Prepare a rich theft', minAge: 16, roles: ['outlaw'] },
  { id: 'rally_gang', cat: 'crime', name: 'RALLY GANG', icon: '🗡️', iconBg: C.purple, desc: 'Secure outlaw loyalty', minAge: 16, roles: ['outlaw'] },
  { id: 'courting', cat: 'leisure', name: 'GO COURTING', icon: '🌹', iconBg: C.health, desc: 'Seek out a match', minAge: 16 },
  { id: 'teach_child', cat: 'leisure', name: 'TEACH CHILD', icon: '📖', iconBg: C.light, desc: 'Shape a young mind', minAge: 18 },
  { id: 'arrange_gathering', cat: 'leisure', name: 'GATHERING', icon: '🕯️', iconBg: C.charm, desc: 'Bring households together', minAge: 16 },
  { id: 'care_relative', cat: 'health', name: 'FAMILY CARE', icon: '🤲', iconBg: C.teal, desc: 'Nurse an ailing relative', minAge: 10 },
  { id: 'rest', cat: 'health', name: 'REST', icon: '🛏️', iconBg: C.light, desc: 'Recover in quiet', minAge: 4 },
  { id: 'treat_patient', cat: 'health', name: 'TREAT PATIENT', icon: '🌿', iconBg: C.faith, desc: 'Practice healing', minAge: 14 },
  { id: 'fence_goods', cat: 'crime', name: 'FENCE GOODS', icon: '🪙', iconBg: C.health, desc: 'Sell questionable wares', minAge: 14 },
  { id: 'bribe_official', cat: 'crime', name: 'BRIBE', icon: '🤝', iconBg: C.charm, desc: 'Purchase official doubt', minAge: 16 },
  { id: 'scout_target', cat: 'crime', name: 'SCOUT TARGET', icon: '👁️', iconBg: C.purple, desc: 'Prepare before acting', minAge: 12 },
  { id: 'study_trade', cat: 'work', name: 'STUDY TRADE', icon: '📚', iconBg: C.light, desc: 'Improve professional skill', minAge: 10 },
  { id: 'seek_patron', cat: 'work', name: 'SEEK PATRON', icon: '🏛️', iconBg: C.charm, desc: 'Find influential support', minAge: 16 },
  { id: 'run_caravan', cat: 'work', name: 'CARAVAN', icon: '🐴', iconBg: C.amber, desc: 'Risk coin on the road', minAge: 16 },
  { id: 'preach_sermon', cat: 'faith', name: 'PREACH', icon: '⛪', iconBg: C.faith, desc: 'Move the parish', minAge: 16 },
  { id: 'gather_intelligence', cat: 'leisure', name: 'INTELLIGENCE', icon: '🪶', iconBg: C.purple, desc: 'Learn what power hides', minAge: 16 },
  { id: 'negotiate_levy', cat: 'martial', name: 'NEGOTIATE LEVY', icon: '📜', iconBg: C.health, desc: 'Reduce the war burden', minAge: 18 },
  { id: 'repair_household', cat: 'work', name: 'REPAIR HOME', icon: '🔨', iconBg: C.amber, desc: 'Strengthen thy roof', minAge: 12 },
  { id: 'manage_stores', cat: 'work', name: 'MANAGE STORES', icon: '🌾', iconBg: C.faith, desc: 'Protect household food', minAge: 10 },
];

export interface CatDef {
  id: ActivityCategory | 'all';
  label: string;
  bg: string;
  sd: string;
  fg: string;
}

export const CATEGORIES: CatDef[] = [
  { id: 'all', label: 'ALL', bg: C.blueDeep, sd: C.blueDark, fg: C.white },
  { id: 'quests', label: 'QUESTS', bg: C.charm, sd: C.charmDark, fg: C.blueDark },
  { id: 'practice', label: 'PRACTICE', bg: C.charm, sd: C.charmDark, fg: C.blueDark },
  { id: 'leisure', label: 'LEISURE', bg: C.charm, sd: C.charmDark, fg: '#3a2a08' },
  { id: 'work', label: 'WORK', bg: '#cda35f', sd: '#9a7333', fg: '#2a1c08' },
  { id: 'faith', label: 'FAITH', bg: C.faith, sd: C.faithDark, fg: '#1a3a0a' },
  { id: 'martial', label: 'MARTIAL', bg: C.light, sd: C.blue, fg: C.blueDark },
  { id: 'crime', label: 'CRIME', bg: C.health, sd: C.healthDark, fg: C.white },
  { id: 'vice', label: 'VICE', bg: '#7a1f2a', sd: '#4a0f18', fg: C.white },
  { id: 'health', label: 'BODY', bg: C.teal, sd: C.tealDark, fg: '#0d3a33' },
];
