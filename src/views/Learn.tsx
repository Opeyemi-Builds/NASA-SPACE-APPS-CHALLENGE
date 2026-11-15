import { useState } from 'react';
import { HAZARDS } from '../data/hazards';
import { INDICATORS } from '../data/indicators';
import { DELAY_NOTE } from '../data/content';
import { useHealth } from '../state';

/** Step 4 — understand. One delay explainer, hazards behind a toggle, one line per signal. */
export default function Learn() {
  const { setTab } = useHealth();
  const [showHazards, setShowHazards] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-28">
      <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Step 4 of 5</p>
      <h2 className="mt-1 text-2xl font-extrabold text-slate-900">Learn</h2>
      <p className="text-sm text-slate-500">Plain words. Tap any signal for how to measure it and what to do.</p>

      <div className="card mt-3 border-indigo-200 bg-indigo-50 p-4 text-sm text-slate-700">
        <b className="text-slate-900">Why the app acts without Earth:</b> {DELAY_NOTE}
      </div>

      <button
        onClick={() => setShowHazards((s) => !s)}
        className="btn-secondary mt-3 w-full min-h-[48px]"
        aria-expanded={showHazards}
      >
        {showHazards ? 'Hide the 5 space hazards' : 'What are the 5 space hazards?'}
      </button>
      {showHazards && (
        <div className="mt-2 space-y-2">
          {HAZARDS.map((h) => (
            <div key={h.name} className="card card-pad">
              <b className="text-slate-900">{h.name}</b>
              <p className="mt-1 text-sm text-slate-600">{h.short}</p>
              <p className="mt-1 text-[13px] text-slate-500"><b>Watched by:</b> {h.indicators}</p>
            </div>
          ))}
        </div>
      )}

      <h3 className="mt-5 text-lg font-extrabold text-slate-900">Signals, in plain words ({INDICATORS.length})</h3>
      <div className="mt-2 space-y-2">
        {INDICATORS.map((i) => {
          const open = openId === i.id;
          return (
            <div key={i.id} className="card overflow-hidden">
              <button
                onClick={() => setOpenId(open ? null : i.id)}
                aria-expanded={open}
                className="flex min-h-[52px] w-full items-center justify-between gap-2 px-4 py-3 text-left"
              >
                <span>
                  <b className="block text-slate-900">{i.name}</b>
                  <span className="block text-xs text-slate-500">{i.plain.split('.')[0]}.</span>
                </span>
                <span className="shrink-0 font-black text-indigo-700">{open ? '−' : '+'}</span>
              </button>
              {open && (
                <div className="space-y-1.5 border-t border-slate-100 px-4 py-3 text-sm text-slate-600">
                  <p><b>How to measure:</b> {i.how}</p>
                  <p><b>If Watch:</b> {i.watchAction}</p>
                  <p><b>Who to tell:</b> {i.who}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button onClick={() => setTab('tests')} className="btn-primary mt-4 w-full">
        Next: verify the checks →
      </button>
    </div>
  );
}
