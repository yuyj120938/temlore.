import { fireEvent, render, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TimeRing } from '../../../src/features/sealing/TimeRing';

describe('TimeRing', () => {
  it('uses the four confirmed presets and always advances the pointer clockwise', () => {
    const view = render(<TimeRing onConfirm={vi.fn()} onBack={vi.fn()} />); const page = within(view.container);
    expect(page.getByRole('button', { name: '10 秒' })).toBeInTheDocument(); expect(page.getByRole('button', { name: '一周' })).toBeInTheDocument(); expect(page.getByRole('button', { name: '六个月' })).toBeInTheDocument(); expect(page.getByRole('button', { name: '一年' })).toBeInTheDocument();
    expect(page.queryByText('1 天')).not.toBeInTheDocument(); expect(page.queryByText('30 天')).not.toBeInTheDocument();
    const pointer = page.getByTestId('time-pointer'); const rotations = [Number(pointer.dataset.rotation)];
    for (const label of ['一周', '六个月', '一年', '10 秒']) { fireEvent.click(page.getByRole('button', { name: label })); rotations.push(Number(pointer.dataset.rotation)); }
    expect(rotations.every((value, index) => index === 0 || value > rotations[index - 1])).toBe(true);
  });

  it('confirms a custom opening date', () => {
    const onConfirm = vi.fn(); const view = render(<TimeRing onConfirm={onConfirm} onBack={vi.fn()} />); const page = within(view.container);
    fireEvent.click(page.getByRole('button', { name: '一周' })); fireEvent.change(page.getByLabelText('自定义开启时间'), { target: { value: '2030-08-21T10:30' } }); fireEvent.click(page.getByText('确认封存时间'));
    expect(onConfirm).toHaveBeenCalledWith('7d', '2030-08-21T10:30');
  });
});
