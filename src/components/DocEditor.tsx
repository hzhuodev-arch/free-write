import { api } from "@convex/_generated/api";
import type { Document } from "@convex/shared/document";
import { HTTP_ROUTES } from "@convex/shared/httpRoutes";
import { useStream } from "@convex-dev/persistent-text-streaming/react";
import { useEffect, useEffectEvent } from "react";
import { useEditor } from "@/context/editor";
import { LayoutProvider } from "@/context/layout";
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
  const { sessionAvailable, streamId, closePromptBar } = useEditor();

  return (
    <LayoutProvider>
      {!sessionAvailable && <SessionLockedBanner />}
      <Toolbar />
      <PromptBar />
      {/* Key on streamId so useStream fully resets between streams */}
      <StreamingSplitEditor
        key={streamId ?? "idle"}
        onClickEditor={closePromptBar}
      />
    </LayoutProvider>
  );
}

function StreamingSplitEditor({
  onClickEditor,
}: {
  onClickEditor: () => void;
}) {
  const {
    streaming,
    streamId,
    content,
    setAdditionalPrompt,
    closePromptBar,
    setFromServer,
  } = useEditor();

  const stream = useStream(
    api.stream.body,
    streamUrl,
    streaming,
    streamId,
  );

  const handleDone = useEffectEvent(() => {
    setAdditionalPrompt("");
    closePromptBar();
    setFromServer(stream.text);
  });
  useEffect(() => {
    if (streaming && stream.status === "done") handleDone();
  }, [streaming, stream.status]);

  const previewContent = streaming ? stream.text : content;

  return (
    <SplitEditor
      onClickEditor={onClickEditor}
      previewContent={previewContent}
      streaming={streaming}
    />
  );
}
