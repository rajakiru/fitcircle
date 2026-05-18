'use client';

import { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { B_COLORS } from '@/lib/colors';
import { CHECKLIST_ITEMS } from '@/lib/data';
import { todayISO } from '@/lib/storage';
import {
  getSupabase, onAuthChange, getProfile, upsertProfile,
  getDailyLog, saveDailyLog,
} from '@/lib/supabase';
import TabBar, { type Tab } from './TabBar';
import TodayScreen from './TodayScreen';
import FeedScreen from './FeedScreen';
import HistoryScreen from './HistoryScreen';
import ProfileScreen from './ProfileScreen';
import LoginScreen from './LoginScreen';
import OnboardingScreen from './OnboardingScreen';
import LoadingScreen from './LoadingScreen';
import SetPasswordScreen from './SetPasswordScreen';

type Phase = 'loading' | 'auth' | 'onboarding' | 'app' | 'set_password';

function buildEmpty(): Record<string, boolean> {
  return Object.fromEntries(CHECKLIST_ITEMS.map(i => [i.id, false]));
}

export default function FitCircleApp() {
  const [phase, setPhase] = useState<Phase>('loading');
  const [userId, setUserId] = useState<string | null>(null);
  const [groupId, setGroupId] = useState<string | null>(null);

  const [tab, setTab] = useState<Tab>('today');
  const [currentDate, setCurrentDate] = useState<string>(todayISO());
  const [checked, setChecked] = useState<Record<string, boolean>>(buildEmpty);

  // Auth listener
  useEffect(() => {
    async function resolveUser(uid: string) {
      try {
        let profile = await getProfile(uid);
        if (!profile) {
          await upsertProfile(uid, { name: '', tint: '#0F4C3A' });
          profile = await getProfile(uid);
        }
        if (!profile?.name) {
          setPhase('onboarding');
        } else {
          setGroupId(profile.group_id);
          setPhase('app');
        }
      } catch (e) {
        console.error('resolveUser error:', e);
        setPhase('onboarding');
      }
    }

    const { data: { subscription } } = onAuthChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setPhase('set_password');
      } else if (!session) {
        setUserId(null);
        setGroupId(null);
        setPhase('auth');
      } else {
        setUserId(session.user.id);
        resolveUser(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load daily log from Supabase when userId or date changes
  useEffect(() => {
    if (!userId) return;
    getDailyLog(userId, currentDate).then(items => {
      setChecked(items ?? buildEmpty());
    });
  }, [userId, currentDate]);

  const toggle = (id: string) => {
    if (!userId) return;
    setChecked(prev => {
      const next = { ...prev, [id]: !prev[id] };
      saveDailyLog(userId, currentDate, next);
      return next;
    });
  };

  const navigateDate = async (date: string) => {
    if (userId) await saveDailyLog(userId, currentDate, checked);
    setCurrentDate(date);
  };

  const jumpToDate = (date: string) => {
    navigateDate(date);
    setTab('today');
  };

  const handleOnboardingComplete = async () => {
    if (!userId) return;
    const profile = await getProfile(userId);
    setGroupId(profile?.group_id ?? null);
    setPhase('app');
  };

  const handleSignOut = () => {
    setUserId(null);
    setGroupId(null);
    setPhase('auth');
  };

  const isToday = currentDate === todayISO();

  if (phase === 'loading') return <LoadingScreen />;
  if (phase === 'auth')    return <LoginScreen onSuccess={() => { /* auth listener handles it */ }} />;
  if (phase === 'set_password') return <SetPasswordScreen onDone={() => setPhase('auth')} />;
  if (phase === 'onboarding' && userId) {
    return <OnboardingScreen userId={userId} onComplete={handleOnboardingComplete} />;
  }

  return (
    <div style={{
      height: '100%',
      background: B_COLORS.bg,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {tab === 'today' && (
          <TodayScreen
            checked={checked}
            toggle={toggle}
            showNudge={isToday}
            currentDate={currentDate}
            onNavigateDate={navigateDate}
            userId={userId!}
            groupId={groupId}
          />
        )}
        {tab === 'feed' && (
          <FeedScreen userId={userId!} groupId={groupId} />
        )}
        {tab === 'history' && (
          <HistoryScreen userId={userId!} groupId={groupId} onJumpToDate={jumpToDate} />
        )}
        {tab === 'profile' && userId && (
          <ProfileScreen userId={userId} onSignOut={handleSignOut} />
        )}
      </div>
      <TabBar active={tab} onChange={setTab} />
    </div>
  );
}
