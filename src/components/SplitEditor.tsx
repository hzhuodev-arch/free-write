import { type RefObject } from "react";
import { useAutoScroll } from "#/hooks/use-auto-scroll";
import { useScrollSync } from "#/hooks/use-scroll-sync";
import { cn } from "@/lib/utils";
import EditorPane from "./EditorPane";
import PreviewPane from "./PreviewPane";

interface SplitEditorProps {
  previewContent: string;
  streaming: boolean;
  onClickEditor?: () => void;
}

export default function SplitEditor({
  previewContent,
  streaming,
  onClickEditor,
}: SplitEditorProps) {
  const { editor, preview, onEditorScroll, onPreviewScroll } = useScrollSync();
  const { onScroll } = useAutoScroll(preview, streaming);

  const handlePreviewScroll = (element: HTMLElement) => {
    onPreviewScroll(element);
    onScroll(element);
  };

  return (
    <div
      className={cn(
        "flex flex-1 divide-x divide-zinc-200 overflow-hidden",
        "dark:divide-zinc-800",
      )}
    >
      {/** biome-ignore lint/a11y/noStaticElementInteractions: <its k> */}
      <div className="flex-1 overflow-hidden" onMouseDown={onClickEditor}>
        <EditorPane
          onScroll={onEditorScroll}
          onViewCreated={(scrollDOM) => {
            editor.current = scrollDOM;
          }}
        />
      </div>
      <div className="flex-1 overflow-hidden">
        <PreviewPane
          content={previewContent}
          ref={preview as RefObject<HTMLDivElement>}
          onScroll={handlePreviewScroll}
        />
      </div>
    </div>
  );
}
