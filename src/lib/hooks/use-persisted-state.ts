import { useState } from "react";

export function usePersistedState<T>(
  key: string,
  defaultValue: T,
): [T, (value: T) => void] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return defaultValue;
    const stored = localStorage.getItem(key);
    if (stored != null) {
      try {
        return JSON.parse(stored);
      } catch {
        // invalid stored value, fall through to persist default
      }
    }
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  });

  const set = (value: T) => {
    setState(value);
    localStorage.setItem(key, JSON.stringify(value));
  };

  return [state, set];
}
