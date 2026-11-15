import { evalForDay, useHealth } from '../state';
import { INDICATOR_MAP } from '../data/indicators';
import { STATUS_MESSAGES } from '../data/content';
import StatusChip from '../components/StatusChip';
import Card from '../components/Card';
import BigButton from '../components/BigButton';
import { fmtValue } from '../lib/format';

// Guide Screen 7: result. Overall chip + sentence, reading rows,
// note when exactly two Watch, two buttons.
export default function Result() {
  const { days, evals, day, setScreen, startWeightKg } = useHealth();
  const ev = evalForDay(evals, day);
  const msg = STATUS_MESSAGES[ev.overall];
  const readings = days.find((d) => d.day === day)?.values ?? {};
  const rows = Object.entries(ev.results).filter(([, r]) => r.status !== 'Normal');
  const watchCount = Object.values(ev.results).filter((r) => r.status === 'Watch').length;

  const seeWhat = () => {
    if (ev.overall === 'Alert' || ev.overall === 'Urgent') setScreen('alert');
    else setScreen('today');
  };

  return (
    <div className="pt-4">
      <h1 className="text-2xl font-extrabold">Check-in complete · Day {day}</h1>
      <Card className="mt-3">
        <StatusChip status={ev.overall} size="lg" />
        <p className="mt-2 font-semibold">{msg.title}</p>
        <p className="mt-1 text-sm text-slate-600">{msg.body}</p>
      </Card>

      <Card className="mt-3">
        <b>Your readings</b>
        <div className="mt-2 space-y-2">
          {rows.length === 0 && <p className="text-sm text-slate-600">All readings normal.</p>}
          {rows.map(([id, r]) => (
            <div key={id} className="flex items-center justify-between gap-2 rounded-xl bg-[#F4F6FB] px-3 py-2 text-sm">
              <span>{INDICATOR_MAP[id]?.name ?? id} · {fmtValue(id, readings, startWeightKg)}</span>
              <StatusChip status={r.status} size="sm" />
            </div>
          ))}
        </div>
        {watchCount === 2 && (
          <p className="mt-2 text-sm font-semibold text-[#8A5A00]">
            If a third sign joins them, the overall status becomes Alert.
          </p>
        )}
      </Card>

      <div className="mt-3 space-y-2">
        <BigButton onClick={seeWhat}>See what to do</BigButton>
        <BigButton variant="secondary" onClick={() => setScreen('today')}>Back to Today</BigButton>
      </div>
    </div>
  );
}
