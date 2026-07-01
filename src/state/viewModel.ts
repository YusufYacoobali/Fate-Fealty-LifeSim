/**
 * Pure selectors that turn GameState into the small, display-ready shapes the
 * UI components consume. Keeping this logic here keeps components dumb.
 */

import { GameState, KinMember, StatKey, TraitDef } from '@/types/game';
import { RANKS } from '@/data/ranks';
import { traitById } from '@/data/traits';
import { STAT_STYLES, TONE_STYLE, C } from '@/theme/theme';

const STAT_ORDER: StatKey[] = ['health', 'charm', 'wits', 'faith'];

export function selectStats(s: GameState) {
  return STAT_ORDER.map((k) => ({ key: k, ...STAT_STYLES[k], val: s.stats[k] }));
}

export function selectFeed(s: GameState) {
  return s.feed.map((e) => {
    const ts = TONE_STYLE[e.tone] ?? TONE_STYLE.plain;
    return {
      id: e.id,
      tag: e.tag,
      tagColor: e.tagColor ?? ts.tagColor,
      text: e.traitId ? e.text.replace(/^.*?(From the cradle|You are now)/, '$1') : e.text,
      traitId: e.traitId,
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

/** Living kin only — the deceased quietly drop off the roster. */
export function selectKin(s: GameState): KinMember[] {
  return s.kin.filter((k) => k.alive);
}

export function selectedKin(s: GameState): KinMember | null {
  if (!s.selectedKinId) return null;
  return s.kin.find((k) => k.id === s.selectedKinId && k.alive) ?? null;
}

export function selectRankPath(s: GameState) {
  return RANKS.map((r, i) => ({
    name: r.short,
    bg: i === s.rankIdx ? C.charm : i < s.rankIdx ? C.faith : C.lightFill,
    sd: i === s.rankIdx ? C.charmDark : i < s.rankIdx ? C.faithDark : C.paleEdge,
    fg: i <= s.rankIdx ? C.inkSoft : '#7a93b0',
  }));
}

export function currentRank(s: GameState) {
  return RANKS[s.rankIdx];
}

export function selectBio(s: GameState): string {
  const rank = currentRank(s);
  return `${s.first} ${s.epithet}, a ${rank.key.toLowerCase()} of Swineford, ${s.age} winters old. Owns ${s.gold} gold, one goose, and a complicated history with apples.`;
}

export function selectLedger(s: GameState) {
  return { income: s.income, expenses: s.expenses, gold: s.gold };
}

export function fullName(s: GameState): string {
  return `${s.first} ${s.epithet}`;
}

export function selectTraits(s: GameState): TraitDef[] {
  return s.traits.map((id) => traitById(id)).filter((t): t is TraitDef => !!t);
}

export { goalView as selectGoal } from '@/engine/goalEngine';
