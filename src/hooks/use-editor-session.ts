import { api } from "@convex/_generated/api";
import type { Mode } from "@convex/shared/types";
import { useAction } from "convex/react";
import { useState } from "react";

const CONTENT_KEY = "free-write:content";
const MODE_KEY = "free-write:mode";

export const useEditorSession = () => {
  const [content, _setContent] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(CONTENT_KEY) ?? "";
  });

  const [mode, _setMode] = useState<Mode>(() => {
    if (typeof window === "undefined") return "format";
    const saved = localStorage.getItem(MODE_KEY);
    return saved === "restructure" ? "restructure" : "format";
  });

  const [locked, setLocked] = useState(false);
  const [streaming, _setStreaming] = useState(false);

  const setContent = (value: string) => {
    _setContent(value);
    localStorage.setItem(CONTENT_KEY, value);
  };

  const setMode = (value: Mode) => {
    _setMode(value);
    localStorage.setItem(MODE_KEY, value);
  };

  const _processDocument = useAction(api.document.actions.processDocument);
  const processDocument = async () => {
    setLocked(true);
    const updatedContent = await _processDocument({ content, mode });
    setContent(updatedContent);
    setLocked(false);
  };

  return {
    content,
    setContent,
    mode,
    setMode,
    locked,
    streaming,
    processDocument,
  };
};
