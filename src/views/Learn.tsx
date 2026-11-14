import { HAZARDS } from '../data/hazards';
import { INDICATORS } from '../data/indicators';
import { DELAY_NOTE } from '../data/content';

export default function Learn() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-28">
      <h2 className="mt-4 text-2xl font-extrabold text-slate-900">Learn</h2>
      <p className="text-sm text-slate-500">Nothing assumed. Plain words, how to measure, and why each hazard matters.</p>

      <div className="card mt-3 border-indigo-200 bg-indigo-50 p-4 text-sm text-slate-700">
        <b className="text-slate-900">Why the app acts without Earth:</b> {DELAY_NOTE}
      </div>

      <h3 className="mt-5 text-lg font-extrabold text-slate-900">The 5 hazards of spaceflight</h3>
      <div className="mt-2 space-y-3">
        {HAZARDS.map((h) => (
          <div key={h.name} className="card card-pad">
            <b className="text-slate-900">{h.name}</b>
            <p className="mt-1 text-sm text-slate-600">{h.short}</p>
            <p className="mt-1 text-[13px] text-slate-500"><b>Watched by:</b> {h.indicators}</p>
            <div className="mt-1 space-y-0.5">
              {h.sources.map((s) => (
                <a key={s} href={s} target="_blank" rel="noreferrer" className="block truncate text-xs font-semibold text-indigo-700">{s}</a>
              ))}
            </div>
          </div>
        ))}
      </div>

      <h3 className="mt-6 text-lg font-extrabold text-slate-900">Every indicator, in plain words</h3>
      <div className="mt-2 space-y-3">
        {INDICATORS.map((i) => (
          <details key={i.id} className="card card-pad">
            <summary className="min-h-[44px] cursor-pointer font-bold text-slate-900">{i.name} <span className="text-xs font-normal text-slate-500">({i.unit} · {i.priority})</span></summary>
            <div className="mt-2 space-y-1.5 text-sm text-slate-600">
              <p><b>What it is:</b> {i.plain}</p>
              <p><b>How to measure:</b> {i.how}</p>
              <p><b>If Watch:</b> {i.watchAction}</p>
              <p><b>Who to tell (Alert):</b> {i.who}</p>
              <p className="text-xs text-slate-500">Source: {i.source}</p>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
