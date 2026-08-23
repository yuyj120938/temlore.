import { useState } from 'react';
import './calendar.css';

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function initialParts(value: string) {
  const fallback = new Date(Date.now() + 86_400_000);
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  return match
    ? { year: Number(match[1]), month: Number(match[2]) - 1, day: Number(match[3]), hour: Number(match[4]), minute: Number(match[5]) }
    : { year: fallback.getFullYear(), month: fallback.getMonth(), day: fallback.getDate(), hour: 9, minute: 0 };
}

export function CalendarPopover({ value, onConfirm, onClose }: { value: string; onConfirm: (value: string) => void; onClose: () => void }) {
  const initial = initialParts(value);
  const [phase, setPhase] = useState<'year' | 'date'>('year');
  const [year, setYear] = useState(initial.year);
  const [month, setMonth] = useState(initial.month);
  const [day, setDay] = useState(initial.day);
  const [hour, setHour] = useState(initial.hour);
  const [minute, setMinute] = useState(initial.minute);
  const currentYear = new Date().getFullYear();
  const firstYear = Math.min(currentYear, initial.year);
  const lastYear = Math.max(currentYear + 100, initial.year);
  const years = Array.from({ length: lastYear - firstYear + 1 }, (_, index) => firstYear + index);
  const leading = (new Date(year, month, 1).getDay() + 6) % 7;
  const count = new Date(year, month + 1, 0).getDate();

  function confirmYear() {
    setDay((selectedDay) => Math.min(selectedDay, new Date(year, month + 1, 0).getDate()));
    setPhase('date');
  }

  function changeMonth(offset: number) {
    const date = new Date(year, month + offset, 1);
    setYear(date.getFullYear());
    setMonth(date.getMonth());
    setDay(1);
  }

  function confirmDate() {
    const confirmedHour = Math.max(0, Math.min(23, hour));
    const confirmedMinute = Math.max(0, Math.min(59, minute));
    onConfirm(`${year}-${pad(month + 1)}-${pad(day)}T${pad(confirmedHour)}:${pad(confirmedMinute)}`);
  }

  return (
    <div className="calendar-backdrop" onClick={onClose}>
      <section className="calendar-popover" role="dialog" aria-modal="true" aria-label="选择开启日期" onClick={(event) => event.stopPropagation()}>
        {phase === 'year' ? (
          <>
            <div className="year-picker">
              <small>选择开启年份</small>
              <div className="year-wheel" aria-label="年份滚轮">
                {years.map((option) => (
                  <button key={option} className={option === year ? 'selected' : ''} aria-label={`${option} 年`} onClick={() => setYear(option)}>
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <footer>
              <button onClick={onClose}>取消</button>
              <button className="calendar-confirm" aria-label="确认年份" onClick={confirmYear}>确认年份</button>
            </footer>
          </>
        ) : (
          <>
            <header>
              <button aria-label="上一月" onClick={() => changeMonth(-1)}>‹</button>
              <b>{year} 年 {month + 1} 月</b>
              <button aria-label="下一月" onClick={() => changeMonth(1)}>›</button>
            </header>
            <div className="calendar-week">
              {['一', '二', '三', '四', '五', '六', '日'].map((label) => <span key={label}>{label}</span>)}
            </div>
            <div className="calendar-grid">
              {Array.from({ length: leading }, (_, index) => <span key={`blank-${index}`} />)}
              {Array.from({ length: count }, (_, index) => index + 1).map((date) => (
                <button key={date} className={date === day ? 'selected' : ''} aria-label={String(date)} onClick={() => setDay(date)}>{date}</button>
              ))}
            </div>
            <div className="calendar-time">
              <label>小时<input aria-label="小时" type="number" min="0" max="23" value={hour} onChange={(event) => setHour(Number(event.target.value))} /></label>
              <i>:</i>
              <label>分钟<input aria-label="分钟" type="number" min="0" max="59" step="5" value={minute} onChange={(event) => setMinute(Number(event.target.value))} /></label>
            </div>
            <footer>
              <button onClick={onClose}>取消</button>
              <button className="calendar-confirm" aria-label="确认日期" onClick={confirmDate}>确认日期</button>
            </footer>
          </>
        )}
      </section>
    </div>
  );
}
