import { useEffect, useLayoutEffect, useRef, useState, type ChangeEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { loadDraft, saveDraft } from './draftStorage';
import {
  emptyDraft,
  insertPhotoAtCaret,
  removePhotoBlock,
  type DraftFont,
  type EditorDraft,
  type LetterBlock,
  type PhotoBlock,
  type TextBlock,
} from './letterBlocks';
import './editor.css';

type Corner = 'nw' | 'ne' | 'sw' | 'se';
type ResizeState = { id: string; corner: Corner; x: number; y: number; width: number; height: number };
type DragState = { id: string; pointerId: number; startX: number; alignX: number; minX: number; maxX: number };

export function LetterEditor({ onDone, onBack }: { onDone: (draft: EditorDraft) => void; onBack?: () => void }) {
  const stored = useRef(loadDraft() ?? emptyDraft());
  const [font, setFont] = useState<DraftFont>(stored.current.font);
  const [blocks, setBlocks] = useState<LetterBlock[]>(stored.current.blocks);
  const [saved, setSaved] = useState(true);
  const fileInput = useRef<HTMLInputElement>(null);
  const paper = useRef<HTMLElement>(null);
  const saveTimer = useRef<number | undefined>(undefined);
  const textareas = useRef(new Map<string, HTMLTextAreaElement>());
  const caret = useRef<{ id: string; offset: number } | null>(null);
  const pendingFocus = useRef<string | null>(null);
  const resize = useRef<ResizeState | null>(null);
  const drag = useRef<DragState | null>(null);
  const touches = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ id: string; distance: number; scale: number } | null>(null);

  useEffect(() => {
    setSaved(false);
    saveDraft({ font, blocks });
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => setSaved(true), 500);
    return () => window.clearTimeout(saveTimer.current);
  }, [font, blocks]);

  useLayoutEffect(() => {
    textareas.current.forEach((textarea) => {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(31, textarea.scrollHeight)}px`;
    });
    const focusId = pendingFocus.current;
    if (!focusId) return;
    const textarea = textareas.current.get(focusId);
    textarea?.focus();
    textarea?.setSelectionRange(0, 0);
    if (textarea) caret.current = { id: focusId, offset: 0 };
    pendingFocus.current = null;
  }, [blocks]);

  function updateText(id: string, text: string) {
    setBlocks((items) => items.map((block) => block.id === id && block.type === 'text' ? { ...block, text } : block));
  }

  function updatePhoto(id: string, update: Partial<PhotoBlock>) {
    setBlocks((items) => items.map((block) => block.id === id && block.type === 'photo' ? { ...block, ...update } : block));
  }

  function rememberCaret(id: string, element: HTMLTextAreaElement) {
    caret.current = { id, offset: element.selectionStart ?? element.value.length };
  }

  function choosePhoto() { fileInput.current?.click(); }

  function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || blocks.filter((block) => block.type === 'photo').length >= 9) return;
    const reader = new FileReader();
    reader.onload = () => {
      const fallback = [...blocks].reverse().find((block): block is TextBlock => block.type === 'text')!;
      const target = caret.current ?? { id: fallback.id, offset: fallback.text.length };
      const previousIds = new Set(blocks.map((block) => block.id));
      const next = insertPhotoAtCaret(blocks, target.id, target.offset, {
        type: 'photo',
        url: String(reader.result),
        caption: '',
        scale: 1,
        width: 188,
        height: 190,
        alignX: 0,
      });
      const insertedIndex = next.findIndex((block) => block.type === 'photo' && !previousIds.has(block.id));
      const nextText = next.slice(insertedIndex + 1).find((block): block is TextBlock => block.type === 'text');
      pendingFocus.current = nextText?.id ?? null;
      setBlocks(next);
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  }

  function startResize(event: ReactPointerEvent<HTMLButtonElement>, block: PhotoBlock, corner: Corner) {
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    resize.current = { id: block.id, corner, x: event.clientX, y: event.clientY, width: block.width, height: block.height };
  }

  function moveResize(event: ReactPointerEvent<HTMLElement>) {
    const active = resize.current;
    if (!active) return;
    const xSign = active.corner.includes('e') ? 1 : -1;
    const ySign = active.corner.includes('s') ? 1 : -1;
    updatePhoto(active.id, {
      width: Math.max(120, Math.min(315, active.width + (event.clientX - active.x) * xSign)),
      height: Math.max(120, Math.min(650, active.height + (event.clientY - active.y) * ySign)),
    });
  }

  function endResize() { resize.current = null; }

  function startPhotoGesture(event: ReactPointerEvent<HTMLDivElement>, block: PhotoBlock) {
    event.currentTarget.setPointerCapture?.(event.pointerId);
    touches.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const figure = event.currentTarget.parentElement?.getBoundingClientRect();
    const paperRect = paper.current?.getBoundingClientRect();
    if (figure && paperRect) {
      const baseLeft = figure.left - block.alignX;
      drag.current = {
        id: block.id,
        pointerId: event.pointerId,
        startX: event.clientX,
        alignX: block.alignX,
        minX: paperRect.left + 10 - baseLeft,
        maxX: paperRect.right - 10 - baseLeft - figure.width,
      };
    }
    if (touches.current.size === 2) {
      const [a, b] = [...touches.current.values()];
      pinch.current = { id: block.id, distance: Math.hypot(a.x - b.x, a.y - b.y), scale: block.scale };
      drag.current = null;
    }
  }

  function movePhotoGesture(event: ReactPointerEvent<HTMLDivElement>) {
    if (!touches.current.has(event.pointerId)) return;
    touches.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pinch.current && touches.current.size === 2) {
      const [a, b] = [...touches.current.values()];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      updatePhoto(pinch.current.id, { scale: Math.max(.5, Math.min(3, pinch.current.scale * distance / Math.max(1, pinch.current.distance))) });
      return;
    }
    const active = drag.current;
    if (active?.pointerId === event.pointerId) {
      updatePhoto(active.id, { alignX: Math.max(active.minX, Math.min(active.maxX, active.alignX + event.clientX - active.startX)) });
    }
  }

  function endPhotoGesture(event: ReactPointerEvent<HTMLDivElement>) {
    touches.current.delete(event.pointerId);
    if (touches.current.size < 2) pinch.current = null;
    if (drag.current?.pointerId === event.pointerId) drag.current = null;
  }

  function focusLastText() {
    const last = [...blocks].reverse().find((block): block is TextBlock => block.type === 'text');
    if (!last) return;
    const textarea = textareas.current.get(last.id);
    textarea?.focus();
    const offset = textarea?.value.length ?? 0;
    textarea?.setSelectionRange(offset, offset);
    caret.current = { id: last.id, offset };
  }

  const now = new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }).toUpperCase();
  let textIndex = 0;
  let photoIndex = 0;

  return <main className="editor-screen">
    <header className="editor-top"><button aria-label="返回" onClick={onBack}>←</button><span>{saved ? 'DRAFT SAVED' : 'SAVING…'}</span></header>
    <article ref={paper} className={`letter-paper ${font}`} onClick={(event) => { if (event.target === event.currentTarget) focusLastText(); }}>
      <small>{now}</small><h1>Dear future me,</h1>
      <div className="letter-flow" data-testid="letter-flow" onClick={(event) => { if (event.target === event.currentTarget) focusLastText(); }}>
        {blocks.map((block) => {
          if (block.type === 'text') {
            textIndex += 1;
            const label = `文字段落${textIndex}`;
            return <textarea
              key={block.id}
              ref={(element) => { if (element) textareas.current.set(block.id, element); else textareas.current.delete(block.id); }}
              className="letter-block-text"
              aria-label={label}
              value={block.text}
              onChange={(event) => { updateText(block.id, event.target.value); rememberCaret(block.id, event.currentTarget); }}
              onFocus={(event) => rememberCaret(block.id, event.currentTarget)}
              onClick={(event) => rememberCaret(block.id, event.currentTarget)}
              onSelect={(event) => rememberCaret(block.id, event.currentTarget)}
            />;
          }
          photoIndex += 1;
          const position = photoIndex;
          return <figure
            data-testid="flow-photo"
            className="polaroid letter-flow-photo"
            key={block.id}
            style={{ width: block.width, height: block.height, transform: `translateX(${block.alignX}px) rotate(-2deg)` }}
            onPointerMove={moveResize}
            onPointerUp={endResize}
          >
            <button type="button" className="photo-delete" aria-label={`删除照片${position}`} onClick={() => setBlocks((items) => removePhotoBlock(items, block.id))}>×</button>
            <div className="photo-placeholder" role="button" tabIndex={0} aria-label={`水平移动照片${position}`} data-axis="x" onPointerDown={(event) => startPhotoGesture(event, block)} onPointerMove={movePhotoGesture} onPointerUp={endPhotoGesture} onPointerCancel={endPhotoGesture}><img src={block.url} alt={`照片${position}`} style={{ transform: `scale(${block.scale})` }} /></div>
            <input aria-label={`照片${position}说明`} value={block.caption} onChange={(event) => updatePhoto(block.id, { caption: event.target.value })} placeholder="写一句照片说明" />
            {(['nw', 'ne', 'sw', 'se'] as Corner[]).map((corner) => <button key={corner} type="button" className={`resize-handle ${corner}`} aria-label={`调整照片${position}${corner}`} onPointerDown={(event) => startResize(event, block, corner)} onPointerUp={endResize} />)}
          </figure>;
        })}
      </div>
    </article>
    <input ref={fileInput} hidden type="file" accept="image/*" aria-label="上传照片" onChange={onFile} />
    <nav className="editor-toolbar" aria-label="写信工具栏"><button onClick={() => setFont(font === 'songti' ? 'kaiti' : 'songti')}>{font === 'songti' ? '宋体' : '楷体'}</button><button onClick={choosePhoto}>▧ 照片</button><button className="editor-done" onClick={() => onDone({ font, blocks })}>✓</button></nav>
  </main>;
}
