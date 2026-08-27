import { useEffect, useRef } from 'react';
import { BlueSeal } from '../../components/BlueSeal';
import './sealing-animation.css';

export function SealingAnimation({ onComplete }: { onComplete: () => void }) {
  const completion = useRef(onComplete);
  useEffect(() => { completion.current = onComplete; }, [onComplete]);
  useEffect(() => { const timer = window.setTimeout(() => completion.current(), 5300); return () => window.clearTimeout(timer); }, []);
  return <main className="sealing-animation" data-testid="sealing-sequence" data-sequence="fold,insert,close,seal,open-drawer,store,close-drawer"><div className="fold-paper">Dear future me,</div><div className="stored-envelope"><div className="envelope-flap" /><BlueSeal variant="stamp" /></div><div className="sealing-desk"><div className="sealing-desk-edge" /><div className="sealing-drawer-cavity" /><div className="sealing-drawer" data-testid="sealing-drawer"><span /></div></div></main>;
}
