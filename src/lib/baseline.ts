import type { DayReading } from '../types';
import type { BaselineCtx } from './rules';

/** Value keys tracked per day (bp split, weight in kg, vision/reaction as deltas). */
export const VALUE_KEYS = [
  'hr', 'bp_sys', 'bp_dia', 'sugar', 'temp', 'sleep', 'mood',
  'spo2', 'breath', 'weight_kg', 'food', 'exercise', 'symptoms',
  'radiation', 'vision_worse', 'co2', 'reaction_slower', 'pain',
] as const;

/** Minimum sensible wobble floors so drift isn't hair-triggered. */
const WOBBLE_FLOOR: Record<string, number> = {
  hr: 2, bp_sys: 3, bp_dia: 2, sugar: 4, temp: 0.15, sleep: 0.4, mood: 0.7,
  spo2: 0.7, breath: 1, weight_kg: 0.2, food: 2, exercise: 10,
  co2: 0.15, symptoms: 0.5, radiation: 1, vision_worse: 0.4, reaction_slower: 2, pain: 0.7,
};

function mean(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function std(xs: number[], m: number): number {
  if (xs.length < 2) return 0;
  const v = xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1);
  return Math.sqrt(v);
}

/**
 * Baseline = mean of days 1–7 (§6.1); wobble = spread (sample std, floored).
 * Weight baseline uses the day-1 reading (§6.1); exercise plan defaults to 120 min.
 */
export function computeBaseline(firstWeek: DayReading[], exercisePlanMin = 120): BaselineCtx {
  const baseline: Record<string, number> = {};
  const wobble: Record<string, number> = {};
  for (const key of VALUE_KEYS) {
    const xs = firstWeek
      .map((d) => d.values[key])
      .filter((x): x is number => typeof x === 'number' && Number.isFinite(x));
    if (xs.length === 0) continue;
    const m = mean(xs);
    baseline[key] = m;
    wobble[key] = Math.max(std(xs, m), WOBBLE_FLOOR[key] ?? 0.5, Math.abs(m) * 0.02);
  }
  const startWeightKg = firstWeek[0]?.values['weight_kg'] ?? 72;
  baseline['weight_kg'] = startWeightKg; // §6.1: weight uses the first reading
  return { baseline, wobble, startWeightKg, exercisePlanMin };
}

/** Streak inputs for the limits rules, computed from raw values only. */
export interface Streaks {
  moodLowDays: number;
  sleepLowNights: number;
  foodLowDays: number;
  exerciseWeekPct: number;
}

export function computeStreaks(allDays: DayReading[], base: BaselineCtx, dayNum: number): Streaks {
  const byDay = new Map(allDays.map((d) => [d.day, d]));
  const val = (day: number, key: string): number | undefined => byDay.get(day)?.values[key];

  const moodUsual = base.baseline['mood'] ?? 7;
  let moodLowDays = 0;
  for (let d = dayNum; d >= 1; d--) {
    const m = val(d, 'mood');
    if (m != null && m <= moodUsual - 2) moodLowDays++;
    else break;
  }

  let sleepLowNights = 0;
  for (let d = dayNum; d >= 1; d--) {
    const s = val(d, 'sleep');
    if (s != null && s < 6) sleepLowNights++;
    else break;
  }

  let foodLowDays = 0;
  for (let d = dayNum; d >= 1; d--) {
    const fd = val(d, 'food');
    if (fd != null && fd < 90) foodLowDays++;
    else break;
  }

  const week: number[] = [];
  for (let d = Math.max(1, dayNum - 6); d <= dayNum; d++) {
    const e = val(d, 'exercise');
    if (e != null) week.push(e);
  }
  const exerciseWeekPct = week.length > 0 ? mean(week) / base.exercisePlanMin : 1;

  return { moodLowDays, sleepLowNights, foodLowDays, exerciseWeekPct };
}
