type BlueSealProps = { variant?: 'logo' | 'stamp'; label?: string };

export function BlueSeal({ variant = 'logo', label = '钟表火漆印章' }: BlueSealProps) {
  return <span aria-label={label} className={`blue-seal blue-seal--${variant}`} style={{ backgroundColor: '#B2EEFF', color: '#98C6FF' }}><span aria-hidden="true">◷</span></span>;
}
