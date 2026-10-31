import {completeForecast} from './choiceRisk';
import { Choice, GameState, STAT_KEYS } from '@/types/game';

export function labelHasGold(choice: Choice, amount: number): boolean {
  return new RegExp(`(?:^|[^0-9])${amount}\\s*(?:g\\b|gold\\b)`, 'i').test(choice.label);
}
export function choiceHint(choice: Choice): string | undefined {
  const amount = choice.costGold ?? Math.max(0, -(choice.outcome?.effects?.gold ?? 0));
  return amount && labelHasGold(choice, amount) && /^(?:Pay|Costs?|Needs?|Requires?) \d+\s*(?:g|gold)[.!]?$/i.test(choice.hint ?? '') ? undefined : choice.hint;
}

/** A preview reads authored stakes; it never rolls an outcome or spends resources. */
export function choiceStakes(choice: Choice): string[] {
  const lines: string[] = [];
  const effects = choice.outcome?.effects;
  const spend = effects?.gold && effects.gold < 0 ? -effects.gold : 0;
  if (spend && !labelHasGold(choice, spend)) lines.push(`Costs ${spend}g`);
  if (choice.costGold && choice.costGold !== spend && !labelHasGold(choice, choice.costGold) && !choice.hint?.includes(`Pay ${choice.costGold}g`)) lines.push(`Requires ${choice.costGold}g available`);
  const forecast = completeForecast(choice);
  const authored = [...(forecast?.positive ?? []), ...(forecast?.negative ?? [])].filter((line) => !(choice.costGold && labelHasGold(choice, choice.costGold) && /^(Costs?|Needs?|Requires?) \d+\s*(g|gold)\b/i.test(line))).filter((line) => !/^(A distinct response|The outcome may be remembered)\.?$/i.test(line));
  if (authored.length) lines.push(...authored.filter((line) => !spend || !/^Costs? \d+\s*(g|gold)\b/i.test(line)));
  if (choice.success || choice.failure) {
    lines.push('Outcome uncertain');
    if ((choice.failure?.effects?.health ?? 0) < 0) lines.push('Failure can cause injury');
  }
  if (forecast?.warnsDelayedConsequence || effects?.schedule) lines.push('May affect future dealings');
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
