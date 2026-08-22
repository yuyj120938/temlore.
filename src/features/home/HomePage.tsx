import { BlueSeal } from '../../components/BlueSeal';
import { FloatingShapes } from '../../components/FloatingShapes';
import { MobileFrame } from '../../components/MobileFrame';
import './home.css';

export function HomePage({ onStart, onAccount }: { onStart: () => void; onAccount: () => void }) {
  return <MobileFrame className="home-screen">
    <FloatingShapes />
    <header className="home-topbar"><button className="icon-button" onClick={onAccount} aria-label="打开账号">☰</button><div className="home-logo">Teml<BlueSeal variant="logo" />re</div><button className="icon-button" onClick={onAccount} aria-label="打开账号">人</button></header>
    <section className="home-copy"><small>A NOTE TO TOMORROW</small><h1>Start<br /><em>writing.</em></h1><p>把此刻交给未来。</p></section>
    <div className="home-envelope" aria-hidden="true"><BlueSeal variant="stamp" /></div>
    <button className="start-button" onClick={onStart}><span>Start writing</span><i>↗</i></button>
  </MobileFrame>;
}
