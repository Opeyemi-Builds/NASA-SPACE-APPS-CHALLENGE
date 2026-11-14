import { INDICATORS, INDICATOR_MAP } from '../data/indicators';
import type { DayEvaluation, DayReading, Zone } from '../types';
import { fmtValue } from '../lib/format';
import StatusBadge from './StatusBadge';
import TrendChart from './TrendChart';

interface Props {
  zone: Zone;
  evaluation: DayEvaluation;
  days: DayReading[];
  baseline: Record<string, number>;
  wobble: Record<string, number>;
  startWeightKg: number;
  onClose: () => void;
}

const chartKey = (id: string) =>
  id === 'bp' ? 'bp_sys' : id === 'weight' ? 'weight_kg' : id === 'vision' ? 'vision_worse' : id === 'reaction' ? 'reaction_slower' : id;

export default function ZonePanel({ zone, evaluation, days, baseline, wobble, startWeightKg, onClose }: Props) {
  const inds = INDICATORS.filter((i) => i.zone === zone);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-6" onClick={onClose}>
      <div
        className="card max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-b-none p-5 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-extrabold text-slate-900">
            {zone} <StatusBadge status={evaluation.zoneStatus[zone]} size="sm" />
          </h2>
          <button onClick={onClose} className="rounded-full border border-slate-300 bg-white px-3 py-1 text-sm font-bold text-slate-600">Close</button>
        </div>
        {inds.map((ind) => {
          const r = evaluation.results[ind.id];
          const ck = chartKey(ind.id);
          return (
            <div key={ind.id} className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-slate-900">{ind.name}</div>
                  <div className="text-sm text-slate-600">
                    Today: <b className="text-slate-900">{fmtValue(ind.id, days.find((d) => d.day === evaluation.day)?.values ?? {}, startWeightKg)}</b>
                  </div>
                  {r.note && <div className="mt-1 text-sm text-slate-600">{r.note}</div>}
                  {r.needsRepeat && <div className="mt-1 text-sm font-bold text-yellow-700">Repeat this reading after 5 minutes of rest.</div>}
                </div>
                <StatusBadge status={r.status} />
              </div>
              <div className="mt-2 rounded-xl border border-slate-200 bg-white p-2">
                <TrendChart indicatorId={ind.id} days={days} baseline={baseline[ck] ?? null} wobble={wobble[ck] ?? null} />
                <div className="mt-1 text-xs text-slate-500">Shaded band = your own normal (first 7 days) · {INDICATOR_MAP[ind.id].unit}</div>
              </div>
              <div className="mt-2 space-y-1 text-sm text-slate-700">
                <div><b>What this means:</b> {ind.plain}</div>
                <div><b>What to do now:</b> {ind.watchAction}</div>
                <div><b>Who to tell:</b> {ind.who}</div>
                <div className="text-xs text-slate-500">Hazards: {ind.hazards.join(' · ')} — Source: {ind.source}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
