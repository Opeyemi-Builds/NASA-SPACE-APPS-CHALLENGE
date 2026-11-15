import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

// Designed card: white rounded box that pops over the deep-space backdrop.
export default function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={cn('card card-pad', className)}>{children}</div>;
}
