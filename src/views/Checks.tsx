import { useMemo } from 'react';
import { runAllTests } from '../lib/testcases';
import { useHealth } from '../state';
import Card from '../components/Card';
import BigButton from '../components/BigButton';

// Verification: every handover test case runs live against the rules engine.
export default function Checks() {
  const { setScreen } = useHealth();
  const { cases, passed, total } = useMemo(() => runAllTests(), []);
  return (
    <div className="pt-4">
      <h1 className="text-2xl font-extrabold">Checks</h1>
      <p className="text-sm text-slate-500">Every check runs live against the rules engine in this app.</p>
      <div className={`mt-3 rounded-2xl border p-4 text-center text-xl font-extrabold ${passed === total ? 'border-[#9ADBB8] bg-[#DDF3E7] text-[#14683F]' : 'border-[#E3C568] bg-[#FFF3CD] text-[#8A5A00]'}`}>
        {passed}/{total} checks pass
      </div>
      <Card className="mt-3">
        <div className="space-y-2">
          {cases.map((c) => (
            <div key={c.name} className="flex items-center justify-between gap-2 rounded-xl bg-[#F4F6FB] px-3 py-2 text-sm">
              <span><b>{c.name}</b><br /><span className="text-xs text-slate-500">{c.input} → {c.got}</span></span>
              <span className={c.pass ? 'font-extrabold text-[#14683F]' : 'font-extrabold text-[#A32218]'}>
                {c.pass ? '✓ PASS' : '■ FAIL'}
              </span>
            </div>
          ))}
        </div>
      </Card>
      <div className="mt-3">
        <BigButton variant="secondary" onClick={() => setScreen('today')}>Back to Today</BigButton>
      </div>
    </div>
  );
}
