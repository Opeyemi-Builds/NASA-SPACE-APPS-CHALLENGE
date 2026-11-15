import { useEffect } from 'react';
import { HealthProvider, evalForDay, useHealth } from './state';
import Banner from './components/Banner';
import UrgentModal from './components/UrgentModal';
import Landing from './views/Landing';
import Today from './views/Today';
import Checkin from './views/Checkin';
import Trends from './views/Trends';
import Learn from './views/Learn';
import TestsView from './views/TestsView';
import type { Tab } from './state';
import { cn } from './lib/cn';

/**
 * Guided flow: 1 Today → 2 Check-in → 3 Trends → 4 Learn → 5 Checks.
 * Numbers in the bottom nav make the order obvious on phones.
 */
const TABS: Array<{ id: Tab; n: string; label: string }> = [
  { id: 'today', n: '1', label: 'Today' },
  { id: 'checkin', n: '2', label: 'Check-in' },
  { id: 'trends', n: '3', label: 'Trends' },
  { id: 'learn', n: '4', label: 'Learn' },
  { id: 'tests', n: '5', label: 'Checks' },
];

const STEP_HINT: Record<Tab, string> = {
  today: 'Step 1 of 5 — see your status',
  checkin: 'Step 2 of 5 — log today',
  trends: 'Step 3 of 5 — spot drift',
  learn: 'Step 4 of 5 — understand',
  tests: 'Step 5 of 5 — verify',
};

function Shell() {
  const { route, setRoute, tab, setTab, day, evals, urgentOpen, setUrgentOpen } = useHealth();
  const ev = evalForDay(evals, day);

  useEffect(() => {
    if (ev.overall === 'Urgent' && route === 'app') setUrgentOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ev.overall, day]);

  if (route === 'landing') {
    return (
      <div className="min-h-screen bg-[#04060f]">
        <Banner />
        <Landing />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#edf0f7]">
      <Banner />
      <div className="sticky top-[33px] z-40 border-b border-slate-200 bg-white/95">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-4 py-2">
          <button onClick={() => setRoute('landing')} className="min-h-[44px] text-sm font-bold text-indigo-700">
            ← Home
          </button>
          <div className="text-center">
            <b className="block text-sm text-slate-900">Day {day} · {ev.overall}</b>
            <span className="block text-[11px] font-semibold text-slate-500">{STEP_HINT[tab]}</span>
          </div>
          <span className="w-14" aria-hidden />
        </div>
      </div>

      <main>
        {tab === 'today' && <Today />}
        {tab === 'checkin' && <Checkin />}
        {tab === 'trends' && <Trends />}
        {tab === 'learn' && <Learn />}
        {tab === 'tests' && <TestsView />}
      </main>

      <button
        onClick={() => setUrgentOpen(true)}
        className="fixed bottom-20 right-3.5 z-40 min-h-[48px] rounded-full bg-red-600 px-5 py-3.5 font-black text-white shadow-lg"
      >
        URGENT
      </button>

      <nav className="fixed bottom-0 z-40 flex w-full border-t border-slate-200 bg-white/95" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="mx-auto flex w-full max-w-3xl">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              aria-current={tab === t.id ? 'page' : undefined}
              className={cn(
                'flex flex-1 flex-col items-center gap-0.5 border-t-[3px] px-1.5 py-2.5 text-[13px] font-bold',
                tab === t.id ? 'border-indigo-600 text-slate-900' : 'border-transparent text-slate-400',
              )}
            >
              <span className={cn(
                'flex h-5 w-5 items-center justify-center rounded-full text-[11px]',
                tab === t.id ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500',
              )}>{t.n}</span>
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      {urgentOpen && <UrgentModal reason={ev.urgentReason} onClose={() => setUrgentOpen(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <HealthProvider>
      <Shell />
    </HealthProvider>
  );
}
