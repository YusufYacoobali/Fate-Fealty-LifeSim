import React, { useCallback, useEffect, useState } from 'react';
import { GameAction, NewLifeOptions } from '../gameReducer';
import { AppMetaApi } from './useAppMeta';

/**
 * Owns the character-creation gate: shows the creation screen on first run and
 * whenever the player asks for a new life, and turns the chosen options into a
 * NEW_LIFE dispatch. Single responsibility: onboarding flow.
 */
export function useCharacterCreation(meta: AppMetaApi, loaded: boolean, dispatch: React.Dispatch<GameAction>) {
  const [creating, setCreating] = useState(false);

  // First-ever run: greet the player with character creation.
  useEffect(() => {
    if (loaded && meta.ready && !meta.metaRef.current.onboarded) {
      setCreating(true);
    }
  }, [loaded, meta.ready, meta.metaRef]);

  /** Show the creation screen (death-screen "New Life" / settings "Restart"). */
  const requestNewLife = useCallback(() => setCreating(true), []);

  /** Commit the chosen character and dismiss the screen. */
  const createCharacter = useCallback(
    (options: NewLifeOptions) => {
      dispatch({ type: 'NEW_LIFE', options });
      meta.update({ onboarded: true });
      setCreating(false);
    },
    [dispatch, meta],
  );

  return { creating, requestNewLife, createCharacter };
}
