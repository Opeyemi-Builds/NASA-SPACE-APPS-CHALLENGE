import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { DayEvaluation, DayReading, Zone } from './types';
import { generateDemoDays } from './data/demo';
import { evaluateAll } from './lib/evaluateAll';
import { loadDays, resetDays, saveDays } from './lib/storage';

// Guide §4: one variable called `screen` decides which screen shows.
// No router. Paths:
// check-in: today -> checkin -> question -> mood -> reaction -> result -> today
// body: today -> zone -> today
// trouble: result -> alert ; any danger answer -> urgent
export type Screen =
  | 'landing'
  | 'today'
  | 'zone'
  | 'checkin'
  | 'question'
  | 'mood'
  | 'reaction'
  | 'result'
  | 'alert'
  | 'urgent'
  | 'trends'
  | 'learn'
  | 'checks';

interface HealthStore {
  days: DayReading[];
  evals: DayEvaluation[];
  startWeightKg: number;
  day: number;
  setDay: (d: number) => void;
  screen: Screen;
  setScreen: (s: Screen) => void;
  zone: Zone | null;
  setZone: (z: Zone | null) => void;
  openZone: (z: Zone) => void;
  // check-in draft shared across question -> mood -> reaction -> result
  draft: Record<string, number>;
  setDraft: (v: Record<string, number>) => void;
  draftFlags: DayReading['flags'];
  setDraftFlags: (f: DayReading['flags']) => void;
  questionStep: number;
  setQuestionStep: (n: number) => void;
  reactionMs: number | null;
  setReactionMs: (n: number | null) => void;
  upsertToday: (day: number, values: Record<string, number>, flags: DayReading['flags']) => void;
  resetDemo: () => void;
}

const Ctx = createContext<HealthStore | null>(null);

export function HealthProvider({ children }: { children: ReactNode }) {
  const [days, setDays] = useState<DayReading[]>(() => loadDays() ?? generateDemoDays());
  useEffect(() => {
    saveDays(days);
  }, [days]);

  // Guide fake-data default: Day 10 shows the first Watch.
  const [day, setDay] = useState(10);
  const [screen, setScreenState] = useState<Screen>('landing');
  const [zone, setZone] = useState<Zone | null>(null);
  const [draft, setDraft] = useState<Record<string, number>>({});
  const [draftFlags, setDraftFlags] = useState<DayReading['flags']>({});
  const [questionStep, setQuestionStep] = useState(0);
  const [reactionMs, setReactionMs] = useState<number | null>(null);

  const { evals, startWeightKg } = useMemo(() => evaluateAll(days), [days]);

  const setScreen = (s: Screen) => {
    setScreenState(s);
    window.scrollTo(0, 0);
  };

  const openZone = (z: Zone) => {
    setZone(z);
    setScreen('zone');
  };

  const upsertToday: HealthStore['upsertToday'] = (d, values, flags) => {
    setDays((prev) =>
      prev.map((x) =>
        x.day === d
          ? { day: d, values: { ...x.values, ...values }, flags: { ...x.flags, ...flags } }
          : x,
      ),
    );
  };

  const resetDemo = () => {
    resetDays();
    setDays(generateDemoDays());
    setDay(10);
    setZone(null);
    setDraft({});
    setDraftFlags({});
    setQuestionStep(0);
    setReactionMs(null);
  };

  return (
    <Ctx.Provider
      value={{
        days, evals, startWeightKg, day, setDay, screen, setScreen,
        zone, setZone, openZone, draft, setDraft, draftFlags, setDraftFlags,
        questionStep, setQuestionStep, reactionMs, setReactionMs,
        upsertToday, resetDemo,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useHealth(): HealthStore {
  const s = useContext(Ctx);
  if (!s) throw new Error('useHealth must be used inside HealthProvider');
  return s;
}

export function evalForDay(evals: DayEvaluation[], day: number): DayEvaluation {
  return evals.find((e) => e.day === day) ?? evals[evals.length - 1];
}
