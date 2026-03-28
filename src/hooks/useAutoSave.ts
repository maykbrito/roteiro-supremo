import { useEffect, useRef, useState, useCallback } from 'react';
import { Id } from '../../convex/_generated/dataModel';
import { ScriptData } from '../types';

interface UseAutoSaveOptions {
  data: ScriptData;
  scriptId: Id<'scripts'> | null;
  saveFn: (args: { id?: Id<'scripts'> } & ScriptData) => Promise<Id<'scripts'>>;
  onNewId: (id: Id<'scripts'>) => void;
  /** Delay in ms after last change before saving. Default: 700 */
  delay?: number;
}

/**
 * Debounced auto-save hook for Convex.
 *
 * - Saves only after `delay`ms of inactivity (default 700ms)
 * - Skips saves triggered by loading a script from the server (dirty-check via JSON snapshot)
 * - Skips saves when data hasn't changed since the last successful save
 * - Flushes any pending save immediately on unmount
 */
export function useAutoSave({
  data,
  scriptId,
  saveFn,
  onNewId,
  delay = 700,
}: UseAutoSaveOptions) {
  const [isSaving, setIsSaving] = useState(false);

  // JSON snapshot of the last data that was actually saved (or seeded from load)
  const lastSavedRef = useRef<string | null>(null);

  // Tracks the previous scriptId to detect script switches
  const prevScriptIdRef = useRef<Id<'scripts'> | null | undefined>(undefined);

  // Pending snapshot waiting to flush (set during debounce window, cleared on save)
  const pendingDataRef = useRef<{ data: ScriptData; scriptId: Id<'scripts'> | null } | null>(null);

  // Keep a stable ref to onNewId so useCallback doesn't recreate save on every render
  const onNewIdRef = useRef(onNewId);
  useEffect(() => { onNewIdRef.current = onNewId; });

  // Stable save function — only depends on saveFn (Convex mutations are stable refs)
  const save = useCallback(
    async (snapshot: ScriptData, currentScriptId: Id<'scripts'> | null) => {
      if (!currentScriptId && !snapshot.title.trim() && !snapshot.objective.trim()) {
        return; // Nothing worth persisting yet
      }

      const serialized = JSON.stringify(snapshot);
      if (serialized === lastSavedRef.current) {
        return; // Identical to last save — skip
      }

      try {
        setIsSaving(true);
        const id = await saveFn({
          id: currentScriptId ?? undefined,
          ...snapshot,
        });
        lastSavedRef.current = serialized;
        if (!currentScriptId && id) {
          onNewIdRef.current(id);
        }
      } catch (error) {
        console.error('Erro ao salvar no Convex:', error);
      } finally {
        setIsSaving(false);
      }
    },
    [saveFn]
  );

  // Debounced save — also seeds the snapshot on first render and on script switch
  useEffect(() => {
    const scriptSwitched = prevScriptIdRef.current !== undefined && prevScriptIdRef.current !== scriptId;
    const isMount = prevScriptIdRef.current === undefined;
    prevScriptIdRef.current = scriptId;

    if (isMount || scriptSwitched) {
      // Seed last-saved snapshot from freshly loaded data so the dirty-check baseline is correct
      lastSavedRef.current = JSON.stringify(data);
      pendingDataRef.current = null;
      return;
    }

    pendingDataRef.current = { data, scriptId };

    const timer = setTimeout(() => {
      pendingDataRef.current = null;
      save(data, scriptId);
    }, delay);

    return () => clearTimeout(timer);
  }, [data, scriptId, delay, save]);

  // Flush on unmount — save immediately if a change is sitting in the debounce window
  useEffect(() => {
    return () => {
      const pending = pendingDataRef.current;
      if (pending) {
        save(pending.data, pending.scriptId);
      }
    };
  }, [save]);

  return { isSaving };
}
