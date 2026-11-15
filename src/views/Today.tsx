import { useMemo } from 'react';
import { evalForDay, useHealth } from '../state';
import { INDICATOR_MAP } from '../data/indicators';
import { STATUS_MESSAGES } from '../data/content';
import StatusBadge from '../components/StatusBadge';
import Card from '../components/Card';
import BigButton from '../components/BigButton';
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

// Screen 1: Today. Status card → day stepper → live 3D body → attention → start.
export default function Today() {
  const { days, evals, day, setDay, setScreen, zone, setZone, startWeightKg, resetDemo } = useHealth();
  const ev = evalForDay(evals, day);
  const msg = STATUS_MESSAGES[ev.overall];
  const { baseline, wobble } = useMemo(
    () => computeBaseline([...days].sort((a, b) => a.day - b.day).slice(0, 7)),
    [days],
  );
  const readings = days.find((d) => d.day === day)?.values ?? {};

  const trouble = Object.entries(ev.results)
    .filter(([, r]) => r.status !== 'Normal')
    .sort((a, b) => (b[1].status === 'Urgent' ? 2 : b[1].status === 'Alert' ? 1 : 0) - (a[1].status === 'Urgent' ? 2 : a[1].status === 'Alert' ? 1 : 0))
    .slice(0, 3);

  const stepDay = (d: number) => setDay(Math.min(14, Math.max(1, d)));
  const nextDue = trouble.length > 0 ? (INDICATOR_MAP[trouble[0][0]]?.name ?? 'a flagged reading') : 'Blood pressure';

  return (
    <div className="pt-4">
      <Card>
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
      </Card>

      <Card className="mt-3">
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
          className="mt-2 w-full" aria-label="Demo day"
        />
      </Card>

      <div className="mt-3">
        <HumanBody3D
          zoneStatus={ev.zoneStatus}
          selected={zone}
          onSelect={setZone}
          markers={buildMarkers(ev)}
          height={typeof window !== 'undefined' && window.innerWidth < 640 ? 340 : 470}
        />
        <p className="mt-2 text-center text-xs text-slate-400">Tap a glowing region for detail · drag to rotate</p>
      </div>

      {trouble.length > 0 && (
        <Card className="mt-3">
          <b className="text-slate-900">Needs attention today ({trouble.length})</b>
          <div className="mt-2 space-y-2">
            {trouble.map(([id, r]) => (
              <button
                key={id}
                onClick={() => setZone(INDICATOR_MAP[id]?.zone ?? null)}
                className="flex min-h-[48px] w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left"
              >
                <span>
                  <b className="block text-sm text-slate-900">{INDICATOR_MAP[id]?.name ?? id}</b>
                  <span className="block text-xs text-slate-500">{fmtValue(id, readings, startWeightKg)}{r.note ? ` — ${r.note}` : ''}</span>
                </span>
                <StatusBadge status={r.status} size="sm" />
              </button>
            ))}
          </div>
        </Card>
      )}

      <Card className="mt-3">
        <b className="text-slate-900">Next check-in:</b> <span className="text-slate-700">{nextDue}, in 2 hours</span>
      </Card>

      <div className="mt-3">
        <BigButton onClick={() => setScreen('checkin')}>Start check-in</BigButton>
      </div>

      <button onClick={resetDemo} className="mt-3 w-full rounded-xl border border-white/15 bg-white/5 py-3 text-sm font-bold text-slate-400">
        Reset demo data
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
