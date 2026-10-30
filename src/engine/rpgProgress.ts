import { GameState } from '@/types/game';
import { EquipmentDef, MaterialId, Quality, SkillId, Skills, SKILLS } from '@/types/rpg';
import { EQUIPMENT, freshSkills, SKILL_NAMES, SKILL_MILESTONES } from '@/data/rpg';
import { pushFeed } from './gameState';

export function normalizeSkills(saved?: Partial<Skills>): Skills {
  const result = freshSkills();
  for (const id of SKILLS) {
    const value = saved?.[id];
    if (!value) continue;
    const level = Math.max(1, Math.min(10, Math.floor(Number.isFinite(value.level) ? value.level : 1)));
    result[id] = { level, xp: level === 10 ? 0 : Math.max(0, Math.min(level * 20 - 1, Math.floor(Number.isFinite(value.xp) ? value.xp : 0))), mastered: Boolean(value.mastered && level === 10) };
  }
  return result;
}
export function skillsOf(s: GameState): Skills { return s.world.characters[s.playerCharacterId]?.skills ?? freshSkills(); }
export function skillLevel(s: GameState, id: SkillId): number { return skillsOf(s)[id].level; }
export function grantSkillXp(s: GameState, id: SkillId, amount: number, reason: string, characterId = s.playerCharacterId): void {
  const player = s.world.characters[characterId];
  if (!player || amount <= 0 || s.dead) return;
  player.skills ??= freshSkills();
  const skill = player.skills[id];
  if (skill.level >= 10) return;
  const previousLevel = skill.level;
  skill.xp += Math.floor(amount);
  while (skill.level < 10 && skill.xp >= 20 * skill.level) { skill.xp -= 20 * skill.level; skill.level += 1; }
  if (skill.level === 10) skill.xp = 0;
  for (const milestone of [3, 6, 10] as const) if (characterId === s.playerCharacterId && previousLevel < milestone && skill.level >= milestone) pushFeed(s, 'SKILL UNLOCK', '#387245', `${SKILL_NAMES[id]} ${milestone}: ${SKILL_MILESTONES[id][milestone]}.`, 'good');
  if (characterId === s.playerCharacterId) pushFeed(s, 'SKILL', '#365f88', `${SKILL_NAMES[id]} +${Math.floor(amount)} XP · ${reason}. Level ${skill.level}${skill.level < 10 ? ` · ${skill.xp}/${20 * skill.level}` : ' · mastery commission available'}.`, 'good');
}
export function qualityAtLevel(level: number): Quality { return level >= 10 ? 'masterwork' : level >= 6 ? 'fine' : 'ordinary'; }
export function equipmentDefinition(key?: string): EquipmentDef | undefined {
  if (!key) return undefined;
  const [id, quality] = key.split(':');
  const def = EQUIPMENT.find((e) => e.id === id);
  if (!def) return undefined;
  const bonus = quality === 'masterwork' ? 2 : quality === 'fine' ? 1 : 0;
  const result = { ...def, name: quality ? `${quality} ${def.name}` : def.name, damage: def.damage ? def.damage + bonus : 0, protection: def.protection ? def.protection + bonus : 0, check: (def.check ?? 0) + (def.slot === 'tool' ? bonus * 0.02 : 0) };
  result.description = [result.damage ? `+${result.damage} strike damage` : '', result.protection ? `absorbs ${result.protection} damage` : '', result.dodgeCost ? `dodge costs +${result.dodgeCost} stamina` : '', result.yield ? `+${result.yield} ${result.id === 'wood_axe' ? 'timber' : result.id === 'mason_tools' ? 'stone / iron' : 'material'} gathering yield` : '', result.check ? `+${Math.round(result.check * 100)} points on ${['herbal_kit', 'tunic'].includes(result.id) ? 'scholarship' : result.id === 'wood_axe' ? 'husbandry / craftsmanship' : result.id === 'mason_tools' ? 'craftsmanship' : 'work'} checks` : ''].filter(Boolean).join('; ');
  return result;
}
export function equippedBonus(s: GameState, key: 'damage' | 'protection' | 'dodgeCost' | 'yield' | 'check'): number {
  return Object.values(s.rpg.equipment).reduce((sum, id) => sum + (equipmentDefinition(id)?.[key] ?? 0), 0);
}
export function ownsEquipment(s: GameState, key: string): boolean { return s.inventory.includes(key) || (s.rpg.goods[key] ?? 0) > 0; }
export function equipmentCheckBonus(s: GameState, skill: SkillId): number {
  return Object.values(s.rpg.equipment).reduce((total, key) => {
    const equipment = equipmentDefinition(key);
    if (!equipment || (equipment.id === 'herbal_kit' || equipment.id === 'tunic') && skill !== 'scholarship') return total;
    if (equipment.id === 'mason_tools' && skill !== 'craftsmanship') return total;
    if (equipment.id === 'wood_axe' && !['husbandry', 'craftsmanship'].includes(skill)) return total;
    return total + (equipment.check ?? 0);
  }, 0);
}
export function gatheringBonus(s: GameState, material: MaterialId): number {
  const tool = equipmentDefinition(s.rpg.equipment.tool);
  if (!tool || tool.id === 'wood_axe' && material !== 'timber' || tool.id === 'mason_tools' && !['stone', 'iron'].includes(material)) return 0;
  return tool.yield ?? 0;
}
export const ACTIVITY_SKILLS: Record<string, SkillId> = {
  fields: 'husbandry', blacksmith: 'craftsmanship', train_sword: 'arms', joust: 'arms', church: 'scholarship',
  lead_patrol: 'arms', drill_levy: 'arms', copy_manuscript: 'scholarship', study_trade: 'craftsmanship', treat_patient: 'scholarship',
  manage_stores: 'husbandry', herbalist: 'scholarship', teach_child: 'scholarship', care_relative: 'scholarship',
  farm: 'husbandry', work_land: 'husbandry', gather_fuel: 'husbandry', hunt: 'husbandry', fishing: 'husbandry',
  study: 'scholarship', read: 'scholarship', pray: 'scholarship', visit_healer: 'scholarship',
  train: 'arms', train_combat: 'arms', secure_bounds: 'arms', patrol: 'arms',
  craft: 'craftsmanship', manage_workshop: 'craftsmanship', repair_household: 'craftsmanship',
  tournament: 'arms', quest: 'arms', poach: 'husbandry',
  gather_intelligence: 'scholarship', hear_petitions: 'scholarship', hold_council: 'scholarship',
  negotiate_levy: 'scholarship', hear_confession: 'scholarship', preach_sermon: 'scholarship',
  open_stores: 'husbandry', sell_surplus: 'husbandry', muster_levy: 'arms',
};
export function awardActivitySkill(s: GameState, id: string, success = true): void {
  const skill = ACTIVITY_SKILLS[id];
  if (skill) grantSkillXp(s, skill, success ? 6 : 3, id.replaceAll('_', ' '));
  const material: MaterialId | undefined = id === 'gather_fuel' ? 'timber' : id === 'blacksmith' && success ? 'iron' : id === 'repair_household' ? 'stone' : undefined;
  if (material) s.rpg.materials[material] += 1 + gatheringBonus(s, material);
}
