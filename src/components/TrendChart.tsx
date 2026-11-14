import { useMemo } from 'react';
import {
  Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import type { DayReading } from '../types';
import { seriesValue } from '../lib/format';

interface Props {
  indicatorId: string;
  days: DayReading[];
  baseline: number | null;
  wobble: number | null;
  height?: number;
}

/** 14-day trend with the astronaut's own normal band shaded. */
export default function TrendChart({ indicatorId, days, baseline, wobble, height = 150 }: Props) {
  const data = useMemo(
    () =>
      days.map((d) => {
        const v = seriesValue(indicatorId, d.values);
        const lo = baseline != null && wobble != null ? baseline - wobble : null;
        const hi = baseline != null && wobble != null ? baseline + wobble : null;
        return { day: `D${d.day}`, v, lo, diff: lo != null && hi != null ? hi - lo : null };
      }),
    [days, indicatorId, baseline, wobble],
  );
  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 6, right: 6, bottom: 0, left: -18 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 10 }} interval={1} />
          <YAxis tick={{ fill: '#64748b', fontSize: 10 }} domain={['auto', 'auto']} width={44} />
          <Tooltip
            contentStyle={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 10, fontSize: 12 }}
            labelStyle={{ color: '#0f172a' }}
          />
          <Area type="monotone" dataKey="lo" stackId="band" stroke="none" fill="transparent" />
          <Area type="monotone" dataKey="diff" stackId="band" stroke="none" fill="#4f46e5" fillOpacity={0.12} name="Your normal" />
          <Line type="monotone" dataKey="v" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 2 }} name="Reading" connectNulls />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
