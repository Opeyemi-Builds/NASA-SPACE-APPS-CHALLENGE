import { useMemo, useState } from 'react';
import { evalForDay, useHealth } from '../state';
import { CHECK_STEPS } from '../lib/checkin';
import type { DayReading } from '../types';
import StatusBadge from '../components/StatusBadge';

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

  const prefill = (key: string, flag: boolean | undefined): number | boolean => {
    if (flag) return !!draftFlags[key as keyof DayReading['flags']];
    return draft[key] ?? current.values[key] ?? '';
  };

  const saveStep = () => {
    upsertToday(day, draft, draftFlags);
    if (step + 1 >= CHECK_STEPS.length) setDone(true);
    else setStep(step + 1);
  };

  if (done) {
    const entries = Object.entries(ev.results).filter(([, r]) => r.status !== 'Normal');
    return (
      <div className="mx-auto max-w-3xl px-4 pb-28">
        <div className="card card-pad mt-4 text-center">
          <h2 className="text-2xl font-extrabold text-slate-900">Check-in complete — Day {day}</h2>
          <div className="mt-2 flex justify-center"><StatusBadge status={ev.overall} size="lg" /></div>
          {ev.patternTriggered && <p className="mt-2 font-bold text-red-700">The signs add up — 3+ Watch readings today.</p>}
          {entries.length === 0 && <p className="mt-3 text-slate-600">All readings normal. Carry on with the routine.</p>}
          <div className="mt-3 space-y-2 text-left">
            {entries.map(([id, r]) => (
              <div key={id} className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-800">
                <span>{id}{r.note ? <span className="text-slate-500"> — {r.note}</span> : null}</span>
                <StatusBadge status={r.status} size="sm" />
              </div>
            ))}
          </div>
          {ev.urgentReason && <p className="mt-3 font-bold text-red-700">{ev.urgentReason} Get help now — do not wait.</p>}
          <button onClick={() => { setDone(false); setStep(0); setTab('today'); }} className="btn-primary mt-4 w-full">
            Back to Today
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-28">
      <div className="mt-4">
        <div className="mb-1 flex justify-between text-xs text-slate-500">
          <span>Step {step + 1} of {CHECK_STEPS.length}</span><span>Day {day}</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>
      <h2 className="mt-3 text-2xl font-extrabold text-slate-900">{s.title}</h2>
      <p className="text-slate-500">{s.subtitle}</p>
      <div className="mt-3 space-y-4">
        {s.fields.map((f) => (
          <div key={f.key} className="card card-pad">
            <label className="font-bold text-slate-900">{f.label}{f.unit ? <span className="font-normal text-slate-500"> ({f.unit})</span> : null}</label>
            {f.hint && <p className="mt-0.5 text-[13px] text-slate-500">{f.hint}</p>}
            {f.type === 'yesno' && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {([false, true] as boolean[]).map((b) => (
                  <button
                    key={String(b)}
                    onClick={() => setDraftFlags((p) => ({ ...p, [f.key]: b }))}
                    className={`rounded-xl border py-3 font-bold ${prefill(f.key, true) === b
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
                      className={`min-h-[48px] flex-1 rounded-xl border font-extrabold ${Number(prefill(f.key, false)) === n ? 'border-indigo-600 bg-indigo-50 text-indigo-800' : 'border-slate-300 bg-white text-slate-600'}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  type="number" inputMode="decimal"
                  min={f.min} max={f.max} step={f.step ?? 1}
                  value={prefill(f.key, false) as number | string}
                  onChange={(e) => setDraft((p) => ({ ...p, [f.key]: Number(e.target.value) }))}
                  className="field-input mt-2"
                />
              )
            )}
            {f.type === 'slider' && (
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="range" min={f.min} max={f.max} step={f.step ?? 1}
                  value={Number(prefill(f.key, false) ?? f.min ?? 0)}
                  onChange={(e) => setDraft((p) => ({ ...p, [f.key]: Number(e.target.value) }))}
                  className="w-full"
                />
                <b className="w-16 text-center text-xl text-slate-900">{String(prefill(f.key, false))}{f.unit ? <span className="text-xs font-normal text-slate-500"> {f.unit}</span> : null}</b>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="btn-secondary">
            Back
          </button>
        )}
        <button onClick={saveStep} className="btn-primary flex-1">
          {step + 1 >= CHECK_STEPS.length ? 'Finish check-in' : 'Next'}
        </button>
      </div>
    </div>
  );
}
