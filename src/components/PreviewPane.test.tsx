import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import PreviewPane from './PreviewPane'

vi.mock('rehype-highlight', () => ({ default: () => {} }))

describe('PreviewPane', () => {
  it('shows streaming indicator when streaming=true', () => {
    render(<PreviewPane content="" streaming={true} />)
    expect(screen.getByRole('status', { name: /formatting in progress/i })).toBeInTheDocument()
  })

  it('hides streaming indicator when streaming=false', () => {
    render(<PreviewPane content="" streaming={false} />)
    expect(
      screen.queryByRole('status', { name: /formatting in progress/i }),
    ).not.toBeInTheDocument()
  })
})
