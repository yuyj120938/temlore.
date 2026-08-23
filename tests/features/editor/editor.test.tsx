import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LetterEditor } from '../../../src/features/editor/LetterEditor';

describe('LetterEditor', () => {
  beforeEach(() => localStorage.clear());
  it('supports text, font switching, optional photos, and done', () => {
    localStorage.clear(); const done = vi.fn(); const view = render(<LetterEditor onDone={done} />); const page = within(view.container);
    fireEvent.change(page.getByLabelText('信件正文'), { target: { value: '新的信' } });
    fireEvent.click(page.getByText('宋体')); expect(page.getByText('楷体')).toBeInTheDocument();
    fireEvent.click(page.getByText('▧ 照片')); expect(page.getByLabelText('上传照片')).toBeInTheDocument();
    expect(page.queryByLabelText('更多')).not.toBeInTheDocument();
    fireEvent.click(page.getByText('✓')); expect(done).toHaveBeenCalledWith('新的信', expect.objectContaining({ body: '新的信', font: 'kaiti' }));
  });

  it('restores and continuously saves the previous draft, and returns immediately', async () => {
    localStorage.setItem('temlore.draft', JSON.stringify({ body: '上一次的存稿', font: 'kaiti', photos: [] }));
    const onBack = vi.fn(); const view = render(<LetterEditor onDone={vi.fn()} onBack={onBack} />); const page = within(view.container);
    expect(page.getByLabelText('信件正文')).toHaveValue('上一次的存稿');
    expect(page.getByText('楷体')).toBeInTheDocument();
    fireEvent.change(page.getByLabelText('信件正文'), { target: { value: '自动保存的新稿' } });
    await waitFor(() => expect(localStorage.getItem('temlore.draft.guest')).toContain('自动保存的新稿'));
    fireEvent.click(page.getByRole('button', { name: '返回' }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('restores photo position and exposes a draggable photo surface on a scrolling paper', () => {
    localStorage.setItem('temlore.draft', JSON.stringify({ body: '很长的信\n'.repeat(80), font: 'songti', photos: [{ url: 'data:image/png;base64,AAAA', caption: '', scale: 1, width: 180, height: 190, x: 24, y: 36 }] }));
    const view = render(<LetterEditor onDone={vi.fn()} />); const page = within(view.container);
    expect(page.getByTestId('draggable-photo')).toHaveStyle({ transform: 'translate(24px, 36px) rotate(-2deg)' });
    expect(page.getByLabelText('移动照片1')).toHaveAttribute('data-draggable', 'true');
    expect(page.getByLabelText('信件正文')).toHaveStyle({ overflow: 'hidden' });
  });
});
