import { useMemo } from 'react';
import { evalForDay, useHealth } from '../state';
import { INDICATORS } from '../data/indicators';
import StatusChip from '../components/StatusChip';
import Card from '../components/Card';
import BigButton from '../components/BigButton';
import MiniChart from '../components/MiniChart';
import { computeBaseline } from '../lib/baseline';
import { fmtValue } from '../lib/format';

// Guide Screen 2: zone detail. Back link, name + chip, one card per
// reading, chart with normal band, meaning / do now / who to tell.
export default function ZoneDetail() {
  const { days, evals, day, zone, setScreen, startWeightKg } = useHealth();
  if (!zone) {
    return (
      <div className="pt-4">
        <BigButton variant="secondary" onClick={() => setScreen('today')}>Back to Today</BigButton>
      </div>
    );
  }
  const ev = evalForDay(evals, day);
  const st = ev.zoneStatus[zone];
  const inds = INDICATORS.filter((i) => i.zone === zone);
  const readings = days.find((d) => d.day === day)?.values ?? {};
  const { baseline, wobble } = useMemo(
    () => computeBaseline([...days].sort((a, b) => a.day - b.day).slice(0, 7)),
    [days],
  );
  const firstTrouble = inds.find((i) => ev.results[i.id]?.status !== 'Normal') ?? inds[0];

  const hist = (key: string) => days.map((d) => d.values[key]).filter((v) => typeof v === 'number');
  const bandKey = (id: string) =>
    id === 'bp' ? 'bp_sys' : id === 'weight' ? 'weight_kg' : id === 'vision' ? 'vision_worse' : id === 'reaction' ? 'reaction_slower' : id;

  return (
    <div className="pt-4">
      <button onClick={() => setScreen('today')} className="min-h-[44px] text-sm font-bold text-[#2F5BEA]">
        ← Back to Today
      </button>
      <div className="mt-2 flex items-center gap-2">
        <h1 className="text-2xl font-extrabold">{zone}</h1>
        <StatusChip status={st} />
      </div>

      <div className="mt-3 space-y-2">
        {inds.map((ind) => {
          const r = ev.results[ind.id];
          const ck = bandKey(ind.id);
          const b = baseline[ck] ?? 0;
          const w = wobble[ck] ?? 0;
          return (
            <Card key={ind.id}>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <b>{ind.name}</b>
                  <div className="text-lg font-extrabold">{fmtValue(ind.id, readings, startWeightKg)}</div>
                </div>
                <StatusChip status={r.status} size="sm" />
              </div>
              <div className="mt-2">
                <MiniChart history={hist(ck)} normalLow={b - w} normalHigh={b + w} />
                <p className="mt-1 text-xs text-slate-500">Green band = your own normal range.</p>
              </div>
            </Card>
          );
        })}
      </div>

      {firstTrouble && (
        <>
          <Card className="mt-3">
            <b>What this means</b>
            <p className="mt-1 text-sm text-slate-600">{firstTrouble.plain}</p>
          </Card>
          <Card className="mt-3">
            <b>What to do now</b>
            <p className="mt-1 text-sm text-slate-600">{firstTrouble.watchAction}</p>
            <p className="mt-2 text-sm text-slate-600"><b>Who to tell if it gets worse:</b> {firstTrouble.who}</p>
          </Card>
        </>
      )}

      <div className="mt-4">
        <BigButton onClick={() => setScreen('today')}>Back to Today</BigButton>
      </div>
    </div>
  );
}
