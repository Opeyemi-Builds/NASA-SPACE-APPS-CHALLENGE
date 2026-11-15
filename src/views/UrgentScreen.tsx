import { useHealth } from '../state';
import BigButton from '../components/BigButton';

// Guide Screen 9: Urgent help. Dark red, white text, large title,
// instructions, kind box, "I have told someone".
export default function UrgentScreen() {
  const { setScreen } = useHealth();
  return (
    <div className="min-h-screen bg-[#7A1710] text-white">
      <div className="mx-auto w-full max-w-[430px] px-4 pb-10 pt-8">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/10 px-4 py-1.5 text-sm font-black">
          <span aria-hidden>!</span> URGENT
        </span>
        <h1 className="mt-3 text-4xl font-black">Get help now</h1>
        <div className="mt-4 space-y-2 text-[16px] leading-relaxed">
          <p><b>1. Stop</b> what you are doing. Do not wait for the next check.</p>
          <p><b>2. Tell</b> the crew medical officer and the nearest crewmate now.</p>
          <p><b>3. Contact</b> the ground flight surgeon at the same time.</p>
          <p><b>4. Do not wait</b> for a reply before getting help on board.</p>
        </div>
        <div className="mt-5 rounded-2xl bg-white/10 p-4 text-[15px]">
          <b>If this is about how you feel:</b> please tell the crew medical officer or someone near you now.
          You do not have to handle this alone.
        </div>
        <div className="mt-6">
          <BigButton
            onClick={() => setScreen('today')}
            className="!bg-white !text-[#7A1710]"
          >
            I have told someone
          </BigButton>
        </div>
      </div>
    </div>
  );
}
