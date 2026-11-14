import { INDICATORS, INDICATOR_MAP } from '../data/indicators';
import type { DayEvaluation, DayReading, Zone } from '../types';
import { fmtValue } from '../lib/format';
import { STATUS_MESSAGES } from '../data/content';
import StatusBadge from './StatusBadge';
import TrendChart from './TrendChart';

interface Props {
  zone: Zone;
  evaluation: DayEvaluation;
  days: DayReading[];
  baseline: Record<string, number>;
  wobble: Record<string, number>;
  startWeightKg: number;
  onClose: () => void;
}

const chartKey = (id: string) =>
  id === 'bp' ? 'bp_sys' : id === 'weight' ? 'weight_kg' : id === 'vision' ? 'vision_worse' : id === 'reaction' ? 'reaction_slower' : id;

const ESCALATION: Record<string, string> = {
  Normal: 'Nobody needs to be told. Carry on with the routine.',
  Watch:
    'Just you for now — take the self-care step below and measure again. Tell the crew medical officer if it stays Watch tomorrow.',
  Alert:
    'Tell the crew medical officer first, then send your readings to the ground flight surgeon — do not wait for a reply before starting self-care.',
  Urgent:
    'Stop and get help now. Crew medical officer + nearby crew + ground flight surgeon, all at once.',
};

export default function ZonePanel({ zone, evaluation, days, baseline, wobble, startWeightKg, onClose }: Props) {
  const inds = INDICATORS.filter((i) => i.zone === zone);
  const zoneStatus = evaluation.zoneStatus[zone];
  const zoneMsg = STATUS_MESSAGES[zoneStatus];
  const readings = days.find((d) => d.day === evaluation.day)?.values ?? {};
  const trouble = inds.filter((i) => evaluation.results[i.id]?.status !== 'Normal');

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${zone} health detail`}
    >
      <div
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-cyan-300/20 bg-[#0a1330] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-slate-100 shadow-[0_0_60px_rgba(34,211,238,0.15)] sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="mb-1 flex items-start justify-between gap-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-300/70">
              Region focus · Day {evaluation.day}
            </p>
            <h2 className="mt-1 flex flex-wrap items-center gap-2 text-2xl font-bold text-white">
              {zone} <StatusBadge status={zoneStatus} size="sm" />
            </h2>
            <p className="mt-1 text-sm font-semibold text-slate-200">{zoneMsg.title}</p>
            <p className="mt-0.5 text-[13px] text-slate-400">
              {trouble.length === 0
                ? `All ${inds.length} indicator${inds.length === 1 ? '' : 's'} in this region read Normal.`
                : `${trouble.length} of ${inds.length} indicator${inds.length === 1 ? '' : 's'} need${trouble.length === 1 ? 's' : ''} attention.`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] shrink-0 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-bold text-slate-200"
          >
            Close
          </button>
        </div>

        {/* escalation strip */}
        <div
          className={`mt-3 rounded-2xl border p-3 text-[13px] leading-relaxed ${
            zoneStatus === 'Normal'
              ? 'border-green-400/30 bg-green-400/10 text-green-100'
              : zoneStatus === 'Watch'
                ? 'border-yellow-400/30 bg-yellow-400/10 text-yellow-100'
                : 'border-red-400/40 bg-red-500/10 text-red-100'
          }`}
        >
          <b className="mr-1.5">Who to tell:</b>
          {ESCALATION[zoneStatus]}
        </div>

        {/* per-indicator cards */}
        <div className="mt-4 space-y-3">
          {inds.map((ind) => {
            const r = evaluation.results[ind.id];
            const ck = chartKey(ind.id);
            return (
              <div
                key={ind.id}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-bold text-white">{ind.name}</div>
                    <div className="mt-0.5 text-lg font-extrabold text-cyan-100">
                      {fmtValue(ind.id, readings, startWeightKg)}
                    </div>
                    {r.note && <div className="mt-1 text-[13px] text-slate-300">{r.note}</div>}
                    {r.needsRepeat && (
                      <div className="mt-1 text-[13px] font-bold text-yellow-300">
                        Repeat this reading after 5 minutes of rest.
                      </div>
                    )}
                    {!r.note && r.status === 'Normal' && (
                      <div className="mt-1 text-[13px] text-slate-400">Within expected range for this astronaut.</div>
                    )}
                  </div>
                  <StatusBadge status={r.status} />
                </div>

                <div className="mt-3 rounded-xl border border-white/10 bg-[#060b1d] p-2">
                  <TrendChart indicatorId={ind.id} days={days} baseline={baseline[ck] ?? null} wobble={wobble[ck] ?? null} />
                  <div className="mt-1 px-1 text-xs text-slate-500">
                    Shaded band = personal normal (first 7 days) · {INDICATOR_MAP[ind.id].unit}
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 text-sm text-slate-300">
                  <div>
                    <b className="text-slate-100">Why flagged:</b>{' '}
                    {r.status === 'Normal' ? 'Not flagged — reading matches limits and personal baseline.' : (ind.plain + ' ' + (r.note ?? ''))}
                  </div>
                  <div>
                    <b className="text-slate-100">Recommendation:</b> {ind.watchAction}
                  </div>
                  <div className="text-[13px] text-slate-400">
                    <b className="text-slate-200">Escalate to:</b> {ind.who}
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {ind.hazards.map((h) => (
                      <span
                        key={h}
                        className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-semibold text-slate-300"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-slate-500">Source: {ind.source}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
