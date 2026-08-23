/**
 * PURE logic for the one-off Pro sample every fresh install receives.
 *
 * A player who has never paid gets the FIRST life they start on this install
 * with the `pro` entitlement's content switched on: premium events, careers,
 * ranks, goals, and the larger action allowance. The moment that life ends —
 * by death, by restart, or by continuing as an heir — the sample is spent and
 * never returns, whatever happens to the save afterwards.
 *
 * No native imports, so this is unit-testable in plain Node.
 */

/** The slice of AppMeta this module owns. */
export interface ProTrialMeta {
  /** lifeNo of the first life started on this install, null before it begins. */
  firstLifeNo: number | null;
  /** True once the sample life has ended, or for installs that predate it. */
  proTrialUsed: boolean;
}

export interface ProTrialResolution {
  /** Meta patch to persist, or null when nothing changed. */
  patch: Partial<ProTrialMeta> | null;
  /** Whether the current life is running on the free sample. */
  active: boolean;
  /** True on the single evaluation where the sample was just spent. */
  justEnded: boolean;
}

const INACTIVE: ProTrialResolution = { patch: null, active: false, justEnded: false };

/**
 * Decide the sample's state for the life currently loaded.
 *
 * `onboarded` matters because the reducer holds a placeholder life until the
 * player finishes character creation; binding the sample to that placeholder
 * would spend it before a single year had been played.
 */
export function resolveProTrial(meta: ProTrialMeta, lifeNo: number, onboarded: boolean): ProTrialResolution {
  if (meta.proTrialUsed) return INACTIVE;
  if (!onboarded) return INACTIVE;

  if (meta.firstLifeNo == null) {
    return { patch: { firstLifeNo: lifeNo }, active: true, justEnded: false };
  }
  if (lifeNo === meta.firstLifeNo) return { patch: null, active: true, justEnded: false };

  // The sample life is over. Spend it, and never grant another.
  return { patch: { proTrialUsed: true }, active: false, justEnded: true };
}
