import { GameState, LifeRole, StoryScale, WorldConditionKey } from '@/types/game';

export interface ActorSelector {
  excludePlayer?: boolean;
  minAge?: number;
  maxAge?: number;
  alive?: boolean;
  kinds?: string[];
  ambitions?: string[];
  importance?: Array<'core' | 'supporting' | 'background'>;
}

export type MissingActorPolicy =
  | { type: 'cancel_story' }
  | { type: 'continue_without_actor' }
  | { type: 'branch'; beatId: string }
  | { type: 'substitute'; selector: ActorSelector };

export interface StoryRoleDefinition {
  selector: ActorSelector;
  missingActor: MissingActorPolicy;
}

export interface PersistentStoryBeat {
  id: string;
  eventId: string;
  minDelay: number;
  maxDelay: number;
  nextBeatId?: string;
  transitions?: StoryTransition[];
  importance: 'important' | 'major';
  endsStory?: boolean;
}

export interface StoryTransition {
  beatId: string;
  when: { variable: string; equals?: string | number | boolean; truthy?: boolean };
}

export interface StoryRecovery {
  recoveryBeatId?: string;
}

export type StoryEligibility =
  | { type: 'age'; min: number; max?: number }
  | { type: 'condition'; condition: WorldConditionKey; atMost?: number; atLeast?: number; minAge?: number }
  | { type: 'has_child'; minChildAge: number }
  | { type: 'role'; roles: LifeRole[]; minAge?: number }
  | { type: 'family_size'; minimum: number; minAge?: number }
  | { type: 'kin_kind'; kinds: string[]; minAge?: number };

export interface StoryTemplate {
  id: string;
  scale: StoryScale;
  eligibility: StoryEligibility;
  roles: Record<string, StoryRoleDefinition>;
  initialBeatId: string;
  beats: Record<string, PersistentStoryBeat>;
  cooldownYears: number;
  recovery: StoryRecovery;
}

function flagshipStory(
  id: string,
  eventPrefix: string,
  eligibility: StoryEligibility,
  roles: Record<string, StoryRoleDefinition>,
): StoryTemplate {
  const beats: Record<string, PersistentStoryBeat> = {};
  for (let index = 1; index <= 3; index++) {
    const beatId = `beat_${index}`;
    beats[beatId] = {
      id: beatId,
      eventId: `${eventPrefix}_${index}`,
      minDelay: index === 1 ? 0 : index === 6 ? 2 : 1,
      maxDelay: index === 1 ? 0 : index === 6 ? 5 : 3,
      nextBeatId: index < 3 ? `beat_${index + 1}` : 'beat_4_cautious',
      transitions: index === 3 ? [
        { beatId: 'beat_4_bold', when: { variable: 'approach', equals: 'bold' } },
        { beatId: 'beat_4_family', when: { variable: 'approach', equals: 'family' } },
      ] : undefined,
      importance: index === 1 ? 'major' : 'important',
    };
  }
  for (const route of ['bold', 'cautious', 'family'] as const) {
    beats[`beat_4_${route}`] = { id: `beat_4_${route}`, eventId: `${eventPrefix}_4_${route}`, minDelay: 1, maxDelay: 3, nextBeatId: 'beat_5', importance: 'important' };
  }
  beats.beat_5 = {
    id: 'beat_5', eventId: `${eventPrefix}_5`, minDelay: 1, maxDelay: 3,
    nextBeatId: 'beat_6_hard',
    transitions: [{ beatId: 'beat_6_reconciled', when: { variable: 'resolution', equals: 'reconcile' } }],
    importance: 'major',
  };
  beats.beat_6_reconciled = { id: 'beat_6_reconciled', eventId: `${eventPrefix}_6_reconciled`, minDelay: 2, maxDelay: 5, importance: 'major', endsStory: true };
  beats.beat_6_hard = { id: 'beat_6_hard', eventId: `${eventPrefix}_6_hard`, minDelay: 2, maxDelay: 5, importance: 'major', endsStory: true };
  return { id, scale: 'major', eligibility, roles, initialBeatId: 'beat_1', beats, cooldownYears: 30, recovery: { recoveryBeatId: 'beat_6_hard' } };
}

