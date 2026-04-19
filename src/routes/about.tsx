import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="flex h-dvh flex-col bg-white dark:bg-zinc-950">
      <header
        className={cn(
          "flex h-11 shrink-0 items-center gap-3 border-b px-4",
          "border-zinc-200 bg-white",
          "dark:border-zinc-800 dark:bg-zinc-950",
        )}
      >
        <Link
          to="/"
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2 py-1 no-underline",
            "text-[12px] font-medium text-zinc-500",
            "hover:bg-zinc-100 hover:text-zinc-700",
            "dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200",
          )}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Link>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-6 py-12">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-100">
              <svg
                viewBox="0 0 14 14"
                className="h-4 w-4 fill-white dark:fill-zinc-900"
                aria-hidden="true"
              >
                <path d="M2 2h4v10H2zM8 2h4v6H8zM8 10h4v2H8z" />
              </svg>
            </div>
            <h1
              className={cn(
                "text-xl font-semibold tracking-tight",
                "text-zinc-900 dark:text-zinc-100",
              )}
            >
              Free Write
            </h1>
          </div>

          <p
            className={cn(
              "mt-4 text-[14px] leading-relaxed",
              "text-zinc-600 dark:text-zinc-400",
            )}
          >
            Write whatever — prose, dashes, indentation, half-formed thoughts.
            Hit <Kbd>⌘S</Kbd> and an LLM rewrites it into clean Markdown.
          </p>

          <Section title="Usage">
            <Block label="Format mode">
              The LLM is constrained to act mostly as a pure formatter. Wording
              and order are preserved (typos are fixed); only Markdown structure
              is added (headings, lists, code blocks, etc.) inferred from your
              informal signals.
            </Block>
            <Block label="Restructure mode">
              The LLM is allowed to reorder paragraphs, merge or split sections,
              and rewrite for clarity. Substance stays, but the shape of the
              document can change. Use this on rough drafts, not on text
              you&apos;ve already polished.
            </Block>
            <Block label="Custom instructions">
              The prompt bar under the editor passes a free-form instruction to
              the LLM alongside your content (e.g.{" "}
              <em>&quot;tighten this&quot;</em>, <em>&quot;add a TOC&quot;</em>,{" "}
              <em>&quot;rewrite in second person&quot;</em>). Applies to
              whichever mode is active.
            </Block>
          </Section>

          <Section title="Sync & identity">
            <p
              className={cn(
                "text-[13px] leading-relaxed",
                "text-zinc-600 dark:text-zinc-400",
              )}
            >
              Documents live in Convex and sync in real time across every tab
              and device that holds the same <Kbd>userId</Kbd> in{" "}
              <Kbd>localStorage</Kbd>. To move your library to another browser
              or machine, copy that value over.
            </p>
            <div
              className={cn(
                "mt-4 rounded-lg border p-4",
                "border-amber-200 bg-amber-50",
                "dark:border-amber-900/40 dark:bg-amber-950/20",
              )}
            >
              <p
                className={cn(
                  "text-[12px] font-semibold uppercase tracking-wide",
                  "text-amber-700 dark:text-amber-400",
                )}
              >
                Heads up
              </p>
              <p
                className={cn(
                  "mt-1.5 text-[13px] leading-relaxed",
                  "text-amber-900/80 dark:text-amber-200/80",
                )}
              >
                That <Kbd>userId</Kbd> is the only credential. Anyone who
                obtains it can read and edit every document under it. Don&apos;t
                paste anything here you&apos;d be upset to leak.
              </p>
            </div>
          </Section>

          <Section title="Why it exists">
            <p
              className={cn(
                "text-[13px] leading-relaxed",
                "text-zinc-600 dark:text-zinc-400",
              )}
            >
              Hobby project. Honestly this should have been a client-only app —
              localStorage and an LLM call is the entire feature. The Convex
              sync engine is here because I wanted to try it, not because the
              problem demanded it. So yes, it&apos;s over-engineered.
              That&apos;s also why &quot;auth&quot; is a string in{" "}
              <Kbd>localStorage</Kbd> instead of a real account system.
            </p>
          </Section>
        </div>
      </main>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2
        className={cn(
          "text-[13px] font-semibold uppercase tracking-wide",
          "text-zinc-400 dark:text-zinc-500",
        )}
      >
        {title}
      </h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function Block({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-200">
        {label}
      </p>
      <p className="mt-1 text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400">
        {children}
      </p>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center gap-0.5 rounded border px-1.5 py-0.5",
        "font-mono text-[11px] leading-none",
        "border-zinc-300 bg-zinc-100 text-zinc-600",
        "dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
      )}
    >
      {children}
    </kbd>
  );
}
