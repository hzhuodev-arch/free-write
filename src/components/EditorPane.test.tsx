import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import EditorPane from './EditorPane'

vi.mock('@uiw/react-codemirror', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@uiw/react-codemirror')>()
  return {
    ...actual,
    default: ({
      value,
      onChange,
      editable,
    }: {
      value: string
      onChange?: (v: string) => void
      editable?: boolean
    }) => (
      <textarea
        data-testid="codemirror"
        value={value}
        readOnly={!editable}
        onChange={(e) => onChange?.(e.target.value)}
      />
    ),
  }
})

const defaultProps = {
  content: 'hello',
  onChange: () => {},
  onSave: () => {},
  locked: false,
}

describe('EditorPane', () => {
  it('fires onSave when Ctrl+S and not locked', () => {
    const onSave = vi.fn()
    render(<EditorPane {...defaultProps} onSave={onSave} locked={false} />)
    fireEvent.keyDown(screen.getByRole('region', { name: /text editor/i }), {
      key: 's',
      ctrlKey: true,
    })
    expect(onSave).toHaveBeenCalledOnce()
  })

  it('does not fire onSave when Ctrl+S and locked', () => {
    const onSave = vi.fn()
    render(<EditorPane {...defaultProps} onSave={onSave} locked={true} />)
    fireEvent.keyDown(screen.getByRole('region', { name: /text editor/i }), {
      key: 's',
      ctrlKey: true,
    })
    expect(onSave).not.toHaveBeenCalled()
  })
})
