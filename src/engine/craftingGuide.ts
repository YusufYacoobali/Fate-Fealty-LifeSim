import { GameState } from '@/types/game';
import { RecipeDef } from '@/types/rpg';
import { CONTRACTS } from '@/content/rpgMissions';
import { equipmentDefinition, qualityAtLevel, skillLevel } from './rpgProgress';

export function recipePurpose(s: GameState, recipe: RecipeDef): string {
  if (recipe.equipment) {
    const gear = equipmentDefinition(`${recipe.equipment}:${qualityAtLevel(skillLevel(s, 'craftsmanship'))}`)!;
    return `Equip in your ${gear.slot} slot: ${gear.description}. Replaces the current ${gear.slot}; extra copies do not stack.`;
  }
  const purposes: Record<string, string> = {
    seed_bundle: 'Use once: +8 holding Stores. Or deliver one to the harvest contract for its guaranteed reward.',
    repair_kit: 'Use once: +8 holding Security. Or deliver one to the broken-cart contract for its guaranteed reward.',
    healing_salve: 'Use once: restore 10 Health. Or deliver one to the fever-remedy contract for its guaranteed reward.',
    provisions: 'Use once: +4 Health and +4 holding Stores. Or save a pack for a safer expedition or caravan crossing.',
    masterpiece: 'Deliver to the Craftsmanship mastery commission in Do → Practice: 25g, +10 Reputation and the mastery title. Requires Craftsmanship 10. Consumed on delivery.',
  };
  return `${purposes[recipe.id] ?? recipe.description}${recipe.effects ? ' Consumed on use or delivery; resources cap at 100.' : ''}`;
}

/** Only point at live offers and approaches that actually use this item. */
export function recipeContracts(s: GameState, recipe: RecipeDef) {
  const gear = recipe.equipment ? equipmentDefinition(recipe.equipment) : undefined;
  return s.rpg.board.offers.filter(o => !o.attempted && s.rpg.board.year === s.world.currentYear).flatMap(offer => {
    const def = CONTRACTS.find(d => d.id === offer.templateId);
    if (!def) return [];
    const delivery = def.options.find(o => o.good === recipe.id);
    const helps = gear && (gear.slot === 'weapon' || gear.slot === 'armour' ? def.options.some(o => o.combat) :
      gear.id === 'herbal_kit' ? def.skill === 'scholarship' : gear.id === 'wood_axe' ? ['husbandry', 'craftsmanship'].includes(def.skill) : gear.id === 'mason_tools' && def.skill === 'craftsmanship');
    return delivery || helps ? [{ offer, title: def.title, purpose: delivery ? `Deliver one: ${delivery.effects.gold ?? 0}g${delivery.effects.reputation ? `, +${delivery.effects.reputation} Reputation` : ''}.` : 'Equip before accepting to improve the relevant approach.' }] : [];
  });
}
