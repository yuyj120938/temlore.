import { render, screen } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';
import { App } from '../../../src/app/App';
import { saveLetter } from '../../../src/features/letters/letterStorage';

describe('persistent app flow', () => {
  beforeEach(() => { localStorage.clear(); });
  it('keeps a logged-in session and starts on the home page after intro', async () => {
    localStorage.setItem('temlore.session', JSON.stringify({ phone: '13800138000' }));
    saveLetter('13800138000', { id: 'arrived', font: 'songti', blocks: [{ id: 'text', type: 'text', text: '抵达' }], writtenAt: '2026-08-23T09:00:00.000Z', unlockAt: 1, arrived: true });
    render(<App />);
    await new Promise((resolve) => setTimeout(resolve, 3050));
    expect(screen.getByText('Start writing')).toBeInTheDocument();
    expect(screen.getByText('A letter has arrived.')).toBeInTheDocument();
  });
});
