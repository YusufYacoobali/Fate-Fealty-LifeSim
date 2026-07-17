/**
 * Pure selectors that turn GameState into the small, display-ready shapes the
 * UI components consume. Keeping this logic here keeps components dumb.
 */

import { GameState, KinMember, STAT_KEYS } from '@/types/game';
import { RANKS } from '@/data/ranks';
import { STAT_STYLES, TONE_STYLE, C } from '@/theme/theme';
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
    const ts = TONE_STYLE[e.tone] ?? TONE_STYLE.plain;
    return {
      id: e.id,
      tag: e.tag,
      tagColor: e.tagColor ?? ts.tagColor,
      text: e.traitId ? e.text.replace(/^.*?(From the cradle|You are now)/, '$1') : e.text,
      traitId: e.traitId,
      source: e.source ?? 'player',
      bg: ts.bg,
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

export function currentRank(s: GameState) {
  return RANKS[s.rankIdx];
}

export function selectBio(s: GameState): string {
  const rank = currentRank(s);
  const career = careerById(s.occupation.careerId)?.title ?? 'unemployed wanderer';
  const debt = s.debts.reduce((sum, item) => sum + item.principal, 0);
  return `${s.first} ${s.epithet}, a ${rank.key.toLowerCase()} of Swineford and ${career}, ${s.age} winters old. Owns ${s.gold} gold${debt ? ` and owes ${debt}` : ''}, one goose, and a complicated history with apples.`;
}

export function fullName(s: GameState): string {
  return `${s.first} ${s.epithet}`;
}

export { traitsOf as selectTraits } from '@/engine/traitEngine';
export { goalView as selectGoal } from '@/engine/goalEngine';
