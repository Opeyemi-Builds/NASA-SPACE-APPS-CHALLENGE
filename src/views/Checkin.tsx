import { useMemo, useState } from 'react';
import { evalForDay, useHealth } from '../state';
import { CHECK_STEPS } from '../lib/checkin';
import type { DayReading } from '../types';
import StatusBadge from '../components/StatusBadge';

/** Guided check-in: one step at a time, plain words, big targets. */
export default function Checkin() {
  const { days, evals, day, upsertToday, setTab } = useHealth();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const current = days.find((d) => d.day === day)!;
  const [draft, setDraft] = useState<Record<string, number>>({ ...current.values });
  const [draftFlags, setDraftFlags] = useState<DayReading['flags']>({ ...current.flags });

  const s = CHECK_STEPS[step];
  const ev = evalForDay(evals, day);
  const progress = useMemo(() => ((step + 1) / CHECK_STEPS.length) * 100, [step]);

  const val = (key: string, flag: boolean | undefined): number | boolean =>
    flag ? !!draftFlags[key as keyof DayReading['flags']] : draft[key] ?? current.values[key] ?? '';

  const saveStep = () => {
    upsertToday(day, draft, draftFlags);
    if (step + 1 >= CHECK_STEPS.length) setDone(true);
    else {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  if (done) {
    const entries = Object.entries(ev.results).filter(([, r]) => r.status !== 'Normal');
    return (
      <div className="mx-auto max-w-3xl px-4 pb-28">
        <div className="card card-pad mt-4 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Step 2 of 5 complete · Day {day}</p>
          <h2 className="mt-1 text-2xl font-extrabold text-slate-900">Check-in done</h2>
          <div className="mt-2 flex justify-center"><StatusBadge status={ev.overall} size="lg" /></div>
          {ev.patternTriggered && <p className="mt-2 font-bold text-red-700">The signs add up — 3+ Watch readings today.</p>}
          {entries.length === 0 && <p className="mt-3 text-slate-600">All readings normal. Carry on with the routine.</p>}
          {entries.length > 0 && (
            <div className="mt-3 space-y-2 text-left">
              {entries.slice(0, 3).map(([id, r]) => (
                <div key={id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800">
                  <span>{id}{r.note ? <span className="text-slate-500"> — {r.note}</span> : null}</span>
                  <StatusBadge status={r.status} size="sm" />
                </div>
              ))}
              {entries.length > 3 && <p className="text-center text-xs text-slate-500">+ {entries.length - 3} more in Today</p>}
            </div>
          )}
          {ev.urgentReason && <p className="mt-3 font-bold text-red-700">{ev.urgentReason} Get help now — do not wait.</p>}
          <button onClick={() => { setDone(false); setStep(0); setTab('trends'); }} className="btn-primary mt-4 w-full">
            Next: see trends →
          </button>
          <button onClick={() => { setDone(false); setStep(0); setTab('today'); }} className="btn-secondary mt-2 w-full">
            Back to Today
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-28">
      <div className="mt-4">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Step 2 of 5 · Day {day}</p>
        <div className="mb-1 mt-1 flex justify-between text-xs text-slate-500">
          <span>Part {step + 1} of {CHECK_STEPS.length}: {s.title}</span><span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <h2 className="mt-3 text-2xl font-extrabold text-slate-900">{s.title}</h2>
      <p className="text-slate-500">{s.subtitle}</p>
      <div className="mt-3 space-y-3">
        {s.fields.map((f) => (
          <div key={f.key} className="card card-pad">
            <label className="font-bold text-slate-900">
              {f.label}
              {f.unit ? <span className="font-normal text-slate-500"> ({f.unit})</span> : null}
            </label>
            {f.type === 'yesno' && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {([false, true] as boolean[]).map((b) => (
                  <button
                    key={String(b)}
                    onClick={() => setDraftFlags((p) => ({ ...p, [f.key]: b }))}
                    className={`min-h-[52px] rounded-xl border py-3 font-bold ${val(f.key, true) === b
                      ? b ? 'border-red-400 bg-red-50 text-red-800' : 'border-green-500 bg-green-50 text-green-800'
                      : 'border-slate-300 bg-white text-slate-600'}`}
                  >
                    {(f.invertLabel ? (b ? f.invertLabel[1] : f.invertLabel[0]) : b ? 'Yes' : 'No')}
                  </button>
                ))}
              </div>
            )}
            {(f.type === 'number' || f.type === 'count') && (
              f.key === 'vision_worse' || f.key === 'symptoms' ? (
                <div className="mt-2 flex gap-2">
                  {[0, 1, 2, 3, 4, 5].slice(0, (f.max ?? 5) + 1).map((n) => (
                    <button
                      key={n}
                      onClick={() => setDraft((p) => ({ ...p, [f.key]: n }))}
                      className={`min-h-[52px] flex-1 rounded-xl border font-extrabold ${Number(val(f.key, false)) === n ? 'border-indigo-600 bg-indigo-50 text-indigo-800' : 'border-slate-300 bg-white text-slate-600'}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  type="number" inputMode="decimal"
                  min={f.min} max={f.max} step={f.step ?? 1}
                  value={val(f.key, false) as number | string}
                  onChange={(e) => setDraft((p) => ({ ...p, [f.key]: Number(e.target.value) }))}
                  className="field-input mt-2"
                  aria-label={f.label}
                />
              )
            )}
            {f.type === 'slider' && (
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="range" min={f.min} max={f.max} step={f.step ?? 1}
                  value={Number(val(f.key, false) ?? f.min ?? 0)}
                  onChange={(e) => setDraft((p) => ({ ...p, [f.key]: Number(e.target.value) }))}
                  className="w-full" aria-label={f.label}
                />
                <b className="w-16 text-center text-xl text-slate-900">
                  {String(val(f.key, false))}
                  {f.unit ? <span className="text-xs font-normal text-slate-500"> {f.unit}</span> : null}
                </b>
              </div>
            )}
            {f.hint && (
              <details className="mt-2 text-[13px] text-slate-500">
                <summary className="cursor-pointer font-semibold text-indigo-700">How do I measure this?</summary>
                <p className="mt-1">{f.hint}</p>
              </details>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="btn-secondary min-h-[52px]">
            Back
          </button>
        )}
        <button onClick={saveStep} className="btn-primary min-h-[52px] flex-1">
          {step + 1 >= CHECK_STEPS.length ? 'Finish check-in' : 'Next →'}
        </button>
      </div>
    </div>
  );
}
