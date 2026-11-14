import { motion } from 'framer-motion';
import { useHealth, evalForDay } from '../state';
import StatusBadge from '../components/StatusBadge';
import HumanBody3D, { buildMarkers } from '../components/HumanBody3D';
import SolarSystem from '../components/SolarSystem';

const VITALS = [
  { id: 'hr', label: 'Heart rate', value: '73 bpm', note: 'drifting above usual', status: 'Watch' as const },
  { id: 'sleep', label: 'Sleep', value: '5.5 h', note: '4th short night', status: 'Alert' as const },
  { id: 'mood', label: 'Mood', value: '4 / 10', note: 'low 3 days', status: 'Alert' as const },
  { id: 'spo2', label: 'Blood oxygen', value: '97 %', note: 'cabin air nominal', status: 'Normal' as const },
  { id: 'bp', label: 'Blood pressure', value: '128 / 82', note: 'elevated', status: 'Watch' as const },
];

const DEMO_DAYS: Array<[string, string, number]> = [
  ['Day 7', 'All green — baseline locked', 7],
  ['Day 10', 'Sleep + brain zone Watch', 10],
  ['Day 11', 'Sleep Alert — 3rd short night', 11],
  ['Day 12', 'Pattern rule — overall Alert', 12],
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
      {/* ============ HERO over the moving solar system ============ */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0" aria-hidden>
          <SolarSystem />
        </div>
        {/* readability scrim: stronger on phones where the sun sits behind text */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(4,6,15,0.55) 0%, rgba(4,6,15,0.15) 30%, rgba(4,6,15,0.05) 55%, rgba(4,6,15,0.92) 100%)',
          }}
        />

        <div className="relative mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col justify-end px-4 pb-10 pt-16 sm:justify-center sm:pb-16">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
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

            {/* mission timeline quick entry */}
            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                Mission timeline — jump to a key day
              </p>
              <div className="mt-2 flex gap-2 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch] sm:flex-wrap">
                {DEMO_DAYS.map(([d, t, day]) => (
                  <button
                    key={d}
                    onClick={() => enter(day)}
                    className="min-h-[44px] shrink-0 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-left text-[13px] backdrop-blur-md transition hover:border-indigo-300/60 hover:bg-white/10 active:scale-[0.97]"
                  >
                    <b className="text-white">{d}</b>
                    <span className="text-slate-300"> · {t}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* scroll hint */}
          <motion.a
            href="#mission"
            aria-label="Scroll to mission content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-4 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-slate-400 sm:flex"
          >
            <span className="text-[11px] font-bold tracking-[0.2em]">SCROLL</span>
            <span className="block h-8 w-[2px] animate-pulse bg-gradient-to-b from-indigo-300 to-transparent" />
          </motion.a>
        </div>
      </header>

      {/* ============ content below the hero ============ */}
      <div id="mission" className="mx-auto max-w-6xl scroll-mt-4 px-4 pb-10 pt-6">
        {/* 3-column dashboard: vitals | body | mission */}
        <div className="grid gap-4 lg:grid-cols-[300px_1fr_300px]">
          {/* left: vitals panel */}
          <motion.section
            initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }}
            className="card card-pad order-2 lg:order-1"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-900">Health Monitoring</h2>
              <span className="tag">Live</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Heart-rate overview · Day 12</p>
            {/* mini bar visual */}
            <div className="mt-3 flex h-24 items-end gap-1.5" aria-hidden>
              {[42, 55, 48, 60, 52, 66, 58, 74, 70, 82, 78, 88].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t"
                  style={{
                    height: `${h}%`,
                    background: i >= 8 ? '#dc2626' : i >= 6 ? '#d4a017' : '#c7d2fe',
                  }}
                />
              ))}
            </div>
            <div className="mt-2 flex justify-between text-sm font-bold text-slate-800">
              <span>Baseline 64 bpm</span><span>Now 73 bpm</span>
            </div>
            <div className="mt-3 space-y-2">
              {VITALS.map((v) => (
                <div key={v.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <div>
                    <div className="text-[13px] font-bold text-slate-800">{v.label}</div>
                    <div className="text-xs text-slate-500">{v.note}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-slate-900">{v.value}</div>
                    <StatusBadge status={v.status} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* center: live 3D astronaut */}
          <motion.section
            initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }}
            className="order-1 flex flex-col lg:order-2"
          >
            <div className="mb-2 flex items-end justify-between px-1">
              <div>
                <h2 className="text-lg font-extrabold text-white">Body status — live 3D</h2>
                <p className="text-xs text-slate-400">Day 12: drag to rotate, click a glowing region for detail</p>
              </div>
              <span className="tag">Live</span>
            </div>
            <HumanBody3D
              zoneStatus={e12.zoneStatus}
              selected={null}
              onSelect={() => enter(12)}
              markers={buildMarkers(e12)}
              height={typeof window !== 'undefined' && window.innerWidth < 640 ? 360 : 470}
            />
            <button
              onClick={() => enter(12)}
              className="mt-3 min-h-[48px] w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3.5 font-extrabold text-white shadow-[0_10px_36px_rgba(99,102,241,0.45)] transition hover:brightness-110 active:scale-[0.98]"
            >
              Open interactive 3D body →
            </button>
          </motion.section>

          {/* right: mission rail */}
          <motion.section
            initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }}
            className="order-3 flex flex-col gap-4"
          >
            <div className="card card-pad">
              <h3 className="text-sm font-extrabold text-slate-900">Mission rule</h3>
              <p className="mt-1 text-[13px] text-slate-600">
                3 or more <b>Watch</b> readings on one day raise the whole crew picture to <b>Alert</b> — the signs add up.
              </p>
              <div className="mt-2 rounded-xl bg-slate-100 p-3 text-center">
                <div className="text-3xl font-black text-red-700">3× Watch</div>
                <div className="text-xs font-bold text-slate-600">= OVERALL ALERT</div>
              </div>
            </div>
            <div className="card card-pad">
              <h3 className="text-sm font-extrabold text-slate-900">Mission readiness</h3>
              <div className="mt-2 flex items-center gap-3">
                <svg viewBox="0 0 80 80" className="h-20 w-20">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                  <circle cx="40" cy="40" r="32" fill="none" stroke="#4f46e5" strokeWidth="10"
                    strokeDasharray="201" strokeDashoffset="24" strokeLinecap="round" transform="rotate(-90 40 40)" />
                  <text x="40" y="46" textAnchor="middle" fontSize="17" fontWeight="800" fill="#0f172a">88%</text>
                </svg>
                <div className="text-xs text-slate-600">
                  <div><b className="text-slate-900">Life quality 1680</b> · sleep debt −4 h</div>
                  <div className="mt-1">Baseline locked Day 7 · 17 indicators tracked</div>
                </div>
              </div>
            </div>
            <div className="card card-pad">
              <h3 className="text-sm font-extrabold text-slate-900">Mission timeline</h3>
              <div className="mt-2 space-y-1.5 text-[13px]">
                {DEMO_DAYS.map(([d, t, day]) => (
                  <button
                    key={d}
                    onClick={() => enter(day)}
                    className="flex min-h-[48px] w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left transition hover:border-indigo-400"
                  >
                    <span><b>{d}</b> · <span className="text-slate-600">{t}</span></span>
                    <span className="font-bold text-indigo-700">Open</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.section>
        </div>

        {/* capability strip */}
        <section className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Learns your normal', 'First 7 days set your baseline and daily wobble. Mood, vision and reactions are judged against you, not a poster chart.'],
            ['Catches drift early', 'More than 2 wobbles off baseline, or a 3-day slide, raises Watch. Three Watches in one day raise overall Alert.'],
            ['Tells you what next', 'Every reading carries what it means, one self-care step, and exactly who to tell — medical officer, ground surgeon, or whole crew.'],
            ['Built for delay', 'Moon 1–2 s, Mars up to 20 min one-way. Clear first steps on board, no waiting for Earth. Offline-first PWA.'],
          ].map(([h, p], i) => (
            <motion.div
              key={h}
              initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: (i % 4) * 0.06 }}
              className="card card-pad border-t-4 border-t-indigo-500"
            >
              <h3 className="font-extrabold text-slate-900">{h}</h3>
              <p className="mt-1 text-sm text-slate-600">{p}</p>
            </motion.div>
          ))}
        </section>

        {/* mission facts */}
        <section className="mt-8">
          <h2 className="text-xl font-extrabold text-white">Why this matters — the numbers</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['600 mSv career limit', 'NASA caps an astronaut’s career radiation dose at 600 mSv, with a 250 mSv limit for a single solar storm. The app tracks the running total.'],
              ['20-minute delay', 'Radio takes about 1–2 seconds to reach the Moon and up to ~20 minutes one-way to Mars. The crew must act first — the app gives the steps.'],
              ['1–1.5% bone loss / month', 'Without gravity and daily exercise, bones lose roughly 1–1.5% density per month on 4–6 month missions. Exercise time is a tracked indicator.'],
              ['7+ hours of sleep', 'Adults need at least 7 hours (AASM/CDC). Four short nights cascade into sleep, mood, heart rate and the overall status.'],
            ].map(([h, p], i) => (
              <motion.div
                key={h}
                initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: (i % 4) * 0.06 }}
                className="rounded-[18px] border border-white/10 border-l-4 border-l-indigo-400 bg-white/[0.06] p-[18px] backdrop-blur-sm"
              >
                <h3 className="font-extrabold text-white">{h}</h3>
                <p className="mt-1 text-sm text-slate-300">{p}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <footer className="pb-10 pt-6 text-center text-[13px] text-slate-400">
          Astro Health Companion · NASA Space Apps 2026 Challenge 4 · Sample mission data for evaluation. Not medical advice.
          <br />Sources: NASA HRP hazards and risks, AHA, CDC/ADA, Mayo Clinic, NASA-STD-3001 — full links in the Learn tab.
        </footer>
      </div>
    </div>
  );
}
