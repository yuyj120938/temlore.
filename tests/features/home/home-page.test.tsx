import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HomePage } from '../../../src/features/home/HomePage';

describe('HomePage account entry', () => {
  it('labels the upper-right entry Sign instead of a person glyph', () => {
    render(<HomePage onStart={vi.fn()} onAccount={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Sign' })).toBeInTheDocument();
    expect(screen.queryByText('人')).not.toBeInTheDocument();
  });

  it('slides saved letter times over the start page and opens the letter directly', () => {
    const onOpenLetter = vi.fn();
    const view = render(<HomePage onStart={vi.fn()} onAccount={vi.fn()} writtenAt="2026-08-23T09:00:00.000Z" onOpenLetter={onOpenLetter} />);
    const page = within(view.container);
    fireEvent.click(page.getByRole('button', { name: '查看写信时间' }));
    expect(page.getByText('写给时间的信')).toBeInTheDocument();
    expect(page.getByText('Start writing')).toBeInTheDocument();
    expect(page.queryByText(/点击查看/)).not.toBeInTheDocument();
    fireEvent.click(page.getByRole('button', { name: /2026/ }));
    expect(onOpenLetter).toHaveBeenCalledOnce();
  });
});
