import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { languages } from "@codemirror/language-data";
import { tags as t } from "@lezer/highlight";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { useEditor } from "@/context/editor";
import { cn } from "@/lib/utils";

interface EditorPaneProps {
  onViewCreated: (element: HTMLElement) => void;
  onScroll: (element: HTMLElement) => void;
}

const baseExtensions = [
  markdown({ base: markdownLanguage, codeLanguages: languages }),
  EditorView.lineWrapping,
  syntaxHighlighting(
    HighlightStyle.define([
      { tag: t.heading1, fontWeight: "600" },
      { tag: t.heading2, fontWeight: "600" },
      { tag: t.heading3, fontWeight: "600" },
      {
        tag: [t.processingInstruction, t.punctuation],
        color: "var(--cm-punctuation)",
      },
      { tag: t.monospace, color: "var(--cm-monospace)" },
      { tag: t.strong, fontWeight: "600" },
      { tag: t.emphasis, fontStyle: "italic" },
      { tag: [t.link, t.url], color: "var(--cm-link)" },
      // code block token colors
      { tag: [t.keyword, t.modifier], color: "var(--cm-keyword)" },
      { tag: [t.string, t.special(t.string)], color: "var(--cm-string)" },
      { tag: [t.number, t.integer, t.float], color: "var(--cm-number)" },
      { tag: t.comment, color: "var(--cm-comment)", fontStyle: "italic" },
      {
        tag: [t.function(t.variableName), t.function(t.propertyName)],
        color: "var(--cm-function)",
      },
      { tag: [t.typeName, t.className, t.namespace], color: "var(--cm-type)" },
      { tag: [t.operator, t.derefOperator], color: "var(--cm-operator)" },
    ]),
  ),
];

export default function EditorPane({
  onViewCreated,
  onScroll,
}: EditorPaneProps) {
  const { content, setContent, locked } = useEditor();
  const dimmed = locked;

  const extensions = [
    ...baseExtensions,
    EditorView.domEventHandlers({
      scroll(_e, view) {
        onScroll(view.scrollDOM);
      },
    }),
  ];

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div
        className={cn(
          "flex h-9 shrink-0 items-center",
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
          Input
        </span>
      </div>

      <section
        aria-label="Text editor"
        className={cn(
          "flex-1 overflow-auto transition-opacity duration-150",
          dimmed && "opacity-40",
        )}
      >
        <CodeMirror
          value={content}
          onChange={setContent}
          extensions={extensions}
          editable={!locked}
          theme="none"
          onCreateEditor={(view) => onViewCreated(view.scrollDOM)}
          basicSetup={{
            lineNumbers: false,
            foldGutter: false,
            dropCursor: false,
            allowMultipleSelections: false,
            highlightActiveLine: false,
            highlightSelectionMatches: false,
            bracketMatching: false,
            closeBrackets: false,
          }}
          style={{ height: "100%" }}
          className="h-full bg-white dark:bg-[#09090b]"
        />
      </section>
    </div>
  );
}
