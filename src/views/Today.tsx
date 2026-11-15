import { evalForDay, useHealth } from '../state';
import { INDICATOR_MAP } from '../data/indicators';
import { STATUS_MESSAGES } from '../data/content';
import StatusChip from '../components/StatusChip';
import Card from '../components/Card';
import BigButton from '../components/BigButton';
import BodyFigure from '../components/BodyFigure';
import { fmtValue } from '../lib/format';

// Guide Screen 1: Today (home). Banner lives in App.
// Title + demo slider, summary card, SVG body, next check-in, start button.
export default function Today() {
  const { days, evals, day, setDay, setScreen, openZone, startWeightKg, resetDemo } = useHealth();
  const ev = evalForDay(evals, day);
  const msg = STATUS_MESSAGES[ev.overall];
  const readings = days.find((d) => d.day === day)?.values ?? {};

  const trouble = Object.entries(ev.results).filter(([, r]) => r.status === 'Watch' || r.status === 'Alert');
  const nextDue = trouble.length > 0 ? (INDICATOR_MAP[trouble[0][0]]?.name ?? 'a flagged reading') : 'Blood pressure';

  return (
    <div className="pt-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-extrabold">Today · Day {day}</h1>
        <label className="flex items-center gap-2 text-xs font-bold text-slate-500">
          Demo day
          <input
            type="range" min={1} max={14} value={day}
            onChange={(e) => setDay(Number(e.target.value))}
            className="w-24" aria-label="Demo day"
          />
        </label>
      </div>

      <Card className="mt-3">
        <div className="flex items-center gap-2">
          <StatusChip status={ev.overall} />
          {ev.patternTriggered && <span className="text-xs font-bold text-[#A32218]">Signs add up</span>}
        </div>
        <p className="mt-2 text-[15px] font-semibold">{msg.title}</p>
        <p className="mt-1 text-sm text-slate-600">{msg.body}</p>
      </Card>

      <Card className="mt-3">
        <BodyFigure zoneStatus={ev.zoneStatus} onSelect={openZone} />
        <p className="mt-1 text-center text-xs text-slate-500">Tap a body zone for detail</p>
      </Card>

      <Card className="mt-3">
        <b>Next check-in:</b> {nextDue}, in 2 hours
        {trouble.length > 0 && (
          <span className="ml-2 text-xs text-slate-500">
            ({trouble.length} reading{trouble.length > 1 ? 's' : ''} to re-check)
          </span>
        )}
      </Card>

      <div className="mt-3">
        <BigButton onClick={() => setScreen('checkin')}>Start check-in</BigButton>
      </div>

      {trouble.length > 0 && (
        <Card className="mt-3">
          <b>Needs attention today</b>
          <div className="mt-2 space-y-2">
            {trouble.slice(0, 3).map(([id, r]) => (
              <div key={id} className="flex items-center justify-between gap-2 rounded-xl bg-[#F4F6FB] px-3 py-2 text-sm">
                <span>{INDICATOR_MAP[id]?.name ?? id} · {fmtValue(id, readings, startWeightKg)}</span>
                <StatusChip status={r.status} size="sm" />
              </div>
            ))}
          </div>
        </Card>
      )}

      <button onClick={resetDemo} className="mt-3 w-full rounded-xl border border-[#D9DFEC] bg-white py-3 text-sm font-bold text-slate-500">
        Reset demo data
      </button>
    </div>
  );
}
