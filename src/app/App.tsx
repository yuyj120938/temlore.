import { useCallback, useEffect, useState } from 'react';
import { IntroAnimation } from '../features/intro/IntroAnimation';
import { HomePage } from '../features/home/HomePage';
import { AuthPage } from '../features/auth/AuthPage';
import { LetterEditor } from '../features/editor/LetterEditor';
import { TimeRing } from '../features/sealing/TimeRing';
import { SealingAnimation } from '../features/sealing/SealingAnimation';
import { MemoryDesk } from '../features/desk/MemoryDesk';
import { LetterReader } from '../features/reading/LetterReader';

export function App() {
  const [intro, setIntro] = useState(true);
  const [auth, setAuth] = useState(false);
  const [loggedIn, setLoggedIn] = useState(() => Boolean(localStorage.getItem('temlore.session')));
  const [arrived, setArrived] = useState(() => localStorage.getItem('temlore.arrived') === 'true');
  const [letterBody, setLetterBody] = useState(() => localStorage.getItem('temlore.letterBody') || '');
  const [instantHome, setInstantHome] = useState(false);
  useEffect(() => {
    const checkArrival = () => { const unlockAt = Number(localStorage.getItem('temlore.unlockAt')); if (unlockAt && unlockAt <= Date.now()) { localStorage.setItem('temlore.arrived', 'true'); setArrived(true); } };
    checkArrival(); const timer = window.setInterval(checkArrival, 1000); return () => window.clearInterval(timer);
  }, []);
  const [editor, setEditor] = useState(false);
  const [sealing, setSealing] = useState(false);
  const [sealed, setSealed] = useState(false);
  const [desk, setDesk] = useState(false);
  const [reading, setReading] = useState(false);
  const completeIntro = useCallback(() => setIntro(false), []);
  if (intro) return <IntroAnimation onComplete={completeIntro} />;
  if (auth) return <AuthPage onSuccess={() => { setAuth(false); setLoggedIn(true); }} onBack={() => setAuth(false)} />;
  if (editor) return <LetterEditor onBack={() => { setInstantHome(true); setEditor(false); }} onDone={(body) => { localStorage.setItem('temlore.letterBody', body); localStorage.setItem('temlore.letterTime', new Date().toISOString()); setLetterBody(body); setEditor(false); setSealing(true); }} />;
  if (sealing) return <TimeRing onBack={() => { setSealing(false); setEditor(true); }} onConfirm={(duration, customDate) => { const delays = { '10s': 10_000, '1d': 86_400_000, '7d': 604_800_000, '30d': 2_592_000_000, '1y': 31_536_000_000 }; const unlockAt = customDate ? new Date(customDate).getTime() : Date.now() + delays[duration]; localStorage.setItem('temlore.unlockAt', String(unlockAt)); localStorage.setItem('temlore.arrived', 'false'); setArrived(false); setSealing(false); setSealed(true); }} />;
  if (sealed) return <SealingAnimation onComplete={() => { setSealed(false); }} />;
  if (reading) return <LetterReader body={letterBody} writtenAt={localStorage.getItem('temlore.letterTime') || undefined} onClose={() => { setReading(false); setDesk(false); }} />;
  if (desk) return <MemoryDesk onOpen={() => setReading(true)} />;
  return <HomePage instant={instantHome} arrived={arrived} writtenAt={localStorage.getItem('temlore.letterTime') || undefined} onOpenLetter={() => setReading(true)} onDrawer={() => setDesk(true)} onStart={() => { setInstantHome(false); loggedIn ? setEditor(true) : setAuth(true); }} onAccount={() => setAuth(true)} />;
}
