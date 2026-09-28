import type { Effects, FactionKey } from './game';

export const SKILLS = ['husbandry', 'craftsmanship', 'scholarship', 'arms'] as const;
export type SkillId = typeof SKILLS[number];
export type SkillProgress = { level: number; xp: number; mastered?: boolean };
export type Skills = Record<SkillId, SkillProgress>;
export type MaterialId = 'timber' | 'stone' | 'iron' | 'herbs';
export type EquipmentSlot = 'weapon' | 'armour' | 'tool';
export type Quality = 'ordinary' | 'fine' | 'masterwork';
export type CareerBranch = 'mercenary' | 'caravan' | 'court';
export interface EquipmentDef {
  id: string; name: string; slot: EquipmentSlot; description: string;
  damage?: number; protection?: number; dodgeCost?: number; yield?: number; check?: number;
}
export interface RecipeDef {
  id: string; name: string; materials: Partial<Record<MaterialId, number>>; gold: number;
  level: number; building?: string; equipment?: string; effects?: Effects; description: string;
  scholarshipLevel?: number;
}
export interface ContractOffer { id: string; templateId: string; clientId: string | null; attempted: boolean }
export type ForgeTask = { kind: 'practice' } | { kind: 'work' } | { kind: 'recipe'; recipeId: string } | { kind: 'commission'; choiceId: string; chapter: number };
export interface ForgeRun {
  id: string; ownerId: string; title: string;
  practice: boolean; level: number;
  lessonXp?: number; craftedKey?: string; recipeId?: string;
  targets: number[]; scores: number[];
  phase: 'ready' | 'striking' | 'result';
  bonusEligible: boolean; bonusXp: number; bonusIron: number;
}
export interface TradeJourney {
  chapter: number; assignments: number; clientId?: string;
  choices: string[]; lastYear?: number;
  ending?: 'trusted' | 'prosperous' | 'independent';
}
export interface MissionRun {
  id: string; ownerId: string; kind: 'contract' | 'expedition' | 'career' | 'holding' | 'caravan' | 'mastery';
  definitionId: string; stage: number; clientId: string | null; faction: FactionKey;
  phase: 'choice' | 'combat'; skill: SkillId;
  selectedOptionId?: string;
  choices?: string[];
  results?: boolean[];
  failed?: boolean;
  charged?: boolean;
  previousResult?: string;
}
export interface RpgState {
  forge: ForgeRun | null;
  forgeBonuses: { ownerId: string; year: number; used: number };
  revision: number;
  lastCrafted?: { key: string; recipeId: string };
  forgeLesson?: { ownerId: string; year: number };
  materials: Record<MaterialId, number>;
  goods: Record<string, number>;
  equipment: Partial<Record<EquipmentSlot, string>>;
  board: { year: number; offers: ContractOffer[] };
  mission: MissionRun | null;
  expedition: { id: string; stage: number; ownerId: string; prepaid?: boolean } | null;
  branches: Record<CareerBranch, { assignments: number; chapter: number; choices?: Record<number, string>; clientId?: string }>;
  stewardId: string | null;
  lastHoldingEncounterYear: number | null;
  lastHoldingEncounterId?: string;
}
export type Defence = 'block' | 'dodge' | 'parry' | 'brace';
export type Attack = 'quick' | 'heavy' | 'feint' | 'recover';
export type TimingGrade = 'miss' | 'good' | 'perfect';
export interface CombatState {
  version: 1;
  id: string;
  phase: 'defence' | 'defence_timing' | 'attack' | 'attack_timing' | 'resolved';
  sequence: number;
  playerStamina: number; opponentStamina: number;
  defence?: Defence; attack?: Attack;
  exposed: boolean; feinted: boolean;
  archetype: 'brawler' | 'guard' | 'duellist' | 'veteran';
  damage: number; protection: number; dodgeCost: number; arms: number;
  weaponId?: string; armourId?: string;
  practice: boolean;
  /** Solo drills reuse the timing/animation pipeline without an opposing character. */
  solo?: { completed: number; xp: number };
  lastAction?: 'strike' | 'block' | 'dodge' | 'hurt' | 'miss' | 'recover';
  /** The resolved move survives nextExchange clearing the pending selection. */
  lastMove?: Attack | Defence;
  lastDamage?: number;
  lastStaminaGain?: number;
  impactId?: number;
  opponentStartVigour?: number;
  lastGrade?: TimingGrade;
}
