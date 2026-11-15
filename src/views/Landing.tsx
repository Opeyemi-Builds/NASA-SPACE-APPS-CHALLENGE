import { useHealth } from '../state';
import Card from '../components/Card';
import BigButton from '../components/BigButton';
import StatusChip from '../components/StatusChip';
import { evalForDay } from '../state';

// Simple entry: title, one line, crew status, Enter App.
export default function Landing() {
  const { setScreen, setDay, evals, day } = useHealth();
  const ev = evalForDay(evals, day);
  const enter = (d: number) => {
    setDay(d);
    setScreen('today');
  };
  return (
    <div className="mx-auto w-full max-w-[430px] px-4 pb-10 pt-10">
      <p className="text-xs font-bold tracking-[0.12em] text-slate-500">NASA SPACE APPS 2026 · CREW HEALTH</p>
      <h1 className="mt-3 text-4xl font-black leading-tight">Your body, 20 minutes from Earth.</h1>
      <p className="mt-3 text-[15px] text-slate-600">
        Astro Health Companion learns each astronaut&apos;s normal, spots drift early, and tells them what to do next.
      </p>
      <div className="mt-4 flex items-center gap-2">
        <span className="text-sm font-semibold text-slate-600">Crew status · Day {day}</span>
        <StatusChip status={ev.overall} size="sm" />
      </div>
      <div className="mt-5">
        <BigButton onClick={() => enter(10)}>Enter App — Day 10</BigButton>
      </div>
      <Card className="mt-3">
        <b>How a day goes</b>
        <p className="mt-1 text-sm text-slate-600">1 Today → 2 Check-in → 3 Questions → 4 Result. Tap any body zone for detail.</p>
        <div className="mt-2 flex gap-2">
          {[7, 10, 11, 12].map((d) => (
            <button
              key={d}
              onClick={() => enter(d)}
              className="min-h-[44px] flex-1 rounded-xl border border-[#D9DFEC] bg-[#F4F6FB] text-sm font-bold"
            >
              Day {d}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
