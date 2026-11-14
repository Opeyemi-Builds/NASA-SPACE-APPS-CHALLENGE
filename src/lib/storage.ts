import type { DayReading } from '../types';

const KEY = 'astro-health-companion/v1/days';

/** Persist check-in edits on device so a refresh never loses the demo (offline-first). */
export function loadDays(): DayReading[] | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DayReading[];
    if (!Array.isArray(parsed) || parsed.length !== 14) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveDays(days: DayReading[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(days));
  } catch {
    /* storage full or unavailable — demo still works in memory */
  }
}

export function resetDays(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
