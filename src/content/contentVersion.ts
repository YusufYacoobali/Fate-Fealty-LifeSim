import { WorldState } from '@/types/game';
import { QUALITY_CHAIN_SPECS } from './qualityAmbientEvents';

/**
 * Titles the ambient chains used before their rewrite, when every beat was
 * called `<chain title>: <n>`. Chain beats gate on the exact title of the beat
 * before them, and that title is persisted in world history, so a save taken
 * mid-chain carries the old string and would otherwise stall there forever.
 */
const LEGACY_CHAIN_TITLES: Record<string, string> = {
  broken_betrothal: 'The Broken Betrothal',
  foster_oath: 'The Foster Child’s Oath',
  siblings_share: 'A Sibling’s Share',
  millers_fever: 'Fever at the Mill',
  wounded_midwife: 'The Wounded Midwife',
  bellmakers_sight: 'The Bellmaker’s Sight',
  stolen_chalice: 'The Stolen Chalice',
  forest_gang: 'The Forest Gang',
  false_witness: 'The False Witness',
  masterpiece: 'The Masterpiece Commission',
  caravan_partnership: 'The Caravan Partnership',
  apprentice_revolt: 'The Apprentices’ Revolt',
  tithe_dispute: 'The Tithe Dispute',
  crown_levy: 'The Crown’s Levy',
  guild_seal: 'The Guild Seal',
  winter_roof: 'A Roof Before Winter',
  granary_rats: 'Rats in the Granary',
  neighbours_fire: 'Fire Next Door',
  strangers_map: 'The Stranger’s Map',
  saints_bone: 'The Saint’s Bone',
  prophetic_child: 'The Child Who Dreamed',
};

/** Maps every `<old title>: <n>` onto the title that beat now carries. */
function legacyChainTitleMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const spec of QUALITY_CHAIN_SPECS) {
    const legacy = LEGACY_CHAIN_TITLES[spec.id];
    if (!legacy) continue;
    spec.beats.forEach((beat, index) => {
      map[`${legacy}: ${index + 1}`] = beat.title;
    });
  }
  return map;
}

/** Increment whenever persisted story/event identifiers or semantics change. */
export const CURRENT_CONTENT_VERSION = 7;

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
  6: (world) => ({ world, notices: [] }),
  // Character-level depth fields are migrated by normalizeGameState.
  5: (world) => ({ world, notices: [] }),
  4: (world) => ({ world, notices: [] }),
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
  3: (world) => {
    const titles = legacyChainTitleMap();
    let rewritten = 0;
    const history = world.history.map((entry) => {
      if (!entry.causes.some((cause) => titles[cause])) return entry;
      rewritten += 1;
      return { ...entry, causes: entry.causes.map((cause) => titles[cause] ?? cause) };
    });
    return {
      world: { ...world, history },
      notices: rewritten
        ? ['Village tales that were part-told have been matched to their rewritten chapters.']
        : [],
    };
  },
};
