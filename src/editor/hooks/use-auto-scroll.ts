import { useEffect, useRef } from "react";

export const useAutoScroll = (
  containerRef: React.RefObject<HTMLElement | null>,
  streaming: boolean,
) => {
  const shouldAutoScroll = useRef(true);
  const isProgrammaticScroll = useRef(false);

  useEffect(() => {
    if (streaming) shouldAutoScroll.current = true;
  }, [streaming]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || !streaming || !shouldAutoScroll.current) return;
    isProgrammaticScroll.current = true;
    element.scrollTop = element.scrollHeight;
    requestAnimationFrame(() => {
      isProgrammaticScroll.current = false;
    });
  });

  const onScroll = (element: HTMLElement) => {
    if (isProgrammaticScroll.current || !streaming) return;
    const distanceFromBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight;
    shouldAutoScroll.current = distanceFromBottom < 30;
  };

  return { onScroll };
};
