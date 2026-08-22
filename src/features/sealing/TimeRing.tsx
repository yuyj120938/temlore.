import { useState } from 'react';
import './sealing.css';

const presets = [['10s', '10 秒'], ['1d', '1 天'], ['7d', '7 天'], ['30d', '30 天'], ['1y', '1 年']] as const;
export function TimeRing({ onConfirm }: { onConfirm: (duration: typeof presets[number][0]) => void }) {
  const [selected, setSelected] = useState<typeof presets[number][0]>('10s');
  return <main className="sealing-screen"><header className="sealing-top"><button>←</button><span>SEAL THIS LETTER</span><button>•••</button></header><section className="ring-copy"><small>SEAL AFTER</small><h1>{presets.find(([key]) => key === selected)?.[1]}</h1><p>一圈时间，选择你想抵达的未来。</p><div className="time-ring" aria-label="封存时间选择器"><i />{presets.map(([key, label], index) => <button key={key} className={selected === key ? 'selected' : ''} style={{ transform: `rotate(${index * 72}deg) translateY(-112px) rotate(${-index * 72}deg)` }} onClick={() => setSelected(key)}>{label}</button>)}</div></section><div className="sealing-warning">封存后将无法查看、编辑或改期，直到服务器时间到达。</div><button className="seal-confirm" onClick={() => onConfirm(selected)}>确认封存时间</button></main>;
}
