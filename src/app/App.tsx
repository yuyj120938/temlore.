import { useCallback, useState } from 'react';
import { IntroAnimation } from '../features/intro/IntroAnimation';
import { HomePage } from '../features/home/HomePage';
import { AuthPage } from '../features/auth/AuthPage';

export function App() {
  const [intro, setIntro] = useState(true);
  const [auth, setAuth] = useState(false);
  const completeIntro = useCallback(() => setIntro(false), []);
  if (intro) return <IntroAnimation onComplete={completeIntro} />;
  if (auth) return <AuthPage onSuccess={() => setAuth(false)} onBack={() => setAuth(false)} />;
  return <HomePage onStart={() => setAuth(true)} onAccount={() => setAuth(true)} />;
}
