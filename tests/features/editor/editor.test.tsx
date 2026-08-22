import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LetterEditor } from '../../../src/features/editor/LetterEditor';

describe('LetterEditor', () => {
  it('supports text, font switching, optional photos, and done', () => {
    const done = vi.fn(); render(<LetterEditor onDone={done} />);
    fireEvent.change(screen.getByLabelText('信件正文'), { target: { value: '新的信' } });
    fireEvent.click(screen.getByText('宋体')); expect(screen.getByText('楷体')).toBeInTheDocument();
    fireEvent.click(screen.getByText('▧ 照片')); expect(screen.getByText('照片 1')).toBeInTheDocument();
    fireEvent.click(screen.getByText('✓')); expect(done).toHaveBeenCalledWith('新的信');
  });
});
