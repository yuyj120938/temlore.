import { fireEvent, render, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CalendarPopover } from '../../../src/features/sealing/CalendarPopover';

describe('CalendarPopover', () => {
  it('starts with a scrollable year wheel before showing date controls', () => {
    const view = render(<CalendarPopover value="2030-08-21T09:30" onConfirm={vi.fn()} onClose={vi.fn()} />); const panel = within(view.container);
    expect(panel.getByRole('dialog', { name: '选择开启日期' })).toBeInTheDocument();
    expect(panel.getByLabelText('年份滚轮')).toBeInTheDocument();
    expect(panel.getByRole('button', { name: '2030 年' })).toHaveClass('selected');
    expect(panel.queryByText('2030 年 8 月')).not.toBeInTheDocument();
    expect(panel.queryByLabelText('小时')).not.toBeInTheDocument(); expect(panel.queryByLabelText('分钟')).not.toBeInTheDocument();
  });

  it('confirms the year before showing dates and keeps the chosen hour and minute', () => {
    const onConfirm = vi.fn(); const view = render(<CalendarPopover value="2030-08-21T09:30" onConfirm={onConfirm} onClose={vi.fn()} />); const panel = within(view.container);
    fireEvent.click(panel.getByRole('button', { name: '2031 年' })); fireEvent.click(panel.getByRole('button', { name: '确认年份' }));
    expect(panel.getByText('2031 年 8 月')).toBeInTheDocument();
    expect(panel.getByLabelText('小时')).toHaveValue(9); expect(panel.getByLabelText('分钟')).toHaveValue(30);
    fireEvent.click(panel.getByRole('button', { name: '22' })); fireEvent.change(panel.getByLabelText('小时'), { target: { value: '18' } }); fireEvent.change(panel.getByLabelText('分钟'), { target: { value: '45' } }); fireEvent.click(panel.getByRole('button', { name: '确认日期' }));
    expect(onConfirm).toHaveBeenCalledWith('2031-08-22T18:45');
  });

  it('navigates months and can be cancelled', () => {
    const onClose = vi.fn(); const view = render(<CalendarPopover value="2030-08-21T00:00" onConfirm={vi.fn()} onClose={onClose} />); const panel = within(view.container);
    fireEvent.click(panel.getByRole('button', { name: '确认年份' })); fireEvent.click(panel.getByRole('button', { name: '下一月' })); expect(panel.getByText('2030 年 9 月')).toBeInTheDocument();
    fireEvent.click(panel.getByRole('button', { name: '取消' })); expect(onClose).toHaveBeenCalledOnce();
  });
});
