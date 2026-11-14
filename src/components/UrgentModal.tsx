const STEPS = [
  'Stop what you are doing. Do not wait for the next check.',
  'Tell the crew medical officer and nearby crew straight away.',
  'Send your readings to the ground flight surgeon at the same time.',
  'Keep doing the self-care steps for the affected indicator while you wait.',
];

const TRIGGERS = [
  'Chest pain or difficulty breathing',
  'Blood oxygen below 90%',
  'Blood pressure 180/120 or higher',
  'Severe or sudden pain',
  'Fainting, confusion or a sudden vision change',
  'Any thought of harming yourself',
  'Blood sugar below 70 with shaking, sweating or confusion',
];

export default function UrgentModal({ reason, onClose }: { reason: string | null; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4" onClick={onClose}>
      <div className="card w-full max-w-lg border-2 border-red-400 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="anim-blink rounded-2xl bg-red-600 px-4 py-3 text-center text-2xl font-black text-white">
          URGENT — GET HELP NOW
        </div>
        {reason && <p className="mt-3 text-center font-bold text-red-700">Trigger: {reason}</p>}
        <ol className="mt-4 list-decimal space-y-2 pl-6 text-[15px] text-slate-800">
          {STEPS.map((s) => <li key={s}>{s}</li>)}
        </ol>
        <div className="mt-4 rounded-2xl bg-slate-100 p-3 text-sm text-slate-700">
          <b className="text-slate-900">If low mood / self-harm:</b> Please tell the crew medical officer or someone near you now.
          You do not have to handle this alone.
        </div>
        <details className="mt-3 text-sm text-slate-600">
          <summary className="cursor-pointer font-bold text-slate-800">All urgent triggers</summary>
          <ul className="mt-2 list-disc pl-5">{TRIGGERS.map((t) => <li key={t}>{t}</li>)}</ul>
        </details>
        <button
          onClick={onClose}
          className="btn-primary mt-5 w-full"
          autoFocus
          onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
        >
          Understood — show me what to do
        </button>
      </div>
    </div>
  );
}
