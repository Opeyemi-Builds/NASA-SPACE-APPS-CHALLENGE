import type { DayEvaluation, DayReading, Status, Zone } from '../types';
import { computeBaseline, computeStreaks } from './baseline';
import { evaluateDay } from './rules';

/** Evaluate every day in order, building history as we go. */
export function evaluateAll(days: DayReading[]): {
  evals: DayEvaluation[];
  startWeightKg: number;
} {
  const sorted = [...days].sort((a, b) => a.day - b.day);
  const base = computeBaseline(sorted.slice(0, 7));
  const history: Record<string, number[]> = {};
  const evals: DayEvaluation[] = sorted.map((d) => {
    const streaks = computeStreaks(sorted, base, d.day);
    const r = evaluateDay(d, base, history, streaks);
    for (const [k, v] of Object.entries(d.values)) (history[k] ??= []).push(v);
    const zoneStatus = r.zoneStatus as Record<Zone, Status>;
    return { day: d.day, results: r.results, zoneStatus, overall: r.overall, patternTriggered: r.patternTriggered, urgentReason: r.urgentReason };
  });
  return { evals, startWeightKg: base.startWeightKg };
}
