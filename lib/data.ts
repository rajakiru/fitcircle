export type Group = 'nutrition' | 'rhythm' | 'body' | 'mind';

export type ChecklistItem = {
  id: string;
  label: string;
  group: Group;
};

export type Member = {
  id: string;
  name: string;
  initials: string;
  tint: string;
  streak: number;
  donePct: number;
};

export type FeedPost = {
  id: string;
  who: string;
  when: string;
  kind: 'meal' | 'streak' | 'weigh';
  caption: string;
  reactions: Record<string, number>;
  label?: string;
  bg?: string;
  doneToday?: number;
  streak?: number;
  weight?: number;
  delta?: string;
};

export type WeightPoint = { w: string; kg: number; waist: number };
export type DayHistory = { day: string; done: number };

export const CHECKLIST_ITEMS: ChecklistItem[] = [
  { id: 'metab',   label: 'Metabolism booster',         group: 'nutrition' },
  { id: 'protein', label: 'Protein source',             group: 'nutrition' },
  { id: 'nuts',    label: 'Nuts and seeds',             group: 'nutrition' },
  { id: 'veg',     label: 'Vegetable',                  group: 'nutrition' },
  { id: 'fruit',   label: 'Fruits',                     group: 'nutrition' },
  { id: 'nosugar', label: 'No sugar · no fried food',   group: 'nutrition' },
  { id: 'water',   label: 'Water 2–3 litres',           group: 'nutrition' },
  { id: 'meals3',  label: '3 meals',                    group: 'nutrition' },
  { id: 'dinner8', label: 'Dinner before 8 PM',         group: 'rhythm'    },
  { id: 'if',      label: 'Intermittent fasting',       group: 'rhythm'    },
  { id: 'sleep',   label: '7–8 hrs sleep before 11 PM', group: 'rhythm'    },
  { id: 'exercise', label: 'Exercise 30 mins',          group: 'body'      },
  { id: 'steps',   label: 'Daily 5K steps',             group: 'body'      },
  { id: 'nophone', label: 'No phone for 30 mins',       group: 'mind'      },
];

export const GROUP: Member[] = [
  { id: 'me',      name: 'Maya',    initials: 'MY', tint: '#FFD6E0', streak: 12, donePct: 71 },
  { id: 'priya',   name: 'Priya',   initials: 'PR', tint: '#D6F5E0', streak: 18, donePct: 85 },
  { id: 'deepa',   name: 'Deepa',   initials: 'DE', tint: '#FFF3D6', streak: 21, donePct: 93 },
  { id: 'anitha',  name: 'Anitha',  initials: 'AN', tint: '#D6E4FF', streak:  7, donePct: 50 },
  { id: 'kavitha', name: 'Kavitha', initials: 'KA', tint: '#F5D6FF', streak:  9, donePct: 64 },
  { id: 'sunita',  name: 'Sunita',  initials: 'SU', tint: '#D6F0FF', streak: 15, donePct: 78 },
];

export const FEED: FeedPost[] = [
  {
    id: 'f1', who: 'priya', when: '2h ago', kind: 'meal', label: 'LUNCH',
    bg: 'linear-gradient(135deg, #a8edaa 0%, #5cb85c 50%, #3a8a3a 100%)',
    doneToday: 11,
    caption: 'Big bowl of daal, salad and brown rice. Feeling clean 🌿',
    reactions: { '🔥': 3, '👏': 2, '💚': 5 },
  },
  {
    id: 'f2', who: 'deepa', when: '4h ago', kind: 'streak', streak: 21,
    caption: 'Three weeks and not a single miss. This group keeps me going 💪',
    reactions: { '🔥': 8, '👏': 6, '💚': 4 },
  },
  {
    id: 'f3', who: 'kavitha', when: '6h ago', kind: 'weigh', weight: 67.8, delta: '−0.4',
    caption: 'Down again this week. Dinners before 8 PM really make a difference.',
    reactions: { '🔥': 2, '👏': 4, '💚': 7 },
  },
  {
    id: 'f4', who: 'sunita', when: 'Yesterday', kind: 'meal', label: 'BREAKFAST',
    bg: 'linear-gradient(135deg, #f7d4b8 0%, #e8a87c 50%, #c9806d 100%)',
    doneToday: 9,
    caption: 'Oats with fruit and a hard boiled egg. Simple but satisfying.',
    reactions: { '🔥': 1, '👏': 3, '💚': 2 },
  },
];

export const WEIGHT_TRACK: WeightPoint[] = [
  { w: 'W1', kg: 73.1, waist: 88.0 },
  { w: 'W2', kg: 72.8, waist: 87.5 },
  { w: 'W3', kg: 72.4, waist: 87.0 },
  { w: 'W4', kg: 72.1, waist: 86.0 },
  { w: 'W5', kg: 71.9, waist: 85.5 },
  { w: 'W6', kg: 71.7, waist: 85.0 },
  { w: 'W7', kg: 71.5, waist: 84.5 },
  { w: 'W8', kg: 71.2, waist: 84.0 },
];

export const WEEK_HISTORY: DayHistory[] = [
  { day: 'M', done: 12 },
  { day: 'T', done: 11 },
  { day: 'W', done: 10 },
  { day: 'T', done: 13 },
  { day: 'F', done: 11 },
  { day: 'S', done: 14 },
  { day: 'S', done:  9 },
];
