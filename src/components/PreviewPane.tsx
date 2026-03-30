import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

interface PreviewPaneProps {
  content: string;
  streaming: boolean;
}

export default function PreviewPane({ content, streaming }: PreviewPaneProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex h-9 shrink-0 items-center gap-2 border-b border-zinc-200 bg-zinc-50 px-5 dark:border-zinc-800 dark:bg-[#111113]">
        <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-zinc-400 dark:text-zinc-600">
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

      <div className="flex-1 overflow-auto bg-white px-9 py-7 dark:bg-[#09090b]">
        <div className="preview-md">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
