import { useCallback, useEffect, useRef, useState } from 'react';
import { GameState } from '@/types/game';
import { evaluateAchievements, recordLifeEnd } from '@/engine/metaProgression';
import { AppMetaApi } from './useAppMeta';
import { AppMeta, DynastyRecord, LifetimeStats } from '../appMeta';

export interface ProgressSnapshot {
  stats: LifetimeStats;
  achievements: string[];
  dynasty: DynastyRecord[];
}

/**
 * Drives cross-life progression: on every state change it evaluates achievements
 * (queuing any newly-earned ones for a toast), and on the death transition it
 * folds the finished life into lifetime stats + the Hall of Legends. Persists
 * through the meta store; exposes a snapshot getter for the Chronicle screen.
 */
export function useMetaProgression(state: GameState, meta: AppMetaApi, loaded: boolean) {
  const prevDead = useRef(state.dead);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);

  useEffect(() => {
    if (!loaded || !meta.ready) return;

    let m: AppMeta = meta.metaRef.current;
    let changed = false;

    // Record the life the moment it ends (death transition).
    if (state.dead && !prevDead.current) {
      m = recordLifeEnd(m, state);
      changed = true;
    }
    prevDead.current = state.dead;

    const { unlocked, newly } = evaluateAchievements(m, state, state.dead);
    if (newly.length > 0) {
      m = { ...m, achievements: unlocked };
      changed = true;
      setNewAchievements((q) => [...q, ...newly]);
    }

    if (changed) {
      meta.update({ stats: m.stats, dynasty: m.dynasty, achievements: m.achievements });
    }
    // meta is a stable api (ref + memoised update); intentionally omitted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, loaded, meta.ready]);

  const dismissAchievement = useCallback(() => setNewAchievements((q) => q.slice(1)), []);

  const getProgress = useCallback((): ProgressSnapshot => {
    const m = meta.metaRef.current;
    return { stats: m.stats, achievements: m.achievements, dynasty: m.dynasty };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { newAchievements, dismissAchievement, getProgress };
}
