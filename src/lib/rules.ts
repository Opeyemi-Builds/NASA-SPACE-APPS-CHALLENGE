import type { DayReading, IndicatorResult, Status } from '../types';
import { worst, worstOf } from '../types';
import { INDICATORS } from '../data/indicators';

/**
 * Rules engine — handover §6, §7.2, §8, §11.
 * Pure logic, zero UI. All thresholds match the handover tables.
 */

export interface BaselineCtx {
  baseline: Record<string, number>; // mean of days 1–7 (weight: day-1 value)
  wobble: Record<string, number>; // spread (std with floor)
  startWeightKg: number;
  exercisePlanMin: number;
}

export interface LimitCtx extends DayReading {
  base: BaselineCtx;
  moodLowDays: number; // consecutive low-mood days ending today
  sleepLowNights: number; // consecutive <6h nights ending today
  foodLowDays: number; // consecutive <90% days ending today
  exerciseWeekPct: number; // this week's avg vs plan (0–1+)
}

function R(id: string, status: Status, note?: string, needsRepeat?: boolean): IndicatorResult {
  return { id, status, note, needsRepeat };
}

/** Status of one reading vs the limits table (§7.2 + §8 edge rules). */
export function statusFromLimits(id: string, ctx: LimitCtx): IndicatorResult {
  const v = ctx.values;
  const f = ctx.flags;
  switch (id) {
    case 'hr': {
      const x = v['hr'];
      if (x == null) return R(id, 'Normal', 'No reading logged.');
      if (x < 50 || x > 110) return R(id, 'Alert', `${x} bpm is outside 50–110 at rest.`);
      if (x < 60 || x > 100) return R(id, 'Watch', `${x} bpm is slightly off your 60–100 range. Rest 5 min and re-check.`);
      return R(id, 'Normal');
    }
    case 'bp': {
      const sys = v['bp_sys'];
      const dia = v['bp_dia'];
      if (sys == null || dia == null) return R(id, 'Normal', 'No reading logged.');
      if (sys >= 180 || dia >= 120)
        return R(id, 'Urgent', `${sys}/${dia} is a hypertensive crisis — get help now.`);
      const sysAlert = sys >= 140;
      const diaAlert = dia >= 90;
      const sysWatch = sys >= 120 && sys <= 139;
      const diaWatch = dia >= 80 && dia <= 89;
      if (sysAlert || diaAlert) {
        if (f.bpRepeat) return R(id, 'Alert', `${sys}/${dia} confirmed on repeat — tell the medical officer.`);
        return R(id, 'Watch', `First reading ${sys}/${dia} is high — rest 5 min and take one repeat reading.`, true);
      }
      if (sysWatch || diaWatch) return R(id, 'Watch', `${sys}/${dia} is elevated (watch: 120–139 / 80–89).`);
      return R(id, 'Normal');
    }
    case 'sugar': {
      const x = v['sugar'];
      if (x == null) return R(id, 'Normal', 'No reading logged.');
      if (x < 70 && (f.sugarSymptoms || v['sugarSymptoms'] === 1))
        return R(id, 'Urgent', `${x} mg/dL with shaking/sweating/confusion — get help now.`);
      if (x < 70) return R(id, 'Alert', `${x} mg/dL is low (under 70).`);
      if (x >= 126) return R(id, 'Alert', `${x} mg/dL fasting is high (126+).`);
      if (x >= 100) return R(id, 'Watch', `${x} mg/dL is above the 70–99 fasting range.`);
      return R(id, 'Normal');
    }
    case 'temp': {
      const x = v['temp'];
      if (x == null) return R(id, 'Normal', 'No reading logged.');
      if (x >= 38.0) return R(id, 'Alert', `${x.toFixed(1)}°C is a fever (38.0+).`);
      if (x < 35.0) return R(id, 'Alert', `${x.toFixed(1)}°C is critically low (under 35.0).`);
      if (x >= 37.3) return R(id, 'Watch', `${x.toFixed(1)}°C is slightly raised.`);
      if (x >= 35.0 && x <= 36.0) return R(id, 'Watch', `${x.toFixed(1)}°C is slightly low.`);
      return R(id, 'Normal');
    }
    case 'sleep': {
      const x = v['sleep'];
      if (x == null) return R(id, 'Normal', 'No reading logged.');
      if (x < 6 && ctx.sleepLowNights >= 3)
        return R(id, 'Alert', `Under 6 hours for ${ctx.sleepLowNights} nights in a row.`);
      if (x < 6) return R(id, 'Watch', `${x.toFixed(1)} h is short — protect tonight's sleep.`);
      if (x < 7) return R(id, 'Watch', `${x.toFixed(1)} h is under your 7-hour minimum.`);
      return R(id, 'Normal'); // ≥7 normal, including >9 (§8 rule 2)
    }
    case 'mood': {
      const x = v['mood'];
      const usual = ctx.base.baseline['mood'] ?? 7;
      if (x == null) return R(id, 'Normal', 'No check-in logged.');
      if (x <= usual - 2 && ctx.moodLowDays >= 3)
        return R(id, 'Alert', `Low mood for ${ctx.moodLowDays} days — talk to the medical officer privately.`);
      if (x <= usual - 2) return R(id, 'Watch', `${x}/10 is 2+ points below your usual ${usual.toFixed(1)}.`);
      return R(id, 'Normal');
    }
    case 'spo2': {
      const x = v['spo2'];
      if (x == null) return R(id, 'Normal', 'No reading logged.');
      if (x < 90) return R(id, 'Urgent', `${x}% is critically low — get help now.`);
      if (x <= 94) return R(id, 'Watch', `${x}% is slightly low (watch: 90–94).`);
      return R(id, 'Normal');
    }
    case 'breath': {
      const x = v['breath'];
      if (x == null) return R(id, 'Normal', 'No reading logged.');
      if (x <= 8 || x >= 25) return R(id, 'Alert', `${x}/min is outside 9–24.`);
      if (x <= 11 || x >= 21) return R(id, 'Watch', `${x}/min is slightly off your 12–20 range.`);
      return R(id, 'Normal');
    }
    case 'weight': {
      const kg = v['weight_kg'];
      if (kg == null) return R(id, 'Normal', 'No reading logged.');
      const pct = (Math.abs(kg - ctx.base.startWeightKg) / ctx.base.startWeightKg) * 100;
      if (pct > 5) return R(id, 'Alert', `${pct.toFixed(1)}% change over the month.`);
      if (pct >= 2) return R(id, 'Watch', `${pct.toFixed(1)}% change from start (watch: 2–5%).`);
      return R(id, 'Normal');
    }
    case 'food': {
      const x = v['food'];
      if (x == null) return R(id, 'Normal', 'No log today.');
      if (f.noFoodOrDrinkDay) return R(id, 'Alert', 'No food or drink for a full day.');
      if (x < 75 && ctx.foodLowDays >= 3) return R(id, 'Alert', `Under 75% for ${ctx.foodLowDays} days.`);
      if (x < 90 && ctx.foodLowDays >= 3) return R(id, 'Watch', `${x}% for ${ctx.foodLowDays} days — eat the planned meals.`);
      return R(id, 'Normal'); // single low days stay Normal (§8 rule 5)
    }
    case 'exercise': {
      const pct = ctx.exerciseWeekPct;
      if (f.injury) return R(id, 'Alert', 'Injury reported — pause and tell the medical officer.');
      if (pct < 0.5) return R(id, 'Alert', `Only ${Math.round(pct * 100)}% of plan this week.`);
      if (pct < 0.8) return R(id, 'Watch', `Only ${Math.round(pct * 100)}% of plan this week.`);
      return R(id, 'Normal');
    }
    case 'symptoms': {
      const n = v['symptoms'] ?? 0;
      if (n >= 3 || f.severeSymptom) return R(id, 'Alert', n >= 3 ? `${n} symptoms — tell the medical officer.` : 'Severe or worsening symptom.');
      if (n >= 1) return R(id, 'Watch', `${n} mild symptom${n > 1 ? 's' : ''} — rest and watch.`);
      return R(id, 'Normal');
    }
    case 'radiation': {
      const x = v['radiation'] ?? 0;
      if (x > 480 || f.stormDoseNear250) return R(id, 'Alert', `${x} mSv career total — above 80% of NASA's 600 limit.`);
      if (x >= 300 || f.solarStormAlert) return R(id, 'Watch', `${x} mSv career total — past 50% of the limit. Follow shelter rules.`);
      return R(id, 'Normal');
    }
    case 'vision': {
      const worse = v['vision_worse'] ?? 0;
      if (worse >= 2 || f.newBlurOrHeadache || f.suddenVisionChange)
        return R(id, 'Alert', 'Two+ lines worse, or new blur/headaches.');
      if (worse >= 1) return R(id, 'Watch', 'One line worse than your baseline — re-test tomorrow.');
      return R(id, 'Normal');
    }
    case 'co2': {
      const x = v['co2'];
      if (x == null) return R(id, 'Normal', 'No monitor data.');
      if (x > 3.0) return R(id, 'Alert', `${x.toFixed(1)} mmHg is above 3.0 — ventilate and report.`);
      if (x >= 2.5) return R(id, 'Watch', `${x.toFixed(1)} mmHg is elevated (watch: 2.5–3.0).`);
      return R(id, 'Normal');
    }
    case 'reaction': {
      const pctSlower = v['reaction_slower'] ?? 0;
      if (pctSlower > 25 || f.manyReactionMisses) return R(id, 'Alert', `${pctSlower}% slower — take a break and re-test.`);
      if (pctSlower >= 10) return R(id, 'Watch', `${pctSlower}% slower than your baseline.`);
      return R(id, 'Normal');
    }
    case 'pain': {
      const x = v['pain'] ?? 0;
      if (f.suddenSeverePain || x >= 9) {
        if (f.suddenSeverePain) return R(id, 'Urgent', 'Sudden severe pain — stop and get help now.');
      }
      if (x >= 7) return R(id, 'Alert', `${x}/10 pain — tell the medical officer.`);
      if (x >= 4) return R(id, 'Watch', `${x}/10 pain — rest the area, stretch gently.`);
      return R(id, 'Normal');
    }
    default:
      return R(id, 'Normal');
  }
}

