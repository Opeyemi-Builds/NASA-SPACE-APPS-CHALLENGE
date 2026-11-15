import { useState } from 'react';
import { evalForDay, useHealth } from '../state';
import { INDICATOR_MAP } from '../data/indicators';
import StatusChip from '../components/StatusChip';
import Card from '../components/Card';
import BigButton from '../components/BigButton';

// Guide Screen 8: Alert. Light red background, 3 numbered steps,
// Send readings button, delay note, red Urgent help button.
export default function AlertScreen() {
  const { days, evals, day, setScreen } = useHealth();
  const ev = evalForDay(evals, day);
  const [sent, setSent] = useState(false);
  const signs = Object.entries(ev.results)
    .filter(([, r]) => r.status === 'Watch' || r.status === 'Alert')
    .map(([id, r]) => `${INDICATOR_MAP[id]?.name ?? id} (${r.status})`);

  return (
    <div className="min-h-screen bg-[#FDE3E0] text-[#14213D]">
      <div className="mx-auto w-full max-w-[430px] px-4 pb-10 pt-6">
        <StatusChip status="Alert" size="lg" />
        <h1 className="mt-3 text-3xl font-black">Your signs add up</h1>
        <p className="mt-2 text-[15px]">
          {signs.length > 0 ? signs.join(' · ') : 'Several readings are off together.'} Tell the crew medical officer today.
        </p>

        <Card className="mt-4">
          <ol className="list-decimal space-y-3 pl-6 text-[15px]">
            <li><b>Talk to the crew medical officer.</b> Show this screen.</li>
            <li>
              <b>Send your readings to the ground flight surgeon.</b>
              <div className="mt-2">
                <BigButton variant="secondary" onClick={() => setSent(true)}>
                  {sent ? 'Sent ✓' : 'Send readings'}
                </BigButton>
              </div>
            </li>
            <li><b>While you wait:</b> rest, drink water, dim lights tonight, re-check sleep and mood tomorrow.</li>
          </ol>
        </Card>

        <p className="mt-3 text-sm text-slate-700">
          Replies from Earth can take up to about 20 minutes one way on a Mars trip — start the steps above now.
        </p>

        <div className="mt-4">
          <BigButton variant="danger" onClick={() => setScreen('urgent')}>Urgent help</BigButton>
          <div className="mt-2">
            <BigButton variant="secondary" onClick={() => setScreen('today')}>Back to Today</BigButton>
          </div>
        </div>
      </div>
    </div>
  );
}
