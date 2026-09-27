import { GameState } from '@/types/game';
import { ForgeRun, ForgeTask } from '@/types/rpg';
import { RECIPES } from '@/data/rpg';
import { careerById } from '@/data/careers';
import { careerActionAvailability, performCareerAction } from './careerEngine';
import { performRpgCommand, rpgAvailability } from './rpgEngine';
import { spendAction } from './actionClock';
import { captureCareerActionRewards, reinforceCareerIdentity } from './careerIdentity';
import { checkLifeGoal } from './goalEngine';
import { stableHash } from './random';
import { grantSkillXp, skillLevel } from './rpgProgress';
import { pushFeed } from './gameState';
import { resolveTradeChoice, TRADE_CHAPTERS, tradeAvailability, tradeProgress } from './tradeJourney';

export const FORGE_BONUS_LIMIT = 3;
export function forgeAllowance(s: GameState): number {
  const record = s.rpg.forgeBonuses;
  return record?.ownerId === s.playerCharacterId && record.year === s.world.currentYear ? Math.max(0, FORGE_BONUS_LIMIT - record.used) : FORGE_BONUS_LIMIT;
}
export function forgeAvailability(s: GameState, task: ForgeTask): string | null {
  if (s.dead || s.pendingEvent || s.duel || s.rpg.mission || s.rpg.forge) return 'Finish the current encounter';
  if (s.tags.includes('imprisoned')) return 'Cannot visit the forge while imprisoned';
  if (s.age < 10) return 'The forge opens at age 10';
  if (task.kind === 'practice') {
    if (skillLevel(s, 'craftsmanship') >= 3) return 'Beginner lessons complete; craft items or take workshop shifts';
    if (s.rpg.forgeLesson?.ownerId === s.playerCharacterId && s.rpg.forgeLesson.year === s.world.currentYear) return 'Lesson completed this year';
    return s.actionClock.used >= s.actionClock.cap ? 'Needs 1 action' : null;
  }
  if (task.kind === 'recipe') {
    if (!RECIPES.some((r) => r.id === task.recipeId && (r.materials.iron ?? 0) > 0)) return 'Choose an ironworking recipe';
    return rpgAvailability(s, { kind: 'craft', id: task.recipeId });
  }
  if (task.kind === 'work') {
    if (careerById(s.occupation.careerId)?.family !== 'craft') return 'Take a craft occupation for paid forge work';
    return careerActionAvailability(s, 'work').reason ?? (s.actionClock.used >= s.actionClock.cap ? 'No actions remain this year' : null);
  }
  if (tradeProgress(s).chapter !== task.chapter || !TRADE_CHAPTERS[task.chapter]?.choices.some((c) => c.id === task.choiceId && c.forge)) return 'This commission cannot use the forge';
  return tradeAvailability(s, task.choiceId);
}

