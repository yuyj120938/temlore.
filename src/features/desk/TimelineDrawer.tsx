export function TimelineDrawer({ onSelect, writtenAt }: { onSelect: () => void; writtenAt?: string }) {
  return <aside className="timeline-drawer"><small>YOUR LETTERS</small><h1>写给时间的信</h1>{writtenAt ? <button className="arrived" onClick={onSelect}><i /><b>{new Date(writtenAt).toLocaleString('zh-CN')}</b><span>已到达</span></button> : <p>还没有写过信。</p>}</aside>;
}
