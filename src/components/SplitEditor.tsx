import { type RefObject } from "react";
import { useAutoScroll } from "#/hooks/use-auto-scroll";
import { useScrollSync } from "#/hooks/use-scroll-sync";
import { useLayout } from "@/context/layout";
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
  const { viewMode, splitRatio, containerRef, onDragStart } = useLayout();

  const handlePreviewScroll = (element: HTMLElement) => {
    onPreviewScroll(element);
    onScroll(element);
  };

  const editorCollapsed = viewMode === "preview";
  const previewCollapsed = viewMode === "editor";

  const editorStyle =
    viewMode === "split" ? { width: `${splitRatio}%` } : undefined;
  const previewStyle =
    viewMode === "split" ? { width: `${100 - splitRatio}%` } : undefined;

  return (
    <div ref={containerRef} className="relative flex flex-1 overflow-hidden">
      {/* Editor pane */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: <its k> */}
      <div
        className={cn(
          "overflow-hidden",
          editorCollapsed ? "w-0" : viewMode !== "split" && "flex-1",
        )}
        style={editorStyle}
        onMouseDown={onClickEditor}
      >
        <EditorPane
          onScroll={onEditorScroll}
          onViewCreated={(scrollDOM) => {
            editor.current = scrollDOM;
          }}
        />
      </div>

      {/* Draggable divider */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: drag handle */}
      <div
        className={cn(
          "group relative z-10 shrink-0 cursor-col-resize",
          viewMode === "split" ? "w-0" : "w-1",
        )}
        onMouseDown={onDragStart}
        onTouchStart={onDragStart}
      >
        {/* Visual line */}
        <div
          className={cn(
            "absolute inset-y-0 left-1/2 -translate-x-1/2",
            "w-px bg-zinc-200 group-hover:w-[3px] group-hover:bg-zinc-300",
            "dark:bg-zinc-800 dark:group-hover:bg-zinc-600",
          )}
        />
        {/* Wider hit area */}
        <div className="absolute inset-y-0 left-1/2 w-3 -translate-x-1/2" />
      </div>

      {/* Preview pane */}
      <div
        className={cn(
          "overflow-hidden",
          previewCollapsed ? "w-0" : viewMode !== "split" && "flex-1",
        )}
        style={previewStyle}
      >
        <PreviewPane
          content={previewContent}
          ref={preview as RefObject<HTMLDivElement>}
          onScroll={handlePreviewScroll}
        />
      </div>
    </div>
  );
}
