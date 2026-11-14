/** The five NASA Human Research Program hazards (handover §7.4). */

export interface Hazard {
  name: string;
  short: string;
  indicators: string;
  sources: string[];
}

export const HAZARDS: Hazard[] = [
  {
    name: 'Space radiation',
    short:
      'Damages DNA, raises cancer risk, and can affect the nervous system, heart, blood vessels and eyes. Dose is measured with personal dosimeters.',
    indicators: 'Radiation dose, Symptoms, Temperature, Heart rate, Blood pressure',
    sources: [
      'https://www.nasa.gov/hrp/radiation/space-radiation-miniseries/',
      'https://www.nasa.gov/reference/risk-of-radiation-induced-cancers/',
    ],
  },
  {
    name: 'Isolation and confinement',
    short:
      'Long stays in a small space change behaviour. Sleep loss and overwork lower performance, with risks of anxiety, low mood and poorer decisions.',
    indicators: 'Mood and stress, Sleep, Reaction time, Food and water',
    sources: [
      'https://www.nasa.gov/hrp/hazard-isolation-and-confinement/',
      'https://www.nasa.gov/reference/risk-of-behavioral-changes-and-psychiatric-disorders/',
    ],
  },
  {
    name: 'Distance from Earth',
    short:
      'Help, supplies and medical care get harder to reach. Mars is months away, with up to ~20 minutes of one-way radio delay.',
    indicators: 'Food and water, Weight, and every escalation rule (crew must act first)',
    sources: ['https://www.nasa.gov/hrp/hazard-distance-from-earth/'],
  },
  {
    name: 'Gravity fields',
    short:
      'Bones, muscles, heart and inner ear adjust. Bones lose ~1–1.5% density a month on 4–6 month missions. Fluids shift headward (SANS). Mars gravity ≈ ⅜ Earth’s.',
    indicators: 'Exercise, Heart rate, Blood pressure, Pain, Vision, Weight',
    sources: [
      'https://www.nasa.gov/hrp/hazard-gravity-fields/',
      'https://www.nasa.gov/reference/risk-of-spaceflight-induced-bone-changes/',
      'https://www.nasa.gov/reference/risk-of-spaceflight-associated-neuro-ocular-syndrome-sans/',
    ],
  },
  {
    name: 'Hostile closed environments',
    short:
      'A sealed spacecraft means managed air (CO₂, chemicals), noise, germs and cramped quarters — disturbing sleep and the immune system.',
    indicators: 'Blood oxygen, Breathing rate, Cabin CO₂, Temperature, Symptoms, Sleep',
    sources: [
      'https://www.nasa.gov/hrp/hazard-hostile-closed-environments/',
      'https://www.nasa.gov/directorates/esdmd/hhp/risk-of-hearing-loss-and-performance-decrements-due-to-acoustics-issues-in-space/',
    ],
  },
];
