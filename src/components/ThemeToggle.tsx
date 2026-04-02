import { useTheme } from "@/context/theme";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Theme: ${theme}. Click to switch.`}
      title={`Theme: ${theme}. Click to switch.`}
      className="rounded-full border border-(--chip-line) bg-(--chip-bg) px-3 py-1.5 text-sm font-semibold text-(--sea-ink) shadow-[0_8px_22px_rgba(30,90,72,0.08)] transition-transform hover:-translate-y-0.5"
    >
      <span className="dark:hidden">Light</span>
      <span className="hidden dark:inline">Dark</span>
    </button>
  );
}
