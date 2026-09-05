import { useState } from 'react';
import { BlueSeal } from '../../components/BlueSeal';
import './desk.css';

export function MemoryDesk({ onOpen, onBack }: { onOpen: () => void; onBack: () => void }) {
  const [open, setOpen] = useState(false);
  return <main className="memory-desk"><button className="desk-back" aria-label="返回主页" onClick={onBack}>←</button><div className="desk-sky" /><div className="desk-copy"><small>YOUR TIME DESK</small><h1>A letter<br />has arrived.</h1></div><div className={`desk-object ${open ? 'is-open' : ''}`}><div className="desk-edge" /><button className="desk-drawer" onClick={() => { setOpen(true); window.setTimeout(onOpen, 900); }} aria-label="打开中央抽屉"><span /></button></div><div className="desk-envelope"><BlueSeal variant="stamp" /></div><p className="desk-hint">TAP THE DRAWER TO OPEN</p></main>;
}
