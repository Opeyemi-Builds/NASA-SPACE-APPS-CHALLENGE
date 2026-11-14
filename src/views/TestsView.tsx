import { useMemo } from 'react';
import { runAllTests } from '../lib/testcases';

export default function TestsView() {
  const { cases, passed, total } = useMemo(() => runAllTests(), []);
  return (
    <div className="mx-auto max-w-3xl px-4 pb-28">
      <h2 className="mt-4 text-2xl font-extrabold text-slate-900">Verification — handover test cases</h2>
      <p className="text-sm text-slate-500">
        Every expected result from the research handover, executed live against the rules engine in this app.
      </p>
      <div className={`mt-3 rounded-2xl border p-4 text-center text-xl font-extrabold ${passed === total ? 'border-green-300 bg-green-50 text-green-800' : 'border-yellow-400 bg-yellow-50 text-yellow-800'}`}>
        {passed}/{total} test cases pass
      </div>
      <div className="card mt-3 overflow-hidden p-0">
        <table className="grid-table">
          <thead>
            <tr className="bg-slate-100 text-left">
              <th className="p-2">Case</th>
              <th className="p-2">Expected</th>
              <th className="p-2">Got</th>
              <th className="p-2">Pass</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((c) => (
              <tr key={c.name} className="odd:bg-slate-50">
                <td className="p-2"><b className="text-slate-900">{c.name}</b><br /><span className="text-xs text-slate-500">{c.input}</span></td>
                <td className="p-2 text-slate-700">{c.expected}</td>
                <td className="p-2 text-slate-700">{c.got}</td>
                <td className="p-2 text-center text-lg">{c.pass ? 'PASS' : 'FAIL'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
