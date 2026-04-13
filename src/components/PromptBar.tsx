import { ChevronDown, Sparkles } from "lucide-react";
import { useEffect, useRef } from "react";
import { useEditor } from "@/context/editor";
import { cn } from "@/lib/utils";

export default function PromptBar() {
  const {
    additionalPrompt: value,
    setAdditionalPrompt: onChange,
    status,
    sessionAvailable,
    promptBarOpen: open,
    setPromptBarOpen: onOpenChange,
  } = useEditor();

  const disabled = status !== "ready" || !sessionAvailable;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus textarea when opened
  useEffect(() => {
    if (open && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [open]);

  const hasValue = value.trim().length > 0;

  return (
    <div className="border-b border-zinc-200 dark:border-zinc-800">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className={cn(
          "flex w-full items-center gap-2 px-5 py-2",
          "text-left",
          "hover:bg-zinc-50 dark:hover:bg-zinc-900/50",
        )}
      >
        <Sparkles
          className={cn(
            "h-3 w-3 shrink-0",
            hasValue
              ? "text-amber-500 dark:text-amber-400"
              : "text-zinc-400 dark:text-zinc-500",
          )}
        />
        <span
          className={cn(
            "shrink-0 whitespace-nowrap text-[11px] font-medium",
            hasValue
              ? "text-zinc-700 dark:text-zinc-200"
              : "text-zinc-400 dark:text-zinc-500",
          )}
        >
          {hasValue ? "Custom instructions" : "Add custom instructions..."}
        </span>
        {hasValue && (
          <>
            <span
              className={cn(
                "shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5",
                "text-[9px] font-semibold text-amber-600",
                "dark:bg-amber-900/40 dark:text-amber-400",
              )}
            >
              Active
            </span>
            {!open && (
              <span className="min-w-0 truncate text-[11px] italic text-zinc-400 dark:text-zinc-500">
                {value.trim()}
              </span>
            )}
          </>
        )}
        <ChevronDown
          className={cn(
            "ml-auto h-3 w-3 shrink-0 text-zinc-400",
            "transition-transform duration-200 dark:text-zinc-500",
            open && "rotate-180",
          )}
        />
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-3 pt-1">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              placeholder="e.g. Make it more concise, add section headings, use bullet points..."
              className={cn(
                "max-h-80 w-full resize-none rounded-md",
                "border border-zinc-200 bg-zinc-50 px-3 py-2",
                "text-xs text-zinc-700 placeholder-zinc-400",
                "outline-none field-sizing-content",
                "focus:border-zinc-300 focus:bg-white",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "dark:border-zinc-700 dark:bg-zinc-900",
                "dark:text-zinc-300 dark:placeholder-zinc-600",
                "dark:focus:border-zinc-600 dark:focus:bg-zinc-900/80",
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
