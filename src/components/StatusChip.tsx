import type { Status } from '../types';
import { cn } from '../lib/cn';

// Designed + guide combined: dot + icon + word, never colour alone.
const META: Record<Status, { icon: string; word: string; dot: string; cls: string }> = {
  Normal: { icon: '✓', word: 'OK', dot: '#16a34a', cls: 'bg-green-50 text-green-800 border-green-300' },
  Watch: { icon: '▲', word: 'WATCH', dot: '#ca8a04', cls: 'bg-yellow-50 text-yellow-800 border-yellow-400' },
  Alert: { icon: '■', word: 'ALERT', dot: '#dc2626', cls: 'bg-red-50 text-red-800 border-red-400' },
  Urgent: { icon: '!', word: 'URGENT', dot: '#ffffff', cls: 'bg-red-600 text-white border-red-700 anim-blink' },
};

export default function StatusChip({ status, size = 'md' }: { status: Status; size?: 'sm' | 'md' | 'lg' }) {
  const m = META[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-extrabold',
        m.cls,
        size === 'sm' && 'px-2.5 py-1 text-xs',
        size === 'md' && 'px-3.5 py-1.5 text-sm',
        size === 'lg' && 'px-5 py-2 text-xl',
      )}
    >
      <span aria-hidden className="inline-block h-2 w-2 rounded-full" style={{ background: m.dot }} />
      <span aria-hidden>{m.icon}</span>
      {m.word}
      <span className="sr-only">{status}</span>
    </span>
  );
}
