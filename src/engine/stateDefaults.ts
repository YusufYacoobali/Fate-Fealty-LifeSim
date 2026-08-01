import { PacingState, PersistedRngState, WorldConditions } from '@/types/game';
import { CURRENT_CONTENT_VERSION } from '@/content/contentVersion';
import { initialRngState } from './random';

export interface StateDefaults {
  currentYear: number;
  rngState: PersistedRngState;
  contentVersion: number;
  conditions: WorldConditions;
  pacing: PacingState;
}

/** Pure, non-random defaults for save normalization and recovery. */
export function createStateDefaults(worldSeed: number, currentYear = 1320): StateDefaults {
  return {
    currentYear,
    rngState: initialRngState(worldSeed),
    contentVersion: CURRENT_CONTENT_VERSION,
    conditions: { foodSecurity: 50, prosperity: 50, publicOrder: 50, warThreat: 35, diseasePressure: 25, religiousTension: 30 },
    pacing: { lastMajorYear: null, lastImportantYear: null, quietYearsSinceStory: 0, majorEventsThisLife: 0, mediumStoriesStarted: 0, immediateChainDepth: 0 },
  };
}
