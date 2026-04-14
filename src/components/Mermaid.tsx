import mermaid from "mermaid";
import { useEffect, useRef, useState } from "react";

function normalizeSvg(svg: string): string {
  const el = new DOMParser().parseFromString(svg, "image/svg+xml").documentElement;
  el.removeAttribute("width");
  el.removeAttribute("height");
  (el as unknown as SVGSVGElement).style.maxWidth = "";
  (el as unknown as SVGSVGElement).style.height = "";
  const vb = el.getAttribute("viewBox")?.trim().split(/\s+/);
  if (vb?.length === 4) {
    el.setAttribute("width", vb[2]);
    el.setAttribute("height", vb[3]);
  }
  return el.outerHTML;
}

async function renderWithTheme(code: string, theme: "neo" | "neo-dark"): Promise<string> {
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "strict",
    theme,
    fontFamily: '"Geist", -apple-system, sans-serif',
  });
  const { svg } = await mermaid.render(`mermaid-${crypto.randomUUID()}`, code);
  return normalizeSvg(svg);
}

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;
const clamp = (z: number) =>
  Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(z * 100) / 100));

function DiagramView({
  light,
  dark,
  fullscreen,
  onToggleFullscreen,
}: {
  light: string;
  dark: string;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
}) {
  const [zoom, setZoom] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      e.preventDefault();
      const delta = -e.deltaY * 0.005;
      setZoom((z) => clamp(z + delta));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onToggleFullscreen();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen, onToggleFullscreen]);

  const btn =
    "flex h-7 w-7 items-center justify-center rounded border border-zinc-200 bg-white text-sm text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800";

  return (
    <>
      <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <button
          type="button"
          onClick={() => setZoom((z) => clamp(z - ZOOM_STEP))}
          disabled={zoom <= MIN_ZOOM}
          aria-label="Zoom out"
          className={btn}
        >
          −
        </button>
        <button
          type="button"
          onClick={() => setZoom(1)}
          aria-label="Reset zoom"
          className={`${btn} w-auto px-2 text-xs tabular-nums`}
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          type="button"
          onClick={() => setZoom((z) => clamp(z + ZOOM_STEP))}
          disabled={zoom >= MAX_ZOOM}
          aria-label="Zoom in"
          className={btn}
        >
          +
        </button>
        <button
          type="button"
          onClick={onToggleFullscreen}
          aria-label={fullscreen ? "Exit fullscreen" : "Expand"}
          className={btn}
        >
          {fullscreen ? "✕" : "⛶"}
        </button>
      </div>
      <div
        ref={scrollRef}
        className={`touch-pan-x touch-pan-y overflow-auto ${fullscreen ? "h-full" : "max-h-125"}`}
      >
        <div className="flex min-h-full min-w-full items-center justify-center p-24">
          <div style={{ zoom }} className="inline-block">
            <div
              className="inline-block dark:hidden"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: mermaid sanitizes SVG output with securityLevel: "strict"
              dangerouslySetInnerHTML={{ __html: light }}
            />
            <div
              className="hidden dark:inline-block"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: mermaid sanitizes SVG output with securityLevel: "strict"
              dangerouslySetInnerHTML={{ __html: dark }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export function Mermaid({ code }: { code: string }) {
  const [light, setLight] = useState("");
  const [dark, setDark] = useState("");
  const [invalid, setInvalid] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const lightSvg = await renderWithTheme(code, "neo");
      if (cancelled) return;
      const darkSvg = await renderWithTheme(code, "neo-dark");
      if (cancelled) return;
      setLight(lightSvg);
      setDark(darkSvg);
      setInvalid(false);
    })().catch(() => {
      if (!cancelled) setInvalid(true);
    });

    return () => {
      cancelled = true;
    };
  }, [code]);

  if (invalid) {
    return (
      <pre className="my-4 whitespace-pre-wrap rounded border border-red-300 bg-red-50 p-3 text-xs text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
        Mermaid syntax error
        {"\n\n"}
        {code}
      </pre>
    );
  }

  return (
    <>
      <div className="group relative my-4 rounded border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <DiagramView
          light={light}
          dark={dark}
          fullscreen={false}
          onToggleFullscreen={() => setFullscreen(true)}
        />
      </div>
      {fullscreen && (
        <div className="fixed inset-0 z-50 bg-black/60 p-6 backdrop-blur-sm">
          <div className="group relative h-full w-full rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <DiagramView
              light={light}
              dark={dark}
              fullscreen={true}
              onToggleFullscreen={() => setFullscreen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
