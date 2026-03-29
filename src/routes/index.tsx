import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import EditorPane from '../components/EditorPane'
import PreviewPane from '../components/PreviewPane'
import Toolbar from '../components/Toolbar'

export const Route = createFileRoute('/')({ component: EditorPage })

type Mode = 'format' | 'restructure'

const SAMPLE_CONTENT = `# Morning Notes — Project Kickoff

## Today's Agenda

- Align on scope — ensure the team shares a clear picture of what we're shipping
- Backend largely complete; API contracts keep shifting — freeze them today
- Design review pushed to Thursday, compressing the implementation window

## Open Questions

If the user loses connection mid-stream — do we restore the original content or keep the partial output?

> Decision: restore the original. Consistency beats partial state.

## Follow-ups

Follow up with Sarah regarding staging environment credentials — she mentioned a new \`rotation policy\` is in effect.

## General Thought

The hardest part of this project isn't the technology — it's *scope creep*. Every conversation introduces a "small" feature that quietly consumes a week. Explicitly documenting what is out of scope from the start is essential.`

function useDark() {
  const [dark, setDark] = useState(() =>
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark'),
  )

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDark(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    return () => observer.disconnect()
  }, [])

  return dark
}

function EditorPage() {
  const dark = useDark()
  const [content, setContent] = useState(SAMPLE_CONTENT)
  const [mode, setMode] = useState<Mode>('format')
  // locked and streaming will be owned by useEditorSession (issue #8)
  const [locked] = useState(false)
  const [streaming] = useState(false)

  return (
    // h-[calc(100dvh-48px)]: fill viewport below the 48px sticky header
    <div className="flex h-[calc(100dvh-48px)] flex-col overflow-hidden bg-white dark:bg-zinc-950">
      <Toolbar mode={mode} onModeChange={setMode} loading={streaming} />

      <div className="flex flex-1 divide-x divide-zinc-200 overflow-hidden dark:divide-zinc-800">
        <div className="flex-1 overflow-hidden">
          <EditorPane
            content={content}
            onChange={setContent}
            onSave={() => {
              // will be wired to useEditorSession in issue #8
            }}
            locked={locked}
            dark={dark}
          />
        </div>
        <div className="flex-1 overflow-hidden">
          <PreviewPane content={content} streaming={streaming} />
        </div>
      </div>
    </div>
  )
}
