import { INDICATOR_MAP } from '../data/indicators';

/** Human-readable value for an indicator on a given day. */
export function fmtValue(id: string, values: Record<string, number>, startWeightKg?: number): string {
  const ind = INDICATOR_MAP[id];
  const u = ind ? ` ${ind.unit}` : '';
  switch (id) {
    case 'bp': {
      const s = values['bp_sys'];
      const d = values['bp_dia'];
      return s == null || d == null ? '—' : `${s}/${d} mmHg`;
    }
    case 'weight': {
      const kg = values['weight_kg'];
      if (kg == null) return '—';
      if (startWeightKg) {
        const pct = ((kg - startWeightKg) / startWeightKg) * 100;
        const sign = pct >= 0 ? '+' : '';
        return `${kg.toFixed(1)} kg (${sign}${pct.toFixed(1)}%)`;
      }
      return `${kg.toFixed(1)} kg`;
    }
    case 'temp':
    case 'sleep':
    case 'co2':
      return values[id] == null ? '—' : `${Number(values[id]).toFixed(1)}${u}`;
    case 'radiation':
      return values[id] == null ? '—' : `${Math.round(values[id])}${u}`;
    default: {
      const x = values[id];
      return x == null ? '—' : `${x}${u}`;
    }
  }
}

/** Series accessor for charts (maps indicator id → numeric value key). */
export function seriesValue(id: string, values: Record<string, number>): number | null {
  switch (id) {
    case 'bp':
      return values['bp_sys'] ?? null;
    case 'weight':
      return values['weight_kg'] ?? null;
    case 'vision':
      return values['vision_worse'] ?? null;
    case 'reaction':
      return values['reaction_slower'] ?? null;
    default:
      return values[id] ?? null;
  }
}
