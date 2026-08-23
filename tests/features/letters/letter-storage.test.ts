import { beforeEach, describe, expect, it } from 'vitest';
import { getActivePhone, loadLetters, saveLetter, type StoredLetter } from '../../../src/features/letters/letterStorage';

describe('phone-scoped letter storage', () => {
  beforeEach(() => localStorage.clear());

  it('keeps a new phone history empty and separates accounts', () => {
    localStorage.setItem('temlore.session', JSON.stringify({ phone: '13800138000' }));
    expect(getActivePhone()).toBe('13800138000');
    saveLetter('13800138000', { id: 'one', body: '第一封', font: 'songti', photos: [], writtenAt: '2026-08-23T10:00:00.000Z', unlockAt: 1, arrived: true });
    expect(loadLetters('13800138000')).toHaveLength(1);
    expect(loadLetters('13900139000')).toEqual([]);
  });

  it('round-trips the complete finalized photo snapshot', () => {
    const letter: StoredLetter = { id: 'photo-letter', body: '含照片', font: 'kaiti', photos: [{ url: 'data:image/png;base64,AAAA', caption: '此刻', scale: 1.2, width: 250, height: 300, x: 18, y: 20 }], writtenAt: '2026-08-23T11:00:00.000Z', unlockAt: 2, arrived: false };
    saveLetter('13800138000', letter);
    expect(loadLetters('13800138000')[0]).toEqual(letter);
  });
});
