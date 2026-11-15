import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

// Guide Step 2: white rounded box, used everywhere.
export default function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={cn('card card-pad', className)}>{children}</div>;
}

// Guide S2: white rounded box used on every screen
