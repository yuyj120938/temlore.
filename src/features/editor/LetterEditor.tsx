import { useEffect, useRef, useState } from 'react';
import './editor.css';

type Photo = { url: string; caption: string };

export function LetterEditor({ onDone }: { onDone: (body: string) => void }) {
  const [body, setBody] = useState('今天的风很轻，我突然想把这一刻留给未来的你。\n\n希望你打开这封信时，仍记得此刻的勇气与期待。');
  const [font, setFont] = useState<'songti' | 'kaiti'>('songti');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [saved, setSaved] = useState(true);
  const saveTimer = useRef<number | undefined>(undefined);
  useEffect(() => { setSaved(false); window.clearTimeout(saveTimer.current); saveTimer.current = window.setTimeout(() => setSaved(true), 1000); return () => window.clearTimeout(saveTimer.current); }, [body, font]);
  function addPhoto() { if (photos.length >= 9) return; setPhotos((items) => [...items, { url: '', caption: '' }]); }
  return <main className="editor-screen"><header className="editor-top"><button aria-label="返回">←</button><span>{saved ? 'DRAFT SAVED' : 'SAVING…'}</span><button aria-label="更多">•••</button></header><article className={`letter-paper ${font}`}><small>21 AUG 2026 · 17:41</small><h1>Dear future me,</h1><textarea aria-label="信件正文" value={body} onChange={(e) => setBody(e.target.value)} />{photos.map((photo, index) => <figure className="polaroid" key={index}><div className="photo-placeholder">照片 {index + 1}</div><input aria-label={`照片${index + 1}说明`} value={photo.caption} onChange={(e) => setPhotos((items) => items.map((item, i) => i === index ? { ...item, caption: e.target.value } : item))} placeholder="写一句照片说明" /></figure>)}</article><nav className="editor-toolbar"><button onClick={() => setFont(font === 'songti' ? 'kaiti' : 'songti')}>{font === 'songti' ? '宋体' : '楷体'}</button><button onClick={addPhoto}>▧ 照片</button><button className="editor-done" onClick={() => onDone(body)}>✓</button></nav></main>;
}
