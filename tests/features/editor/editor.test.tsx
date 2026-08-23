import { fireEvent, render, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LetterEditor } from '../../../src/features/editor/LetterEditor';

function mockPhotoRead() {
  vi.spyOn(FileReader.prototype, 'readAsDataURL').mockImplementation(function () {
    Object.defineProperty(this, 'result', { configurable: true, value: 'data:image/png;base64,AAAA' });
    this.onload?.(new ProgressEvent('load'));
  });
}

describe('LetterEditor', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('supports seamless text, font switching, and done', () => {
    const done = vi.fn(); const view = render(<LetterEditor onDone={done} />); const page = within(view.container);
    fireEvent.change(page.getByLabelText('文字段落1'), { target: { value: '新的信' } });
    fireEvent.click(page.getByText('宋体')); expect(page.getByText('楷体')).toBeInTheDocument();
    expect(page.getByLabelText('上传照片')).toBeInTheDocument();
    fireEvent.click(page.getByText('✓'));
    expect(done).toHaveBeenCalledWith('新的信', expect.objectContaining({
      font: 'kaiti',
      blocks: [expect.objectContaining({ type: 'text', text: '新的信' })],
    }));
  });

  it('restores and continuously saves the previous draft, and returns immediately', async () => {
    localStorage.setItem('temlore.draft', JSON.stringify({ body: '上一次的存稿', font: 'kaiti', photos: [] }));
    const onBack = vi.fn(); const view = render(<LetterEditor onDone={vi.fn()} onBack={onBack} />); const page = within(view.container);
    expect(page.getByLabelText('文字段落1')).toHaveValue('上一次的存稿');
    expect(page.getByText('楷体')).toBeInTheDocument();
    fireEvent.change(page.getByLabelText('文字段落1'), { target: { value: '自动保存的新稿' } });
    await waitFor(() => expect(localStorage.getItem('temlore.draft.guest')).toContain('自动保存的新稿'));
    fireEvent.click(page.getByRole('button', { name: '返回' }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('inserts a photo at the caret and continues with text below it', () => {
    mockPhotoRead();
    const done = vi.fn(); const view = render(<LetterEditor onDone={done} />); const page = within(view.container);
    const first = page.getByLabelText('文字段落1') as HTMLTextAreaElement;
    fireEvent.change(first, { target: { value: '上面下面' } });
    first.setSelectionRange(2, 2); fireEvent.select(first);
    fireEvent.change(page.getByLabelText('上传照片'), { target: { files: [new File(['x'], 'photo.png', { type: 'image/png' })] } });
    expect(page.getByLabelText('文字段落1')).toHaveValue('上面');
    expect(page.getByAltText('照片1')).toBeInTheDocument();
    expect(page.getByLabelText('文字段落2')).toHaveValue('下面');
    expect(page.getByLabelText('文字段落2')).toHaveFocus();
    fireEvent.change(page.getByLabelText('文字段落2'), { target: { value: '照片下面的新文字' } });
    fireEvent.click(page.getByText('✓'));
    expect(done.mock.calls[0][1].blocks.map((block: { type: string }) => block.type)).toEqual(['text', 'photo', 'text']);
  });

  it('deletes a photo and reconnects the surrounding text', () => {
    localStorage.setItem('temlore.draft', JSON.stringify({ font: 'songti', blocks: [
      { id: 'a', type: 'text', text: '上面' },
      { id: 'p', type: 'photo', url: 'data:image/png;base64,AAAA', caption: '', scale: 1, width: 188, height: 190, alignX: 0 },
      { id: 'b', type: 'text', text: '下面' },
    ] }));
    const view = render(<LetterEditor onDone={vi.fn()} />); const page = within(view.container);
    fireEvent.click(page.getByRole('button', { name: '删除照片1' }));
    expect(page.queryByAltText('照片1')).not.toBeInTheDocument();
    expect(page.getByLabelText('文字段落1')).toHaveValue('上面下面');
  });

  it('keeps photo resizing and horizontal movement inside the content flow', () => {
    localStorage.setItem('temlore.draft', JSON.stringify({ font: 'songti', blocks: [
      { id: 'a', type: 'text', text: '上面' },
      { id: 'p', type: 'photo', url: 'data:image/png;base64,AAAA', caption: '', scale: 1.2, width: 180, height: 190, alignX: 24 },
      { id: 'b', type: 'text', text: '下面' },
    ] }));
    const view = render(<LetterEditor onDone={vi.fn()} />); const page = within(view.container);
    expect(page.getByTestId('flow-photo')).toHaveStyle({ transform: 'translateX(24px) rotate(-2deg)' });
    expect(page.getByLabelText('水平移动照片1')).toHaveAttribute('data-axis', 'x');
    expect(page.getByRole('button', { name: '调整照片1se' })).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('temlore.draft.guest') || '{}').blocks[1]).not.toHaveProperty('y');
  });
});
