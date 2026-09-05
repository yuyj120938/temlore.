import { useState } from 'react';
import { CalendarPopover } from './CalendarPopover';
import './sealing.css';

export type SealDuration = '10s' | '7d' | '3mo' | '6mo' | '1y' | '3y' | '5y';
const presets: ReadonlyArray<[SealDuration, string]> = [['10s', '10 秒'], ['7d', '一周'], ['3mo', '三个月'], ['6mo', '六个月'], ['1y', '一年'], ['3y', '三年'], ['5y', '五年']];

export function TimeRing({ onConfirm, onBack }: { onConfirm: (duration: SealDuration, customDate?: string) => void; onBack: () => void }) {
  const [selected, setSelected] = useState<SealDuration>('10s');
  const [customDate, setCustomDate] = useState('');
  const [rotation, setRotation] = useState(0);
  const [calendarOpen, setCalendarOpen] = useState(false);

  function selectTime(key: SealDuration, index: number) {
    const target = index * (360 / presets.length); const current = rotation % 360; let advance = (target - current + 360) % 360;
    if (advance === 0) advance = 360;
    setRotation(rotation + advance); setSelected(key); setCustomDate('');
  }

  return <main className="sealing-screen"><header className="sealing-top"><button aria-label="返回写信" onClick={onBack}>←</button><span>SEAL THIS LETTER</span></header><section className="ring-copy"><small>SEAL AFTER</small><h1>{customDate ? '自定义' : presets.find(([key]) => key === selected)?.[1]}</h1><p>一圈时间，选择你想抵达的未来。</p><div className="time-ring" aria-label="封存时间选择器"><i data-testid="time-pointer" data-rotation={rotation} style={{ transform: `translate(-50%,-100%) rotate(${rotation}deg)` }} />{presets.map(([key, label], index) => <button key={key} className={selected === key && !customDate ? 'selected' : ''} style={{ transform: `rotate(${index * (360 / presets.length)}deg) translateY(-112px) rotate(${-index * (360 / presets.length)}deg)` }} onClick={() => selectTime(key, index)}>{label}</button>)}</div><button className={`custom-time ${customDate ? 'selected' : ''}`} aria-label="自定义开启时间" onClick={() => setCalendarOpen(true)}><span>自定义日期</span><b>{customDate ? customDate.replace('T', ' ') : '选择日期与时间'}</b></button></section><div className="sealing-warning plain">封存后将无法查看、编辑或改期，直到服务器时间到达。</div><button className="seal-confirm" onClick={() => onConfirm(selected, customDate || undefined)}>确认封存时间</button>{calendarOpen && <CalendarPopover value={customDate} onClose={() => setCalendarOpen(false)} onConfirm={(value) => { setCustomDate(value); setCalendarOpen(false); }} />}</main>;
}
