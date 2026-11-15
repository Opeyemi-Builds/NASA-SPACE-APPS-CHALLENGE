import { useHealth } from '../state';
import Card from '../components/Card';
import BigButton from '../components/BigButton';

// Guide Screen 3: check-in list. 6 questions, first shows Next, rest To do.
const QUESTIONS = [
  'Heart rate',
  'Blood pressure',
  'Body temperature',
  'Sleep',
  'Mood',
  'Reaction test',
];

export default function CheckinList() {
  const { setScreen, setQuestionStep, setDraft, setDraftFlags, days, day } = useHealth();
  const start = () => {
    const cur = days.find((d) => d.day === day)!;
    setDraft({ ...cur.values });
    setDraftFlags({ ...cur.flags });
    setQuestionStep(0);
    setScreen('question');
  };
  return (
    <div className="pt-4">
      <h1 className="text-2xl font-extrabold">Daily check-in</h1>
      <p className="text-sm text-slate-500">About 4 minutes.</p>
      <Card className="mt-3">
        <ol className="space-y-2">
          {QUESTIONS.map((q, i) => (
            <li key={q} className="flex items-center justify-between gap-2 rounded-xl bg-[#F4F6FB] px-3 py-2.5 text-[15px]">
              <span><b className="mr-2">{i + 1}.</b>{q}</span>
              {i === 0 ? (
                <span className="rounded-full bg-[#DDF3E7] px-3 py-1 text-xs font-extrabold text-[#14683F]">Next</span>
              ) : (
                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500">To do</span>
              )}
            </li>
          ))}
        </ol>
      </Card>
      <p className="mt-2 text-sm text-slate-500">Blood sugar is weekly and not due today.</p>
      <div className="mt-3">
        <BigButton onClick={start}>Start with heart rate</BigButton>
      </div>
    </div>
  );
}
