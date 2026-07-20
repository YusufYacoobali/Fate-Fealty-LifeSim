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
  progress?: (ctx: AchievementCtx) => { current: number; target: number };
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

  { id: 'baron_rise', name: 'Lord of the Manor', emoji: '🏰', desc: 'Rise to the rank of Baron.', premium: true, check: (c) => c.state.rankIdx >= 4 },
  { id: 'crowned', name: 'The Crown Is Yours', emoji: '👑', desc: 'Become Monarch.', premium: true, check: (c) => c.state.rankIdx >= 5 },

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

  { id: 'beloved_ruler', name: 'Beloved Ruler', emoji: '🕊️', desc: 'Be remembered for mercy on the throne.', premium: true, check: (c) => c.state.tags.includes('beloved_ruler') },
  { id: 'feared_ruler', name: 'Feared Ruler', emoji: '⚡', desc: 'Be remembered for iron rule.', premium: true, check: (c) => c.state.tags.includes('feared_ruler') },
  { id: 'rebellion_breaker', name: 'Rebellion Breaker', emoji: '🛡️', desc: 'Survive or crush a rebellion.', premium: true, secret: true, check: (c) => c.state.tags.includes('rebellion_crushed') || c.state.tags.includes('rebellion_survived') },
  { id: 'abdicated', name: 'The Weary Crown', emoji: '📜', desc: 'Abdicate with grace.', premium: true, secret: true, check: (c) => c.state.tags.includes('abdicated') },
  { id: 'great_dynasty', name: 'Great Dynasty', emoji: '🏛️', desc: 'Secure a royal legacy.', premium: true, check: (c) => c.state.tags.includes('great_dynasty') || c.state.tags.includes('dynasty_secured') },

  // --- ambition ---
  { id: 'ambition', name: 'Life’s Ambition', emoji: '🎯', desc: 'Fulfil the life goal set at your coming of age.', check: (c) => c.state.goalDone },

  // --- meta / dynasty ---
  { id: 'reincarnated', name: 'Again, From the Mud', emoji: '♻️', desc: 'Begin a fifth life.', check: (c) => c.stats.livesLived >= 4 },
  { id: 'dynasty', name: 'A Lasting Dynasty', emoji: '🏰', desc: 'Play ten lives in all.', check: (c) => c.stats.livesLived >= 9 },

  // --- living world update ---
  { id: 'first_job', name: 'Gainfully Employed', emoji: '🧰', desc: 'Take your first occupation.', check: (c) => c.state.tags.includes('gainfully_employed') },
  { id: 'career_master', name: 'Master of a Trade', emoji: '🏅', desc: 'Reach the final tier of a career.', check: (c) => !!c.state.occupation.careerId && ['reeve', 'master_artisan', 'merchant', 'prior', 'marshal', 'chancellor', 'bandit_chief'].includes(c.state.occupation.careerId) },
  { id: 'hard_year', name: 'Not a Moment Wasted', emoji: '⏳', desc: 'Use every available action in one year.', check: (c) => c.state.actionClock.used >= c.state.actionClock.cap },
  { id: 'hundred_actions', name: 'A Busy Life', emoji: '📅', desc: 'Take one hundred deliberate actions.', check: (c) => c.state.actionClock.lifetimeUsed >= 100, progress: (c) => ({ current: c.state.actionClock.lifetimeUsed, target: 100 }) },
  { id: 'borrower', name: 'Neither Lender Nor...', emoji: '🤝', desc: 'Take a loan.', check: (c) => c.state.tags.includes('has_borrowed') },
  { id: 'debt_free', name: 'Clear Ledger', emoji: '✅', desc: 'Repay a debt in full.', check: (c) => c.state.tags.includes('debt_repaid') },
  { id: 'working_fortune', name: 'By Thy Own Hands', emoji: '🪙', desc: 'Earn 200 gold during one life.', check: (c) => c.state.income >= 200, progress: (c) => ({ current: c.state.income, target: 200 }) },
  { id: 'trusted_friend', name: 'In Confidence', emoji: '🔐', desc: 'Build mutual trust above 80.', check: (c) => c.state.world.relationships.some((r) => r.aId === 'player' && r.aToB.trust >= 80 && r.bToA.trust >= 80) },
  { id: 'deep_friendship', name: 'Fast Friends', emoji: '🫂', desc: 'Build mutual affinity above 85.', check: (c) => c.state.world.relationships.some((r) => r.aId === 'player' && r.aToB.affinity >= 85 && r.bToA.affinity >= 85) },
  { id: 'feud', name: 'This Means War', emoji: '⚔️', desc: 'Begin a personal feud.', check: (c) => c.state.world.relationships.some((r) => r.flags.includes('feud') && (r.aId === 'player' || r.bId === 'player')) },
  { id: 'peacemaker', name: 'Bury the Hatchet', emoji: '🕊️', desc: 'Reconcile with a rival.', check: (c) => c.state.tags.includes('made_peace') },
  { id: 'chosen_wedding', name: 'By Mine Own Heart', emoji: '💒', desc: 'Court and choose your own spouse.', check: (c) => c.state.tags.includes('chose_marriage') },
  { id: 'second_marriage', name: 'Love, Again', emoji: '💞', desc: 'Marry after divorce or widowhood.', check: (c) => c.state.tags.includes('married') && (c.state.tags.includes('divorced') || c.state.tags.includes('widowed')) },
  { id: 'world_wedding', name: 'Wedding Guest', emoji: '🎊', desc: 'See two people in the living world marry.', check: (c) => c.state.tags.includes('witnessed_world_wedding') },
  { id: 'world_birth', name: 'The Village Grows', emoji: '🍼', desc: 'Witness a new child join the world.', check: (c) => c.state.tags.includes('witnessed_world_birth') },
  { id: 'estate_builder', name: 'Stone by Stone', emoji: '🏗️', desc: 'Build three Holding upgrades.', check: (c) => c.state.holding.upgrades.length >= 3, progress: (c) => ({ current: c.state.holding.upgrades.length, target: 3 }) },
  { id: 'all_paths_worked', name: 'Many Trades', emoji: '🧭', desc: 'Work in four different career families.', check: (c) => ['agriculture', 'craft', 'trade', 'church', 'martial', 'court', 'outlaw'].filter((family) => c.state.tags.includes(`career_family_${family}`)).length >= 4, progress: (c) => ({ current: ['agriculture', 'craft', 'trade', 'church', 'martial', 'court', 'outlaw'].filter((family) => c.state.tags.includes(`career_family_${family}`)).length, target: 4 }) },
  { id: 'great_household', name: 'A Crowded Table', emoji: '🍲', desc: 'Share a household with five living family members.', check: (c) => c.state.kin.filter((k) => k.alive && ['spouse', 'child'].includes(k.kind)).length >= 4, progress: (c) => ({ current: c.state.kin.filter((k) => k.alive && ['spouse', 'child'].includes(k.kind)).length, target: 4 }) },
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
