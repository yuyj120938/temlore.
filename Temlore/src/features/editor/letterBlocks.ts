export type DraftFont = 'songti' | 'kaiti';
export type TextBlock = { id: string; type: 'text'; text: string };
export type PhotoBlock = {
  id: string;
  type: 'photo';
  url: string;
  caption: string;
  scale: number;
  width: number;
  height: number;
  alignX: number;
};
export type LetterBlock = TextBlock | PhotoBlock;
export type EditorDraft = { font: DraftFont; blocks: LetterBlock[] };

type LegacyPhoto = {
  url: string;
  caption?: string;
  scale?: number;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
};
type LegacyDraft = { body?: string; font?: DraftFont; photos?: LegacyPhoto[] };

let nextId = 0;

export function blockId(prefix: 'text' | 'photo') {
  nextId += 1;
  return `${prefix}-${Date.now()}-${nextId}`;
}

export function emptyDraft(): EditorDraft {
  return { font: 'songti', blocks: [{ id: blockId('text'), type: 'text', text: '' }] };
}

function ensureTrailingText(blocks: LetterBlock[]) {
  return blocks.at(-1)?.type === 'text'
    ? blocks
    : [...blocks, { id: blockId('text'), type: 'text' as const, text: '' }];
}

export function normalizeDraft(value: unknown): EditorDraft | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as EditorDraft & LegacyDraft;
  const font: DraftFont = candidate.font === 'kaiti' ? 'kaiti' : 'songti';
  if (Array.isArray(candidate.blocks)) {
    const blocks = candidate.blocks.filter((block) => block && (block.type === 'text' || block.type === 'photo'));
    return { font, blocks: ensureTrailingText(blocks.length ? blocks : emptyDraft().blocks) };
  }
  const blocks: LetterBlock[] = [{ id: blockId('text'), type: 'text', text: candidate.body ?? '' }];
  for (const legacy of candidate.photos ?? []) {
    blocks.push({
      id: blockId('photo'),
      type: 'photo',
      url: legacy.url,
      caption: legacy.caption ?? '',
      scale: legacy.scale ?? 1,
      width: legacy.width ?? 188,
      height: legacy.height ?? 190,
      alignX: Math.max(-80, Math.min(80, legacy.x ?? 0)),
    });
  }
  return { font, blocks: ensureTrailingText(blocks) };
}

export function insertPhotoAtCaret(blocks: LetterBlock[], textId: string, offset: number, photo: Omit<PhotoBlock, 'id'>) {
  const index = blocks.findIndex((block) => block.id === textId && block.type === 'text');
  const target = blocks[index];
  if (index < 0 || target.type !== 'text') {
    return ensureTrailingText([...blocks, { ...photo, id: blockId('photo') }]);
  }
  const caret = Math.max(0, Math.min(target.text.length, offset));
  return [
    ...blocks.slice(0, index),
    { ...target, text: target.text.slice(0, caret) },
    { ...photo, id: blockId('photo') },
    { id: blockId('text'), type: 'text' as const, text: target.text.slice(caret) },
    ...blocks.slice(index + 1),
  ];
}

export function removePhotoBlock(blocks: LetterBlock[], photoId: string) {
  const index = blocks.findIndex((block) => block.id === photoId && block.type === 'photo');
  if (index < 0) return blocks;
  const before = blocks[index - 1];
  const after = blocks[index + 1];
  if (before?.type === 'text' && after?.type === 'text') {
    return [...blocks.slice(0, index - 1), { ...before, text: before.text + after.text }, ...blocks.slice(index + 2)];
  }
  return ensureTrailingText(blocks.filter((block) => block.id !== photoId));
}

export function bodyFromBlocks(blocks: LetterBlock[]) {
  return blocks
    .filter((block): block is TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('');
}
