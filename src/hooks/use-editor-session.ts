import { api } from "@convex/_generated/api";
import type { Mode } from "@convex/shared/types";
import type { StreamId } from "@convex-dev/persistent-text-streaming";
import { useMutation } from "convex/react";
import { useEffect, useState } from "react";

const CONTENT_KEY = "free-write:content";
const MODE_KEY = "free-write:mode";
const STREAM_ID_KEY = "free-write:streamId";

export const useEditorSession = () => {
  const [content, _setContent] = useState("");
  const [mode, _setMode] = useState<Mode>("format");
  const [locked, setLocked] = useState(false);
  const [streamId, _setStreamId] = useState<StreamId | undefined>(undefined);
  const [streaming, setStreaming] = useState(false);
  const [driven, setDriven] = useState(false);

  // Hydrate from localStorage after mount to avoid SSR mismatch
  useEffect(() => {
    const savedContent = localStorage.getItem(CONTENT_KEY);
    if (savedContent) _setContent(savedContent);

    const savedMode = localStorage.getItem(MODE_KEY);
    if (savedMode === "restructure") _setMode("restructure");

    const savedStreamId = localStorage.getItem(STREAM_ID_KEY);
    if (savedStreamId) {
      _setStreamId(savedStreamId as StreamId);
      setLocked(true);
      setStreaming(true);
    }
  }, []);

  const setContent = (value: string) => {
    _setContent(value);
    localStorage.setItem(CONTENT_KEY, value);
  };

  const setMode = (value: Mode) => {
    _setMode(value);
    localStorage.setItem(MODE_KEY, value);
  };

  const setStreamId = (value: StreamId | undefined) => {
    _setStreamId(value);
    if (value === undefined) return localStorage.removeItem(STREAM_ID_KEY);
    localStorage.setItem(STREAM_ID_KEY, value);
  };

  const createDocumentProcessingStream = useMutation(api.document.createStream);

  const initiateProcessing = async () => {
    setLocked(true);
    setDriven(true);
    const streamId = await createDocumentProcessingStream({ content, mode });
    setStreamId(streamId);
    setStreaming(true);
  };

  const finishProcessing = (processedContent: string) => {
    setContent(processedContent);
    setLocked(false);
    setStreamId(undefined);
    setStreaming(false);
    setDriven(false);
  };

  return {
    content,
    setContent,
    mode,
    setMode,
    locked,
    streaming,
    streamId,
    driven,
    initiateProcessing,
    finishProcessing,
  };
};