/** Commit the original task once. The forge can add a bonus, never reroll its result. */
export function startForge(s: GameState, task: ForgeTask): void {
  if (forgeAvailability(s, task)) return;
  const level = skillLevel(s, 'craftsmanship');
  let title = 'A lesson at the anvil';
  if (task.kind === 'practice') {
    spendAction(s);
    s.rpg.forgeLesson = { ownerId: s.playerCharacterId, year: s.world.currentYear };
  }
  if (task.kind === 'recipe') {
    title = RECIPES.find((r) => r.id === task.recipeId)!.name;
    performRpgCommand(s, { kind: 'craft', id: task.recipeId });
  } else if (task.kind === 'work') {
    title = 'Paid workshop shift';
    const before = captureCareerActionRewards(s);
    performCareerAction(s, 'work');
    reinforceCareerIdentity(s, 'work', before);
    checkLifeGoal(s);
    spendAction(s);
  } else if (task.kind === 'commission') {
    title = TRADE_CHAPTERS[task.chapter].title;
    if (!resolveTradeChoice(s, task.chapter, task.choiceId)) return;
  }
  if (s.dead || s.stats.health <= 0) return;
  const bonusEligible = task.kind !== 'practice' && forgeAllowance(s) > 0;
  if (task.kind !== 'practice') {
    if (s.rpg.forgeBonuses.ownerId !== s.playerCharacterId || s.rpg.forgeBonuses.year !== s.world.currentYear) s.rpg.forgeBonuses = { ownerId: s.playerCharacterId, year: s.world.currentYear, used: 0 };
    if (bonusEligible) s.rpg.forgeBonuses.used += 1;
  }
  const id = `forge_${s.nextId++}`;
  s.rpg.forge = { id, ownerId: s.playerCharacterId, title, level, practice: task.kind === 'practice', lessonXp: task.kind === 'practice' ? 6 : 0,
    ...(task.kind === 'recipe' ? { craftedKey: s.rpg.lastCrafted?.key, recipeId: task.recipeId } : {}),
    targets: Array.from({ length: 5 }, (_, index) => 0.25 + (stableHash(s.world.worldSeed, id, String(index)) % 501) / 1000),
    scores: [], phase: 'ready', bonusEligible, bonusXp: 0, bonusIron: 0 };
}
export function forgeWindow(level: number): number { return level >= 6 ? 0.12 : level >= 3 ? 0.14 : 0.17; }
export function forgeGrade(run: ForgeRun): 'Practice' | 'Good' | 'Excellent' {
  const score = run.scores.reduce((total, value) => total + value, 0);
  return score >= 400 ? 'Excellent' : score >= 250 ? 'Good' : 'Practice';
}
export function beginForge(s: GameState, id: string): void {
  if (s.rpg.forge?.id === id && s.rpg.forge.phase === 'ready') s.rpg.forge.phase = 'striking';
}
export function strikeForge(s: GameState, id: string, sequence: number, position: number): void {
  const run = s.rpg.forge;
  if (!run || s.dead || run.ownerId !== s.playerCharacterId || run.id !== id || run.phase !== 'striking' || run.scores.length !== sequence || !Number.isFinite(position) || position < 0 || position > 1) return;
  const distance = Math.abs(position - run.targets[sequence]);
  run.scores.push(distance <= forgeWindow(run.level) / 2 ? 100 : distance <= forgeWindow(run.level) ? 60 : 0);
  if (run.scores.length === 5) finishForge(s, id, false);
}
export function finishForge(s: GameState, id: string, quick: boolean): void {
  const run = s.rpg.forge;
  if (!run || run.id !== id || run.phase === 'result' || run.ownerId !== s.playerCharacterId || s.dead) return;
  if (!quick && run.scores.length !== 5) return;
  const grade = quick ? 'Practice' : forgeGrade(run);
  run.bonusXp = run.bonusEligible && !quick ? grade === 'Excellent' ? 4 : grade === 'Good' ? 2 : 0 : 0;
  run.bonusIron = run.bonusEligible && !quick && grade === 'Excellent' ? 1 : 0;
  run.phase = 'result'; // Settle before emitting rewards: replayed inputs are harmless.
  if (run.lessonXp) {
    grantSkillXp(s, 'craftsmanship', run.lessonXp, 'a lesson at the anvil');
    pushFeed(s, 'ANVIL LESSON', '#9b5c29', 'You straighten a bent hinge under the smith’s watchful eye. Six Craftsmanship XP; one fewer crooked door in the village.', 'good');
  }
  if (run.bonusXp) grantSkillXp(s, 'craftsmanship', run.bonusXp, 'careful forge work — bonus');
  if (run.bonusIron) s.rpg.materials.iron += run.bonusIron;
  if (!run.practice) pushFeed(s, 'AT THE ANVIL', '#9b5c29', quick ? 'You finish at an ordinary pace. Your normal work, item and XP are kept; no forge bonus.' : `${grade} hammer work. Your normal task rewards are kept. Bonus: ${run.bonusXp} Craftsmanship XP${run.bonusIron ? ' and 1 recovered iron' : ''}.`, run.bonusXp ? 'good' : 'plain');
}
export function closeForge(s: GameState, id: string): void { if (s.rpg.forge?.id === id && s.rpg.forge.phase === 'result') s.rpg.forge = null; }
