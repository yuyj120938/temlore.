import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HomePage } from '../../../src/features/home/HomePage';

describe('HomePage account entry', () => {
  it('labels the upper-right entry Sign instead of a person glyph', () => {
    render(<HomePage onStart={vi.fn()} onAccount={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Sign' })).toBeInTheDocument();
    expect(screen.queryByText('人')).not.toBeInTheDocument();
  });
});
