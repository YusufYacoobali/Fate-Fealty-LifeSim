import { ActivityCategory, ActivityDef } from '@/types/game';
import { C } from '@/theme/theme';

export const ACTIVITY_DEFS: ActivityDef[] = [
  { id: 'tavern', cat: 'leisure', name: 'TAVERN', icon: '🍺', iconBg: C.charm, desc: 'Drink, sing, brawl' },
  { id: 'dice', cat: 'leisure', name: 'DICE', icon: '🎲', iconBg: C.health, desc: 'Gamble thy coin' },
  { id: 'feast', cat: 'leisure', name: 'FEAST', icon: '🍗', iconBg: C.orange, desc: 'Host a merry feast' },
  { id: 'fair', cat: 'leisure', name: 'FAIR', icon: '🎪', iconBg: C.purple, desc: 'Juggle at the fair' },
  { id: 'fields', cat: 'work', name: 'FIELDS', icon: '🌾', iconBg: '#cda35f', desc: 'Honest turnip toil' },
  { id: 'blacksmith', cat: 'work', name: 'FORGE', icon: '🔨', iconBg: C.light, desc: 'Sweat for coin' },
  { id: 'market', cat: 'work', name: 'MARKET', icon: '🧺', iconBg: C.faith, desc: 'Sell thy wares' },
  { id: 'church', cat: 'faith', name: 'CHAPEL', icon: '⛪', iconBg: C.faith, desc: 'Pray for thy soul' },
  { id: 'pilgrimage', cat: 'faith', name: 'PILGRIM', icon: '🧎', iconBg: C.light, desc: 'Walk to the shrine' },
  { id: 'train', cat: 'martial', name: 'THE KEEP', icon: '🛡️', iconBg: C.light, desc: 'Train for knighthood' },
  { id: 'quest', cat: 'martial', name: 'QUEST', icon: '📜', iconBg: C.purple, desc: 'Heed the notice board' },
  { id: 'tournament', cat: 'martial', name: 'TOURNEY', icon: '🐎', iconBg: C.charm, desc: 'Joust for glory' },
  { id: 'poach', cat: 'crime', name: 'POACH', icon: '🦌', iconBg: '#9bc46a', desc: 'Hunt royal deer' },
  { id: 'pickpocket', cat: 'crime', name: 'PICKPOCKET', icon: '🤲', iconBg: C.health, desc: 'Lift a fat purse' },
  { id: 'banditry', cat: 'crime', name: 'BANDITRY', icon: '🗡️', iconBg: '#cda35f', desc: 'Rob the road' },
  { id: 'leech', cat: 'health', name: 'DOCTOR', icon: '🩸', iconBg: '#f3a0a0', desc: 'Leeches cure all' },
  { id: 'bathhouse', cat: 'health', name: 'BATHHOUSE', icon: '🛁', iconBg: C.teal, desc: 'A rare hot bath' },
  { id: 'herbalist', cat: 'health', name: 'HERBALIST', icon: '🌿', iconBg: C.faith, desc: 'A potent tonic' },
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
