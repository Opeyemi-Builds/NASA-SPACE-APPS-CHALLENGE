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

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'today', label: 'Today' },
  { id: 'checkin', label: 'Check-in' },
  { id: 'trends', label: 'Trends' },
  { id: 'learn', label: 'Learn' },
  { id: 'tests', label: 'Tests' },
];

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
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-2">
          <button onClick={() => setRoute('landing')} className="text-sm font-bold text-indigo-700">Landing</button>
          <b className="text-sm text-slate-900">Astro Health Companion</b>
          <span className="text-xs text-slate-500">Day {day} · {ev.overall}</span>
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
        className="fixed bottom-20 right-3.5 z-40 rounded-full bg-red-600 px-5 py-3.5 font-black text-white shadow-lg"
      >
        URGENT
      </button>

      <nav className="fixed bottom-0 z-40 flex w-full border-t border-slate-200 bg-white/95" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="mx-auto flex w-full max-w-3xl">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex-1 border-t-[3px] px-1.5 py-3.5 text-[13px] font-bold',
                tab === t.id ? 'border-indigo-600 text-slate-900' : 'border-transparent text-slate-400',
              )}
            >
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
