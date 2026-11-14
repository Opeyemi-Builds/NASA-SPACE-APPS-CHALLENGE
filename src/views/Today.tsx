import { useMemo } from 'react';
import { evalForDay, useHealth } from '../state';
import { INDICATORS } from '../data/indicators';
import { STATUS_MESSAGES } from '../data/content';
import StatusBadge from '../components/StatusBadge';
import HumanBody3D, { buildMarkers } from '../components/HumanBody3D';
import ZonePanel from '../components/ZonePanel';
import { computeBaseline } from '../lib/baseline';

export default function Today() {
  const { days, evals, day, setDay, setTab, zone, setZone, startWeightKg, resetDemo } = useHealth();
  const ev = evalForDay(evals, day);
  const msg = STATUS_MESSAGES[ev.overall];
  const { baseline, wobble } = useMemo(() => computeBaseline([...days].sort((a, b) => a.day - b.day).slice(0, 7)), [days]);

  const watchList = INDICATORS.filter((i) => ev.results[i.id]?.status === 'Watch' || ev.results[i.id]?.status === 'Alert');
  const nextDue = watchList[0]?.name ?? 'blood pressure';

  return (
    <div className="mx-auto max-w-3xl px-4 pb-28">
      <div className="card card-pad mt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xl font-extrabold text-slate-900">
            Day {day} <StatusBadge status={ev.overall} />
          </div>
          {ev.patternTriggered && (
            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800">Signs add up — pattern rule</span>
          )}
        </div>
        <p className="mt-2 text-[15px] text-slate-900"><b>{msg.title}</b></p>
        <p className="mt-1 text-sm text-slate-600">{msg.body}</p>
        <p className="mt-1 text-sm text-slate-600"><b>Who to tell:</b> {msg.who}</p>
      </div>

      <div className="card mt-3 px-4 py-3 text-sm text-slate-700">
        <b>Next check-in due:</b> {nextDue} {ev.overall === 'Normal' ? 'in 2 hours' : '— re-check now'}
        {watchList.length > 0 && (
          <span className="ml-2 text-xs text-slate-500">({watchList.length} indicator{watchList.length > 1 ? 's' : ''} need attention)</span>
        )}
      </div>

      <div className="card mt-3 px-4 py-3">
        <label className="text-sm font-bold text-slate-800">
          Mission day (Day 1 to Day 14)
        </label>
        <div className="flex items-center gap-3">
          <input type="range" min={1} max={14} value={day} onChange={(e) => setDay(Number(e.target.value))} className="w-full" aria-label="Mission day" />
          <b className="w-14 text-center text-lg text-slate-900">{day}/14</b>
        </div>
        <p className="text-xs text-slate-500">Day 7: all green · Day 10: sleep Watch · Day 11: sleep Alert · Day 12: overall Alert</p>
      </div>

      <div className="mt-3">
        <HumanBody3D
          zoneStatus={ev.zoneStatus}
          selected={zone}
          onSelect={setZone}
          markers={buildMarkers(ev)}
          height={typeof window !== 'undefined' && window.innerWidth < 640 ? 340 : 470}
        />
      </div>

      <button onClick={() => setTab('checkin')} className="btn-primary mt-4 w-full">
        Start daily check-in
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
