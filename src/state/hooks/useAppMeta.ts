import { useCallback, useEffect, useRef, useState } from 'react';
import { AppMeta, DEFAULT_META, loadMeta, saveMeta } from '../appMeta';

export interface AppMetaApi {
  /** Live reference to the current meta (read it inside effects/callbacks). */
  metaRef: React.MutableRefObject<AppMeta>;
  /** True once meta has been hydrated from disk. */
  ready: boolean;
  /** Merge a patch into meta and persist it. */
  update: (patch: Partial<AppMeta>) => void;
}

/**
 * Owns the cross-life app metadata (entry counter, prompt/notification flags).
 * Exposed as a ref + updater so dependent hooks can read/write without causing
 * re-render churn. Single responsibility: app-level meta persistence.
 */
export function useAppMeta(): AppMetaApi {
  const metaRef = useRef<AppMeta>({ ...DEFAULT_META });
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const m = await loadMeta();
      if (!active) return;
      metaRef.current = m;
      setReady(true);
    })();
    return () => {
      active = false;
    };
  }, []);

  const update = useCallback((patch: Partial<AppMeta>) => {
    metaRef.current = { ...metaRef.current, ...patch };
    const snapshot = metaRef.current;
    // App-state changes and reward claims can arrive close together. Serialise
    // writes so a slower older snapshot can never overwrite the latest one.
    saveQueueRef.current = saveQueueRef.current.then(() => saveMeta(snapshot));
  }, []);

  return { metaRef, ready, update };
}
