import { useState } from "react";

type ThemeMode = "light" | "dark";

const getInitialMode = (): ThemeMode => {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem("theme");
  return stored === "dark" ? "dark" : "light";
};

export default function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>(getInitialMode);

  function toggleTheme() {
    const next: ThemeMode = mode === "light" ? "dark" : "light";
    setMode(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    document.documentElement.style.colorScheme = next;
    window.localStorage.setItem("theme", next);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Theme: ${mode}. Click to switch.`}
      title={`Theme: ${mode}. Click to switch.`}
      className="rounded-full border border-(--chip-line) bg-(--chip-bg) px-3 py-1.5 text-sm font-semibold text-(--sea-ink) shadow-[0_8px_22px_rgba(30,90,72,0.08)] transition-transform hover:-translate-y-0.5"
    >
      {mode === "dark" ? "Dark" : "Light"}
    </button>
  );
}
