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
  { id: 'leisure', label: 'LEISURE', bg: C.charm, sd: C.charmDark, fg: '#3a2a08' },
  { id: 'work', label: 'WORK', bg: '#cda35f', sd: '#9a7333', fg: '#2a1c08' },
  { id: 'faith', label: 'FAITH', bg: C.faith, sd: C.faithDark, fg: '#1a3a0a' },
  { id: 'martial', label: 'MARTIAL', bg: C.light, sd: C.blue, fg: C.blueDark },
  { id: 'crime', label: 'CRIME', bg: C.health, sd: C.healthDark, fg: C.white },
  { id: 'health', label: 'BODY', bg: C.teal, sd: C.tealDark, fg: '#0d3a33' },
];
