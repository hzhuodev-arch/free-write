import { useEditor } from "#/editor/context/editor-context";
import { cn } from "#/lib/utils";

export function SessionLockedBanner() {
  const { takeover } = useEditor();

  return (
    <div
      className={cn(
        "flex items-center justify-between px-5 py-2",
        "border-b border-amber-200 bg-amber-50",
        "dark:border-amber-800/50 dark:bg-amber-950/30",
      )}
    >
      <span className={cn("text-sm text-amber-800", "dark:text-amber-200")}>
        This document is being edited in another session.
      </span>
      <button
        type="button"
        onClick={takeover}
        className={cn(
          "rounded px-3 py-1 text-sm font-medium",
          "bg-amber-200 text-amber-900 hover:bg-amber-300",
          "dark:bg-amber-800 dark:text-amber-100 dark:hover:bg-amber-700",
        )}
      >
        Take over
      </button>
    </div>
  );
}
