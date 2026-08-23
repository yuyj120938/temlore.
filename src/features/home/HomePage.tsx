import { useState } from 'react';
import { BlueSeal } from '../../components/BlueSeal';
import { FloatingShapes } from '../../components/FloatingShapes';
import { MobileFrame } from '../../components/MobileFrame';
import { TimelineDrawer } from '../desk/TimelineDrawer';
import './home.css';

type HomePageProps = { onStart: () => void; onAccount: () => void; arrived?: boolean; onDrawer?: () => void; writtenAt?: string; onOpenLetter?: () => void; instant?: boolean };

export function HomePage({ onStart, onAccount, arrived = false, onDrawer, writtenAt, onOpenLetter, instant = false }: HomePageProps) {
  const [timelineOpen, setTimelineOpen] = useState(false);
  return <MobileFrame className={`home-screen ${instant ? 'instant' : ''}`}>
    <FloatingShapes />
    <header className="home-topbar"><button className="icon-button" onClick={() => setTimelineOpen(true)} aria-label="查看写信时间">☰</button><div className="home-logo">Teml<BlueSeal variant="logo" />re</div><button className="sign-button" onClick={onAccount} aria-label="Sign">Sign</button></header>
    <section className="home-copy"><small>A NOTE TO TOMORROW</small><h1>Start<br /><em>writing.</em></h1><p>{arrived ? 'A letter has arrived.' : '把此刻交给未来。'}</p></section>
    <button className={`home-envelope ${arrived ? 'arrived' : ''}`} aria-label={arrived ? '打开抽屉' : '信封'} onClick={arrived ? onDrawer : undefined}><BlueSeal variant="stamp" /></button>
    <button className="start-button" onClick={onStart}><span>Start writing</span><i>↗</i></button>
    <button className={`timeline-scrim ${timelineOpen ? 'is-open' : ''}`} aria-label="关闭写信时间" onClick={() => setTimelineOpen(false)} />
    <div className={`home-timeline ${timelineOpen ? 'is-open' : ''}`} aria-hidden={!timelineOpen}><TimelineDrawer writtenAt={writtenAt} onSelect={() => { setTimelineOpen(false); onOpenLetter?.(); }} /></div>
  </MobileFrame>;
}
