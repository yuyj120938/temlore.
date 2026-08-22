import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { IntroAnimation } from '../../../src/features/intro/IntroAnimation';

describe('intro animation', () => {
  it('emits completion once after three seconds', () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    render(<IntroAnimation onComplete={onComplete} />);
    expect(screen.getByLabelText('Temlore')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(2999));
    expect(onComplete).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(onComplete).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });
});
