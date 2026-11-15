import { useEffect } from 'react';
import { HealthProvider, evalForDay, useHealth, type Screen } from './state';
import Banner from './components/Banner';
import Landing from './views/Landing';
import Today from './views/Today';
import ZoneDetail from './views/ZoneDetail';
import CheckinList from './views/CheckinList';
import Question from './views/Question';
import Mood from './views/Mood';
import Reaction from './views/Reaction';
import Result from './views/Result';
import AlertScreen from './views/AlertScreen';
import UrgentScreen from './views/UrgentScreen';
import Trends from './views/Trends';
import Learn from './views/Learn';
import Checks from './views/Checks';

/** 9-screen flow on the deep-space theme. One `screen` variable, no router. */
function Shell() {
  const { screen, setScreen, evals, day } = useHealth();
  const ev = evalForDay(evals, day);

  useEffect(() => {
    if (ev.overall === 'Urgent' && (screen === 'today' || screen === 'result')) {
      setScreen('urgent');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ev.overall, day]);

  if (screen === 'landing') {
    return (
      <div className="min-h-screen bg-[#04060f]">
        <Banner />
        <Landing />
      </div>
    );
  }

  if (screen === 'alert') return <AlertScreen />;
  if (screen === 'urgent') return <UrgentScreen />;

  return (
    <div className="min-h-screen bg-[#04060f] text-slate-100">
      <Banner />
      {/* in-app header: day + status over the stars */}
      <div className="sticky top-[33px] z-40 border-b border-white/10 bg-[#070b16]/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-2 px-4 py-2">
          <button onClick={() => setScreen('landing')} className="min-h-[44px] text-sm font-bold text-indigo-300">
            ← Home
          </button>
          <div className="text-center">
            <b className="block text-sm text-white">Day {day} · {ev.overall}</b>
            <span className="block text-[11px] font-semibold text-slate-400">
              {screen === 'today' && 'Today — see your status'}
              {screen === 'zone' && 'Body zone — detail'}
              {screen === 'checkin' && 'Check-in — about 4 minutes'}
              {screen === 'question' && 'Check-in — questions'}
              {screen === 'mood' && 'Check-in — mood'}
              {screen === 'reaction' && 'Check-in — reaction test'}
              {screen === 'result' && 'Result — what to do'}
              {screen === 'trends' && 'Trends — spot drift'}
              {screen === 'learn' && 'Learn — plain words'}
              {screen === 'checks' && 'Checks — proof'}
            </span>
          </div>
          <span className="w-14" aria-hidden />
        </div>
      </div>

      <main className="mx-auto w-full max-w-3xl px-4 pb-32">
        {screen === 'today' && <Today />}
        {screen === 'zone' && <ZoneDetail />}
        {screen === 'checkin' && <CheckinList />}
        {screen === 'question' && <Question />}
        {screen === 'mood' && <Mood />}
        {screen === 'reaction' && <Reaction />}
        {screen === 'result' && <Result />}
        {screen === 'trends' && <Trends />}
        {screen === 'learn' && <Learn />}
        {screen === 'checks' && <Checks />}
      </main>
      <UrgentTab />
      <BottomTabs />
    </div>
  );
}

const TABS: Array<{ id: Screen; label: string }> = [
  { id: 'today', label: 'Today' },
  { id: 'trends', label: 'Trends' },
  { id: 'learn', label: 'Learn' },
];

function BottomTabs() {
  const { screen, setScreen } = useHealth();
  const active = screen === 'today' || screen === 'zone' ? 'today' : screen;
  return (
    <nav
      className="fixed bottom-0 z-40 flex w-full border-t border-white/10 bg-[#070b16]/95 backdrop-blur-md"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex w-full max-w-3xl">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setScreen(t.id)}
            aria-current={active === t.id ? 'page' : undefined}
            className={`min-h-[56px] flex-1 border-t-[3px] text-[15px] font-bold transition ${
              active === t.id
                ? 'border-indigo-400 text-white'
                : 'border-transparent text-slate-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

function UrgentTab() {
  const { setScreen } = useHealth();
  return (
    <button
      onClick={() => setScreen('urgent')}
      className="anim-blink fixed bottom-[70px] right-3.5 z-40 min-h-[48px] rounded-full bg-red-600 px-5 py-3 font-black text-white shadow-[0_10px_36px_rgba(220,38,38,0.55)]"
    >
      Urgent help
    </button>
  );
}

export default function App() {
  return (
    <HealthProvider>
      <Shell />
    </HealthProvider>
  );
}
