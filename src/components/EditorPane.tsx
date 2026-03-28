import type { KeyboardEvent } from 'react'
import CodeMirror, { EditorView } from '@uiw/react-codemirror'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'

interface EditorPaneProps {
  content: string
  onChange: (value: string) => void
  onSave: () => void
  locked: boolean
}

// Extensions are stable — defined outside the component to avoid re-creating on every render
const extensions = [
  markdown({ base: markdownLanguage, codeLanguages: languages }),
  EditorView.lineWrapping,
]

export default function EditorPane({
  content,
  onChange,
  onSave,
  locked,
}: EditorPaneProps) {
  // Handle Ctrl/Cmd+S on the container so the shortcut is testable and works
  // regardless of whether the CodeMirror keymap intercepts it first.
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
