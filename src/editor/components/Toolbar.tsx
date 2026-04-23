import { getRouteApi, Link } from "@tanstack/react-router";
import { MODES } from "convex/shared/types";
import {
  Columns2,
  HelpCircle,
  Loader2,
  PanelLeft,
  PanelRight,
} from "lucide-react";
import { SidebarTrigger } from "@/design-system/components/sidebar";
import { useEditor } from "@/editor/context/editor-context";
import type { ViewMode } from "@/editor/types";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/shell/components/ThemeToggle";

const indexRoute = getRouteApi("/");

const VIEW_MODES: { mode: ViewMode; icon: typeof PanelLeft; label: string }[] =
  [
    { mode: "editor", icon: PanelLeft, label: "Full editor" },
    { mode: "split", icon: Columns2, label: "Split view" },
    { mode: "preview", icon: PanelRight, label: "Full preview" },
  ];

export default function Toolbar() {
  const { mode, setMode, status, transform, cancel, sessionAvailable } =
    useEditor();
  const { view } = indexRoute.useSearch();
  const navigate = indexRoute.useNavigate();
  const setView = (v: ViewMode) =>
    navigate({ search: (s) => ({ ...s, view: v}), replace: true });
  const disabled = !sessionAvailable;

  return (
    <div
      className={cn(
        "flex h-11 shrink-0 items-center gap-4",
        "border-b border-zinc-200 bg-white px-4",
        "dark:border-zinc-800 dark:bg-zinc-950",
      )}
    >
      <SidebarTrigger
        className={cn(
          "-ml-1 md:hidden",
          "text-zinc-500 hover:text-zinc-700",
          "dark:text-zinc-400 dark:hover:text-zinc-200",
        )}
      />

      {/* Mode segmented control */}
      <fieldset
        aria-label="Formatting mode"
        className={cn(
          "m-0 flex items-center gap-0.5 rounded-[7px]",
          "border border-zinc-200 bg-zinc-100 p-0.5",
          "dark:border-zinc-800 dark:bg-zinc-900",
        )}
      >
        {MODES.map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m}
            disabled={disabled}
            onClick={() => setMode(m)}
            className={cn(
              "rounded-[5px] px-2.5 py-1 text-[11px]",
              "font-medium capitalize leading-tight transition-shadow",
              mode === m
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100"
                : "text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300",
            )}
          >
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </fieldset>

      {/* Transform / Cancel button */}
      <button
        type="button"
        disabled={disabled}
        onClick={status !== "ready" ? cancel : transform}
        className={cn(
          "hidden min-w-26 items-center justify-center gap-1.5 rounded-[5px] px-2.5 py-1 sm:flex",
          "text-[11px] font-medium leading-tight",
          "border outline-none",
          status !== "ready"
            ? [
                "border-amber-200 bg-amber-50 text-amber-700",
                "hover:border-amber-300 hover:bg-amber-100 hover:text-amber-800",
                "active:bg-amber-100/80",
                "dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300",
                "dark:hover:border-amber-800 dark:hover:bg-amber-950/70 dark:hover:text-amber-200",
              ]
            : [
                "border-zinc-200 bg-white text-zinc-700",
                "hover:border-zinc-300 hover:text-zinc-900",
                "active:bg-zinc-50",
                "dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
                "dark:hover:border-zinc-600 dark:hover:text-zinc-100",
                "dark:active:bg-zinc-800/80",
              ],
        )}
      >
        <span>{status !== "ready" ? "Cancel" : "Transform"}</span>
        <kbd
          className={cn(
            "rounded border px-1 py-0.5 font-mono text-[10px] leading-none",
            status !== "ready"
              ? "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-400"
              : "border-zinc-300 bg-zinc-50 text-zinc-400 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-500",
          )}
        >
          {status !== "ready" ? "Esc" : "⌘S"}
        </kbd>
      </button>

      {/* Right side: status + theme */}
      <div className="ml-auto flex items-center gap-3">
        {status === "initiating" ? (
          <div className="flex items-center gap-1.5">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500" />
            <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">
              Initiating…
            </span>
          </div>
        ) : status === "streaming" ? (
          <div className="flex items-center gap-1.5">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
            <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400">
              Formatting…
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
              Ready
            </span>
          </div>
        )}

        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />

        {/* View mode toggles */}
        <div className="flex items-center gap-0.5">
          {VIEW_MODES.map(({ mode: vm, icon: Icon, label }) => (
            <button
              key={vm}
              type="button"
              title={label}
              aria-label={label}
              aria-pressed={view === vm}
              onClick={() => setView(vm)}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md",
                view === vm
                  ? "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                  : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>

        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />

        <Link
          to="/about"
          title="What & how"
          aria-label="What & how"
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-md no-underline",
            "text-zinc-400",
            "hover:bg-zinc-100 hover:text-zinc-600",
            "dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300",
          )}
        >
          <HelpCircle className="h-3.5 w-3.5" />
        </Link>

        <ThemeToggle />
      </div>
    </div>
  );
}
