import { createContext, useContext } from "react";
import type { StreamId } from "@convex-dev/persistent-text-streaming";
import type { Mode } from "@convex/shared/types";
import type { Status } from "@/types";

export interface EditorContextValue {
  content: string;
  setContent: (value: string) => void;
  setFromServer: (value: string) => void;

  status: Status;
  locked: boolean;
  sessionAvailable: boolean;
  streaming: boolean;
  streamId: StreamId | undefined;

  mode: Mode;
  setMode: (mode: Mode) => void;

  transform: () => void;
  cancel: () => void;
  takeover: () => void;

  additionalPrompt: string;
  setAdditionalPrompt: (value: string) => void;
  promptBarOpen: boolean;
  setPromptBarOpen: (open: boolean) => void;
  closePromptBar: () => void;
}

export const EditorContext = createContext<EditorContextValue | null>(null);

export function useEditor(): EditorContextValue {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor must be used within an EditorProvider");
  return ctx;
}
