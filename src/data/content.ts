/** Escalation copy per overall status (handover §6.6). */
export const STATUS_MESSAGES: Record<string, { title: string; body: string; who: string }> = {
  Normal: {
    title: 'Carry on with the routine.',
    body: 'Inside the usual range and close to your own baseline. Nothing to act on.',
    who: 'Nobody needs to be told.',
  },
  Watch: {
    title: 'Take one simple self-care step and measure again later.',
    body: 'Slightly outside the range, or drifting from your own baseline over days. The zone panel shows the exact step.',
    who: 'Just you — log it and re-check.',
  },
  Alert: {
    title: 'Tell the crew medical officer first.',
    body: 'Clearly outside the range, or watch-level signs that keep going. Send your readings to the ground flight surgeon at the same time — do not wait for a reply before starting self-care.',
    who: 'Crew medical officer first + ground flight surgeon (see indicator group).',
  },
  Urgent: {
    title: 'Stop and get help now. Do not wait for the next check.',
    body: 'Possible emergency. Tell the crew medical officer and nearby crew straight away, and the ground flight surgeon at the same time.',
    who: 'Crew medical officer + nearby crew + ground flight surgeon, all at once.',
  },
};

/** Comms-delay explainer for Learn + Alert screens. */
export const DELAY_NOTE =
  'Radio delay is about 1–2 seconds to the Moon and up to ~20 minutes one-way to Mars — so the app gives clear first steps on board instead of waiting for Earth.';
