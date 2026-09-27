import { Choice, GameState, STAT_KEYS } from '@/types/game';

/** A preview reads authored stakes; it never rolls an outcome or spends resources. */
export function choiceStakes(choice: Choice): string[] {
  const lines: string[] = [];
  const effects = choice.outcome?.effects;
  const spend = effects?.gold && effects.gold < 0 ? -effects.gold : 0;
  if (spend) lines.push(`Costs ${spend}g`);
  if (choice.costGold && choice.costGold !== spend && !choice.hint?.includes(`Pay ${choice.costGold}g`)) lines.push(`Requires ${choice.costGold}g available`);
  const forecast = choice.forecast;
  const authored = [...(forecast?.positive ?? []), ...(forecast?.negative ?? [])].filter((line) => !/^(A distinct response|The outcome may be remembered)\.?$/i.test(line));
  if (authored.length) lines.push(...authored.filter((line) => !spend || !/^Costs? \d+\s*(g|gold)\b/i.test(line)));
  if (choice.success || choice.failure) {
    lines.push('Outcome uncertain');
    if ((choice.failure?.effects?.health ?? 0) < 0) lines.push('Failure can cause injury');
  }
  if (forecast?.warnsDelayedConsequence || effects?.schedule) lines.push('May have consequences in a later year');
  return [...new Set(lines)];
}

export function feedbackSnapshot(s: GameState) {
  return { gold: s.gold, reputation: s.reputation, stats: { ...s.stats }, materials: { ...s.rpg.materials }, holding: { ...s.holding } };
}
export function feedbackChanges(before: ReturnType<typeof feedbackSnapshot>, s: GameState): string[] {
  const changes: string[] = [];
  const add = (label: string, old: number, current: number) => { const delta = current - old; if (delta) changes.push(`${label} ${delta > 0 ? '+' : '−'}${Math.abs(delta)}`); };
  add('Gold', before.gold, s.gold);
  for (const key of STAT_KEYS) add(key[0].toUpperCase() + key.slice(1), before.stats[key], s.stats[key]);
  add('Reputation', before.reputation, s.reputation);
  for (const key of Object.keys(before.materials) as (keyof typeof before.materials)[]) add(key, before.materials[key], s.rpg.materials[key]);
  for (const key of ['stores', 'loyalty', 'security'] as const) add(key, before.holding[key], s.holding[key]);
  return changes;
}

/** Only incidental career/arrival notices collapse; deaths, family and choices stay visible. */
export function isRoutineNews(entry: { source?: string; tag: string }): boolean {
  return (entry.source === 'world' || entry.source === 'npc') && ['WORLD · CAREER', 'WORLD · ARRIVAL'].includes(entry.tag);
}
