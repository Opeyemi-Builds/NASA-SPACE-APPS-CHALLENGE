import { useMemo } from 'react';
import { evalForDay, useHealth } from '../state';
import { INDICATORS } from '../data/indicators';
import { computeBaseline } from '../lib/baseline';
import { fmtValue } from '../lib/format';
import StatusChip from '../components/StatusChip';
import Card from '../components/Card';
import MiniChart from '../components/MiniChart';

// Extras for later: a list of small charts, one per reading, each with its own normal band.
const chartKey = (id: string) =>
  id === 'bp' ? 'bp_sys' : id === 'weight' ? 'weight_kg' : id === 'vision' ? 'vision_worse' : id === 'reaction' ? 'reaction_slower' : id;

export default function Trends() {
  const { days, evals, day, startWeightKg } = useHealth();
  const ev = evalForDay(evals, day);
  const { baseline, wobble } = useMemo(
    () => computeBaseline([...days].sort((a, b) => a.day - b.day).slice(0, 7)),
    [days],
  );
  const readings = days.find((d) => d.day === day)?.values ?? {};

  return (
    <div className="pt-4">
      <h1 className="text-2xl font-extrabold">Trends · Day {day}</h1>
      <p className="text-sm text-slate-500">Every reading, 14 days, with your own normal band.</p>
      <div className="mt-3 space-y-2">
        {INDICATORS.map((ind) => {
          const ck = chartKey(ind.id);
          const st = ev.results[ind.id]?.status ?? 'Normal';
          const b = baseline[ck] ?? 0;
          const w = wobble[ck] ?? 0;
          return (
            <Card key={ind.id}>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <b>{ind.name}</b>
                  <span className="ml-2 text-sm font-bold">{fmtValue(ind.id, readings, startWeightKg)}</span>
                </div>
                <StatusChip status={st} size="sm" />
              </div>
              <div className="mt-2">
                <MiniChart
                  history={days.map((d) => d.values[ck]).filter((v) => typeof v === 'number')}
                  normalLow={b - w}
                  normalHigh={b + w}
                />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
