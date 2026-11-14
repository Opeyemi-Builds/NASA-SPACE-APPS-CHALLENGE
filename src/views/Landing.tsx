import { motion } from 'framer-motion';
import { useHealth, evalForDay } from '../state';
import StatusBadge from '../components/StatusBadge';
import HumanBody3D, { buildMarkers } from '../components/HumanBody3D';

const VITALS = [
  { id: 'hr', label: 'Heart rate', value: '73 bpm', note: 'drifting above usual', status: 'Watch' as const },
  { id: 'sleep', label: 'Sleep', value: '5.5 h', note: '4th short night', status: 'Alert' as const },
  { id: 'mood', label: 'Mood', value: '4 / 10', note: 'low 3 days', status: 'Alert' as const },
  { id: 'spo2', label: 'Blood oxygen', value: '97 %', note: 'cabin air nominal', status: 'Normal' as const },
  { id: 'bp', label: 'Blood pressure', value: '128 / 82', note: 'elevated', status: 'Watch' as const },
];

export default function Landing() {
  const { setRoute, setDay, evals } = useHealth();
  const e12 = evalForDay(evals, 12);
  const enter = (day: number) => {
    setDay(day);
    setRoute('app');
    window.scrollTo(0, 0);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10">
      {/* top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-5">
        <div>
          <span className="eyebrow">NASA SPACE APPS 2026 · CHALLENGE 4 · CREW HEALTH</span>
          <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
            Astro Health Companion
          </h1>
          <p className="mt-1 max-w-2xl text-[15px] text-slate-600">
            Learns each astronaut&apos;s normal, spots drift early, and tells them what to do next —
            even when Earth can&apos;t answer for 20 minutes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right text-sm">
            <div className="font-bold text-slate-900">Demo crew · Day 12</div>
            <StatusBadge status={e12.overall} size="sm" />
          </div>
          <button onClick={() => enter(12)} className="btn-primary">Enter App</button>
        </div>
      </div>

      {/* 3-column dashboard: vitals | body | mission */}
      <div className="grid gap-4 lg:grid-cols-[300px_1fr_300px]">
        {/* left: vitals panel */}
        <motion.section
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          className="card card-pad"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900">Health Monitoring</h2>
            <span className="tag">Live demo</span>
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

        {/* center: real 3D body */}
        <motion.section
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="card card-pad flex flex-col items-center"
        >
          <h2 className="self-start text-lg font-extrabold text-slate-900">Body status — live 3D</h2>
          <p className="self-start text-xs text-slate-500">Day 12: drag to rotate, click a glowing marker for detail</p>
          <HumanBody3D
            zoneStatus={e12.zoneStatus}
            selected={null}
            onSelect={() => enter(12)}
            markers={buildMarkers(e12)}
            height={430}
          />
          <button onClick={() => enter(12)} className="btn-secondary mt-2 w-full">Open interactive 3D body</button>
        </motion.section>

        {/* right: mission rail */}
        <motion.section
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
          className="flex flex-col gap-4"
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
            <h3 className="text-sm font-extrabold text-slate-900">Demo story</h3>
            <div className="mt-2 space-y-1.5 text-[13px]">
              {[
                ['Day 7', 'All green — baseline locked', 7],
                ['Day 10', 'Sleep + brain zone Watch', 10],
                ['Day 11', 'Sleep Alert — 3rd short night', 11],
                ['Day 12', 'Pattern rule — overall Alert', 12],
              ].map(([d, t, day]) => (
                <button
                  key={d as string}
                  onClick={() => enter(day as number)}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left transition hover:border-indigo-400"
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
        ].map(([h, p]) => (
          <div key={h} className="card card-pad">
            <h3 className="font-extrabold text-slate-900">{h}</h3>
            <p className="mt-1 text-sm text-slate-600">{p}</p>
          </div>
        ))}
      </section>

      {/* mission facts */}
      <section className="mt-4">
        <h2 className="text-xl font-extrabold text-slate-900">Why this matters — the numbers</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['600 mSv career limit', 'NASA caps an astronaut’s career radiation dose at 600 mSv, with a 250 mSv limit for a single solar storm. The app tracks the running total.'],
            ['20-minute delay', 'Radio takes about 1–2 seconds to reach the Moon and up to ~20 minutes one-way to Mars. The crew must act first — the app gives the steps.'],
            ['1–1.5% bone loss / month', 'Without gravity and daily exercise, bones lose roughly 1–1.5% density per month on 4–6 month missions. Exercise time is a tracked indicator.'],
            ['7+ hours of sleep', 'Adults need at least 7 hours (AASM/CDC). The demo shows what four short nights do to sleep, mood, heart rate and the overall status.'],
          ].map(([h, p]) => (
            <div key={h} className="card card-pad border-l-4 border-l-indigo-600">
              <h3 className="font-extrabold text-slate-900">{h}</h3>
              <p className="mt-1 text-sm text-slate-600">{p}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="pb-10 pt-6 text-center text-[13px] text-slate-500">
        Astro Health Companion · NASA Space Apps 2026 Challenge 4 · Demonstration data and example ranges. Not medical advice.
        <br />Sources: NASA HRP hazards and risks, AHA, CDC/ADA, Mayo Clinic, NASA-STD-3001 — full links in the Learn tab.
      </footer>
    </div>
  );
}
