import { BlueSeal } from '../../components/BlueSeal';
export function LetterReader({ onClose }: { onClose: () => void }) {
  return <main className="reader-screen"><header><button onClick={onClose}>←</button><span>LETTER OPENED</span><button>•••</button></header><article><small>01 JAN 2026 · ARRIVED</small><h1>Dear future me,</h1><p>今天的风很轻，我突然想把这一刻留给未来的你。</p><p>希望你打开这封信时，仍记得此刻的勇气与期待。</p><div className="reader-seal"><BlueSeal variant="stamp" /></div></article></main>;
}
