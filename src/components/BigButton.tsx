import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../lib/cn';

// Designed buttons: indigo→violet gradient primary, min 48px targets.
interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export default function BigButton({ variant = 'primary', className = '', ...rest }: Props) {
  const cls =
    variant === 'primary' ? 'btn-primary' : variant === 'danger' ? 'btn-danger' : 'btn-secondary';
  return <button className={cn(cls, 'w-full', className)} {...rest} />;
}
