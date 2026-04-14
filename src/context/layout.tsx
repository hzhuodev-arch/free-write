import {
  createContext,
  type RefObject,
  useContext,
  useRef,
  useState,
} from "react";
import { usePersistedState } from "#/hooks/use-persisted-state";

export type ViewMode = "editor" | "split" | "preview";

const MIN_RATIO = 20;
const MAX_RATIO = 80;

interface LayoutContextValue {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  splitRatio: number;
  containerRef: RefObject<HTMLDivElement | null>;
  onDragStart: (e: React.MouseEvent | React.TouchEvent) => void;
}

const LayoutContext = createContext<LayoutContextValue | null>(null);

export function useLayout() {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error("useLayout must be used within LayoutProvider");
  return ctx;
}

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [splitRatio, setSplitRatio] = usePersistedState(
    "free-write:split-ratio",
    50,
  );
  const [viewMode, setViewMode] = useState<ViewMode>("split");
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

  return (
    <LayoutContext.Provider
      value={{
        viewMode,
        setViewMode,
        splitRatio,
        containerRef,
        onDragStart,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}
