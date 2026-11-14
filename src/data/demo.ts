import type { DayReading } from '../types';

/**
 * Seeded 14-day demo generator (handover §7.5).
 * Fixed seed → identical demo every run. Days 1–7 are normal (set baseline).
 * Story: lost sleep → rising heart rate, lower mood, less exercise.
 *   Day 7: all green · Day 10: sleep + brain zone Watch · Day 11: sleep Alert
 *   Day 12: mood + HR + exercise Watch → pattern rule → overall Alert.
 */

/** Deterministic PRNG (mulberry32). */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const gauss = (r: () => number) => (r() + r() + r() + r() - 2) / 1.2; // ≈N(0, ~0.9)

interface Usual { mean: number; wobble: number }

const USUALS: Record<string, Usual> = {
  hr: { mean: 64, wobble: 3 },
  bp_sys: { mean: 116, wobble: 4 },
  bp_dia: { mean: 74, wobble: 3 },
  temp: { mean: 36.6, wobble: 0.2 },
  sugar: { mean: 88, wobble: 5 },
  sleep: { mean: 7.0, wobble: 0.6 },
  mood: { mean: 7, wobble: 1 },
  spo2: { mean: 97, wobble: 1 },
  breath: { mean: 15, wobble: 1 },
  weight_kg: { mean: 72.0, wobble: 0.3 },
  exercise: { mean: 120, wobble: 15 },
  food: { mean: 98, wobble: 3 },
  symptoms: { mean: 0, wobble: 0 },
  radiation: { mean: 0.4, wobble: 0.1 },
  vision_worse: { mean: 0, wobble: 0 },
  co2: { mean: 2.0, wobble: 0.2 },
  reaction_slower: { mean: 2, wobble: 3 },
  pain: { mean: 1, wobble: 1 },
};

const round1 = (x: number) => Math.round(x * 10) / 10;

export function generateDemoDays(seed = 20261014): DayReading[] {
  void seed; // story values below are scripted exactly (not drawn) so the demo
  // beats land identically on every run: Day 7 all green, Day 10 sleep Watch,
  // Day 11 sleep Alert, Day 12 overall Alert via the pattern rule.
  const days: DayReading[] = [];
  let radiationTotal = 120; // career mSv already accumulated before the demo
  const hrScript: Record<number, number> = { 8: 66, 9: 65, 10: 67, 11: 70, 12: 73, 13: 76, 14: 78 };
  for (let day = 1; day <= 14; day++) {
    const shortNights = day >= 9 && day <= 12; // main story: lost sleep
    const lowMood = day >= 10 && day <= 13; // follows the sleep loss
    const lowExercise = day >= 10 && day <= 13;
    const lowFood = day >= 10 && day <= 12;
    const highBp = day >= 12 && day <= 14;
    const slowReact = day === 12 || day === 13;
    const v: Record<string, number> = {
      hr: day <= 7 ? 64 : hrScript[day],
      bp_sys: highBp ? 128 : 116,
      bp_dia: 74,
      temp: 36.6,
      sugar: 88,
      sleep: shortNights ? 5.5 : 7.0,
      mood: lowMood ? 4 : 7,
      spo2: 97,
      breath: 15,
      weight_kg: round1(72.0 - 0.1 * (day - 1)),
      food: lowFood ? 82 : 98,
      exercise: lowExercise ? 60 : 120,
      symptoms: 0,
      radiation: 0, // set below (running career total)
      vision_worse: 0,
      co2: 2.0,
      reaction_slower: slowReact ? 18 : 2,
      pain: 1,
    };
    radiationTotal = round1(radiationTotal + 0.5);
    v['radiation'] = radiationTotal;
    days.push({ day, values: v, flags: {} });
  }
  return days;
}
