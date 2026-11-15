import type { Status } from '../types';
import { cn } from '../lib/cn';

// Guide §3: every status shows colour + icon + word, never colour alone.
const META: Record<Status, { icon: string; word: string; fg: string; bg: string; bd: string }> = {
  Normal: { icon: '✓', word: 'OK', fg: '#14683F', bg: '#DDF3E7', bd: '#9ADBB8' },
  Watch: { icon: '▲', word: 'WATCH', fg: '#8A5A00', bg: '#FFF3CD', bd: '#E3C568' },
  Alert: { icon: '■', word: 'ALERT', fg: '#A32218', bg: '#FDE3E0', bd: '#F0A9A3' },
  Urgent: { icon: '!', word: 'URGENT', fg: '#FFFFFF', bg: '#A32218', bd: '#7A1710' },
};

export default function StatusChip({ status, size = 'md' }: { status: Status; size?: 'sm' | 'md' | 'lg' }) {
  const m = META[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-extrabold',
        size === 'sm' && 'px-2.5 py-1 text-xs',
        size === 'md' && 'px-3.5 py-1.5 text-sm',
        size === 'lg' && 'px-5 py-2 text-xl',
      )}
      style={{ color: m.fg, background: m.bg, borderColor: m.bd }}
    >
      <span aria-hidden>{m.icon}</span>
      {m.word}
      <span className="sr-only">{status}</span>
    </span>
  );
}

// Guide S2: StatusChip colour+icon+word, never colour alone
