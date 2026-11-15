import { useMemo, useState } from 'react';
import { useHealth, evalForDay } from '../state';
import { INDICATORS } from '../data/indicators';
import { computeBaseline } from '../lib/baseline';
import { fmtValue } from '../lib/format';
import StatusBadge from '../components/StatusBadge';
import TrendChart from '../components/TrendChart';

const chartKey = (id: string) =>
  id === 'bp' ? 'bp_sys' : id === 'weight' ? 'weight_kg' : id === 'vision' ? 'vision_worse' : id === 'reaction' ? 'reaction_slower' : id;

/** Step 3 — spot drift. Troubled charts first, the rest behind one toggle. */
export default function Trends() {
  const { days, evals, day, startWeightKg, setTab } = useHealth();
  const ev = evalForDay(evals, day);
  const [showAll, setShowAll] = useState(false);
  const { baseline, wobble } = useMemo(
    () => computeBaseline([...days].sort((a, b) => a.day - b.day).slice(0, 7)),
    [days],
  );

  const ordered = useMemo(() => {
    const rank = (s: string) => (s === 'Urgent' ? 3 : s === 'Alert' ? 2 : s === 'Watch' ? 1 : 0);
    return [...INDICATORS].sort(
      (a, b) => rank(ev.results[b.id]?.status ?? 'Normal') - rank(ev.results[a.id]?.status ?? 'Normal'),
    );
  }, [ev]);

  const troubled = ordered.filter((i) => (ev.results[i.id]?.status ?? 'Normal') !== 'Normal');
  const visible = showAll ? ordered : troubled.length > 0 ? troubled : ordered.slice(0, 4);
  const readings = days.find((d) => d.day === day)?.values ?? {};

  return (
    <div className="mx-auto max-w-3xl px-4 pb-28">
      <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Step 3 of 5 · Day {day}</p>
      <h2 className="mt-1 text-2xl font-extrabold text-slate-900">Trends</h2>
      <p className="text-sm text-slate-500">
        {troubled.length === 0
          ? 'Everything is inside your normal band. Here are your key signals.'
          : `${troubled.length} signal${troubled.length === 1 ? '' : 's'} outside your normal band on Day ${day}.`}
        {' '}Shaded band = your first-7-day normal.
      </p>

      <div className="mt-3 space-y-3">
        {visible.map((ind) => {
          const ck = chartKey(ind.id);
          const st = ev.results[ind.id]?.status ?? 'Normal';
          const r = ev.results[ind.id];
          return (
            <div key={ind.id} className="card card-pad">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <b className="text-slate-900">{ind.name}</b>
                  <span className="ml-2 text-sm font-bold text-slate-700">
                    {fmtValue(ind.id, readings, startWeightKg)}
                  </span>
                  {r?.note && <p className="mt-0.5 text-xs text-slate-500">{r.note}</p>}
                </div>
                <StatusBadge status={st} size="sm" />
              </div>
              <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
                <TrendChart indicatorId={ind.id} days={days} baseline={baseline[ck] ?? null} wobble={wobble[ck] ?? null} />
              </div>
            </div>
          );
        })}
      </div>

      {troubled.length > 0 && (
        <button
          onClick={() => setShowAll((s) => !s)}
          className="btn-secondary mt-3 w-full min-h-[48px]"
        >
          {showAll ? 'Show less' : `Show all 17 signals`}
        </button>
      )}

      <button onClick={() => setTab('learn')} className="btn-primary mt-3 w-full">
        Next: understand what it means →
      </button>
    </div>
  );
}
