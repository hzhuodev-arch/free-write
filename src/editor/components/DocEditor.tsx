import { api } from "@convex/_generated/api";
import type { Document } from "@convex/shared/document";
import { HTTP_ROUTES } from "@convex/shared/httpRoutes";
import { useStream } from "@convex-dev/persistent-text-streaming/react";
import { useEffect, useEffectEvent, useState } from "react";
import { useEditor } from "@/editor/context/editor-context";
import EditorProvider from "./EditorProvider";
import PromptBar from "./PromptBar";
import { SessionLockedBanner } from "./SessionLockedBanner";
import SplitEditor from "./SplitEditor";
import Toolbar from "./Toolbar";

const streamUrl = new URL(
  HTTP_ROUTES.streamDocument(import.meta.env.VITE_CONVEX_SITE_URL),
);

export default function DocEditor({
  doc,
  sessionId,
  ready = true,
}: {
  doc: Document;
  sessionId: string;
  ready?: boolean;
}) {
  return (
    <EditorProvider doc={doc} sessionId={sessionId} ready={ready}>
      <DocEditorLayout />
    </EditorProvider>
  );
}

function DocEditorLayout() {
  const { sessionAvailable, streaming, streamId, content, closePromptBar } =
    useEditor();
  const [streamText, setStreamText] = useState("");

  const previewContent = streaming ? streamText : content;

  return (
    <>
      {!sessionAvailable && <SessionLockedBanner />}
      <Toolbar />
      <PromptBar />
      {/* Key on streamId so useStream fully resets between streams.
          Kept here (not around SplitEditor) so EditorPane's CodeMirror
          instance — and its undo history — survives stream lifecycle. */}
      <StreamWatcher key={streamId ?? "idle"} onText={setStreamText} />
      <SplitEditor
        onClickEditor={closePromptBar}
        previewContent={previewContent}
        streaming={streaming}
      />
    </>
  );
}

function StreamWatcher({ onText }: { onText: (text: string) => void }) {
  const {
    streaming,
    streamId,
    setAdditionalPrompt,
    closePromptBar,
    setFromServer,
  } = useEditor();

  const stream = useStream(api.stream.body, streamUrl, streaming, streamId);

  useEffect(() => {
    onText(stream.text);
  }, [stream.text, onText]);

  const handleDone = useEffectEvent(() => {
    setAdditionalPrompt("");
    closePromptBar();
    setFromServer(stream.text);
  });
  useEffect(() => {
    if (streaming && stream.status === "done") handleDone();
  }, [streaming, stream.status]);

  return null;
}
