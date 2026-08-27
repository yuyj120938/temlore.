import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SealingAnimation } from '../../../src/features/sealing/SealingAnimation';

describe('SealingAnimation', () => {
  afterEach(() => vi.useRealTimers());
  it('opens the matching desk drawer before storing and closing it', () => {
    render(<SealingAnimation onComplete={vi.fn()} />);
    expect(screen.getByTestId('sealing-sequence')).toHaveAttribute('data-sequence', 'fold,insert,close,seal,open-drawer,store,close-drawer');
    expect(screen.getByTestId('sealing-drawer')).toBeInTheDocument();
    expect(screen.queryByText('KEEPING THIS MOMENT')).not.toBeInTheDocument();
  });

  it('completes on schedule even when the parent rerenders', () => {
    vi.useFakeTimers(); const complete = vi.fn(); const view = render(<SealingAnimation onComplete={() => complete()} />);
    vi.advanceTimersByTime(3000); view.rerender(<SealingAnimation onComplete={() => complete()} />);
    vi.advanceTimersByTime(2300); expect(complete).toHaveBeenCalledOnce();
  });
});
