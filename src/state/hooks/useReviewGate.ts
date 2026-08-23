import { useCallback, useEffect, useRef, useState } from 'react';
import { GameState } from '@/types/game';
import { ageUpsDelta, reviewCadenceDue } from '@/services/reviewLogic';
import { AppMetaApi } from './useAppMeta';

/**
 * Tracks cumulative age-ups and decides when the review prompt should
 * appear. Single responsibility: the review-prompt gate. The actual native
 * review presentation lives in the ReviewPrompt component / review service.
 */
export function useReviewGate(state: GameState, loaded: boolean, meta: AppMetaApi) {
  const prevAge = useRef(state.age);
  const prevLifeNo = useRef(state.lifeNo);
  const trackingStarted = useRef(false);
  const reviewQueued = useRef(false);
  const [reviewVisible, setReviewVisible] = useState(false);

  useEffect(() => {
    if (!loaded || !meta.ready) return;

    // Hydration restores age-ups already represented by persisted totalAgeUps.
    // Establish the baseline first so relaunching cannot count them twice.
    if (!trackingStarted.current) {
      prevAge.current = state.age;
      prevLifeNo.current = state.lifeNo;
      trackingStarted.current = true;
      return;
    }

    const ageUpDelta = ageUpsDelta(prevLifeNo.current, prevAge.current, state.lifeNo, state.age);
    prevAge.current = state.age;
    prevLifeNo.current = state.lifeNo;
    if (ageUpDelta > 0) {
      meta.update({ totalAgeUps: meta.metaRef.current.totalAgeUps + ageUpDelta });
      if (reviewCadenceDue(meta.metaRef.current, state)) reviewQueued.current = true;
    }

    // Once earned by an age-up, keep the prompt queued behind story/settings
    // overlays. Ordinary actions may clear an overlay but cannot earn a prompt.
    const screenIsClear = !state.dead && !state.pendingEvent && !state.settingsOpen;
    if (reviewQueued.current && !reviewVisible && screenIsClear) {
      reviewQueued.current = false;
      setReviewVisible(true);
    }
    // meta is a stable api (ref + memoised update); intentionally omitted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, loaded, meta.ready, reviewVisible]);

  const resolveReview = useCallback(() => {
    setReviewVisible(false);
    const current = meta.metaRef.current;
    meta.update({
      reviewPrompted: true,
      reviewPromptCount: current.reviewPromptCount + 1,
      reviewLastEntry: current.totalEntries,
      reviewLastAgeUp: current.totalAgeUps,
    });
    // meta is a stable api (ref + memoised update); intentionally omitted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { reviewVisible, resolveReview };
}
