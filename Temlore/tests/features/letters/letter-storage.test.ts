import { beforeEach, describe, expect, it } from 'vitest';
import { getActivePhone, loadLetters, saveLetter, type StoredLetter } from '../../../src/features/letters/letterStorage';

describe('phone-scoped letter storage', () => {
  beforeEach(() => localStorage.clear());

  it('keeps a new phone history empty and separates accounts', () => {
    localStorage.setItem('temlore.session', JSON.stringify({ phone: '13800138000' }));
    expect(getActivePhone()).toBe('13800138000');
    saveLetter('13800138000', { id: 'one', font: 'songti', blocks: [{ id: 'text', type: 'text', text: '第一封' }], writtenAt: '2026-08-23T10:00:00.000Z', unlockAt: 1, arrived: true });
    expect(loadLetters('13800138000')).toHaveLength(1);
    expect(loadLetters('13900139000')).toEqual([]);
  });

  it('round-trips the complete finalized photo snapshot', () => {
    const letter: StoredLetter = {
      id: 'photo-letter',
      font: 'kaiti',
      blocks: [
        { id: 'before', type: 'text', text: '照片上面' },
        { id: 'photo', type: 'photo', url: 'data:image/png;base64,AAAA', caption: '此刻', scale: 1.2, width: 250, height: 300, alignX: 18 },
        { id: 'after', type: 'text', text: '照片下面' },
      ],
      writtenAt: '2026-08-23T11:00:00.000Z',
      unlockAt: 2,
      arrived: false,
    };
    saveLetter('13800138000', letter);
    expect(loadLetters('13800138000')[0]).toEqual(letter);
  });

  it('loads a legacy letter as safe ordered blocks without rewriting storage', () => {
    const raw = [{ id: 'old', body: '旧正文', font: 'songti', photos: [{ url: 'old', x: 0, y: -200 }], writtenAt: '2026-08-23T11:00:00.000Z', unlockAt: 2, arrived: true }];
    localStorage.setItem('temlore.letters.13800138000', JSON.stringify(raw));
    expect(loadLetters('13800138000')[0].blocks.map((block) => block.type)).toEqual(['text', 'photo', 'text']);
    expect(localStorage.getItem('temlore.letters.13800138000')).toBe(JSON.stringify(raw));
  });
});
