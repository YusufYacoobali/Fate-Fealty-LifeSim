/**
 * Trait engine — assigns the birth trait, grants acquired traits as they're
 * earned, and exposes the passive modifiers traits contribute (success-roll
 * bonus, aging multiplier). Pure logic over GameState.
 */

import { GameState, TraitDef } from '@/types/game';
import { TRAITS, traitById } from '@/data/traits';
import { addTag, pushFeed } from './gameState';
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
    pushFeed(s, 'TRAIT GAINED', C.purpleDark, `You are now ${t.name}. ${t.blurb}`, 'good', { traitId: t.id });
  }
  return true;
}

/** Grant any acquired traits whose conditions are now met. */
export function grantAcquiredTraits(s: GameState): void {
  for (const t of TRAITS) {
    if (t.kind === 'acquired' && !hasTrait(s, t.id) && t.earnedWhen?.(s)) {
      grantTrait(s, t.id);
    }
  }
}
