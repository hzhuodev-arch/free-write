import { api } from "@convex/_generated/api";
import type { Doc } from "@convex/_generated/dataModel";
import { SESSION_STALE_TIME_MS } from "@convex/shared/const";
import type { Mode } from "@convex/shared/types";
import type { StreamId } from "@convex-dev/persistent-text-streaming";
import { useMutation } from "convex/react";
import { type ReactNode, useEffect, useEffectEvent, useState } from "react";
import { useContentSync } from "#/hooks/use-content-sync";
import { useKeyboardShortcut } from "#/hooks/use-keyboard-shortcut";
import { useNow } from "#/hooks/use-now";
import { usePersistedState } from "#/hooks/use-persisted-state";
import { EditorContext } from "@/context/editor";
import type { Status } from "@/types";

export default function EditorProvider({
  doc,
  sessionId,
  ready = true,
  children,
}: {
  doc: Doc<"documents">;
  sessionId: string;
  ready?: boolean;
  children: ReactNode;
}) {
  const docId = doc._id;

  // --- Mutations ---
  const claimSession = useMutation(api.document.claimSession);
  const createStream = useMutation(api.document.createStream);
  const clearStream = useMutation(api.document.clearActiveStream);
  const releaseSession = useMutation(api.document.releaseSession);

  // --- Session ---
  const now = useNow();
  const sessionAvailable =
    doc.activeSession === undefined ||
    doc.activeSession.sessionId === sessionId ||
    now - doc.activeSession.lastUpdatedAt > SESSION_STALE_TIME_MS;

  const onRelease = useEffectEvent(() =>
    releaseSession({ sessionId, documentId: docId }),
  );
  useEffect(() => () => void onRelease(), []);

  // --- Content ---
  const { contentLocal, setContent, flush, setFromServer } = useContentSync(
    docId,
    doc.content,
    sessionId,
    ready,
  );

  // --- Stream lifecycle ---
  const [initiating, setInitiating] = useState(false);
  const activeStreamId = doc.activeStreamId;
  const streaming = activeStreamId != null;

  const status: Status = initiating
    ? "initiating"
    : streaming
      ? "streaming"
      : "ready";

  const transform = async () => {
    await flush();
    await claimSession({ documentId: docId, sessionId });
    setInitiating(true);
    try {
      await createStream({
        documentId: docId,
        content: contentLocal,
        mode,
        additionalPrompt: additionalPrompt.trim() || undefined,
        sessionId,
      });
    } finally {
      setInitiating(false);
    }
  };

  const cancel = () => {
    clearStream({ documentId: docId });
  };

  const takeover = () => {
    claimSession({ documentId: docId, sessionId });
  };

  // --- Prompt bar ---
  const [mode, setMode] = usePersistedState<Mode>("free-write:mode", "format");
  const [additionalPrompt, setAdditionalPrompt] = useState("");
  const [promptBarOpen, setPromptBarOpen] = useState(false);
  const closePromptBar = () => setPromptBarOpen(false);

  // --- Keyboard shortcuts ---
  useKeyboardShortcut(["mod", "s"], () => {
    if (sessionAvailable) transform();
  });
  useKeyboardShortcut(["Escape"], () => {
    if (streaming) cancel();
  });

  // --- Derived ---
  const locked = initiating || streaming || !sessionAvailable;

  return (
    <EditorContext.Provider
      value={{
        content: contentLocal,
        setContent,
        setFromServer,
        status,
        locked,
        sessionAvailable,
        streaming,
        streamId: activeStreamId as StreamId | undefined,
        mode,
        setMode,
        transform,
        cancel,
        takeover,
        additionalPrompt,
        setAdditionalPrompt,
        promptBarOpen,
        setPromptBarOpen,
        closePromptBar,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}
