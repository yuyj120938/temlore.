import { BlueSeal } from '../../components/BlueSeal';
import type { StoredLetter } from '../letters/letterStorage';

export function LetterReader({ onClose, letter }: { onClose: () => void; letter: StoredLetter }) {
  const date = new Date(letter.writtenAt).toLocaleString('zh-CN');
  return <main className="reader-screen"><header><button onClick={onClose}>←</button><span>LETTER OPENED</span><i /></header><article className={letter.font}><small>{date} · ARRIVED</small><h1>Dear future me,</h1>{letter.body.split('\n').filter(Boolean).map((line, index) => <p key={index}>{line}</p>)}{letter.photos.map((photo, index) => <figure className="reader-photo" key={index} style={{ width: photo.width, height: photo.height, transform: `translate(${photo.x}px, ${photo.y}px) rotate(-2deg)` }}><div><img src={photo.url} alt={`信件照片${index + 1}`} style={{ transform: `scale(${photo.scale})` }} /></div>{photo.caption && <figcaption>{photo.caption}</figcaption>}</figure>)}<div className="reader-seal"><BlueSeal variant="stamp" /></div></article></main>;
}
