import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TimeRing } from '../../../src/features/sealing/TimeRing';

describe('TimeRing', () => { it('selects a duration and confirms it', () => { const onConfirm = vi.fn(); render(<TimeRing onConfirm={onConfirm} />); fireEvent.click(screen.getByText('1 天')); fireEvent.click(screen.getByText('确认封存时间')); expect(onConfirm).toHaveBeenCalledWith('1d'); }); });
