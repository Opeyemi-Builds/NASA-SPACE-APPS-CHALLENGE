/** Check-in flow: 6 grouped steps covering all 17 indicators (handover §4). */

export type FieldType = 'number' | 'slider' | 'yesno' | 'count';

export interface CheckField {
  key: string; // values key, or flags key when flag: true
  flag?: boolean;
  label: string;
  type: FieldType;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  hint?: string;
  invertLabel?: [string, string]; // [no, yes] labels for yesno
}

export interface CheckStep {
  id: string;
  title: string;
  subtitle: string;
  fields: CheckField[];
}

export const CHECK_STEPS: CheckStep[] = [
  {
    id: 'heart', title: 'Heart', subtitle: 'Resting pulse + blood pressure',
    fields: [
      { key: 'hr', label: 'Resting heart rate', type: 'number', min: 30, max: 200, unit: 'bpm', hint: 'Seated, after 5 minutes of rest. Count pulse 30s × 2, or read your wearable.' },
      { key: 'chestPain', flag: true, label: 'Any chest pain?', type: 'yesno', invertLabel: ['No', 'Yes — chest pain'] },
      { key: 'dizziness', flag: true, label: 'Any dizziness?', type: 'yesno', invertLabel: ['No', 'Yes — dizzy'] },
      { key: 'bp_sys', label: 'Blood pressure — top number', type: 'number', min: 60, max: 260, unit: 'mmHg', hint: 'Automatic cuff, seated, same time daily.' },
      { key: 'bp_dia', label: 'Blood pressure — bottom number', type: 'number', min: 30, max: 160, unit: 'mmHg' },
    ],
  },
  {
    id: 'mind', title: 'Rest & mind', subtitle: 'Sleep, mood, temperature, sugar',
    fields: [
      { key: 'sleep', label: 'Sleep last night', type: 'number', min: 0, max: 14, step: 0.5, unit: 'hours', hint: 'From your tracker or best estimate.' },
      { key: 'mood', label: 'Mood right now (10 = best)', type: 'slider', min: 1, max: 10, step: 1, hint: 'There are no wrong answers. A dip is data, not failure.' },
      { key: 'selfHarmThought', flag: true, label: 'Any thought of harming yourself?', type: 'yesno', invertLabel: ['No', 'Yes'], hint: 'Asked privately, every day — so help can reach you fast.' },
      { key: 'temp', label: 'Body temperature', type: 'number', min: 30, max: 45, step: 0.1, unit: '°C', hint: 'Forehead or ear thermometer.' },
      { key: 'sugar', label: 'Blood sugar (fasting)', type: 'number', min: 20, max: 600, unit: 'mg/dL', hint: 'Fingerstick meter, fasting.' },
      { key: 'sugarSymptoms', flag: true, label: 'Shaking, sweating or confusion?', type: 'yesno', invertLabel: ['No', 'Yes — symptoms'] },
    ],
  },
  {
    id: 'lungs', title: 'Lungs & air', subtitle: 'Oxygen, breathing, cabin CO₂',
    fields: [
      { key: 'spo2', label: 'Blood oxygen (SpO₂)', type: 'number', min: 70, max: 100, unit: '%', hint: 'Fingertip pulse oximeter.' },
      { key: 'breathDifficulty', flag: true, label: 'Difficulty breathing?', type: 'yesno', invertLabel: ['No', 'Yes — hard to breathe'] },
      { key: 'breath', label: 'Breathing rate', type: 'number', min: 4, max: 60, unit: '/min', hint: 'Count breaths for one full minute.' },
      { key: 'co2', label: 'Cabin CO₂ (daily avg)', type: 'number', min: 0, max: 6, step: 0.1, unit: 'mmHg', hint: 'Read the cabin air monitor.' },
    ],
  },
  {
    id: 'fuel', title: 'Fuel & body', subtitle: 'Food, water, weight, exercise, symptoms',
    fields: [
      { key: 'food', label: 'Food + water vs target', type: 'slider', min: 0, max: 110, step: 5, unit: '%', hint: 'From your food and drink log.' },
      { key: 'noFoodOrDrinkDay', flag: true, label: 'A full day with no food or drink?', type: 'yesno', invertLabel: ['No', 'Yes'] },
      { key: 'weight_kg', label: 'Body mass', type: 'number', min: 30, max: 150, step: 0.1, unit: 'kg', hint: 'Body-mass device, weekly.' },
      { key: 'exercise', label: 'Exercise today', type: 'number', min: 0, max: 300, unit: 'min', hint: 'Plan is 120 min/day. Log equipment time.' },
      { key: 'injury', flag: true, label: 'Any injury during exercise?', type: 'yesno', invertLabel: ['No', 'Yes — injured'] },
      { key: 'symptoms', label: 'Symptoms (sore throat, cough, rash, headache, nausea)', type: 'count', min: 0, max: 5, hint: 'Tick count from the list.' },
      { key: 'severeSymptom', flag: true, label: 'Any symptom severe or worsening 48h?', type: 'yesno', invertLabel: ['No', 'Yes — severe'] },
    ],
  },
  {
    id: 'shield', title: 'Shield', subtitle: 'Radiation dose',
    fields: [
      { key: 'radiation', label: 'Career radiation total', type: 'number', min: 0, max: 600, step: 1, unit: 'mSv', hint: 'Personal dosimeter. NASA career limit: 600.' },
      { key: 'solarStormAlert', flag: true, label: 'Solar storm alert active?', type: 'yesno', invertLabel: ['No', 'Yes — storm alert'] },
      { key: 'stormDoseNear250', flag: true, label: 'Storm dose nearing 250 mSv?', type: 'yesno', invertLabel: ['No', 'Yes'] },
    ],
  },
  {
    id: 'senses', title: 'Senses', subtitle: 'Vision, reactions, pain',
    fields: [
      { key: 'vision_worse', label: 'Eye chart vs your baseline', type: 'count', min: 0, max: 4, hint: 'How many lines worse? 0 = same as usual.' },
      { key: 'newBlurOrHeadache', flag: true, label: 'New blur or headaches?', type: 'yesno', invertLabel: ['No', 'Yes'] },
      { key: 'faintOrConfusion', flag: true, label: 'Fainting or confusion?', type: 'yesno', invertLabel: ['No', 'Yes'] },
      { key: 'suddenVisionChange', flag: true, label: 'Sudden vision change?', type: 'yesno', invertLabel: ['No', 'Yes'] },
      { key: 'reaction_slower', label: 'Reaction test vs baseline', type: 'slider', min: 0, max: 100, step: 5, unit: '% slower', hint: '3-minute tap test. 0 = your usual speed.' },
      { key: 'manyReactionMisses', flag: true, label: 'Many missed taps?', type: 'yesno', invertLabel: ['No', 'Yes'] },
      { key: 'pain', label: 'Pain (0 = none, 10 = worst)', type: 'slider', min: 0, max: 10, step: 1, hint: 'Tap the body figure in Today to mark where.' },
      { key: 'suddenSeverePain', flag: true, label: 'Sudden severe pain?', type: 'yesno', invertLabel: ['No', 'Yes — sudden + severe'] },
    ],
  },
];
