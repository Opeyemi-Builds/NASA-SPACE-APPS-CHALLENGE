import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../lib/cn';

// Guide Step 2: full-width button, min 48px tall, blue by default.
interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export default function BigButton({ variant = 'primary', className = '', ...rest }: Props) {
  const cls =
    variant === 'primary' ? 'btn-primary' : variant === 'danger' ? 'btn-danger' : 'btn-secondary';
  return <button className={cn(cls, 'w-full', className)} {...rest} />;
}
