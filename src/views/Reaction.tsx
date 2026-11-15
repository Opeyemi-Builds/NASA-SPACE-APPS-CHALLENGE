import { useEffect, useRef, useState } from 'react';
import { useHealth } from '../state';
import Card from '../components/Card';
import BigButton from '../components/BigButton';

// Guide Screen 6: reaction test. Grey button, random 1-4s wait,
// turns green with TAP, measure ms. 10 rounds, dots, average -> Result.
const ROUNDS = 10;

type Phase = 'idle' | 'waiting' | 'ready' | 'early';

export default function Reaction() {
  const { draft, setDraft, draftFlags, upsertToday, day, setReactionMs, setScreen } = useHealth();
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<Phase>('idle');
  const [times, setTimes] = useState<number[]>([]);
  const [earlyMsg, setEarlyMsg] = useState(false);
  const timer = useRef<number | null>(null);
  const t0 = useRef(0);

  const clearTimer = () => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  };
  useEffect(() => clearTimer, []);

  const startRound = () => {
    setEarlyMsg(false);
    setPhase('waiting');
    const wait = 1000 + Math.random() * 3000; // 1-4 s
    timer.current = window.setTimeout(() => {
      t0.current = performance.now();
      setPhase('ready');
    }, wait);
  };

  const tap = () => {
    if (phase === 'waiting' || phase === 'idle') {
      // tapped early: restart the round
      clearTimer();
      setEarlyMsg(true);
      setPhase('early');
      return;
    }
    if (phase === 'ready') {
      const ms = Math.round(performance.now() - t0.current);
      const next = [...times, ms];
      setTimes(next);
      setPhase('idle');
      if (next.length >= ROUNDS) {
        const avg = Math.round(next.reduce((a, b) => a + b, 0) / next.length);
        // map average tap time to % slower vs personal baseline
        const pct = avg <= 350 ? 0 : avg <= 500 ? 10 : avg <= 700 ? 18 : 30;
        setReactionMs(avg);
        upsertToday(day, { ...draft, reaction_slower: pct }, draftFlags);
        setDraft({ ...draft, reaction_slower: pct });
        setScreen('result');
      } else {
        setRound(next.length);
      }
    }
  };

  const dot = (done: boolean, cur: boolean) => (
    <span
      style={{
        width: 10, height: 10, borderRadius: '50%',
        background: done ? '#2F5BEA' : cur ? '#9AB4FF' : '#D9DFEC',
        display: 'inline-block',
      }}
    />
  );

  return (
    <div className="pt-4 text-center">
      <h1 className="text-2xl font-extrabold">Reaction test</h1>
      <p className="text-sm text-slate-500">When the circle turns green, tap it as fast as you can. Do not tap early.</p>

      <Card className="mt-3">
        <button
          onClick={phase === 'idle' || phase === 'early' ? startRound : tap}
          aria-label={phase === 'ready' ? 'Tap now' : 'Reaction button'}
          style={{
            width: 200, height: 200, borderRadius: '50%', border: 0,
            background: phase === 'ready' ? '#14683F' : phase === 'waiting' ? '#94A3B8' : '#CBD5E1',
            color: '#fff', fontSize: 28, fontWeight: 900, cursor: 'pointer',
          }}
        >
          {phase === 'ready' ? 'TAP' : phase === 'waiting' ? '···' : 'START'}
        </button>
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {Array.from({ length: ROUNDS }).map((_, i) => (
            <span key={i}>{dot(i < times.length, i === times.length && phase !== 'idle')}</span>
          ))}
        </div>
        <p className="mt-2 text-sm text-slate-600">
          Round {Math.min(times.length + 1, ROUNDS)} of {ROUNDS}
          {times.length > 0 && ` · last ${times[times.length - 1]} ms`}
        </p>
        {earlyMsg && phase === 'early' && (
          <p className="mt-1 font-bold text-[#A32218]">Too early — tap START to retry this round.</p>
        )}
        {phase === 'early' && (
          <div className="mt-2"><BigButton onClick={startRound}>Retry round</BigButton></div>
        )}
      </Card>
    </div>
  );
}
