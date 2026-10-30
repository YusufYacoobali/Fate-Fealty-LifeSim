import { BIRTH_ORIGINS } from '@/data/birthOrigins';
/**
 * Pure selectors that turn GameState into the small, display-ready shapes the
 * UI components consume. Keeping this logic here keeps components dumb.
 */

import { GameState, KinMember, STAT_KEYS } from '@/types/game';
import { RANKS } from '@/data/ranks';
import { STAT_STYLES, FEED_STYLE, C } from '@/theme/theme';
import { relationMatchesFilter } from '@/engine/relationshipEngine';
import { careerById } from '@/data/careers';

export function selectStats(s: GameState) {
  return STAT_KEYS.map((k) => ({ key: k, ...STAT_STYLES[k], val: s.stats[k] }));
}

export function selectFeed(s: GameState) {
  return s.feed.filter((entry) => {
    if (s.world.feedFilter === 'player') return (entry.source ?? 'player') === 'player';
    if (s.world.feedFilter === 'world') return entry.source === 'npc' || entry.source === 'world';
    return true;
  }).map((e) => {
    const source = e.source ?? 'player';
    const palette = source === 'player' ? FEED_STYLE.player : FEED_STYLE.world;
    const ts = palette[e.tone] ?? palette.plain;
    // Alternate on the entry id, not the row index: the feed is capped and
    // filtered, so an index-based stripe would reshuffle as entries age out.
    return {
      id: e.id,
      age: e.age,
      changes: e.changes,
      tag: e.tag,
      tagColor: e.tagColor ?? ts.tagColor,
      text: e.traitId ? e.text.replace(/^.*?(From the cradle|You are now)/, '$1') : e.text,
      traitId: e.traitId,
      source,
      bg: e.id % 2 === 0 ? ts.bg : ts.bgAlt,
      border: ts.border,
      sd: ts.sd,
      sl: ts.sl,
    };
  });
}

export function relColor(rel: number): string {
  return rel >= 66 ? C.good : rel >= 33 ? C.charmDark : C.bad;
}

export function relLabel(rel: number): string {
  return rel >= 75 ? 'Adoring' : rel >= 50 ? 'Warm' : rel >= 30 ? 'Cool' : 'Hostile';
}

export function selectKin(s: GameState): KinMember[] {
  return s.kin.filter((kin) => relationMatchesFilter(s, kin, s.world.relationFilter));
}

export function selectedKin(s: GameState): KinMember | null {
  if (!s.selectedKinId) return null;
  return s.kin.find((k) => k.id === s.selectedKinId) ?? null;
}

export function selectRankPath(s: GameState) {
  return RANKS.map((r, i) => {
    const locked = !!r.premium && !s.lifetimeUnlocked;

    return {
      name: r.short,
      locked,
      bg: locked ? '#c2ccd8' : i === s.rankIdx ? C.charm : i < s.rankIdx ? C.faith : C.lightFill,
      sd: locked ? '#7a8799' : i === s.rankIdx ? C.charmDark : i < s.rankIdx ? C.faithDark : C.paleEdge,
      fg: locked ? '#41536b' : i <= s.rankIdx ? C.inkSoft : '#7a93b0',
    };
  });
}

export function selectRankClimb(s: GameState) {
  const current = RANKS[s.rankIdx];
  const next = RANKS[s.rankIdx + 1];
  if (!current || !next) return null;

  const player = s.world.characters[s.playerCharacterId];
  const requiredRoute = s.rankIdx >= 4 ? 'Succession or council recognition' : s.rankIdx >= 2 ? 'Formal royal grant' : 'Martial training and service';
  const req = next.promote;
  const readiness = [req.progress > 0 ? s.rankProgress / req.progress : 1];
  if (req.minAge > 0) readiness.push(s.age / req.minAge);
  if (req.minGold != null && req.minGold > 0) readiness.push(s.gold / req.minGold);
  if (req.stats) {
    for (const [key, target] of Object.entries(req.stats)) {
      if (target != null && target > 0) readiness.push(s.stats[key as keyof GameState['stats']] / target);
    }
  }

  return {
    from: current.short,
    route: requiredRoute,
    to: next.short,
    progress: s.rankIdx >= 2 || !player.education?.qualifications.includes('martial_training') || careerById(s.occupation.careerId)?.family !== 'martial' ? 0 : Math.round(Math.max(0, Math.min(1, ...readiness)) * 100),
    locked: !!next.premium && !s.lifetimeUnlocked,
  };
}

export function currentRank(s: GameState) {
  const rank = RANKS[s.rankIdx];
  const player = s.world.characters[s.playerCharacterId];
  if (s.rankIdx === 0 && player?.socialStatus?.estate === 'commoner') return { ...rank, short: 'COMMONER', key: 'Commoner' as typeof rank.key };
  if (s.rankIdx === 3 && player?.socialStatus?.estate === 'royal') return { ...rank, short: 'ROYAL KIN', key: 'Royal kin' as typeof rank.key };
  return rank;
}

export function selectBio(s: GameState): string {
  const rank = currentRank(s);
  const career = careerById(s.occupation.careerId)?.title ?? 'unemployed wanderer';
  const debt = s.debts.reduce((sum, item) => sum + item.principal, 0);
  const player = s.world.characters[s.playerCharacterId];
  const origin = BIRTH_ORIGINS.find(o => o.id === player.background?.origin)?.name ?? 'Unknown';
  const office = Object.entries(s.world.court?.offices ?? {}).find(([, id]) => id === player.id)?.[0];
  return `${s.first} ${s.epithet}, a ${rank.key.toLowerCase()} of Swineford and ${career}, ${s.age} winters old. Born to a ${origin.toLowerCase()} household${office ? `; appointed ${office.replaceAll('_', ' ')}` : ''}. Owns ${s.gold} gold${debt ? ` and owes ${debt}` : ''}. ${player.education?.qualifications.length ? `Learning: ${player.education.qualifications.map(q => q.replaceAll('_', ' ')).join(', ')}.` : 'No formal qualifications; later study remains open.'}`;
}

export function fullName(s: GameState): string {
  return `${s.first} ${s.epithet}`;
}

export { traitsOf as selectTraits } from '@/engine/traitEngine';
export { goalView as selectGoal } from '@/engine/goalEngine';
