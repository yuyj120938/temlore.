import { useEffect, useRef, useState, type ChangeEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { loadDraft, saveDraft, type DraftFont, type DraftPhoto } from './draftStorage';
import './editor.css';

const initialBody = '今天的风很轻，我突然想把这一刻留给未来的你。\n\n希望你打开这封信时，仍记得此刻的勇气与期待。';
type Corner = 'nw' | 'ne' | 'sw' | 'se';
type ResizeState = { index: number; corner: Corner; x: number; y: number; width: number; height: number };

export function LetterEditor({ onDone, onBack }: { onDone: (body: string) => void; onBack?: () => void }) {
  const stored = useRef(loadDraft());
  const [body, setBody] = useState(stored.current?.body ?? initialBody);
  const [font, setFont] = useState<DraftFont>(stored.current?.font ?? 'songti');
  const [photos, setPhotos] = useState<DraftPhoto[]>(stored.current?.photos ?? []);
  const [saved, setSaved] = useState(true);
  const fileInput = useRef<HTMLInputElement>(null);
  const saveTimer = useRef<number | undefined>(undefined);
  const resize = useRef<ResizeState | null>(null);
  const touches = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ distance: number; scale: number; index: number } | null>(null);

  useEffect(() => {
    setSaved(false); saveDraft({ body, font, photos }); window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => setSaved(true), 500);
    return () => window.clearTimeout(saveTimer.current);
  }, [body, font, photos]);

  function updatePhoto(index: number, update: Partial<DraftPhoto>) { setPhotos((items) => items.map((item, i) => i === index ? { ...item, ...update } : item)); }
  function choosePhoto() { fileInput.current?.click(); }
  function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file || photos.length >= 9) return;
    const reader = new FileReader(); reader.onload = () => setPhotos((items) => [...items, { url: String(reader.result), caption: '', scale: 1, width: 188, height: 190 }]); reader.readAsDataURL(file); e.target.value = '';
  }
  function startResize(e: ReactPointerEvent<HTMLButtonElement>, index: number, corner: Corner) {
    e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); const photo = photos[index];
    resize.current = { index, corner, x: e.clientX, y: e.clientY, width: photo.width, height: photo.height };
  }
  function moveResize(e: ReactPointerEvent<HTMLElement>) {
    const active = resize.current; if (!active) return;
    const xSign = active.corner.includes('e') ? 1 : -1; const ySign = active.corner.includes('s') ? 1 : -1;
    updatePhoto(active.index, { width: Math.max(120, Math.min(315, active.width + (e.clientX - active.x) * xSign)), height: Math.max(120, Math.min(650, active.height + (e.clientY - active.y) * ySign)) });
  }
  function startPinch(e: ReactPointerEvent<HTMLDivElement>, index: number) {
    e.currentTarget.setPointerCapture(e.pointerId); touches.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (touches.current.size === 2) { const [a, b] = [...touches.current.values()]; pinch.current = { distance: Math.hypot(a.x - b.x, a.y - b.y), scale: photos[index].scale, index }; }
  }
  function movePinch(e: ReactPointerEvent<HTMLDivElement>) {
    if (!touches.current.has(e.pointerId)) return; touches.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch.current && touches.current.size === 2) { const [a, b] = [...touches.current.values()]; const distance = Math.hypot(a.x - b.x, a.y - b.y); updatePhoto(pinch.current.index, { scale: Math.max(.5, Math.min(3, pinch.current.scale * distance / pinch.current.distance)) }); }
  }
  function endPointer(e: ReactPointerEvent) { touches.current.delete(e.pointerId); if (touches.current.size < 2) pinch.current = null; resize.current = null; }

  const now = new Date().toLocaleString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', hour12:false }).toUpperCase();
  return <main className="editor-screen"><header className="editor-top"><button aria-label="返回" onClick={onBack}>←</button><span>{saved ? 'DRAFT SAVED' : 'SAVING…'}</span></header><article className={`letter-paper ${font}`}><small>{now}</small><h1>Dear future me,</h1><textarea aria-label="信件正文" value={body} onChange={(e) => setBody(e.target.value)} />{photos.map((photo, index) => <figure className="polaroid resizable-photo" key={index} style={{ width: photo.width, height: photo.height }} onPointerMove={moveResize} onPointerUp={endPointer}><div className="photo-placeholder" onPointerDown={(e) => startPinch(e, index)} onPointerMove={movePinch} onPointerUp={endPointer} onPointerCancel={endPointer}><img src={photo.url} alt={`照片${index + 1}`} style={{ transform: `scale(${photo.scale})` }} /></div><input aria-label={`照片${index + 1}说明`} value={photo.caption} onChange={(e) => updatePhoto(index, { caption: e.target.value })} placeholder="写一句照片说明" />{(['nw','ne','sw','se'] as Corner[]).map((corner) => <button key={corner} type="button" className={`resize-handle ${corner}`} aria-label={`调整照片${index + 1}${corner}`} onPointerDown={(e) => startResize(e, index, corner)} onPointerUp={endPointer} />)}</figure>)}</article><input ref={fileInput} hidden type="file" accept="image/*" aria-label="上传照片" onChange={onFile} /><nav className="editor-toolbar" aria-label="写信工具栏"><button onClick={() => setFont(font === 'songti' ? 'kaiti' : 'songti')}>{font === 'songti' ? '宋体' : '楷体'}</button><button onClick={choosePhoto}>▧ 照片</button><button className="editor-done" onClick={() => onDone(body)}>✓</button></nav></main>;
}
