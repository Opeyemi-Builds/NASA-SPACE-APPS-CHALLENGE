import { motion } from 'framer-motion';
import { useHealth, evalForDay } from '../state';
import StatusBadge from '../components/StatusBadge';
import HumanBody3D, { buildMarkers } from '../components/HumanBody3D';
import SolarSystem from '../components/SolarSystem';

const STORY: Array<[string, string, number, string]> = [
  ['Day 7', 'Baseline locked — all green', 7, 'Start here'],
  ['Day 10', 'Sleep drifts — first Watch', 10, 'Drift begins'],
  ['Day 11', 'Sleep Alert — 3rd short night', 11, 'It spreads'],
  ['Day 12', 'Pattern rule — overall Alert', 12, 'See the full picture'],
];

const STEPS: Array<[string, string]> = [
  ['1 · Learn your normal', 'Days 1–7 set your personal baseline. You are compared to you, not a poster chart.'],
  ['2 · Log a 2-minute check-in', 'Heart, sleep, mood, air, food, senses — the app flags drift on the spot.'],
  ['3 · Act without waiting', 'Moon 1–2 s, Mars up to 20 min delay. Clear first steps on board, who to tell, no waiting for Earth.'],
];

export default function Landing() {
  const { setRoute, setDay, setTab, evals } = useHealth();
  const e12 = evalForDay(evals, 12);
  const enter = (day: number) => {
    setDay(day);
    setTab('today');
    setRoute('app');
    window.scrollTo(0, 0);
  };

  return (
    <div className="bg-[#04060f] text-slate-100">
      {/* HERO */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0" aria-hidden>
          <SolarSystem />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(4,6,15,0.55) 0%, rgba(4,6,15,0.15) 30%, rgba(4,6,15,0.05) 55%, rgba(4,6,15,0.92) 100%)',
          }}
        />
        <div className="relative mx-auto flex min-h-[92svh] w-full max-w-6xl flex-col justify-end px-4 pb-10 pt-16 sm:justify-center sm:pb-16">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-2xl">
            <span className="inline-block rounded-full border border-indigo-300/40 bg-indigo-500/20 px-3.5 py-1.5 text-[11px] font-bold tracking-[0.12em] text-indigo-100 backdrop-blur-sm sm:text-xs">
              NASA SPACE APPS 2026 · CHALLENGE 4 · CREW HEALTH
            </span>
            <h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-tight text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.7)] sm:text-6xl">
              Your body,
              <br />
              <span className="bg-gradient-to-r from-indigo-300 via-sky-200 to-amber-200 bg-clip-text text-transparent">
                20 minutes from Earth.
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-slate-200 drop-shadow-[0_1px_10px_rgba(0,0,0,0.8)] sm:text-lg">
              Astro Health Companion learns each astronaut&apos;s normal, spots drift early,
              and tells them what to do next — even when Earth can&apos;t answer.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                onClick={() => enter(12)}
                className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 px-8 py-4 text-lg font-extrabold text-white shadow-[0_10px_36px_rgba(99,102,241,0.55)] transition hover:brightness-110 active:scale-[0.98] sm:w-auto"
              >
                Enter App — Day 12 →
              </button>
              <div className="flex items-center gap-2.5 rounded-2xl border border-white/15 bg-white/5 px-4 py-2.5 backdrop-blur-md">
                <span className="text-xs font-semibold text-slate-300">Crew status</span>
                <StatusBadge status={e12.overall} size="sm" />
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      <div id="mission" className="mx-auto max-w-6xl scroll-mt-4 px-4 pb-10 pt-6">
        {/* HOW IT WORKS — 3 steps, nothing else */}
        <section>
          <h2 className="text-xl font-extrabold text-white">How it works</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {STEPS.map(([h, p]) => (
              <div key={h} className="rounded-[18px] border border-white/10 bg-white/[0.06] p-[18px] backdrop-blur-sm">
                <h3 className="font-extrabold text-white">{h}</h3>
                <p className="mt-1 text-sm text-slate-300">{p}</p>
              </div>
            ))}
          </div>
        </section>

        {/* STORY — the only timeline on the page */}
        <section className="mt-8">
          <h2 className="text-xl font-extrabold text-white">Follow the story</h2>
          <p className="mt-1 text-sm text-slate-400">Four stops. Each opens the app on that day.</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {STORY.map(([d, t, day, tag]) => (
              <button
                key={d}
                onClick={() => enter(day)}
                className="min-h-[64px] rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-left backdrop-blur-sm transition hover:border-indigo-300/60 hover:bg-white/10 active:scale-[0.98]"
              >
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-indigo-300">{tag}</span>
                <span className="mt-1 block font-extrabold text-white">{d}</span>
                <span className="block text-[13px] text-slate-300">{t}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 3D PREVIEW — one job: show the body is alive */}
        <section className="mt-8">
          <div className="mb-2 flex items-end justify-between px-1">
            <div>
              <h2 className="text-xl font-extrabold text-white">Body status — live preview</h2>
              <p className="text-xs text-slate-400">Day 12 inside the app: drag to rotate, tap a glowing region</p>
            </div>
            <span className="tag">Live</span>
          </div>
          <HumanBody3D
            zoneStatus={e12.zoneStatus}
            selected={null}
            onSelect={() => enter(12)}
            markers={buildMarkers(e12)}
            height={typeof window !== 'undefined' && window.innerWidth < 640 ? 340 : 440}
          />
          <button
            onClick={() => enter(12)}
            className="mt-3 min-h-[48px] w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3.5 font-extrabold text-white shadow-[0_10px_36px_rgba(99,102,241,0.45)] transition hover:brightness-110 active:scale-[0.98]"
          >
            Open interactive 3D body →
          </button>
        </section>

        {/* ONE RULE */}
        <section className="mt-8 rounded-[18px] border border-white/10 bg-white/[0.06] p-5 text-center backdrop-blur-sm">
          <p className="text-sm text-slate-300">3 or more <b className="text-white">Watch</b> readings on one day raise everything to <b className="text-white">Alert</b> — the signs add up.</p>
          <p className="mt-1 text-3xl font-black text-red-400">3× Watch = Alert</p>
        </section>

        <footer className="pb-10 pt-6 text-center text-[13px] text-slate-400">
          Astro Health Companion · NASA Space Apps 2026 Challenge 4 · Sample mission data for evaluation. Not medical advice.
        </footer>
      </div>
    </div>
  );
}
