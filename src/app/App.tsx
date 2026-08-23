import { useCallback, useEffect, useState } from 'react';
import { IntroAnimation } from '../features/intro/IntroAnimation';
import { HomePage } from '../features/home/HomePage';
import { AuthPage } from '../features/auth/AuthPage';
import { LetterEditor } from '../features/editor/LetterEditor';
import { clearDraft, type EditorDraft } from '../features/editor/draftStorage';
import { TimeRing } from '../features/sealing/TimeRing';
import { SealingAnimation } from '../features/sealing/SealingAnimation';
import { MemoryDesk } from '../features/desk/MemoryDesk';
import { LetterReader } from '../features/reading/LetterReader';
import { getActivePhone, loadLetters, markArrived, saveLetter, type StoredLetter } from '../features/letters/letterStorage';

export function App() {
  const [intro, setIntro] = useState(true);
  const [auth, setAuth] = useState(false);
  const [phone, setPhone] = useState(getActivePhone);
  const [letters, setLetters] = useState<StoredLetter[]>(() => loadLetters(getActivePhone()));
  const [pendingDraft, setPendingDraft] = useState<EditorDraft | null>(null);
  const [selectedLetter, setSelectedLetter] = useState<StoredLetter | null>(null);
  const [instantHome, setInstantHome] = useState(false);
  const [editor, setEditor] = useState(false);
  const [sealing, setSealing] = useState(false);
  const [sealed, setSealed] = useState(false);
  const [desk, setDesk] = useState(false);
  const [reading, setReading] = useState(false);

  useEffect(() => {
    const checkArrival = () => setLetters(markArrived(phone));
    checkArrival(); const timer = window.setInterval(checkArrival, 1000); return () => window.clearInterval(timer);
  }, [phone]);

  const completeIntro = useCallback(() => setIntro(false), []);
  const arrivedLetter = letters.find((letter) => letter.arrived);
  const latestLetter = letters[0];

  if (intro) return <IntroAnimation onComplete={completeIntro} />;
  if (auth) return <AuthPage onSuccess={() => { const activePhone = getActivePhone(); setPhone(activePhone); setLetters(loadLetters(activePhone)); setAuth(false); }} onBack={() => setAuth(false)} />;
  if (editor) return <LetterEditor onBack={() => { setInstantHome(true); setEditor(false); }} onDone={(_, draft) => { setPendingDraft(draft); setEditor(false); setSealing(true); }} />;
  if (sealing) return <TimeRing onBack={() => { setSealing(false); setEditor(true); }} onConfirm={(duration, customDate) => {
    if (!pendingDraft || !phone) return;
    const delays = { '10s': 10_000, '7d': 604_800_000, '6mo': 15_768_000_000, '1y': 31_536_000_000 };
    const writtenAt = new Date().toISOString(); const unlockAt = customDate ? new Date(customDate).getTime() : Date.now() + delays[duration];
    const letter: StoredLetter = { ...pendingDraft, id: `${Date.now()}`, writtenAt, unlockAt, arrived: unlockAt <= Date.now() };
    saveLetter(phone, letter); setLetters(loadLetters(phone)); setSelectedLetter(letter); setSealing(false); setSealed(true);
  }} />;
  if (sealed) return <SealingAnimation onComplete={() => { clearDraft(); setPendingDraft(null); setInstantHome(true); setSealed(false); }} />;
  if (reading && selectedLetter) return <LetterReader letter={selectedLetter} onClose={() => { setReading(false); setDesk(false); }} />;
  if (desk) return <MemoryDesk onOpen={() => { if (arrivedLetter) { setSelectedLetter(arrivedLetter); setReading(true); } }} />;
  return <HomePage instant={instantHome} arrived={Boolean(arrivedLetter)} writtenAt={latestLetter?.writtenAt} onOpenLetter={() => { if (latestLetter) { setSelectedLetter(latestLetter); setReading(true); } }} onDrawer={() => { if (arrivedLetter) setDesk(true); }} onStart={() => { setInstantHome(false); phone ? setEditor(true) : setAuth(true); }} onAccount={() => setAuth(true)} />;
}
