import type { ReactNode } from 'react';

export function MobileFrame({ children, className = '', showTime = true }: { children: ReactNode; className?: string; showTime?: boolean }) {
  return <section className={`mobile-frame ${className}`}><div className="mobile-status">{showTime && <span>9:41</span>}</div>{children}</section>;
}
