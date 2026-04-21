import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/shell/context/theme-context";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-md",
        "text-zinc-400",
        "hover:bg-zinc-100 hover:text-zinc-600",
        "dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-300",
      )}
    >
      {theme === "light" ? (
        <Moon className="h-3.5 w-3.5" />
      ) : (
        <Sun className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
