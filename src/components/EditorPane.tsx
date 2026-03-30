import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { languages } from "@codemirror/language-data";
import { keymap } from "@codemirror/view";
import { tags as t } from "@lezer/highlight";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { useRef } from "react";

interface EditorPaneProps {
  content: string;
  onChange: (value: string) => void;
  onSave: () => void;
  locked: boolean;
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
    ]),
  ),
];

export default function EditorPane({
  content,
  onChange,
  onSave,
  locked,
}: EditorPaneProps) {
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  const extensions = [
    ...baseExtensions,
    keymap.of([
      {
        key: "Mod-s",
        run: () => {
          onSaveRef.current();
          return true;
        },
      },
    ]),
  ];

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex h-9 shrink-0 items-center border-b border-zinc-200 bg-zinc-50 px-5 dark:border-zinc-800 dark:bg-[#111113]">
        <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-zinc-400 dark:text-zinc-600">
          Input
        </span>
      </div>

      <section
        aria-label="Text editor"
        className={[
          "flex-1 overflow-auto transition-opacity duration-150",
          locked ? "pointer-events-none opacity-40" : "",
        ].join(" ")}
      >
        <CodeMirror
          value={content}
          onChange={onChange}
          extensions={extensions}
          editable={!locked}
          theme="none"
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
