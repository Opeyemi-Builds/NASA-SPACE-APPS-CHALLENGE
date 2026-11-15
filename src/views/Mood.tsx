import { useHealth } from '../state';
import Card from '../components/Card';
import BigButton from '../components/BigButton';

// Guide Screen 5: mood slider 1-10 + self-harm question (Yes -> Urgent).
export default function Mood() {
  const { draft, setDraft, draftFlags, setDraftFlags, setScreen, setQuestionStep } = useHealth();
  const mood = draft['mood'] ?? 7;
  const next = () => {
    if (draftFlags.selfHarmThought) {
      setScreen('urgent');
      return;
    }
    setScreen('reaction');
  };
  return (
    <div className="pt-4">
      <div className="flex items-center justify-between">
        <button onClick={() => { setQuestionStep(3); setScreen('question'); }} className="min-h-[44px] text-sm font-bold text-[#2F5BEA]">
          ← Back
        </button>
        <span className="text-xs font-bold text-slate-500">Step 5 of 6</span>
      </div>
      <h1 className="mt-2 text-2xl font-extrabold">Mood and stress</h1>

      <Card className="mt-3 text-center">
        <b>How do you feel today?</b>
        <div className="my-2 text-5xl font-black">{mood}</div>
        <input
          type="range" min={1} max={10} step={1}
          value={mood}
          onChange={(e) => setDraft({ ...draft, mood: Number(e.target.value) })}
          className="w-full" aria-label="Mood from 1 to 10"
        />
        <p className="text-xs text-slate-500">1 is very low, 10 is very good.</p>
      </Card>

      <Card className="mt-3">
        <b>Any thoughts of harming yourself?</b>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {([false, true] as boolean[]).map((b) => (
            <button
              key={String(b)}
              onClick={() => setDraftFlags({ ...draftFlags, selfHarmThought: b })}
              className={`min-h-[52px] rounded-xl border py-3 font-bold ${
                (draftFlags.selfHarmThought ?? false) === b
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

      <div className="mt-4">
        <BigButton onClick={next}>Next: reaction test</BigButton>
      </div>
    </div>
  );
}
