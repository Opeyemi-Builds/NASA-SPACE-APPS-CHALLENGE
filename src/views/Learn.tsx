import { useState } from 'react';
import { HAZARDS } from '../data/hazards';
import { INDICATORS } from '../data/indicators';
import { DELAY_NOTE } from '../data/content';
import Card from '../components/Card';

// Extras for later: short explanations of the 5 hazards and each reading, plus sources.
export default function Learn() {
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <div className="pt-4">
      <h1 className="text-2xl font-extrabold">Learn</h1>
      <p className="text-sm text-slate-500">Plain words. No medical jargon.</p>

      <Card className="mt-3">
        <b>Why the app acts without Earth</b>
        <p className="mt-1 text-sm text-slate-600">{DELAY_NOTE}</p>
      </Card>

      <h2 className="mt-4 text-lg font-extrabold">The 5 hazards of spaceflight</h2>
      <div className="mt-2 space-y-2">
        {HAZARDS.map((h) => (
          <Card key={h.name}>
            <b>{h.name}</b>
            <p className="mt-1 text-sm text-slate-600">{h.short}</p>
            <p className="mt-1 text-[13px] text-slate-500"><b>Watched by:</b> {h.indicators}</p>
          </Card>
        ))}
      </div>

      <h2 className="mt-4 text-lg font-extrabold">Every reading, in plain words</h2>
      <div className="mt-2 space-y-2">
        {INDICATORS.map((i) => {
          const open = openId === i.id;
          return (
            <Card key={i.id}>
              <button
                onClick={() => setOpenId(open ? null : i.id)}
                aria-expanded={open}
                className="flex min-h-[48px] w-full items-center justify-between gap-2 text-left"
              >
                <b>{i.name}</b>
                <span className="font-black text-[#2F5BEA]">{open ? '−' : '+'}</span>
              </button>
              {open && (
                <div className="mt-1 space-y-1.5 border-t border-[#D9DFEC] pt-2 text-sm text-slate-600">
                  <p><b>What it is:</b> {i.plain}</p>
                  <p><b>How to measure:</b> {i.how}</p>
                  <p><b>If Watch:</b> {i.watchAction}</p>
                  <p><b>Who to tell:</b> {i.who}</p>
                  <p className="text-xs text-slate-500">Source: {i.source}</p>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <h2 className="mt-4 text-lg font-extrabold">Sources</h2>
      <Card className="mt-2">
        <ul className="space-y-1 text-xs">
          {Array.from(new Set(HAZARDS.flatMap((h) => h.sources))).map((s) => (
            <li key={s}><a href={s} target="_blank" rel="noreferrer" className="font-semibold text-[#2F5BEA]">{s}</a></li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