function roleStory(role: LifeRole): StoryTemplate {
  const id = `role_${role}`;
  return {
    id,
    scale: 'medium',
    eligibility: { type: 'role', roles: [role], minAge: 14 },
    roles: { contact: { selector: { excludePlayer: true, minAge: 16, alive: true }, missingActor: substituteAdult } },
    initialBeatId: 'beat_1',
    beats: {
      beat_1: { id: 'beat_1', eventId: `story_${id}_1`, minDelay: 0, maxDelay: 0, nextBeatId: 'beat_2', importance: 'important' },
      beat_2: { id: 'beat_2', eventId: `story_${id}_2`, minDelay: 1, maxDelay: 3, nextBeatId: 'beat_3', importance: 'important' },
      beat_3: { id: 'beat_3', eventId: `story_${id}_3`, minDelay: 1, maxDelay: 3, importance: 'important', endsStory: true },
    },
    cooldownYears: 12,
    recovery: { recoveryBeatId: 'beat_3' },
  };
}

function relationshipStory(id: string, kinds: string[]): StoryTemplate {
  return {
    id,
    scale: 'relationship',
    eligibility: { type: 'kin_kind', kinds, minAge: 12 },
    roles: { other: { selector: { excludePlayer: true, minAge: 10, alive: true, kinds }, missingActor: { type: 'cancel_story' } } },
    initialBeatId: 'beat_1',
    beats: {
      beat_1: { id: 'beat_1', eventId: `story_${id}_1`, minDelay: 0, maxDelay: 0, nextBeatId: 'beat_2', importance: 'important' },
      beat_2: { id: 'beat_2', eventId: `story_${id}_2`, minDelay: 1, maxDelay: 3, nextBeatId: 'beat_3', importance: 'important' },
      beat_3: { id: 'beat_3', eventId: `story_${id}_3`, minDelay: 1, maxDelay: 4, importance: 'important', endsStory: true },
    },
    cooldownYears: 10,
    recovery: { recoveryBeatId: 'beat_3' },
  };
}

const substituteAdult: MissingActorPolicy = {
  type: 'substitute',
  selector: { excludePlayer: true, minAge: 16, alive: true, importance: ['core', 'supporting'] },
};

const ROLE_STORY_TEMPLATES = (['commoner', 'artisan_merchant', 'clergy', 'martial', 'landed_noble', 'monarch', 'outlaw'] as LifeRole[]).map(roleStory);
const RELATIONSHIP_STORY_TEMPLATES = [
  relationshipStory('friendship_test', ['friend']),
  relationshipStory('rival_reckoning', ['foe']),
  relationshipStory('marriage_strain', ['spouse']),
];

export const PERSISTENT_STORY_TEMPLATES: StoryTemplate[] = [
  flagshipStory('rivals_rise', 'story_rival', { type: 'age', min: 8, max: 30 }, {
    rival: { selector: { excludePlayer: true, minAge: 7, alive: true, importance: ['core', 'supporting'] }, missingActor: substituteAdult },
    patron: { selector: { excludePlayer: true, minAge: 25, alive: true, importance: ['core', 'supporting'] }, missingActor: substituteAdult },
  }),
  flagshipStory('lean_harvest', 'story_harvest', { type: 'condition', condition: 'foodSecurity', atMost: 48, minAge: 8 }, {
    merchant: { selector: { excludePlayer: true, minAge: 18, alive: true }, missingActor: substituteAdult },
    reeve: { selector: { excludePlayer: true, minAge: 21, alive: true }, missingActor: substituteAdult },
  }),
  flagshipStory('disputed_inheritance', 'story_inheritance', { type: 'family_size', minimum: 3, minAge: 18 }, {
    claimant: { selector: { excludePlayer: true, minAge: 16, alive: true }, missingActor: { type: 'branch', beatId: 'beat_6' } },
    witness: { selector: { excludePlayer: true, minAge: 18, alive: true }, missingActor: substituteAdult },
  }),
  flagshipStory('war_swineford', 'story_war', { type: 'condition', condition: 'warThreat', atLeast: 42, minAge: 14 }, {
    commander: { selector: { excludePlayer: true, minAge: 22, alive: true }, missingActor: substituteAdult },
    companion: { selector: { excludePlayer: true, minAge: 14, alive: true }, missingActor: substituteAdult },
  }),
  flagshipStory('ambitious_child', 'story_child', { type: 'has_child', minChildAge: 10 }, {
    child: { selector: { excludePlayer: true, minAge: 10, maxAge: 25, alive: true, kinds: ['child'] }, missingActor: { type: 'cancel_story' } },
    mentor: { selector: { excludePlayer: true, minAge: 20, alive: true }, missingActor: substituteAdult },
  }),
  ...ROLE_STORY_TEMPLATES,
  ...RELATIONSHIP_STORY_TEMPLATES,
];

