import { forwardRef, isValidElement, type Ref } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { useEditor } from "@/context/editor";
import { cn } from "@/lib/utils";
import { Mermaid } from "./Mermaid";

const markdownComponents: Components = {
  pre(props) {
    const child = props.children;
    if (isValidElement<{ className?: string; children?: React.ReactNode }>(child)) {
      const className = child.props.className ?? "";
      if (className.includes("language-mermaid")) {
        return (
          <Mermaid code={String(child.props.children ?? "").replace(/\n$/, "")} />
        );
      }
    }
    return <pre {...props} />;
  },
};

interface PreviewPaneProps {
  content: string;
  onScroll: (el: HTMLElement) => void;
}

const PreviewPane = forwardRef<HTMLElement, PreviewPaneProps>(
  ({ content, onScroll }, ref) => {
    const { streaming } = useEditor();

    return (
      <div className="flex h-full flex-col overflow-hidden">
        <div
          className={cn(
            "flex h-9 shrink-0 items-center gap-2",
            "border-b border-zinc-200 bg-zinc-50 px-5",
            "dark:border-zinc-800 dark:bg-[#111113]",
          )}
        >
          <span
            className={cn(
              "text-[11px] font-medium uppercase tracking-[0.04em]",
              "text-zinc-400 dark:text-zinc-600",
            )}
          >
            Preview
          </span>

          {streaming && (
            <output
              aria-label="Formatting in progress"
              aria-live="polite"
              className="ml-auto flex items-center gap-1.5"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
              <span className="text-[11px] text-zinc-400">Formatting…</span>
            </output>
          )}
        </div>

        <div
          ref={ref as Ref<HTMLDivElement>}
          onScroll={(e) => onScroll(e.currentTarget)}
          className="flex-1 overflow-auto bg-white px-9 py-7 dark:bg-[#09090b]"
        >
          <div className="preview-md">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkBreaks]}
              rehypePlugins={[rehypeHighlight]}
              components={markdownComponents}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    );
  },
);

export default PreviewPane;
