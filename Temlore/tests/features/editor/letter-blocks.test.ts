import { describe, expect, it } from 'vitest';
import { bodyFromBlocks, insertPhotoAtCaret, normalizeDraft, removePhotoBlock, type PhotoBlock } from '../../../src/features/editor/letterBlocks';

const photo: Omit<PhotoBlock, 'id'> = {
  type: 'photo',
  url: 'data:image/png;base64,AAAA',
  caption: '',
  scale: 1,
  width: 188,
  height: 190,
  alignX: 0,
};

describe('ordered letter blocks', () => {
  it('splits text at the caret and inserts a photo between both halves', () => {
    const blocks = insertPhotoAtCaret([{ id: 'text-1', type: 'text', text: '前半后半' }], 'text-1', 2, photo);
    expect(blocks.map((block) => block.type)).toEqual(['text', 'photo', 'text']);
    expect(blocks[0]).toMatchObject({ type: 'text', text: '前半' });
    expect(blocks[2]).toMatchObject({ type: 'text', text: '后半' });
  });

  it('merges adjacent text after removing a photo', () => {
    const blocks = removePhotoBlock([
      { id: 'before', type: 'text', text: '上面' },
      { id: 'photo', ...photo },
      { id: 'after', type: 'text', text: '下面' },
    ], 'photo');
    expect(blocks).toEqual([{ id: 'before', type: 'text', text: '上面下面' }]);
  });

  it('converts legacy text and photos to safe flow without vertical offsets', () => {
    const draft = normalizeDraft({
      body: '旧正文',
      font: 'kaiti',
      photos: [{ url: photo.url, caption: '旧照片', scale: 1, width: 250, height: 300, x: 18, y: -240 }],
    });
    expect(draft?.blocks.map((block) => block.type)).toEqual(['text', 'photo', 'text']);
    expect(draft?.blocks[1]).toMatchObject({ type: 'photo', alignX: 18 });
    expect(draft?.blocks[1]).not.toHaveProperty('y');
    expect(bodyFromBlocks(draft!.blocks)).toBe('旧正文');
  });
});
