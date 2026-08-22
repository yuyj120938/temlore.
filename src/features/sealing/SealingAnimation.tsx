import { useEffect } from 'react';
import { BlueSeal } from '../../components/BlueSeal';
import './sealing-animation.css';

export function SealingAnimation({ onComplete }: { onComplete: () => void }) {
  useEffect(() => { const timer = window.setTimeout(onComplete, 4500); return () => window.clearTimeout(timer); }, [onComplete]);
  return <main className="sealing-animation"><div className="fold-paper">Dear future me,</div><div className="stored-envelope"><BlueSeal variant="stamp" /></div><div className="sealing-desk"><div className="sealing-drawer" /></div><p>KEEPING THIS MOMENT</p></main>;
}
