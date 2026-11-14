/** Shared domain types for Astro Health Companion. */

export type Status = 'Normal' | 'Watch' | 'Alert' | 'Urgent';

export const STATUS_ORDER: Record<Status, number> = {
  Normal: 0,
  Watch: 1,
  Alert: 2,
  Urgent: 3,
};

export function worst(a: Status, b: Status): Status {
  return STATUS_ORDER[a] >= STATUS_ORDER[b] ? a : b;
}

export function worstOf(list: Status[]): Status {
  return list.reduce<Status>((acc, s) => worst(acc, s), 'Normal');
}

export type Zone =
  | 'Head and brain'
  | 'Eyes'
  | 'Heart'
  | 'Lungs'
  | 'Stomach and gut'
  | 'Bones and muscles'
  | 'Whole body';

/** Escalation audience groups (handover §7.3). */
export type Group = 'A' | 'B' | 'C' | 'D';

export interface Indicator {
  id: string;
  name: string;
  unit: string;
  zone: Zone;
  group: Group;
  priority: 'Core' | 'High' | 'Optional';
  hazards: string[];
  how: string;
  plain: string;
  watchAction: string;
  who: string;
  source: string;
}

/** One day of readings. Keys are indicator ids; bp uses sys/dia pair. */
export interface DayReading {
  day: number; // 1..14
  values: Record<string, number>;
  flags: {
    chestPain?: boolean;
    dizziness?: boolean;
    breathDifficulty?: boolean;
    faintOrConfusion?: boolean;
    suddenVisionChange?: boolean;
    selfHarmThought?: boolean;
    sugarSymptoms?: boolean; // shaking / sweating / confusion with low sugar
    suddenSeverePain?: boolean;
    severeSymptom?: boolean;
    solarStormAlert?: boolean;
    stormDoseNear250?: boolean;
    newBlurOrHeadache?: boolean;
    manyReactionMisses?: boolean;
    noFoodOrDrinkDay?: boolean;
    injury?: boolean;
    lowMoodDays?: number; // consecutive low-mood days (for mood Alert rule)
    lowSleepNights?: number; // consecutive <6h nights (for sleep Alert rule)
    bpRepeat?: boolean; // repeat BP reading confirmed an Alert-range value
  };
}

export interface IndicatorResult {
  id: string;
  status: Status;
  note?: string;
  needsRepeat?: boolean;
}

export interface DayEvaluation {
  day: number;
  results: Record<string, IndicatorResult>;
  zoneStatus: Record<Zone, Status>;
  overall: Status;
  patternTriggered: boolean;
  urgentReason: string | null;
}
