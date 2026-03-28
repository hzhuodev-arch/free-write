import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import EditorPane from '../components/EditorPane'
import PreviewPane from '../components/PreviewPane'
import Toolbar from '../components/Toolbar'

export const Route = createFileRoute('/')({ component: EditorPage })

type Mode = 'format' | 'restructure'

const SAMPLE_CONTENT = `morning notes — project kickoff

things to cover today
  - align on scope, make sure everyone is on the same page about what we're actually shipping
  - the backend is mostly done but the api contracts keep changing, need to freeze them
  - design review got pushed to thursday, which means the implementation window shrinks

open questions
  what happens if the user loses connection mid-stream? do we restore the original or keep the partial?
  probably restore the original. consistency > partial state.

also need to follow up with sarah about the staging environment credentials. she mentioned there was a new rotation policy.

general thought — the hardest part of this project isn't the tech, it's the scope creep. every conversation introduces a new "small" feature that somehow takes a week. need to get better at writing down what's out of scope explicitly.`

function EditorPage() {
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
          />
        </div>
        <div className="flex-1 overflow-hidden">
          <PreviewPane content={content} streaming={streaming} />
        </div>
      </div>
    </div>
  )
}
