import { useMemo } from 'react';
import { runAllTests } from '../lib/testcases';
import { useHealth } from '../state';

/** Step 5 — verify. One score, story checks first, engine proof behind a toggle. */
export default function TestsView() {
  const { setTab, setRoute } = useHealth();
  const { cases, passed, total } = useMemo(() => runAllTests(), []);
  const story = cases.filter((c) =>
    ['Day 7 baseline', 'Day 10 sleep drift', 'Day 12 pattern rule', 'Pattern rule'].includes(c.name),
  );
  const rest = cases.filter((c) => !story.includes(c));

  return (
    <div className="mx-auto max-w-3xl px-4 pb-28">
      <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Step 5 of 5</p>
      <h2 className="mt-1 text-2xl font-extrabold text-slate-900">Checks</h2>
      <p className="text-sm text-slate-500">Every check runs live against the rules engine in this app.</p>

      <div className={`mt-3 rounded-2xl border p-4 text-center text-xl font-extrabold ${passed === total ? 'border-green-300 bg-green-50 text-green-800' : 'border-yellow-400 bg-yellow-50 text-yellow-800'}`}>
        {passed}/{total} checks pass
      </div>

      <h3 className="mt-4 font-extrabold text-slate-900">The story, verified</h3>
      <div className="mt-2 space-y-2">
        {story.map((c) => (
          <div key={c.name} className="card flex items-center justify-between gap-2 px-4 py-3">
            <div>
              <b className="block text-slate-900">{c.name}</b>
              <span className="block text-xs text-slate-500">{c.input} → {c.got}</span>
            </div>
            <span className={`shrink-0 rounded-full px-3 py-1 text-sm font-extrabold ${c.pass ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {c.pass ? 'PASS' : 'FAIL'}
            </span>
          </div>
        ))}
      </div>

      <details className="card card-pad mt-3">
        <summary className="min-h-[44px] cursor-pointer font-bold text-slate-900">
          All {total} engine checks
        </summary>
        <div className="mt-2 space-y-1.5">
          {rest.map((c) => (
            <div key={c.name} className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm">
              <span className="text-slate-700"><b className="text-slate-900">{c.name}</b> · {c.input}</span>
              <span className={c.pass ? 'font-extrabold text-green-700' : 'font-extrabold text-red-700'}>
                {c.pass ? 'PASS' : 'FAIL'}
              </span>
            </div>
          ))}
        </div>
      </details>

      <button onClick={() => { setTab('today'); }} className="btn-primary mt-4 w-full">
        Back to Today (step 1) →
      </button>
      <button onClick={() => setRoute('landing')} className="btn-secondary mt-2 w-full">
        Back to home
      </button>
    </div>
  );
}