/** Drift check (§6.3): >~2 wobbles from baseline, or 3-day same-direction run. */
export function statusFromDrift(
  id: string,
  value: number | undefined,
  base: BaselineCtx,
  last3: number[],
): Status {
  if (value == null) return 'Normal';
  const DRIFT_IDS = new Set(['hr', 'bp_sys', 'bp_dia', 'temp', 'sugar', 'spo2', 'breath', 'sleep', 'weight_kg', 'exercise', 'co2']);
  if (!DRIFT_IDS.has(id)) return 'Normal';
  const b = base.baseline[id];
  const w = base.wobble[id] ?? 1;
  if (b == null || !Number.isFinite(b)) return 'Normal';
  if (Math.abs(value - b) > 2 * w + 1e-9) return 'Watch';
  if (last3.length >= 3) {
    const [a, c, d] = [last3[0], last3[1], last3[2]];
    if ((d > c && c > a && a >= b) || (d < c && c < a && a <= b)) return 'Watch';
  }
  return 'Normal';
}

/** Global urgent triggers (§6.7). Returns a reason string or null. */
export function urgentTriggerReason(day: DayReading, results: Record<string, IndicatorResult>): string | null {
  const f = day.flags;
  const v = day.values;
  if (f.chestPain) return 'Chest pain reported.';
  if (f.breathDifficulty) return 'Difficulty breathing reported.';
  if ((v['spo2'] ?? 100) < 90) return 'Blood oxygen below 90%.';
  if ((v['bp_sys'] ?? 0) >= 180 || (v['bp_dia'] ?? 0) >= 120) return 'Blood pressure 180/120 or higher.';
  if (f.suddenSeverePain) return 'Sudden severe pain.';
  if (f.faintOrConfusion || f.suddenVisionChange) return 'Fainting, confusion or sudden vision change.';
  if (f.selfHarmThought) return 'Thought of harming yourself reported.';
  if ((v['sugar'] ?? 99) < 70 && (f.sugarSymptoms || v['sugarSymptoms'] === 1))
    return 'Blood sugar below 70 with shaking, sweating or confusion.';
  // dizziness + any HR reading that is off-normal escalates HR to Alert (handled in evaluate),
  // chest pain already forces Urgent below.
  return null;
}

