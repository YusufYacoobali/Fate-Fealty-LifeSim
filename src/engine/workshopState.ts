import { GameState } from '@/types/game';
import { TradeJourney } from '@/types/rpg';

/** Additive save defaults; never infer rewards or replay work while loading. */
export function normalizeWorkshopState(s: GameState): void {
  const bonus = s.rpg.forgeBonuses;
  s.rpg.forgeBonuses = { ownerId: typeof bonus?.ownerId === 'string' ? bonus.ownerId : s.playerCharacterId, year: Number.isSafeInteger(bonus?.year) ? bonus.year : -1, used: Math.max(0, Math.min(3, Number.isFinite(bonus?.used) ? Math.floor(bonus.used) : 0)) };
  const run = s.rpg.forge;
  if (run && ((run.practice && run.lessonXp !== 6) || s.dead || run.ownerId !== s.playerCharacterId || typeof run.id !== 'string' || !['ready', 'striking', 'result'].includes(run.phase) || !Array.isArray(run.targets) || run.targets.length !== 5 || run.targets.some((v) => !Number.isFinite(v) || v < 0.25 || v > 0.75) || !Array.isArray(run.scores) || run.scores.length > 5 || run.scores.some((v) => ![0, 60, 100].includes(v)) || !Number.isFinite(run.level) || s.rpg.mission || s.duel || s.pendingEvent)) s.rpg.forge = null;
  else if (run) {
    // Old free practice sessions carry no lesson reward.
    run.lessonXp = run.practice && run.lessonXp === 6 ? 6 : 0;
    delete (run as unknown as Record<string, unknown>).assisted;
    run.level = Math.min(10, Math.max(1, Math.floor(run.level)));
    if (run.scores.length === 5) run.phase = 'result';
    run.bonusXp = Number.isFinite(run.bonusXp) ? Math.max(0, Math.min(4, run.bonusXp)) : 0;
    run.bonusIron = run.bonusIron === 1 ? 1 : 0;
  }
  for (const person of Object.values(s.world.characters)) {
    const progress = person.tradeJourney;
    if (!progress) continue;
    const endings = ['trusted', 'prosperous', 'independent'];
    person.tradeJourney = {
      chapter: Math.min(4, Math.max(0, Number.isFinite(progress.chapter) ? Math.floor(progress.chapter) : 0)),
      assignments: Math.max(0, Number.isFinite(progress.assignments) ? Math.floor(progress.assignments) : 0),
      choices: Array.isArray(progress.choices) ? progress.choices.filter((c) => typeof c === 'string').slice(0, 4) : [],
      clientId: typeof progress.clientId === 'string' ? progress.clientId : undefined,
      lastYear: Number.isSafeInteger(progress.lastYear) ? progress.lastYear : undefined,
      ending: endings.includes(progress.ending ?? '') ? progress.ending as TradeJourney['ending'] : undefined,
    };
  }
}
