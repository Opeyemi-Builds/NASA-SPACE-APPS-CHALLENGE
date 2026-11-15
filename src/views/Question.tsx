import { useHealth } from '../state';
import Card from '../components/Card';
import BigButton from '../components/BigButton';

// Guide Screen 4: one reusable question template.
// Steps 1-4 of 6: heart rate, blood pressure, temperature, sleep.
const STEPS = [
  {
    title: 'Resting heart rate',
    how: 'Sit still for 5 minutes. Count your pulse for 30 seconds and double it, or read your wearable.',
    key: 'hr',
    unit: 'Beats per minute',
    flagKey: 'chestPain' as const,
    flagQ: 'Any chest pain or dizziness?',
  },
  {
    title: 'Blood pressure',
    how: 'Automatic cuff, seated, same time daily. Enter the top number first.',
    key: 'bp_sys',
    unit: 'Top number (mmHg)',
    key2: 'bp_dia',
    unit2: 'Bottom number (mmHg)',
    flagKey: null,
    flagQ: '',
  },
  {
    title: 'Body temperature',
    how: 'Forehead or ear thermometer. Rest first if you just exercised.',
    key: 'temp',
    unit: '°C',
    flagKey: null,
    flagQ: '',
  },
  {
    title: 'Sleep',
    how: 'From your tracker or best estimate. How many hours did you sleep last night?',
    key: 'sleep',
    unit: 'Hours',
    flagKey: null,
    flagQ: '',
  },
];

export default function Question() {
  const { questionStep, setQuestionStep, draft, setDraft, draftFlags, setDraftFlags, setScreen } = useHealth();
  const s = STEPS[Math.min(questionStep, STEPS.length - 1)];

  const danger = draftFlags.chestPain === true;
  const next = () => {
    if (danger) {
      setScreen('urgent');
      return;
    }
    if (questionStep + 1 >= STEPS.length) setScreen('mood');
    else setQuestionStep(questionStep + 1);
  };

  return (
    <div className="pt-4">
      <div className="flex items-center justify-between">
        <button onClick={() => (questionStep === 0 ? setScreen('checkin') : setQuestionStep(questionStep - 1))} className="min-h-[44px] text-sm font-bold text-[#2F5BEA]">
          ← Back
        </button>
        <span className="text-xs font-bold text-slate-500">Step {questionStep + 1} of 6</span>
      </div>
      <h1 className="mt-2 text-2xl font-extrabold">{s.title}</h1>

      <Card className="mt-3">
        <b>How to measure</b>
        <p className="mt-1 text-sm text-slate-600">{s.how}</p>
      </Card>

      <Card className="mt-3">
        <label className="font-bold">{s.title} ({s.unit})</label>
        <input
          type="number"
          inputMode="decimal"
          className="field-input"
          value={draft[s.key] ?? ''}
          onChange={(e) => setDraft({ ...draft, [s.key]: Number(e.target.value) })}
          aria-label={`${s.title} in ${s.unit}`}
        />
        {s.key2 && (
          <>
            <label className="font-bold">{s.title} ({s.unit2})</label>
            <input
              type="number"
              inputMode="decimal"
              className="field-input"
              value={draft[s.key2] ?? ''}
              onChange={(e) => setDraft({ ...draft, [s.key2!]: Number(e.target.value) })}
              aria-label={`${s.title} in ${s.unit2}`}
            />
          </>
        )}
      </Card>

      {s.flagKey && (
        <Card className="mt-3">
          <b>{s.flagQ}</b>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {([false, true] as boolean[]).map((b) => (
              <button
                key={String(b)}
                onClick={() => setDraftFlags({ ...draftFlags, [s.flagKey!]: b })}
                className={`min-h-[52px] rounded-xl border py-3 font-bold ${
                  (draftFlags[s.flagKey!] ?? false) === b
                    ? b
                      ? 'border-[#A32218] bg-[#FDE3E0] text-[#A32218]'
                      : 'border-[#14683F] bg-[#DDF3E7] text-[#14683F]'
                    : 'border-[#D9DFEC] bg-white text-slate-600'
                }`}
              >
                {b ? 'Yes' : 'No'}
              </button>
            ))}
          </div>
        </Card>
      )}

      <div className="mt-4">
        <BigButton onClick={next}>
          {questionStep + 1 >= STEPS.length ? 'Next: mood' : `Next: ${STEPS[questionStep + 1].title.toLowerCase()}`}
        </BigButton>
      </div>
    </div>
  );
}
