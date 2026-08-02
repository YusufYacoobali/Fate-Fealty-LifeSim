import { WorldState } from '@/types/game';

/** Increment whenever persisted story/event identifiers or semantics change. */
export const CURRENT_CONTENT_VERSION = 3;

export interface ContentAliases {
  templates: Record<string, string>;
  events: Record<string, string>;
  careers: Record<string, string>;
  characters: Record<string, string>;
  beats: Record<string, Record<string, string>>;
  consequences: Record<string, string>;
}

export const CONTENT_ALIASES: ContentAliases = {
  templates: { rival_rise: 'rivals_rise' },
  events: { story_rivals_1: 'story_rival_1' },
  careers: { village_healer: 'barber_surgeon', law_clerk: 'copyist' },
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
  2: (world) => ({
    world: {
      ...world,
      contentLedger: world.contentLedger ?? {},
      repetitionLedger: world.repetitionLedger ?? {},
      recentDomains: world.recentDomains ?? [],
      expectedChildren: world.expectedChildren ?? [],
      factions: world.factions ?? {
        crown: { id: 'crown', name: 'The Crown', influence: 62, playerStanding: 0, lastActionYear: world.currentYear - 1 },
        church: { id: 'church', name: 'The Church', influence: 58, playerStanding: 0, lastActionYear: world.currentYear - 1 },
        guilds: { id: 'guilds', name: 'The Guilds', influence: 48, playerStanding: 0, lastActionYear: world.currentYear - 1 },
        commons: { id: 'commons', name: 'The Commons', influence: 54, playerStanding: 0, lastActionYear: world.currentYear - 1 },
        outlaws: { id: 'outlaws', name: 'The Outlaws', influence: 22, playerStanding: 0, lastActionYear: world.currentYear - 1 },
      },
    },
    notices: ['Swineford gained durable content cooldowns, family expectations and faction records.'],
  }),
};
