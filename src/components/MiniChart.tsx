// Guide Step 4: line chart as a plain SVG polyline + light green normal band.
export default function MiniChart({
  history,
  normalLow,
  normalHigh,
}: {
  history: number[];
  normalLow: number;
  normalHigh: number;
}) {
  const W = 280;
  const H = 90;
  const PAD = 8;
  const xs = history.filter((v) => typeof v === 'number' && Number.isFinite(v));
  if (xs.length === 0) return <p className="text-sm text-slate-500">No readings yet.</p>;
  const lo = Math.min(...xs, normalLow);
  const hi = Math.max(...xs, normalHigh);
  const span = hi - lo || 1;
  const y = (v: number) => H - PAD - ((v - lo) / span) * (H - PAD * 2);
  const x = (i: number) => PAD + (i / Math.max(xs.length - 1, 1)) * (W - PAD * 2);
  const pts = xs.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Recent readings with your normal range">
      {/* normal band */}
      <rect
        x={0}
        y={y(normalHigh)}
        width={W}
        height={Math.max(y(normalLow) - y(normalHigh), 2)}
        fill="#DDF3E7"
      />
      <polyline points={pts} fill="none" stroke="#2F5BEA" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      {xs.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r={3.5} fill="#2F5BEA" />
      ))}
    </svg>
  );
}
