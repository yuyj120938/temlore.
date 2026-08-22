import { useCallback, useState } from 'react';
import { IntroAnimation } from '../features/intro/IntroAnimation';
import { HomePage } from '../features/home/HomePage';
import { AuthPage } from '../features/auth/AuthPage';
import { LetterEditor } from '../features/editor/LetterEditor';

export function App() {
  const [intro, setIntro] = useState(true);
  const [auth, setAuth] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [editor, setEditor] = useState(false);
  const completeIntro = useCallback(() => setIntro(false), []);
  if (intro) return <IntroAnimation onComplete={completeIntro} />;
  if (auth) return <AuthPage onSuccess={() => { setAuth(false); setLoggedIn(true); setEditor(true); }} onBack={() => setAuth(false)} />;
  if (editor) return <LetterEditor onDone={() => setEditor(false)} />;
  return <HomePage onStart={() => loggedIn ? setEditor(true) : setAuth(true)} onAccount={() => setAuth(true)} />;
}