const INDICATOR_IDS = INDICATORS.map((i) => i.id);

/** Full day evaluation: limits + drift, urgent override, zones, pattern rule. */
export function evaluateDay(
  day: DayReading,
  base: BaselineCtx,
  history: Record<string, number[]>, // indicator value key -> values for days before this one
  streaks: { moodLowDays: number; sleepLowNights: number; foodLowDays: number; exerciseWeekPct: number },
): { results: Record<string, IndicatorResult>; zoneStatus: Record<string, Status>; overall: Status; patternTriggered: boolean; urgentReason: string | null } {
  const ctx: LimitCtx = { ...day, base, ...streaks };
  const results: Record<string, IndicatorResult> = {};

  for (const id of INDICATOR_IDS) {
    const lim = statusFromLimits(id, ctx);
    // drift key mapping: most ids map to values[id]; weight->weight_kg; bp handled per-number
    let drift: Status = 'Normal';
    if (id === 'bp') {
      const d1 = statusFromDrift('bp_sys', day.values['bp_sys'], base, history['bp_sys']?.slice(-3) ?? []);
      const d2 = statusFromDrift('bp_dia', day.values['bp_dia'], base, history['bp_dia']?.slice(-3) ?? []);
      drift = worst(d1, d2);
    } else if (id === 'weight') {
      drift = statusFromDrift('weight_kg', day.values['weight_kg'], base, history['weight_kg']?.slice(-3) ?? []);
    } else {
      drift = statusFromDrift(id, day.values[id], base, history[id]?.slice(-3) ?? []);
    }
    let s = worst(lim.status, drift);
    let note = lim.note;
    if (lim.status === 'Normal' && drift === 'Watch') note = 'Drifting from your own usual — keep an eye on it.';
    results[id] = { id, status: s, note, needsRepeat: lim.needsRepeat };
  }

  // §8 rule 4: dizziness with any heart rate -> HR Alert (unless already Urgent)
  if (day.flags.dizziness && results['hr'] && results['hr'].status !== 'Urgent') {
    results['hr'] = { id: 'hr', status: 'Alert', note: 'Dizziness reported with heart-rate reading.' };
  }

  const urgentReason = urgentTriggerReason(day, results);
  if (urgentReason) {
    // force the most relevant indicator(s) + overall to Urgent
    if (day.flags.chestPain || day.flags.breathDifficulty) {
      if (results['hr']) results['hr'].status = 'Urgent';
      if (results['spo2']) results['spo2'].status = worst(results['spo2'].status, 'Urgent');
    }
    if ((day.values['spo2'] ?? 100) < 90 && results['spo2']) results['spo2'].status = 'Urgent';
    if ((day.values['bp_sys'] ?? 0) >= 180 || (day.values['bp_dia'] ?? 0) >= 120) {
      if (results['bp']) results['bp'].status = 'Urgent';
    }
    if (day.flags.selfHarmThought && results['mood']) {
      results['mood'] = { id: 'mood', status: 'Urgent', note: 'Please tell the crew medical officer or someone near you now. You do not have to handle this alone.' };
    }
    if (day.flags.suddenSeverePain && results['pain']) results['pain'].status = 'Urgent';
    if ((day.values['sugar'] ?? 99) < 70 && (day.flags.sugarSymptoms || day.values['sugarSymptoms'] === 1) && results['sugar'])
      results['sugar'].status = 'Urgent';
  }

  // zones = worst of member indicators
  const zoneStatus: Record<string, Status> = {};
  for (const ind of INDICATORS) {
    zoneStatus[ind.zone] = worst(zoneStatus[ind.zone] ?? 'Normal', results[ind.id].status);
  }

  const watchCount = Object.values(results).filter((r) => r.status === 'Watch').length;
  const patternTriggered = watchCount >= 3;
  let overall = worstOf(Object.values(zoneStatus));
  if (patternTriggered && worst(overall, 'Alert') === 'Alert' && overall !== 'Urgent') overall = 'Alert';
  if (urgentReason) overall = 'Urgent';

  return { results, zoneStatus, overall, patternTriggered, urgentReason };
}
