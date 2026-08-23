import type { ReactNode } from 'react';

export function MobileFrame({ children, className = '', showTime = true }: { children: ReactNode; className?: string; showTime?: boolean }) {
  return <section className={`mobile-frame ${className}`}><div className="mobile-island" /><div className="mobile-status">{showTime && <span>9:41</span>}<span className="mobile-signals">● ● ▰</span></div>{children}</section>;
}
