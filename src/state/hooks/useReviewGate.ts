import { useCallback, useEffect, useRef, useState } from 'react';
import { GameState } from '@/types/game';
import { entriesDelta, shouldPromptReview } from '@/services/reviewLogic';
import { AppMetaApi } from './useAppMeta';

/**
 * Tracks cumulative life entries and decides when the review prompt should
 * appear. Single responsibility: the review-prompt gate. The actual native
 * review presentation lives in the ReviewPrompt component / review service.
 */
export function useReviewGate(state: GameState, loaded: boolean, meta: AppMetaApi) {
  const prevFeedLen = useRef(state.feed.length);
  const [reviewVisible, setReviewVisible] = useState(false);

  useEffect(() => {
    if (!loaded || !meta.ready) return;

    const delta = entriesDelta(prevFeedLen.current, state.feed.length);
    prevFeedLen.current = state.feed.length;
    if (delta > 0) {
      meta.update({ totalEntries: meta.metaRef.current.totalEntries + delta });
    }

    if (!reviewVisible && shouldPromptReview(meta.metaRef.current, state)) {
      setReviewVisible(true);
    }
    // meta is a stable api (ref + memoised update); intentionally omitted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, loaded, meta.ready, reviewVisible]);

  const resolveReview = useCallback(() => {
    setReviewVisible(false);
    meta.update({ reviewPrompted: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { reviewVisible, resolveReview };
}
