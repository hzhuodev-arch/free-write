import { useRef } from "react";

const getScrollRatio = (el: HTMLElement) => {
  const scrollable = el.scrollHeight - el.clientHeight;
  return scrollable > 0 ? el.scrollTop / scrollable : 0;
};

const applyScrollRatio = (el: HTMLElement, ratio: number) => {
  const scrollable = el.scrollHeight - el.clientHeight;
  el.scrollTop = ratio * scrollable;
};

export const useScrollSync = () => {
  const editor = useRef<HTMLElement | null>(null);
  const preview = useRef<HTMLElement | null>(null);
  const isSyncing = useRef(false);

  const syncFrom = (source: HTMLElement, target: HTMLElement | null) => {
    if (!target || isSyncing.current) return;
    isSyncing.current = true;
    const scrollRatio = getScrollRatio(source);
    applyScrollRatio(target, scrollRatio);
    requestAnimationFrame(() => {
      isSyncing.current = false;
    });
  };

  const onEditorScroll = (el: HTMLElement) => {
    syncFrom(el, preview.current);
  };

  const onPreviewScroll = (el: HTMLElement) => {
    syncFrom(el, editor.current);
  };

  return { editor, preview, onEditorScroll, onPreviewScroll };
};
