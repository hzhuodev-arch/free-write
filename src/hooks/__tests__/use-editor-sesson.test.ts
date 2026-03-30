import { describe } from "node:test";
import { renderHook } from "@testing-library/react";
import { act } from "react";
import { afterEach, expect, it } from "vitest";
import { useEditorSession } from "@/hooks/use-editor-session";

const CONTENT_KEY = "free-write:content";
const MODE_KEY = "free-write:mode";

afterEach(() => {
  localStorage.clear();
});

describe("content", () => {
  it("defaults to empty string when localStorage is empty", () => {
    const { result } = renderHook(() => useEditorSession());
    expect(result.current.content).toBe("");
  });
  it("hydrates from localStorage on mount", () => {
    localStorage.setItem(CONTENT_KEY, "hello world");
    const { result } = renderHook(() => useEditorSession());
    expect(result.current.content).toBe("hello world");
  });

  it("persists to localStorage on setContent", () => {
    const { result } = renderHook(() => useEditorSession());
    act(() => result.current.setContent("new text"));
    expect(localStorage.getItem(CONTENT_KEY)).toBe("new text");
  });
});

describe("mode", () => {
  it('defaults to "format" when localStorage is empty', () => {
    const { result } = renderHook(() => useEditorSession());
    expect(result.current.mode).toBe("format");
  });

  it('hydrates "restructure" from localStorage', () => {
    localStorage.setItem(MODE_KEY, "restructure");
    const { result } = renderHook(() => useEditorSession());
    expect(result.current.mode).toBe("restructure");
  });

  it("persists to localStorage on setMode", () => {
    const { result } = renderHook(() => useEditorSession());
    act(() => result.current.setMode("restructure"));
    expect(localStorage.getItem(MODE_KEY)).toBe("restructure");
  });
});
