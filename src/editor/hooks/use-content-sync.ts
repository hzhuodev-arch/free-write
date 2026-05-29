import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation } from "convex/react";
import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";

const DEBOUNCE_MS = 500;

/**
 * Syncs an editor's local content with the server.
 *
 * State model: `local` (UI state) and `saved` (last value acked by the
 * server). `dirty` is derived as `local !== saved` — no separate flag, no
 * race-condition bookkeeping. Every write path updates `saved` on success.
 */
export function useContentSync(
  docId: Id<"documents">,
  remoteContent: string,
  sessionId: string,
  ready = true,
) {
  const updateContent = useMutation(api.documents.updateContent);

  const [local, setLocal] = useState(remoteContent);
  const localRef = useRef(local);
  localRef.current = local;

  // Last content known to be persisted on the server.
  const savedRef = useRef(remoteContent);
  const isDirty = useCallback(() => localRef.current !== savedRef.current, []);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  const persist = async (value: string) => {
    await updateContent({ docId, content: value, sessionId });
    savedRef.current = value;
  };

  // Accept remote updates only when the editor is clean.
  useEffect(() => {
    if (!isDirty()) {
      savedRef.current = remoteContent;
      setLocal(remoteContent);
    }
  }, [remoteContent, isDirty]);

  // Flush pending writes when `ready` flips true and on unmount.
  const flushNow = useEffectEvent(() => {
    cancelTimer();
    if (isDirty()) void persist(localRef.current);
  });
  useEffect(() => {
    if (!ready) return;
    flushNow();
    return () => flushNow();
  }, [ready]);

  const setContent = (value: string) => {
    setLocal(value);
    cancelTimer();
    if (ready)
      timerRef.current = setTimeout(() => void persist(value), DEBOUNCE_MS);
  };

  // Awaitable flush — call before operations that read server-side content.
  const flush = async () => {
    cancelTimer();
    if (ready && isDirty()) await persist(localRef.current);
  };

  // Adopt a value already persisted server-side (e.g. AI-generated output).
  const setFromServer = (value: string) => {
    setLocal(value);
    savedRef.current = value;
  };

  return { contentLocal: local, setContent, flush, setFromServer };
}
