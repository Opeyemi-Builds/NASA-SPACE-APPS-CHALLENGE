import { statusFromLimits, evaluateDay, type BaselineCtx } from './rules';
import { computeBaseline, computeStreaks } from './baseline';
import { generateDemoDays } from '../data/demo';
import type { DayReading } from '../types';

/**
 * Handover §11 test cases, executable. Powers the in-app Tests view so
 * judges can verify every expected result live.
 */

export interface TestCase {
  name: string;
  input: string;
  expected: string;
  got: string;
  pass: boolean;
}

function synthBase(moodUsual = 7): BaselineCtx {
  const baseline: Record<string, number> = {
    hr: 72, bp_sys: 118, bp_dia: 76, sugar: 90, temp: 36.6, sleep: 7.5,
    mood: moodUsual, spo2: 97, breath: 15, weight_kg: 72, food: 98,
    exercise: 120, symptoms: 0, radiation: 120, vision_worse: 0,
    co2: 2.0, reaction_slower: 2, pain: 1,
  };
  const wobble: Record<string, number> = {
    hr: 5, bp_sys: 5, bp_dia: 4, sugar: 10, temp: 1, sleep: 1, mood: 1,
    spo2: 2, breath: 3, weight_kg: 1, food: 5, exercise: 20, symptoms: 1,
    radiation: 5, vision_worse: 1, co2: 1, reaction_slower: 5, pain: 2,
  };
  return { baseline, wobble, startWeightKg: 72, exercisePlanMin: 120 };
}

const S = (over: Partial<{ moodLowDays: number; sleepLowNights: number; foodLowDays: number; exerciseWeekPct: number }>) => ({
  moodLowDays: 0, sleepLowNights: 0, foodLowDays: 0, exerciseWeekPct: 1, ...over,
});

function limCase(
  name: string, input: string, id: string,
  trials: Array<{ values: Record<string, number>; flags?: DayReading['flags']; streak?: Parameters<typeof S>[0]; base?: BaselineCtx }>,
  expected: string[],
): TestCase {
  const got = trials.map((t) => {
    const base = t.base ?? synthBase();
    const d: DayReading = { day: 8, values: t.values, flags: t.flags ?? {} };
    return statusFromLimits(id, { ...d, base, ...S(t.streak ?? {}) }).status;
  });
  return { name, input, expected: expected.join(' / '), got: got.join(' / '), pass: got.join('|') === expected.join('|') };
}

function historyUpTo(days: DayReading[], n: number): Record<string, number[]> {
  const h: Record<string, number[]> = {};
  for (const d of days.filter((x) => x.day < n)) {
    for (const [k, v] of Object.entries(d.values)) (h[k] ??= []).push(v);
  }
  return h;
}