export const STORY_TEMPLATE_BY_ID = Object.fromEntries(PERSISTENT_STORY_TEMPLATES.map((template) => [template.id, template]));

export function storyEligibilityReasons(state: GameState, templateId: string): string[] {
  const template = STORY_TEMPLATE_BY_ID[templateId];
  if (!template) return ['an older chain of events'];
  const eligibility = template.eligibility;
  switch (eligibility.type) {
    case 'condition': return [`${eligibility.condition.replace(/([A-Z])/g, ' $1').toLowerCase()} is ${state.world.conditions[eligibility.condition]}`];
    case 'has_child': return ['a child in the household has reached a decisive age'];
    case 'family_size': return ['the family is large enough for competing interests to matter'];
    case 'role': return [`the duties of the ${deriveLifeRole(state).replaceAll('_', ' ')} life`];
    case 'kin_kind': return [`an important ${eligibility.kinds.join(' or ')} relationship remains unresolved`];
    case 'age': return ['this conflict has ripened with age and reputation'];
  }
}

export function storyEligibilityMet(state: GameState, eligibility: StoryEligibility): boolean {
  const player = state.world.characters[state.playerCharacterId];
  const age = player?.age ?? state.age;
  switch (eligibility.type) {
    case 'age': return age >= eligibility.min && (eligibility.max == null || age <= eligibility.max);
    case 'condition': {
      if (eligibility.minAge != null && age < eligibility.minAge) return false;
      const value = state.world.conditions[eligibility.condition];
      return (eligibility.atMost == null || value <= eligibility.atMost) && (eligibility.atLeast == null || value >= eligibility.atLeast);
    }
    case 'has_child': return Object.values(state.world.characters).some((character) => character.alive && character.parentIds?.includes(state.playerCharacterId) && character.age >= eligibility.minChildAge);
    case 'family_size': {
      if (eligibility.minAge != null && age < eligibility.minAge) return false;
      const family = player?.birthFamilyId ? state.world.families[player.birthFamilyId] : undefined;
      return (family?.memberIds.length ?? 0) >= eligibility.minimum;
    }
    case 'role': return (eligibility.minAge == null || age >= eligibility.minAge) && eligibility.roles.includes(deriveLifeRole(state));
    case 'kin_kind': return (eligibility.minAge == null || age >= eligibility.minAge) && Object.values(state.world.characters).some((kin) => kin.id !== state.playerCharacterId && kin.alive && eligibility.kinds.includes(kin.kind));
  }
}

export function deriveLifeRole(state: GameState): LifeRole {
  const player = state.world.characters[state.playerCharacterId];
  const career = player?.occupation.careerId ?? state.occupation.careerId ?? '';
  if (career.includes('poacher') || career.includes('cutpurse') || career.includes('bandit') || state.paths.outlaw > 20) return 'outlaw';
  if (state.rankIdx >= 5) return 'monarch';
  if (state.rankIdx >= 3) return 'landed_noble';
  if (['acolyte', 'cleric', 'prior'].includes(career)) return 'clergy';
  if (['levy', 'guard', 'marshal'].includes(career) || state.rankIdx >= 1) return 'martial';
  if (['apprentice', 'artisan', 'master_artisan', 'hawker', 'trader', 'merchant'].includes(career)) return 'artisan_merchant';
  return 'commoner';
}
