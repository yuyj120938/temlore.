import { useCallback, useState } from 'react';
import { IntroAnimation } from '../features/intro/IntroAnimation';
import { HomePage } from '../features/home/HomePage';

export function App() {
  const [intro, setIntro] = useState(true);
  const completeIntro = useCallback(() => setIntro(false), []);
  if (intro) return <IntroAnimation onComplete={completeIntro} />;
  return <HomePage onStart={() => undefined} onAccount={() => undefined} />;
}
