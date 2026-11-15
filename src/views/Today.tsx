import { useMemo } from 'react';
import { evalForDay, useHealth } from '../state';
import { INDICATOR_MAP } from '../data/indicators';
import { STATUS_MESSAGES } from '../data/content';
import StatusBadge from '../components/StatusBadge';
import HumanBody3D, { buildMarkers } from '../components/HumanBody3D';
import ZonePanel from '../components/ZonePanel';
import { computeBaseline } from '../lib/baseline';
import { fmtValue } from '../lib/format';

const STORY_LABEL: Record<number, string> = {
  7: 'Baseline locked — all green',
  10: 'Sleep drifts — first Watch',
  11: 'Sleep Alert — 3rd short night',
  12: 'Pattern rule — overall Alert',
};

export default function Today() {
  const { days, evals, day, setDay, setTab, zone, setZone, startWeightKg, resetDemo } = useHealth();
  const ev = evalForDay(evals, day);
  const msg = STATUS_MESSAGES[ev.overall];
  const { baseline, wobble } = useMemo(
    () => computeBaseline([...days].sort((a, b) => a.day - b.day).slice(0, 7)),
    [days],
  );

  const trouble = Object.entries(ev.results)
    .filter(([, r]) => r.status !== 'Normal')
    .sort((a, b) => (b[1].status === 'Urgent' ? 2 : b[1].status === 'Alert' ? 1 : 0) - (a[1].status === 'Urgent' ? 2 : a[1].status === 'Alert' ? 1 : 0))
    .slice(0, 3);

  const stepDay = (d: number) => setDay(Math.min(14, Math.max(1, d)));

  return (
    <div className="mx-auto max-w-3xl px-4 pb-28">
      {/* 1 — STATUS */}
      <div className="card card-pad mt-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xl font-extrabold text-slate-900">
            Day {day} <StatusBadge status={ev.overall} />
          </div>
          {ev.patternTriggered && (
            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800">Signs add up</span>
          )}
        </div>
        <p className="mt-2 text-[15px] text-slate-900"><b>{msg.title}</b></p>
        <p className="mt-1 text-sm text-slate-600"><b>Who to tell:</b> {msg.who}</p>
      </div>

      {/* 2 — DAY STEPPER */}
      <div className="card mt-3 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <button onClick={() => stepDay(day - 1)} disabled={day <= 1} className="btn-secondary min-h-[44px] px-4 py-2 text-sm disabled:opacity-40">← Prev</button>
          <div className="text-center">
            <b className="text-lg text-slate-900">Day {day} / 14</b>
            {STORY_LABEL[day] && <p className="text-xs font-semibold text-indigo-700">{STORY_LABEL[day]}</p>}
          </div>
          <button onClick={() => stepDay(day + 1)} disabled={day >= 14} className="btn-secondary min-h-[44px] px-4 py-2 text-sm disabled:opacity-40">Next →</button>
        </div>
        <input
          type="range" min={1} max={14} value={day}
          onChange={(e) => setDay(Number(e.target.value))}
          className="mt-2 w-full" aria-label="Mission day"
        />
      </div>

      {/* 3 — BODY */}
      <div className="mt-3">
        <HumanBody3D
          zoneStatus={ev.zoneStatus}
          selected={zone}
          onSelect={setZone}
          markers={buildMarkers(ev)}
          height={typeof window !== 'undefined' && window.innerWidth < 640 ? 340 : 470}
        />
        <p className="mt-1 text-center text-xs text-slate-500">Tap a glowing region for detail</p>
      </div>

      {/* 4 — WHAT NEEDS ATTENTION (max 3) */}
      <div className="card card-pad mt-3">
        <h2 className="font-extrabold text-slate-900">
          {trouble.length === 0 ? 'All clear' : `Needs attention (${trouble.length})`}
        </h2>
        {trouble.length === 0 ? (
          <p className="mt-1 text-sm text-slate-600">All readings normal. Carry on with the routine.</p>
        ) : (
          <div className="mt-2 space-y-2">
            {trouble.map(([id, r]) => {
              const ind = INDICATOR_MAP[id];
              const readings = days.find((d) => d.day === day)?.values ?? {};
              return (
                <button
                  key={id}
                  onClick={() => ind && setZone(ind.zone)}
                  className="flex min-h-[48px] w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left"
                >
                  <span>
                    <b className="block text-sm text-slate-900">{ind?.name ?? id}</b>
                    <span className="block text-xs text-slate-500">{fmtValue(id, readings, startWeightKg)}{r.note ? ` — ${r.note}` : ''}</span>
                  </span>
                  <StatusBadge status={r.status} size="sm" />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 5 — NEXT STEP */}
      <button onClick={() => setTab('checkin')} className="btn-primary mt-4 w-full">
        Next: log today&apos;s check-in →
      </button>
      <button onClick={() => setTab('trends')} className="btn-secondary mt-2 w-full">
        Or view trends
      </button>
      <button onClick={resetDemo} className="mt-2 w-full rounded-2xl border border-slate-300 bg-white py-2.5 text-sm font-bold text-slate-500">
        Reset mission data
      </button>

      {zone && (
        <ZonePanel
          zone={zone} evaluation={ev} days={days}
          baseline={baseline} wobble={wobble} startWeightKg={startWeightKg}
          onClose={() => setZone(null)}
        />
      )}
    </div>
  );
}
