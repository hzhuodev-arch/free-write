import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useEffect, useEffectEvent, useRef, useState } from "react";

const DEBOUNCE_MS = 500;

export function useContentSync(
  docId: Id<"documents">,
  remoteContent: string,
  sessionId: string,
  ready = true,
) {
  const updateContent = useMutation(api.document.updateContent);

  // --- Local content state ---
  const [contentLocal, setContentLocal] = useState(remoteContent);
  const contentRef = useRef(contentLocal);
  contentRef.current = contentLocal;

  // Accept remote updates when local hasn't been edited
  useEffect(() => {
    if (!dirtyRef.current) setContentLocal(remoteContent);
  }, [remoteContent]);

  // --- Debounced persistence ---
  const dirtyRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const save = (value: string) => {
    updateContent({ docId, content: value, sessionId }).then(() => {
      if (dirtyRef.current && contentRef.current === value) {
        dirtyRef.current = false;
      }
    });
  };

  const scheduleSave = (value: string) => {
    dirtyRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (ready) timerRef.current = setTimeout(() => save(value), DEBOUNCE_MS);
  };

  const cancelPendingSave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  // Flush on ready; save + cleanup on unmount
  const onSave = useEffectEvent(() => {
    cancelPendingSave();
    save(contentRef.current);
  });
  useEffect(() => {
    if (ready && dirtyRef.current) onSave();
    return () => {
      if (dirtyRef.current && ready) onSave();
    };
  }, [ready]);

  // --- Public API ---

  const setContent = (value: string) => {
    setContentLocal(value);
    scheduleSave(value);
  };

  // Call before any operation that reads server-side content (e.g. AI rewrite)
  // to ensure pending local edits are persisted first.
  const flush = async () => {
    cancelPendingSave();
    if (dirtyRef.current && ready) {
      const snapshot = contentRef.current;
      await updateContent({ docId, content: snapshot, sessionId });
      if (contentRef.current === snapshot) dirtyRef.current = false;
    }
  };

  // Replace local content with a value already persisted on the server
  // (e.g. AI-generated output), skipping the save round-trip.
  const setFromServer = (value: string) => {
    setContentLocal(value);
    dirtyRef.current = false;
  };

  return { contentLocal, setContent, flush, setFromServer };
}
