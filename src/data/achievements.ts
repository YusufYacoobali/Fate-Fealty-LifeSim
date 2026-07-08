import { GameState } from '@/types/game';
import { LifetimeStats } from '@/state/appMeta';

/**
 * Achievement registry. Each achievement is a pure predicate over a context
 * (the current/final life state + lifetime stats + whether it's a death check).
 * Evaluated continuously during play and once more at death, so both "reach X"
 * and "die of Y" achievements work. Pure data — add one in a single line.
 */
export interface AchievementCtx {
  state: GameState;
  stats: LifetimeStats;
  atDeath: boolean;
}

export interface AchievementDef {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  /** Hidden in the list until unlocked. */
  secret?: boolean;
  /** Lifetime Pass deed; only unlocks and displays when lifetimeUnlocked is true. */
  premium?: boolean;
  check: (ctx: AchievementCtx) => boolean;
}

const livingChildren = (s: GameState) => s.kin.filter((k) => k.kind === 'child' && k.alive).length;

export const ACHIEVEMENTS: AchievementDef[] = [
  // --- survival / age ---
  { id: 'coming_of_age', name: 'Coming of Age', emoji: '🌱', desc: 'Reach the age of 18.', check: (c) => c.state.age >= 18 },
  { id: 'greybeard', name: 'Greybeard', emoji: '🧓', desc: 'Live to the ripe age of 70.', check: (c) => c.state.age >= 70 },
  { id: 'the_reaper', name: 'Memento Mori', emoji: '🪦', desc: 'Meet your end for the first time.', check: (c) => c.atDeath },

  // --- station ---
  { id: 'squired', name: 'A Squire Rises', emoji: '🧒', desc: 'Climb to the rank of Squire.', check: (c) => c.state.rankIdx >= 1 },
  { id: 'knighted', name: 'Arise, Sir Knight', emoji: '🛡️', desc: 'Be dubbed a Knight.', check: (c) => c.state.rankIdx >= 2 },
  { id: 'ennobled', name: 'Born Again Noble', emoji: '👑', desc: 'Ascend to the nobility.', check: (c) => c.state.rankIdx >= 3 },

  { id: 'baron_rise', name: 'Lord of the Manor', emoji: 'B', desc: 'Rise to the rank of Baron.', premium: true, check: (c) => c.state.rankIdx >= 4 },
  { id: 'crowned', name: 'The Crown Is Yours', emoji: 'M', desc: 'Become Monarch.', premium: true, check: (c) => c.state.rankIdx >= 5 },

  // --- wealth ---
  { id: 'coin_purse', name: 'A Heavy Purse', emoji: '💰', desc: 'Hold 100 gold at once.', check: (c) => c.state.gold >= 100 },
  { id: 'dragon_hoard', name: 'Dragon’s Hoard', emoji: '🐉', desc: 'Hold 300 gold at once.', check: (c) => c.state.gold >= 300 },

  // --- attributes ---
  { id: 'sage', name: 'Village Sage', emoji: '✦', desc: 'Raise Wits to 95.', check: (c) => c.state.stats.wits >= 95 },
  { id: 'beloved', name: 'Beloved by All', emoji: '★', desc: 'Raise Charm to 95.', check: (c) => c.state.stats.charm >= 95 },
  { id: 'devout', name: 'Truly Devout', emoji: '✝', desc: 'Raise Faith to 95.', check: (c) => c.state.stats.faith >= 95 },

  // --- family ---
  { id: 'wedded', name: 'Till Death Do Us Part', emoji: '💍', desc: 'Take a spouse.', check: (c) => c.state.tags.includes('married') },
  { id: 'brood', name: 'A Full Cradle', emoji: '👶', desc: 'Raise three living children at once.', check: (c) => livingChildren(c.state) >= 3 },

  // --- trait / reputation milestones ---
  { id: 'war_hero', name: 'Hero of the Realm', emoji: '🎖️', desc: 'Earn the War Hero trait.', check: (c) => c.state.traits.includes('war_hero') },
  { id: 'saint', name: 'A Living Saint', emoji: '✨', desc: 'Become a Living Saint.', check: (c) => c.state.traits.includes('living_saint') },
  { id: 'jailbird', name: 'Jailbird', emoji: '⛓️', desc: 'Survive a stint in the dungeon.', check: (c) => c.state.tags.includes('ex_convict') },
  { id: 'plague_walker', name: 'Plague Walker', emoji: '☣️', desc: 'Outlive the Great Pestilence.', secret: true, check: (c) => c.state.tags.includes('plague_survivor') },

  { id: 'beloved_ruler', name: 'Beloved Ruler', emoji: '+', desc: 'Be remembered for mercy on the throne.', premium: true, check: (c) => c.state.tags.includes('beloved_ruler') },
  { id: 'feared_ruler', name: 'Feared Ruler', emoji: '!', desc: 'Be remembered for iron rule.', premium: true, check: (c) => c.state.tags.includes('feared_ruler') },
  { id: 'rebellion_breaker', name: 'Rebellion Breaker', emoji: 'R', desc: 'Survive or crush a rebellion.', premium: true, secret: true, check: (c) => c.state.tags.includes('rebellion_crushed') || c.state.tags.includes('rebellion_survived') },
  { id: 'abdicated', name: 'The Weary Crown', emoji: 'A', desc: 'Abdicate with grace.', premium: true, secret: true, check: (c) => c.state.tags.includes('abdicated') },
  { id: 'great_dynasty', name: 'Great Dynasty', emoji: 'D', desc: 'Secure a royal legacy.', premium: true, check: (c) => c.state.tags.includes('great_dynasty') || c.state.tags.includes('dynasty_secured') },

  // --- ambition ---
  { id: 'ambition', name: 'Life’s Ambition', emoji: '🎯', desc: 'Fulfil the life goal set at your coming of age.', check: (c) => c.state.goalDone },

  // --- meta / dynasty ---
  { id: 'reincarnated', name: 'Again, From the Mud', emoji: '♻️', desc: 'Begin a fifth life.', check: (c) => c.stats.livesLived >= 4 },
  { id: 'dynasty', name: 'A Lasting Dynasty', emoji: '🏰', desc: 'Play ten lives in all.', check: (c) => c.stats.livesLived >= 9 },
];

const BY_ID: Record<string, AchievementDef> = ACHIEVEMENTS.reduce(
  (acc, a) => {
    acc[a.id] = a;
    return acc;
  },
  {} as Record<string, AchievementDef>,
);

export function achievementById(id: string): AchievementDef | undefined {
  return BY_ID[id];
}
