import { getRouteApi } from "@tanstack/react-router";
import { type RefObject, useRef } from "react";
import { useAutoScroll } from "#/editor/hooks/use-auto-scroll";
import { useScrollSync } from "#/editor/hooks/use-scroll-sync";
import { usePersistedState } from "#/lib/hooks/use-persisted-state";
import { cn } from "@/lib/utils";
import EditorPane from "./EditorPane";
import PreviewPane from "./PreviewPane";

interface SplitEditorProps {
  previewContent: string;
  streaming: boolean;
  onClickEditor?: () => void;
}

const MIN_RATIO = 20;
const MAX_RATIO = 80;

const indexRoute = getRouteApi("/");

export default function SplitEditor({
  previewContent,
  streaming,
  onClickEditor,
}: SplitEditorProps) {
  const { editor, preview, onEditorScroll, onPreviewScroll } = useScrollSync();
  const { onScroll } = useAutoScroll(preview, streaming);
  const { view } = indexRoute.useSearch();

  const [splitRatio, setSplitRatio] = usePersistedState(
    "free-write:split-ratio",
    50,
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  function onDragStart(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    isDragging.current = true;

    const isTouch = "touches" in e;

    function onMove(ev: MouseEvent | TouchEvent) {
      if (!isDragging.current) return;
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const clientX =
        "touches" in ev ? ev.touches[0].clientX : (ev as MouseEvent).clientX;
      const ratio = Math.min(
        MAX_RATIO,
        Math.max(MIN_RATIO, ((clientX - rect.left) / rect.width) * 100),
      );
      setSplitRatio(ratio);
    }

    function onEnd() {
      isDragging.current = false;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onEnd);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    if (isTouch) {
      document.addEventListener("touchmove", onMove);
      document.addEventListener("touchend", onEnd);
    } else {
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onEnd);
    }
  }

  const handlePreviewScroll = (element: HTMLElement) => {
    onPreviewScroll(element);
    onScroll(element);
  };

  const editorCollapsed = view === "preview";
  const previewCollapsed = view === "editor";

  const editorStyle = view === "split" ? { width: `${splitRatio}%` } : undefined;
  const previewStyle =
    view === "split" ? { width: `${100 - splitRatio}%` } : undefined;

  return (
    <div ref={containerRef} className="relative flex flex-1 overflow-hidden">
      {/* Editor pane */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: <its k> */}
      <div
        className={cn(
          "overflow-hidden",
          editorCollapsed ? "w-0" : view !== "split" && "flex-1",
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

      {/* Draggable divider — only interactive in split mode */}
      {view === "split" && (
        // biome-ignore lint/a11y/noStaticElementInteractions: drag handle
        <div
          className="group relative z-10 w-0 shrink-0 cursor-col-resize"
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
      )}

      {/* Preview pane */}
      <div
        className={cn(
          "overflow-hidden",
          previewCollapsed ? "w-0" : view !== "split" && "flex-1",
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
