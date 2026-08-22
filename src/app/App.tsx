import { useCallback, useState } from 'react';
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
  const [loggedIn, setLoggedIn] = useState(false);
  const [editor, setEditor] = useState(false);
  const [sealing, setSealing] = useState(false);
  const [sealed, setSealed] = useState(false);
  const [desk, setDesk] = useState(false);
  const [reading, setReading] = useState(false);
  const completeIntro = useCallback(() => setIntro(false), []);
  if (intro) return <IntroAnimation onComplete={completeIntro} />;
  if (auth) return <AuthPage onSuccess={() => { setAuth(false); setLoggedIn(true); setEditor(true); }} onBack={() => setAuth(false)} />;
  if (editor) return <LetterEditor onDone={() => { setEditor(false); setSealing(true); }} />;
  if (sealing) return <TimeRing onConfirm={() => { setSealing(false); setSealed(true); }} />;
  if (sealed) return <SealingAnimation onComplete={() => { setSealed(false); setDesk(true); }} />;
  if (reading) return <LetterReader onClose={() => setReading(false)} />;
  if (desk) return <MemoryDesk onOpen={() => setReading(true)} />;
  return <HomePage onStart={() => loggedIn ? setEditor(true) : setAuth(true)} onAccount={() => setAuth(true)} />;
}
