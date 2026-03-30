import { createFileRoute } from "@tanstack/react-router";
import { useEditorSession } from "#/hooks/use-editor-session";
import EditorPane from "@/components/EditorPane";
import PreviewPane from "@/components/PreviewPane";
import Toolbar from "@/components/Toolbar";

export const Route = createFileRoute("/")({ component: EditorPage });

function EditorPage() {
  const {
    content,
    setContent,
    mode,
    setMode,
    locked,
    streaming,
    processDocument,
  } = useEditorSession();

  return (
    // h-[calc(100dvh-48px)]: fill viewport below the 48px sticky header
    <div className="flex h-[calc(100dvh-48px)] flex-col overflow-hidden bg-white dark:bg-zinc-950">
      <Toolbar mode={mode} onModeChange={setMode} loading={streaming} />

      <div className="flex flex-1 divide-x divide-zinc-200 overflow-hidden dark:divide-zinc-800">
        <div className="flex-1 overflow-hidden">
          <EditorPane
            content={content}
            onChange={setContent}
            onSave={processDocument}
            locked={locked}
          />
        </div>
        <div className="flex-1 overflow-hidden">
          <PreviewPane content={content} streaming={streaming} />
        </div>
      </div>
    </div>
  );
}
