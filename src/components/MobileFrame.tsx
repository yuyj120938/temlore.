import type { ReactNode } from 'react';

export function MobileFrame({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`mobile-frame ${className}`}><div className="mobile-island" /><div className="mobile-status"><span>9:41</span><span>● ● ▰</span></div>{children}</section>;
}
