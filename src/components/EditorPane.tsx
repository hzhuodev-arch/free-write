import type { KeyboardEvent } from 'react'
import CodeMirror, { EditorView } from '@uiw/react-codemirror'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'

interface EditorPaneProps {
  content: string
  onChange: (value: string) => void
  onSave: () => void
  locked: boolean
  dark: boolean
}

function makeHighlight(dark: boolean) {
  return syntaxHighlighting(
    HighlightStyle.define([
      { tag: t.heading1, fontWeight: '600' },
      { tag: t.heading2, fontWeight: '600' },
      { tag: t.heading3, fontWeight: '600' },
      {
        tag: [t.processingInstruction, t.punctuation],
        color: dark ? '#52525b' : '#a1a1aa',
      },
      { tag: t.monospace, color: dark ? '#93c5fd' : '#1d4ed8' },
      { tag: t.strong, fontWeight: '600' },
      { tag: t.emphasis, fontStyle: 'italic' },
      { tag: [t.link, t.url], color: dark ? '#60a5fa' : '#2563eb' },
    ]),
  )
}

const baseExtensions = [
  markdown({ base: markdownLanguage, codeLanguages: languages }),
  EditorView.lineWrapping,
]

export default function EditorPane({
  content,
  onChange,
  onSave,
  locked,
  dark,
}: EditorPaneProps) {
  const extensions = [...baseExtensions, makeHighlight(dark)]

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault()
      if (!locked) onSave()
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex h-9 shrink-0 items-center border-b border-zinc-200 bg-zinc-50 px-5 dark:border-zinc-800 dark:bg-[#111113]">
        <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-zinc-400 dark:text-zinc-600">
          Input
        </span>
      </div>

      <div
        role="region"
        aria-label="Text editor"
        onKeyDown={handleKeyDown}
        className={[
          'flex-1 overflow-auto transition-opacity duration-150',
          locked ? 'pointer-events-none opacity-40' : '',
        ].join(' ')}
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
          style={{ height: '100%' }}
          className="h-full bg-white dark:bg-[#09090b]"
        />
      </div>
    </div>
  )
}
