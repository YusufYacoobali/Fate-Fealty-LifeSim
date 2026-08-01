import { GameState, WorldConditionKey } from '@/types/game';
import { clamp } from './random';
import { pushFeed } from './gameState';
import { C } from '@/theme/theme';

function drift(value: number, target = 50): number {
  if (value === target) return value;
  return clamp(value + Math.sign(target - value) * Math.min(2, Math.abs(target - value)));
}

export function tickWorldConditions(state: GameState): GameState {
  const keys = Object.keys(state.world.conditions) as WorldConditionKey[];
  for (const key of keys) state.world.conditions[key] = drift(state.world.conditions[key]);
  const active = state.world.conditionModifiers.filter((modifier) => modifier.expiresYear == null || modifier.expiresYear >= state.world.currentYear);
  state.world.conditionModifiers = active;
  for (const modifier of active) {
    if ((modifier.application ?? 'annual') === 'annual') {
      state.world.conditions[modifier.condition] = clamp(state.world.conditions[modifier.condition] + modifier.delta);
    }
  }
  state.world.conditions.foodSecurity = clamp(state.world.conditions.foodSecurity + Math.round((state.holding.stores - 50) / 20));
  state.world.conditions.publicOrder = clamp(state.world.conditions.publicOrder + Math.round((state.holding.security + state.holding.loyalty - 100) / 30));
  if (state.tags.includes('at_war')) state.world.conditions.warThreat = clamp(state.world.conditions.warThreat + 8);
  if (state.tags.includes('ill')) state.world.conditions.diseasePressure = clamp(state.world.conditions.diseasePressure + 2);

  const conditions = state.world.conditions;
  if (conditions.foodSecurity < 35) pushFeed(state, 'WORLD · HUNGER', C.bad, 'Food is scarce after weak stores and mounting pressure on Swineford.', 'bad', {}, 'world', 'world');
  if (conditions.warThreat > 65) pushFeed(state, 'WORLD · WAR', C.bad, 'War draws close; levies, taxes, and frightened rumours follow the banners.', 'bad', {}, 'world', 'world');
  if (conditions.diseasePressure > 60) pushFeed(state, 'WORLD · SICKNESS', C.bad, 'Sickness spreads through crowded homes and uneasy streets.', 'bad', {}, 'world', 'world');
  return state;
}

export function strongestConditionReasons(state: GameState, key: WorldConditionKey): string[] {
  const reasons = state.world.conditionModifiers
    .filter((modifier) => modifier.condition === key && !modifier.hiddenUntilRevealed)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 3)
    .map((modifier) => modifier.label);
  if (reasons.length) return reasons;
  if (key === 'foodSecurity') return ['holding stores and the latest harvest'];
  if (key === 'publicOrder') return ['local security and loyalty'];
  return ['the slow pressures of life in Swineford'];
}
