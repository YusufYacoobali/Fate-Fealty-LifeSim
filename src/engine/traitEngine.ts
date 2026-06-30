/**
 * Trait engine — assigns the birth trait, grants acquired traits as they're
 * earned, and exposes the passive modifiers traits contribute (success-roll
 * bonus, aging multiplier). Pure logic over GameState.
 */

import { GameState, TraitDef } from '@/types/game';
import { TRAITS, birthTraits, traitById } from '@/data/traits';
import { addTag, pushFeed } from './gameState';
import { clamp, pick } from './random';
import { C } from '@/theme/theme';

export function traitsOf(s: GameState): TraitDef[] {
  return s.traits.map((id) => traitById(id)).filter((t): t is TraitDef => !!t);
}

export function hasTrait(s: GameState, id: string): boolean {
  return s.traits.includes(id);
}

/** Net success-roll bonus contributed by all current traits. */
export function rollBonusFromTraits(s: GameState): number {
  return traitsOf(s).reduce((sum, t) => sum + (t.rollBonus ?? 0), 0);
}

/** Combined multiplier applied to old-age attrition. */
export function agingMultiplierFromTraits(s: GameState): number {
  return traitsOf(s).reduce((m, t) => m * (t.agingMultiplier ?? 1), 1);
}

/** Add a trait (idempotent), mirror it as a tag, and announce it in the feed. */
export function grantTrait(s: GameState, id: string, announce = true): boolean {
  if (hasTrait(s, id)) return false;
  const t = traitById(id);
  if (!t) return false;
  s.traits = [...s.traits, id];
  addTag(s, `trait_${id}`);
  if (announce) {
    pushFeed(s, 'TRAIT GAINED', C.purpleDark, `${t.emoji} You are now ${t.name}. ${t.blurb}`, 'good');
  }
  return true;
}

/** Roll a birth trait and apply its flat starting-stat shifts. */
export function assignBirthTrait(s: GameState): void {
  const t = pick(birthTraits());
  s.traits = [t.id];
  addTag(s, `trait_${t.id}`);
  if (t.startStats) {
    for (const k of ['health', 'charm', 'wits', 'faith'] as const) {
      const d = t.startStats[k];
      if (d != null) s.stats[k] = clamp(s.stats[k] + d);
    }
  }
}

/** Grant any acquired traits whose conditions are now met. */
export function grantAcquiredTraits(s: GameState): void {
  for (const t of TRAITS) {
    if (t.kind === 'acquired' && !hasTrait(s, t.id) && t.earnedWhen?.(s)) {
      grantTrait(s, t.id);
    }
  }
}
