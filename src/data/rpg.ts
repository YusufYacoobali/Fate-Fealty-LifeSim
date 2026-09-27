import { EquipmentDef, RecipeDef, RpgState, Skills } from '@/types/rpg';

export const SKILL_NAMES = { husbandry: 'Husbandry', craftsmanship: 'Craftsmanship', scholarship: 'Scholarship', arms: 'Arms' };
export const MASTERY_TITLES = { husbandry: 'Master Husbandman', craftsmanship: 'Guild Mastercrafter', scholarship: 'Learned Scholar', arms: 'Master-at-Arms' };
export const BRANCH_MILESTONES = {
  mercenary: ['Trusted escort', 'Company sergeant', 'Company captain'],
  caravan: ['Route scout', 'Caravan factor', 'Independent partner'],
  court: ['Petition clerk', 'Council investigator', 'Independent councillor'],
};
export const BRANCH_ASSIGNMENTS = [0, 2, 4] as const;
export const SKILL_MILESTONES = {
  husbandry: { 3: 'Better gathering yields, cattle handling and prepared contracts', 6: 'Controlled seed trials and larger harvests', 10: 'Maximum agricultural yields and mastery commission' },
  craftsmanship: { 3: 'Workshop tools, quilted armour and safer construction', 6: 'Fine equipment, tempered blades and mail', 10: 'Masterwork quality and the guild masterpiece' },
  scholarship: { 3: 'Herbal kits, land surveys and second trade/court chapters', 6: 'Account audits and final trade/court chapters', 10: 'Strongest knowledge checks and mastery commission' },
  arms: { 3: 'Prepared escorts and the second mercenary chapter', 6: 'Signal patrols and the final mercenary chapter', 10: 'Widest timing windows and champion mastery commission' },
};
export function freshSkills(): Skills {
  return { husbandry: { level: 1, xp: 0 }, craftsmanship: { level: 1, xp: 0 }, scholarship: { level: 1, xp: 0 }, arms: { level: 1, xp: 0 } };
}
export function freshRpg(): RpgState {
  return { forge: null, forgeBonuses: { ownerId: "", year: -1, used: 0 }, revision: 0, materials: { timber: 0, stone: 0, iron: 0, herbs: 0 }, goods: {}, equipment: {}, board: { year: -1, offers: [] }, mission: null, expedition: null,
    branches: { mercenary: { assignments: 0, chapter: 0 }, caravan: { assignments: 0, chapter: 0 }, court: { assignments: 0, chapter: 0 } }, stewardId: null, lastHoldingEncounterYear: null };
}
export const EQUIPMENT: EquipmentDef[] = [
  { id: 'sword', name: 'Iron sword', slot: 'weapon', damage: 4, description: '+4 strike damage' },
  { id: 'lance', name: 'Tourney lance', slot: 'weapon', damage: 6, description: '+6 strike damage' },
  { id: 'gambeson', name: 'Gambeson', slot: 'armour', protection: 3, dodgeCost: 2, description: 'Absorbs 3 damage; dodge costs +2 stamina' },
  { id: 'mail_shirt', name: 'Mail shirt', slot: 'armour', protection: 6, dodgeCost: 5, description: 'Absorbs 6 damage; dodge costs +5 stamina' },
  { id: 'helm', name: 'Iron helm', slot: 'armour', protection: 4, dodgeCost: 2, description: 'Absorbs 4 damage; dodge costs +2 stamina' },
  { id: 'tunic', name: 'Fine tunic', slot: 'armour', check: 0.06, description: '+6 percentage points on court and mediation checks' },
  { id: 'wool_cloak', name: 'Wool cloak', slot: 'armour', protection: 1, description: 'Absorbs 1 damage' },
  { id: 'hand_cart', name: 'Hand cart', slot: 'tool', yield: 1, description: '+1 material when gathering' },
  { id: 'whetstone', name: 'Whetstone', slot: 'tool', damage: 1, description: '+1 strike damage' },
  { id: 'wood_axe', name: 'Wood axe', slot: 'tool', yield: 1, check: 0.04, description: '+1 gathering yield; +4 points on work checks' },
  { id: 'mason_tools', name: "Mason's tools", slot: 'tool', yield: 1, check: 0.08, description: '+1 gathering yield; +8 points on work checks' },
  { id: 'herbal_kit', name: 'Herbal kit', slot: 'tool', check: 0.08, description: '+8 points on scholarship checks' },
  { id: 'practice_sword', name: 'Balanced blade', slot: 'weapon', damage: 3, description: '+3 strike damage' },
  { id: 'steel_blade', name: 'Tempered blade', slot: 'weapon', damage: 7, description: '+7 strike damage' },
];
export const RECIPES: RecipeDef[] = [
  { id: 'wood_axe', name: 'Wood axe', materials: { timber: 2, iron: 1 }, gold: 1, level: 1, equipment: 'wood_axe', description: 'A useful tool for gathering and repairs.' },
  { id: 'mason_tools', name: "Mason's tools", materials: { timber: 1, iron: 3 }, gold: 3, level: 3, building: 'workshop', equipment: 'mason_tools', description: 'Fine tools for difficult commissions.' },
  { id: 'herbal_kit', name: 'Herbal kit', materials: { timber: 1, herbs: 3 }, gold: 2, level: 3, scholarshipLevel: 3, building: 'herb_garden', equipment: 'herbal_kit', description: 'Prepare remedies and identify rare plants.' },
  { id: 'practice_sword', name: 'Balanced blade', materials: { timber: 1, iron: 2 }, gold: 2, level: 1, equipment: 'practice_sword', description: 'A reliable blade for a new adventurer.' },
  { id: 'steel_blade', name: 'Tempered blade', materials: { iron: 5, timber: 1 }, gold: 8, level: 6, building: 'workshop', equipment: 'steel_blade', description: 'A powerful, carefully tempered weapon.' },
  { id: 'gambeson', name: 'Quilted armour', materials: { herbs: 2, timber: 1 }, gold: 5, level: 3, equipment: 'gambeson', description: 'Light protection for road and battlefield.' },
  { id: 'mail_shirt', name: 'Mail shirt', materials: { iron: 8 }, gold: 12, level: 6, building: 'workshop', equipment: 'mail_shirt', description: 'Strong protection at a cost in mobility.' },
  { id: 'seed_bundle', name: 'Seed bundle', materials: { herbs: 2 }, gold: 1, level: 1, effects: { holding: { stores: 8 } }, description: 'Use to add 8 Stores, or deliver to a client.' },
  { id: 'repair_kit', name: 'Repair kit', materials: { timber: 2, iron: 1 }, gold: 1, level: 1, effects: { holding: { security: 8 } }, description: 'Use to add 8 Security, or fulfil repairs.' },
  { id: 'healing_salve', name: 'Healing salve', materials: { herbs: 3 }, gold: 1, level: 1, effects: { health: 10 }, description: 'Use to restore 10 Health, or deliver to a patient.' },
  { id: 'provisions', name: 'Travel provisions', materials: { herbs: 1, timber: 1 }, gold: 2, level: 1, effects: { health: 4, holding: { stores: 4 } }, description: 'Supplies that also unlock a safe expedition approach.' },
  { id: 'masterpiece', name: 'Guild masterpiece', materials: { timber: 6, iron: 6, stone: 3 }, gold: 15, level: 10, building: 'workshop', description: 'A masterwork for the final guild commission.' },
];
export const RPG_BUILDINGS = [
  { id: 'workshop', name: 'Workshop', gold: 24, materials: { timber: 5, stone: 2 }, description: 'Unlock advanced tools, armour and guild commissions.' },
  { id: 'herb_garden', name: 'Herb garden', gold: 18, materials: { timber: 3, herbs: 3 }, description: 'Unlock herbal kits; gather one extra herb.' },
  { id: 'training_yard', name: 'Training yard', gold: 26, materials: { timber: 4, stone: 3 }, description: 'Unlock advanced Arms exercises and company work.' },
] as const;
export const MATERIAL_PRICES = { timber: 2, stone: 3, iron: 4, herbs: 2 };
// Per outing, not per unit: gathering stays cheaper than retail, but ore is an investment.
export const GATHERING_COSTS = { timber: 2, stone: 4, iron: 6, herbs: 3 };
