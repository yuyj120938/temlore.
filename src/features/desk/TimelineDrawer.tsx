export type LetterStatus = 'draft' | 'sealed' | 'arrived' | 'opened';
export function TimelineDrawer({ onSelect }: { onSelect: (status: LetterStatus) => void }) {
  return <aside className="timeline-drawer"><small>YOUR LETTERS</small><h1>写给时间的信</h1><button onClick={() => onSelect('draft')}><b>21 Aug, 2026</b><span>草稿 · 继续书写 →</span></button><button onClick={() => onSelect('sealed')}><b>18 Jul, 2026</b><span>封存中 · 还有 26 天</span></button><button className="arrived" onClick={() => onSelect('arrived')}><i /> <b>01 Jan, 2026</b><span>已到达 · 打开书桌 →</span></button><button onClick={() => onSelect('opened')}><b>10 Oct, 2025</b><span>已开启 · 重新阅读 →</span></button></aside>;
}
