import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SealingAnimation } from '../../../src/features/sealing/SealingAnimation';

describe('SealingAnimation', () => {
  it('opens the matching desk drawer before storing and closing it', () => {
    render(<SealingAnimation onComplete={vi.fn()} />);
    expect(screen.getByTestId('sealing-sequence')).toHaveAttribute('data-sequence', 'fold,insert,close,seal,open-drawer,store,close-drawer');
    expect(screen.getByTestId('sealing-drawer')).toBeInTheDocument();
  });
});
