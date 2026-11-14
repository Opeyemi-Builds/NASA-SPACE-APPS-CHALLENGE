import type { Status } from '../types';
import { cn } from '../lib/cn';

const META: Record<Status, { word: string; dot: string; cls: string }> = {
  Normal: { word: 'OK', dot: '#16a34a', cls: 'bg-green-50 text-green-800 border-green-300' },
  Watch: { word: 'Watch', dot: '#ca8a04', cls: 'bg-yellow-50 text-yellow-800 border-yellow-400' },
  Alert: { word: 'Alert', dot: '#dc2626', cls: 'bg-red-50 text-red-800 border-red-400' },
  Urgent: { word: 'Urgent', dot: '#ffffff', cls: 'bg-red-600 text-white border-red-700 anim-blink' },
};

export default function StatusBadge({ status, size = 'md' }: { status: Status; size?: 'sm' | 'md' | 'lg' }) {
  const m = META[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-extrabold',
        m.cls,
        size === 'sm' && 'px-2.5 py-0.5 text-xs',
        size === 'md' && 'px-3.5 py-1 text-sm',
        size === 'lg' && 'px-5 py-2 text-xl',
      )}
    >
      <span aria-hidden className="inline-block h-2 w-2 rounded-full" style={{ background: m.dot }} />
      {m.word}
      <span className="sr-only">{status}</span>
    </span>
  );
}
