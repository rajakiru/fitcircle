'use client';

import { useState } from 'react';
import { B_COLORS } from '@/lib/colors';
import TabBar from './TabBar';
import TodayScreen from './TodayScreen';
import FeedScreen from './FeedScreen';
import TrendsScreen from './TrendsScreen';

type Tab = 'today' | 'feed' | 'stats';

const INITIAL_CHECKED: Record<string, boolean> = {
  metab:   true,
  protein: true,
  nuts:    false,
  veg:     true,
  fruit:   true,
  nosugar: false,
  water:   false,
  meals3:  true,
  dinner8: true,
  if:      true,
  sleep:   true,
  exercise: false,
  steps:   true,
  nophone: false,
};

export default function FitCircleApp() {
  const [tab, setTab] = useState<Tab>('today');
  const [checked, setChecked] = useState<Record<string, boolean>>(INITIAL_CHECKED);
  const [reactions, setReactions] = useState<Record<string, string[]>>({});

  const toggle = (id: string) => setChecked(c => ({ ...c, [id]: !c[id] }));

  const addReaction = (postId: string, r: string) => {
    setReactions(rx => {
      const cur = rx[postId] ?? [];
      return { ...rx, [postId]: cur.includes(r) ? cur.filter(x => x !== r) : [...cur, r] };
    });
  };

  return (
    <div style={{
      height: '100%',
      background: B_COLORS.bg,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {tab === 'today' && (
          <TodayScreen checked={checked} toggle={toggle} showNudge={true} />
        )}
        {tab === 'feed' && (
          <FeedScreen reactions={reactions} addReaction={addReaction} />
        )}
        {tab === 'stats' && (
          <TrendsScreen />
        )}
      </div>
      <TabBar active={tab} onChange={setTab} />
    </div>
  );
}
