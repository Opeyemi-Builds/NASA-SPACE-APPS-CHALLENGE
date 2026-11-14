import { useMemo } from 'react';
import { useHealth, evalForDay } from '../state';
import { INDICATORS } from '../data/indicators';
import { computeBaseline } from '../lib/baseline';
import StatusBadge from '../components/StatusBadge';
import TrendChart from '../components/TrendChart';

const chartKey = (id: string) =>
  id === 'bp' ? 'bp_sys' : id === 'weight' ? 'weight_kg' : id === 'vision' ? 'vision_worse' : id === 'reaction' ? 'reaction_slower' : id;

export default function Trends() {
  const { days, evals, day } = useHealth();
  const ev = evalForDay(evals, day);
  const { baseline, wobble } = useMemo(() => computeBaseline([...days].sort((a, b) => a.day - b.day).slice(0, 7)), [days]);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-28">
      <h2 className="mt-4 text-2xl font-extrabold text-slate-900">Trends — Day {day}</h2>
      <p className="text-sm text-slate-500">Every indicator, 14 days, shaded with your own normal band. Hazard tags included.</p>
      <div className="mt-3 space-y-3">
        {INDICATORS.map((ind) => {
          const ck = chartKey(ind.id);
          const st = ev.results[ind.id]?.status ?? 'Normal';
          return (
            <div key={ind.id} className="card card-pad">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <b className="text-slate-900">{ind.name}</b> <span className="text-xs text-slate-500">({ind.priority} · {ind.zone})</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {ind.hazards.map((h) => (
                      <span key={h} className="hazard-tag">{h}</span>
                    ))}
                  </div>
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
    </div>
  );
}
