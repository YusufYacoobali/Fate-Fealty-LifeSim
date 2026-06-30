import React, { useEffect, useReducer, useState } from 'react';
import { GameState } from '@/types/game';
import { createLife } from '@/engine/gameState';
import { GameAction, gameReducer } from '../gameReducer';
import { loadGame, saveGame } from '../persistence';

export interface PersistentGame {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  loaded: boolean;
}

/**
 * Owns the game reducer plus its persistence lifecycle — hydrate once on mount,
 * then save on every change. Single responsibility: the durable game state.
 */
export function usePersistentGame(): PersistentGame {
  const [state, dispatch] = useReducer(gameReducer, undefined, () => createLife());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const saved = await loadGame();
      if (!active) return;
      if (saved) dispatch({ type: 'HYDRATE', state: saved });
      setLoaded(true);
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (loaded) saveGame(state);
  }, [state, loaded]);

  return { state, dispatch, loaded };
}