export function runAllTests(): { cases: TestCase[]; passed: number; total: number } {
  const cases: TestCase[] = [
    limCase('Heart rate', '72 / 105 / 112 / 48', 'hr',
      [{ values: { hr: 72 } }, { values: { hr: 105 } }, { values: { hr: 112 } }, { values: { hr: 48 } }],
      ['Normal', 'Watch', 'Alert', 'Alert']),
    limCase('Blood pressure', '118/76 / 128/82 / 142/88 repeat / 185/125', 'bp',
      [
        { values: { bp_sys: 118, bp_dia: 76 } },
        { values: { bp_sys: 128, bp_dia: 82 } },
        { values: { bp_sys: 142, bp_dia: 88 }, flags: { bpRepeat: true } },
        { values: { bp_sys: 185, bp_dia: 125 } },
      ],
      ['Normal', 'Watch', 'Alert', 'Urgent']),
    limCase('Temperature', '36.6 / 37.5 / 38.1 / 35.5', 'temp',
      [{ values: { temp: 36.6 } }, { values: { temp: 37.5 } }, { values: { temp: 38.1 } }, { values: { temp: 35.5 } }],
      ['Normal', 'Watch', 'Alert', 'Watch']),
    limCase('Blood sugar', '90 / 110 / 130 / 65 / 65+shaking', 'sugar',
      [
        { values: { sugar: 90 } }, { values: { sugar: 110 } }, { values: { sugar: 130 } },
        { values: { sugar: 65 } }, { values: { sugar: 65 }, flags: { sugarSymptoms: true } },
      ],
      ['Normal', 'Watch', 'Alert', 'Alert', 'Urgent']),
    limCase('Sleep', '7.5 / 6.5 / 5.5 ×3 nights', 'sleep',
      [
        { values: { sleep: 7.5 } },
        { values: { sleep: 6.5 }, streak: { sleepLowNights: 1 } },
        { values: { sleep: 5.5 }, streak: { sleepLowNights: 3 } },
      ],
      ['Normal', 'Watch', 'Alert']),
    limCase('Blood oxygen', '96 / 92 / 88', 'spo2',
      [{ values: { spo2: 96 } }, { values: { spo2: 92 } }, { values: { spo2: 88 } }],
      ['Normal', 'Watch', 'Urgent']),
    limCase('Breathing rate', '15 / 22 / 26', 'breath',
      [{ values: { breath: 15 } }, { values: { breath: 22 } }, { values: { breath: 26 } }],
      ['Normal', 'Watch', 'Alert']),
    limCase('Cabin CO₂', '2.0 / 2.8 / 3.2 mmHg', 'co2',
      [{ values: { co2: 2.0 } }, { values: { co2: 2.8 } }, { values: { co2: 3.2 } }],
      ['Normal', 'Watch', 'Alert']),
    limCase('Mood (usual 7)', '6.5 / 5 / low ×3 days', 'mood',
      [
        { values: { mood: 6.5 } },
        { values: { mood: 5 }, streak: { moodLowDays: 1 } },
        { values: { mood: 4 }, streak: { moodLowDays: 3 } },
      ],
      ['Normal', 'Watch', 'Alert']),
  ];

  // Any thought of self-harm → Urgent
  {
    const base = synthBase();
    const d: DayReading = { day: 8, values: { mood: 6 }, flags: { selfHarmThought: true } };
    const e = evaluateDay(d, base, {}, S({}));
    cases.push({
      name: 'Self-harm thought', input: '“thought of harming myself”', expected: 'Urgent',
      got: e.results['mood'].status, pass: e.results['mood'].status === 'Urgent' && e.overall === 'Urgent',
    });
  }

  // Pattern rule: 3 Watches same day → overall Alert
  {
    const base = synthBase();
    const d: DayReading = {
      day: 8,
      values: { sleep: 6.5, mood: 5, bp_sys: 128, bp_dia: 82 },
      flags: {},
    };
    const e = evaluateDay(d, base, {}, S({ sleepLowNights: 1, moodLowDays: 1 }));
    const indiv = [e.results['sleep'].status, e.results['mood'].status, e.results['bp'].status].join('/');
    cases.push({
      name: 'Pattern rule', input: `3× Watch same day (${indiv})`, expected: 'Overall Alert',
      got: `Overall ${e.overall}`, pass: e.overall === 'Alert' && e.patternTriggered,
    });
  }

  // Mission timeline checks
  {
    const days = generateDemoDays();
    const base = computeBaseline(days.slice(0, 7));
    const evalDay = (n: number) => {
      const d = days.find((x) => x.day === n)!;
      return evaluateDay(d, base, historyUpTo(days, n), computeStreaks(days, base, n));
    };
    const e7 = evalDay(7);
    const allGreen = e7.overall === 'Normal' && Object.values(e7.results).every((r) => r.status === 'Normal');
    cases.push({
      name: 'Day 7 baseline', input: 'first week complete', expected: 'All green',
      got: allGreen ? 'All green' : `Overall ${e7.overall}`, pass: allGreen,
    });
    const e10 = evalDay(10);
    cases.push({
      name: 'Day 10 sleep drift', input: '2nd short night', expected: 'Sleep Watch',
      got: `Sleep ${e10.results['sleep'].status} / overall ${e10.overall}`,
      pass: e10.results['sleep'].status === 'Watch',
    });
    const e12 = evalDay(12);
    cases.push({
      name: 'Day 12 pattern rule', input: 'signs add up', expected: 'Overall Alert',
      got: `Overall ${e12.overall}${e12.patternTriggered ? ' (pattern rule)' : ''}`,
      pass: e12.overall === 'Alert',
    });
  }

  const passed = cases.filter((c) => c.pass).length;
  return { cases, passed, total: cases.length };
}
