import { ContentDomain, ContentLedgerEntry, ExpectedChild, FactionKey, FactionState, PacingState, PersistedRngState, WorldConditions } from '@/types/game';
import { CURRENT_CONTENT_VERSION } from '@/content/contentVersion';
import { initialRngState } from './random';

export interface StateDefaults {
  currentYear: number;
  rngState: PersistedRngState;
  contentVersion: number;
  conditions: WorldConditions;
  pacing: PacingState;
  contentLedger: Record<string, ContentLedgerEntry>;
  repetitionLedger: Record<string, number>;
  recentDomains: ContentDomain[];
  expectedChildren: ExpectedChild[];
  factions: Record<FactionKey, FactionState>;
}

/** Pure, non-random defaults for save normalization and recovery. */
export function createStateDefaults(worldSeed: number, currentYear = 1320): StateDefaults {
  return {
    currentYear,
    rngState: initialRngState(worldSeed),
    contentVersion: CURRENT_CONTENT_VERSION,
    conditions: { foodSecurity: 50, prosperity: 50, publicOrder: 50, warThreat: 35, diseasePressure: 25, religiousTension: 30 },
    pacing: { lastMajorYear: null, lastImportantYear: null, quietYearsSinceStory: 0, majorEventsThisLife: 0, mediumStoriesStarted: 0, immediateChainDepth: 0 },
    contentLedger: {},
    repetitionLedger: {},
    recentDomains: [],
    expectedChildren: [],
    factions: {
      crown: { id: 'crown', name: 'The Crown', influence: 62, playerStanding: 0, lastActionYear: currentYear - 1 },
      church: { id: 'church', name: 'The Church', influence: 58, playerStanding: 0, lastActionYear: currentYear - 1 },
      guilds: { id: 'guilds', name: 'The Guilds', influence: 48, playerStanding: 0, lastActionYear: currentYear - 1 },
      commons: { id: 'commons', name: 'The Commons', influence: 54, playerStanding: 0, lastActionYear: currentYear - 1 },
      outlaws: { id: 'outlaws', name: 'The Outlaws', influence: 22, playerStanding: 0, lastActionYear: currentYear - 1 },
    },
  };
}
