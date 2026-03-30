import { Loader2 } from "lucide-react";
import { MODES, type Mode } from "../types";

interface ToolbarProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  loading: boolean;
}

export default function Toolbar({ mode, onModeChange, loading }: ToolbarProps) {
  return (
    <div className="flex h-11 shrink-0 items-center gap-3 border-b border-zinc-200 bg-white px-5 dark:border-zinc-800 dark:bg-zinc-950">
      {/* Mode segmented control */}
      <fieldset
        aria-label="Formatting mode"
        className="m-0 flex items-center gap-0.5 rounded-[7px] border border-zinc-200 bg-zinc-100 p-0.5 dark:border-zinc-800 dark:bg-zinc-900"
      >
        {MODES.map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m}
            onClick={() => onModeChange(m)}
            className={[
              "rounded-[5px] px-3 py-1 text-xs font-medium capitalize leading-tight transition-all",
              mode === m
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100"
                : "text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300",
            ].join(" ")}
          >
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </fieldset>

      <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />

      <span className="text-[11px] text-zinc-400">
        Press{" "}
        <kbd className="rounded border border-zinc-200 bg-zinc-100 px-1 py-0.5 font-mono text-[10px] text-zinc-500 shadow-[0_1px_0_var(--color-zinc-200)] dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:shadow-zinc-700">
          ⌘S
        </kbd>{" "}
        to transform
      </span>

      {/* Status — right-aligned */}
      <div className="ml-auto flex items-center gap-2">
        {loading ? (
          <>
            <Loader2
              data-testid="spinner"
              className="h-3.5 w-3.5 animate-spin text-blue-500"
            />
            <span className="text-[11.5px] font-medium text-blue-600 dark:text-blue-400">
              Formatting…
            </span>
          </>
        ) : (
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 dark:border-emerald-800/60 dark:bg-emerald-950/40">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-[11.5px] font-medium text-emerald-700 dark:text-emerald-400">
              Ready
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
