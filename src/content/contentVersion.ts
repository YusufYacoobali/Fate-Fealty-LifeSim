import { WorldState } from '@/types/game';

/** Increment whenever persisted story/event identifiers or semantics change. */
export const CURRENT_CONTENT_VERSION = 2;

export interface ContentAliases {
  templates: Record<string, string>;
  events: Record<string, string>;
  characters: Record<string, string>;
  beats: Record<string, Record<string, string>>;
  consequences: Record<string, string>;
}

export const CONTENT_ALIASES: ContentAliases = {
  templates: { rival_rise: 'rivals_rise' },
  events: { story_rivals_1: 'story_rival_1' },
  characters: { sir_roderick: 'roderick' },
  beats: { rivals_rise: { confrontation: 'beat_5', conclusion: 'beat_6_hard' } },
  consequences: { history_entry: 'history' },
};

export interface ContentMigrationResult {
  world: WorldState;
  notices: string[];
}

export type ContentMigration = (world: WorldState) => ContentMigrationResult;

/** Sequential migrations are registered at the version being migrated FROM. */
export const CONTENT_MIGRATIONS: Record<number, ContentMigration> = {
  1: (world) => ({
    world: {
      ...world,
      conditionModifiers: world.conditionModifiers.map((modifier) => ({
        ...modifier,
        application: modifier.expiresYear === world.currentYear ? 'once' : (modifier.application ?? 'annual'),
      })),
    },
    notices: ['World pressures were updated to distinguish lasting causes from one-time shocks.'],
  }),
};
