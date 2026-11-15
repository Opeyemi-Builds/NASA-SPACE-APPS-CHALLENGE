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

/** Guide §4: one `screen` variable decides what shows. No router. */
function Shell() {
  const { screen, setScreen, evals, day } = useHealth();
  const ev = evalForDay(evals, day);

  // Any Urgent overall jumps to the Urgent screen (guide path 3).
  useEffect(() => {
    if (ev.overall === 'Urgent' && (screen === 'today' || screen === 'result')) {
      setScreen('urgent');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ev.overall, day]);

  if (screen === 'landing') {
    return (
      <div className="min-h-screen bg-[#F4F6FB]">
        <Banner />
        <Landing />
      </div>
    );
  }

  // Alert + Urgent are full-bleed coloured screens (guide §5 screens 8-9).
  if (screen === 'alert') return <AlertScreen />;
  if (screen === 'urgent') return <UrgentScreen />;

  return (
    <div className="min-h-screen bg-[#F4F6FB] text-[#14213D]">
      <Banner />
      <main className="mx-auto w-full max-w-[430px] px-4 pb-32">
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
      className="fixed bottom-0 z-40 flex w-full border-t border-[#D9DFEC] bg-white/95"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex w-full max-w-[430px]">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setScreen(t.id)}
            aria-current={active === t.id ? 'page' : undefined}
            className={`min-h-[56px] flex-1 border-t-[3px] text-[15px] font-bold ${
              active === t.id
                ? 'border-[#2F5BEA] text-[#14213D]'
                : 'border-transparent text-slate-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

/** Guide §4: an Urgent help button is on every screen. */
function UrgentTab() {
  const { setScreen } = useHealth();
  return (
    <button
      onClick={() => setScreen('urgent')}
      className="fixed bottom-[70px] right-3.5 z-40 min-h-[48px] rounded-full bg-[#A32218] px-5 py-3 font-black text-white shadow-lg"
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
