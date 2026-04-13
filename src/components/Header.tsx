import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 flex h-12 shrink-0 items-center",
        "border-b border-zinc-200 bg-white px-5",
        "dark:border-zinc-800 dark:bg-zinc-950",
      )}
    >
      <div className="flex items-center gap-2">
        <div className="flex h-6.5 w-6.5 items-center justify-center rounded-md bg-zinc-900 dark:bg-zinc-100">
          <svg
            viewBox="0 0 14 14"
            className="h-3.5 w-3.5 fill-white dark:fill-zinc-900"
            aria-hidden="true"
          >
            <path d="M2 2h4v10H2zM8 2h4v6H8zM8 10h4v2H8z" />
          </svg>
        </div>
        <Link
          to="/"
          className={cn(
            "text-sm font-semibold tracking-tight text-zinc-900",
            "no-underline dark:text-zinc-100",
          )}
        >
          Free Write
        </Link>
      </div>

      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </header>
  );
}
