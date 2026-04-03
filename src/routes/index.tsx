import { api } from "@convex/_generated/api";
import { HTTP_ROUTES } from "@convex/shared/httpRoutes";
import { useStream } from "@convex-dev/persistent-text-streaming/react";
import { createFileRoute } from "@tanstack/react-router";
import { type RefObject, useEffect, useEffectEvent } from "react";
import { useAutoScroll } from "#/hooks/use-auto-scroll";
import { useEditorSession } from "#/hooks/use-editor-session";
import { useScrollSync } from "#/hooks/use-scroll-sync";
import EditorPane from "@/components/EditorPane";
import PreviewPane from "@/components/PreviewPane";
import Toolbar from "@/components/Toolbar";

export const Route = createFileRoute("/")({
  component: EditorPage,
});

function EditorPage() {
  const {
    content,
    setContent,
    mode,
    setMode,
    locked,
    streaming,
    streamId,
    driven,
    initiateProcessing,
    finishProcessing,
  } = useEditorSession();

  const stream = useStream(
    api.document.streamBody,
    new URL(HTTP_ROUTES.streamDocument(import.meta.env.VITE_CONVEX_SITE_URL)),
    driven,
    streamId,
  );

  const onStreamDone = useEffectEvent((text: string) => finishProcessing(text));
  useEffect(() => {
    if (stream.status === "done") onStreamDone(stream.text);
  }, [stream.status, stream.text]);

  const { editor, preview, onEditorScroll, onPreviewScroll } = useScrollSync();

  const { onScroll } = useAutoScroll(preview, streaming);

  const handlePreviewScroll = (element: HTMLElement) => {
    onPreviewScroll(element);
    onScroll(element);
  };

  const previewContent = stream.status === "streaming" ? stream.text : content;

  return (
    // h-[calc(100dvh-48px)]: fill viewport below the 48px sticky header
    <div className="flex h-[calc(100dvh-48px)] flex-col overflow-hidden bg-white dark:bg-zinc-950">
      <Toolbar mode={mode} onModeChange={setMode} loading={streaming} />

      <div className="flex flex-1 divide-x divide-zinc-200 overflow-hidden dark:divide-zinc-800">
        <div className="flex-1 overflow-hidden">
          <EditorPane
            content={content}
            onChange={setContent}
            initiateProcessing={initiateProcessing}
            locked={locked}
            onScroll={onEditorScroll}
            onViewCreated={(scrollDOM) => {
              editor.current = scrollDOM;
            }}
          />
        </div>
        <div className="flex-1 overflow-hidden">
          <PreviewPane
            content={previewContent}
            streaming={streaming}
            ref={preview as RefObject<HTMLDivElement>}
            onScroll={handlePreviewScroll}
          />
        </div>
      </div>
    </div>
  );
}
