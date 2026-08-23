import { fireEvent, render, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CalendarPopover } from '../../../src/features/sealing/CalendarPopover';

describe('CalendarPopover', () => {
  it('uses a native-like month grid with a blue selected day and time controls', () => {
    const onConfirm = vi.fn(); const view = render(<CalendarPopover value="2030-08-21T10:30" onConfirm={onConfirm} onClose={vi.fn()} />); const panel = within(view.container);
    expect(panel.getByRole('dialog', { name: '选择开启日期' })).toBeInTheDocument();
    expect(panel.getByText('2030 年 8 月')).toBeInTheDocument();
    expect(panel.getByRole('button', { name: '21' })).toHaveClass('selected');
    expect(panel.getByLabelText('小时')).toHaveValue(10); expect(panel.getByLabelText('分钟')).toHaveValue(30);
    fireEvent.click(panel.getByRole('button', { name: '22' }));
    fireEvent.click(panel.getByRole('button', { name: '确认日期' }));
    expect(onConfirm).toHaveBeenCalledWith('2030-08-22T10:30');
  });

  it('navigates months and can be cancelled', () => {
    const onClose = vi.fn(); const view = render(<CalendarPopover value="2030-08-21T10:30" onConfirm={vi.fn()} onClose={onClose} />); const panel = within(view.container);
    fireEvent.click(panel.getByRole('button', { name: '下一月' })); expect(panel.getByText('2030 年 9 月')).toBeInTheDocument();
    fireEvent.click(panel.getByRole('button', { name: '取消' })); expect(onClose).toHaveBeenCalledOnce();
  });
});
