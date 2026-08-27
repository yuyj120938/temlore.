import { render, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LetterReader } from '../../../src/features/reading/LetterReader';

describe('LetterReader', () => {
  it('renders text and photos in stored block order without vertical transforms', () => {
    const letter = {
      id: 'one',
      font: 'kaiti' as const,
      blocks: [
        { id: 'a', type: 'text' as const, text: '照片上面' },
        { id: 'p', type: 'photo' as const, url: 'data:image/png;base64,AAAA', caption: '此刻', scale: 1.2, width: 220, height: 260, alignX: 18 },
        { id: 'b', type: 'text' as const, text: '照片下面' },
      ],
      writtenAt: '2026-08-23T11:00:00.000Z',
      unlockAt: 1,
      arrived: true,
    };
    const view = render(<LetterReader letter={letter} onClose={vi.fn()} />); const page = within(view.container);
    const flow = page.getByTestId('reader-flow');
    expect([...flow.children].map((node) => node.textContent)).toEqual(['照片上面', '此刻', '照片下面']);
    expect(page.getByTestId('reader-photo')).toHaveStyle({ transform: 'translateX(18px) rotate(-2deg)' });
    expect(page.getByTestId('reader-photo').getAttribute('style')).not.toContain('translateY');
    expect(page.queryByRole('button', { name: /删除照片/ })).not.toBeInTheDocument();
  });
});
