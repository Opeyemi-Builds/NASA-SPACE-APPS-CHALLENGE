# Astro Health Companion

NASA Space Apps Challenge 2026 — **Challenge 4**: *Create Health Monitoring Software for Astronauts on Space Missions.*

An astronaut health companion that **learns each person's normal, spots drift early, and tells them what to do next** — even when Earth can't answer for 20 minutes.

**Stack:** React 19 · TypeScript · Vite · Tailwind CSS v4 · three.js (react-three-fiber) · framer-motion · recharts · PWA (offline-first). No backend, no database — everything runs on device.

## Run it

```bash
npm install
npm run dev      # local demo
npm run build    # typecheck + production build (dist/)
```

Open the landing page and press **Enter App**. No login, no onboarding.

## The 3-minute demo story (guaranteed beats)

| Day | What happens |
|-----|--------------|
| **7** | All green — baseline locks (first 7 days = your normal) |
| **10** | 2nd short night — Sleep + Head/brain zone turn Watch |
| **11** | 3rd night under 6 h — Sleep goes to Alert |
| **12** | Mood + heart + exercise join Watch — pattern rule fires — overall **Alert** |

Drag the **demo day slider** (Day 1–14) in Today to replay it. Drag the 3D body to rotate it, click a glowing marker or any body part for charts + guidance.

## How it decides (`src/lib/rules.ts` — pure logic, zero UI)

- **Baseline** = mean of days 1–7; **wobble** = spread. Weight uses the day-1 reading.
- **Limits** map each reading to Normal / Watch / Alert / Urgent per the handover table, plus edge rules (BP repeat readings, 35.0–36.0 C Watch band, single low food days stay Normal, dizziness + heart rate raises Alert, and more).
- **Drift** raises Watch when a reading sits more than ~2 wobbles off baseline, or slides the same direction 3 days running.
- **Pattern rule**: 3+ Watch readings on one day raise the overall status to **Alert** — small signs add up.
- **Urgent triggers** force Urgent and open the red action sheet from anywhere in the app.

## Prove it

Open the **Tests tab** in the app — every handover test case executes live against the engine (limits, self-harm thought to Urgent, pattern rule, demo beats).

## Deploy

Static only. `npm run build`, then host `dist/` on GitHub Pages (workflow included), Vercel, or Netlify. The service worker keeps it working in airplane mode. Test on a phone + slow connection before the demo.

## Disclaimer

All readings are **invented demo numbers**. Wording and limits are condensed from the team's research sheet; verified against Mayo Clinic, AHA, CDC/ADA, NASA HRP hazards & risks, and NASA-STD-3001 where noted in `src/data/indicators.ts`. **Demonstration software — not medical advice** (banner on every screen).
