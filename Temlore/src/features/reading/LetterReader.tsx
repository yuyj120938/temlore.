import { BlueSeal } from '../../components/BlueSeal';
import type { StoredLetter } from '../letters/letterStorage';

export function LetterReader({ onClose, letter }: { onClose: () => void; letter: StoredLetter }) {
  const date = new Date(letter.writtenAt).toLocaleString('zh-CN');
  let photoIndex = 0;
  return <main className="reader-screen">
    <header><button onClick={onClose}>←</button><span>LETTER OPENED</span><i /></header>
    <article className={letter.font}>
      <small>{date} · ARRIVED</small><h1>Dear future me,</h1>
      <div className="reader-flow" data-testid="reader-flow">
        {letter.blocks.map((block) => {
          if (block.type === 'text') return <div className="reader-text" key={block.id}>{block.text}</div>;
          photoIndex += 1;
          const position = photoIndex;
          return <figure className="reader-photo" data-testid="reader-photo" key={block.id} style={{ width: block.width, height: block.height, transform: `translateX(${block.alignX}px) rotate(-2deg)` }}>
            <div><img src={block.url} alt={`信件照片${position}`} style={{ transform: `scale(${block.scale})` }} /></div>
            {block.caption && <figcaption>{block.caption}</figcaption>}
          </figure>;
        })}
      </div>
      <div className="reader-seal"><BlueSeal variant="stamp" /></div>
    </article>
  </main>;
}
