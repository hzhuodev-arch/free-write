import { useEffect, useEffectEvent } from "react";

type Shortcut = readonly Key[];

export const useKeyboardShortcut = (
  shortcut: Shortcut,
  execute: () => void,
) => {
  const onExecute = useEffectEvent(execute);
  const getShortcut = useEffectEvent(() => shortcut);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const parts = getShortcut();

      const wantMod = parts.includes("mod");
      const wantCtrl = parts.includes("ctrl");
      const wantMeta = parts.includes("meta");
      const wantShift = parts.includes("shift");
      const wantAlt = parts.includes("alt");

      // The "main" key is the first non-modifier in the array
      const mainKey = parts.find(
        (p) => p !== "mod" && p !== "ctrl" && p !== "meta" && p !== "shift" && p !== "alt",
      );

      if (!mainKey) return;

      // Normalize "Space" -> " "
      const expectedKey = mainKey === "Space" ? " " : mainKey;

      // Case-insensitive comparison for letter keys
      const isLetter = expectedKey.length === 1 && /[a-z]/i.test(expectedKey);
      const keyMatches = isLetter
        ? e.key.toLowerCase() === expectedKey.toLowerCase()
        : e.key === expectedKey;

      if (!keyMatches) return;

      // mod = ctrl on win/linux, cmd on mac
      const modPressed = e.ctrlKey || e.metaKey;

      const ctrlOk = wantMod ? modPressed : wantCtrl === e.ctrlKey;
      const metaOk = wantMod ? true : wantMeta === e.metaKey;
      const shiftOk = wantShift === e.shiftKey;
      const altOk = wantAlt === e.altKey;

      if (ctrlOk && metaOk && shiftOk && altOk) {
        e.preventDefault();
        onExecute();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
};

type Key =
  | "mod"
  | "ctrl"
  | "meta"
  | "shift"
  | "alt"
  | "Enter"
  | "Escape"
  | "Backspace"
  | "Tab"
  | "Space"
  | "ArrowUp"
  | "ArrowDown"
  | "ArrowLeft"
  | "ArrowRight"
  | "CapsLock"
  | "Delete"
  | "Home"
  | "End"
  | "PageUp"
  | "PageDown"
  | "Insert"
  | "F1"
  | "F2"
  | "F3"
  | "F4"
  | "F5"
  | "F6"
  | "F7"
  | "F8"
  | "F9"
  | "F10"
  | "F11"
  | "F12"
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "a"
  | "b"
  | "c"
  | "d"
  | "e"
  | "f"
  | "g"
  | "h"
  | "i"
  | "j"
  | "k"
  | "l"
  | "m"
  | "n"
  | "o"
  | "p"
  | "q"
  | "r"
  | "s"
  | "t"
  | "u"
  | "v"
  | "w"
  | "x"
  | "y"
  | "z";