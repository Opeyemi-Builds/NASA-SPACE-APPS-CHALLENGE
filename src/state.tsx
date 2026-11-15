import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { DayEvaluation, DayReading, Zone } from './types';
import { generateDemoDays } from './data/demo';
import { evaluateAll } from './lib/evaluateAll';
import { loadDays, resetDays, saveDays } from './lib/storage';

export type Tab = 'today' | 'checkin' | 'trends' | 'learn' | 'tests';

interface HealthStore {
  days: DayReading[];
  evals: DayEvaluation[];
  startWeightKg: number;
  upsertToday: (day: number, values: Record<string, number>, flags: DayReading['flags']) => void;
  resetDemo: () => void;
  day: number;
  setDay: (d: number) => void;
  tab: Tab;
  setTab: (t: Tab) => void;
  zone: Zone | null;
  setZone: (z: Zone | null) => void;
  urgentOpen: boolean;
  setUrgentOpen: (b: boolean) => void;
  route: 'landing' | 'app';
  setRoute: (r: 'landing' | 'app') => void;
}

const Ctx = createContext<HealthStore | null>(null);

export function HealthProvider({ children }: { children: ReactNode }) {
  const [days, setDays] = useState<DayReading[]>(() => loadDays() ?? generateDemoDays());

  useEffect(() => {
    saveDays(days);
  }, [days]);
  const [day, setDay] = useState(12);
  const [tab, setTab] = useState<Tab>('today');
  const [zone, setZone] = useState<Zone | null>(null);
  const [urgentOpen, setUrgentOpen] = useState(false);
  const [route, setRoute] = useState<'landing' | 'app'>('landing');

  const { evals, startWeightKg } = useMemo(() => evaluateAll(days), [days]);

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
    setDay(12);
    setZone(null);
  };

  return (
    <Ctx.Provider
      value={{
        days, evals, startWeightKg, upsertToday, resetDemo,
        day, setDay, tab, setTab, zone, setZone,
        urgentOpen, setUrgentOpen, route, setRoute,
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
