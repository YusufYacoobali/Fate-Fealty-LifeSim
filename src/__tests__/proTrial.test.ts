import { resolveProTrial, ProTrialMeta } from '@/services/proTrialLogic';
import { DEFAULT_META, migrateMeta } from '@/state/appMeta';

const fresh: ProTrialMeta = { firstLifeNo: null, proTrialUsed: false };

describe('proTrialLogic.resolveProTrial', () => {
  it('withholds the sample until character creation is done', () => {
    // The reducer holds a placeholder life until the player finishes creation;
    // binding to it would spend the sample before a year was played.
    expect(resolveProTrial(fresh, 1, false)).toEqual({ patch: null, active: false, justEnded: false });
  });

  it('binds the sample to the first life actually started', () => {
    expect(resolveProTrial(fresh, 2, true)).toEqual({ patch: { firstLifeNo: 2 }, active: true, justEnded: false });
  });

  it('stays active for the whole of that life', () => {
    const bound: ProTrialMeta = { firstLifeNo: 2, proTrialUsed: false };
    expect(resolveProTrial(bound, 2, true)).toEqual({ patch: null, active: true, justEnded: false });
  });

  it('is spent the moment the life is left behind', () => {
    const bound: ProTrialMeta = { firstLifeNo: 2, proTrialUsed: false };
    expect(resolveProTrial(bound, 3, true)).toEqual({ patch: { proTrialUsed: true }, active: false, justEnded: true });
  });

  it('never comes back, and never reports ending twice', () => {
    const spent: ProTrialMeta = { firstLifeNo: 2, proTrialUsed: true };
    expect(resolveProTrial(spent, 3, true)).toEqual({ patch: null, active: false, justEnded: false });
    // Not even if a later save somehow returns to the sample life number.
    expect(resolveProTrial(spent, 2, true)).toEqual({ patch: null, active: false, justEnded: false });
  });
});

describe('appMeta.migrateMeta', () => {
  it('leaves a fresh install eligible for the sample', () => {
    expect(migrateMeta({})).toMatchObject({ firstLifeNo: null, proTrialUsed: false, proTrialNoticeSeen: false });
  });

  it('marks the sample spent for installs that predate it', () => {
    const existing = migrateMeta({ onboarded: true, totalEntries: 400 });
    expect(existing.proTrialUsed).toBe(true);
    // Nor should those players see a notice about a sample they never had.
    expect(existing.proTrialNoticeSeen).toBe(true);
  });

  it('preserves a sample already in progress', () => {
    expect(migrateMeta({ onboarded: true, firstLifeNo: 2, proTrialUsed: false })).toMatchObject({
      firstLifeNo: 2,
      proTrialUsed: false,
    });
  });

  it('carries the legacy one-shot review flag over as one shown ask', () => {
    expect(migrateMeta({ reviewPrompted: true, totalEntries: 90 })).toMatchObject({
      reviewPromptCount: 1,
      reviewLastEntry: 90,
    });
  });

  it('leaves an un-prompted save at zero asks', () => {
    expect(migrateMeta({ totalEntries: 90 })).toMatchObject({ reviewPromptCount: 0, reviewLastEntry: 0 });
  });

  it('keeps the last confirmed entitlement for an unavailable-store fallback', () => {
    expect(migrateMeta({ lifetimeUnlocked: true }).lifetimeUnlocked).toBe(true);
    expect(migrateMeta({ lifetimeUnlocked: false }).lifetimeUnlocked).toBe(false);
  });

  it('fills every missing field from the defaults', () => {
    expect(Object.keys(migrateMeta({})).sort()).toEqual(Object.keys(DEFAULT_META).sort());
  });
});
