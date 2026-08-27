import { useEffect } from 'react';
import { BlueSeal } from '../../components/BlueSeal';
import { FloatingShapes } from '../../components/FloatingShapes';
import { MobileFrame } from '../../components/MobileFrame';

export function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onComplete, 3000);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return <MobileFrame className="intro-screen">
    <FloatingShapes />
    <div className="intro-wax-drop" aria-hidden="true" />
    <div className="intro-stamp"><BlueSeal variant="stamp" /></div>
    <div className="intro-logo" aria-label="Temlore">Teml<span><BlueSeal variant="logo" /></span>re</div>
  </MobileFrame>;
}
