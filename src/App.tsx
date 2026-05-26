import { useEffect, useState } from 'react';
import { TabBar } from './components/TabBar';
import { SplashScreen } from './screens/SplashScreen';
import { TeamScreen } from './screens/TeamScreen';
import { TabellScreen } from './screens/TabellScreen';
import { ProgramScreen } from './screens/ProgramScreen';
import { ReglerScreen } from './screens/ReglerScreen';
import { AdminScreen } from './screens/AdminScreen';
import { ProfilScreen } from './screens/ProfilScreen';
import { WinnerScreen } from './screens/WinnerScreen';
import { ADMIN_PLAYER_ID } from './data/players';
import { SUNDAY_RESULTS_TS } from './data/days';
import { isResultsRevealed, RESULTS_CHANGE_EVENT } from './lib/locking';
import { useCurrentUserId } from './lib/store';
import { useFirebaseAuth } from './lib/auth';

export type TabId = 'lag' | 'tabell' | 'program' | 'regler' | 'admin' | 'profil';

export function App() {
  // Single Firebase auth listener for the whole app; reconciles with localStorage user.
  const auth = useFirebaseAuth();
  const userId = useCurrentUserId();
  const [tab, setTab] = useState<TabId>('lag');
  const [, forceTick] = useState(0);

  // Re-render when the results phase is toggled by admin, and schedule an
  // automatic re-render at the Sunday-noon reveal so open tabs flip over.
  useEffect(() => {
    const bump = () => forceTick((x) => x + 1);
    window.addEventListener(RESULTS_CHANGE_EVENT, bump);
    const ms = SUNDAY_RESULTS_TS - Date.now();
    const timer = ms > 0 && ms < 2 ** 31 ? window.setTimeout(bump, ms) : undefined;
    return () => {
      window.removeEventListener(RESULTS_CHANGE_EVENT, bump);
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  if (!userId) {
    return (
      <div className="app-shell">
        <SplashScreen auth={auth} />
      </div>
    );
  }

  if (isResultsRevealed()) {
    return (
      <div className="app-shell">
        <WinnerScreen userId={userId} />
      </div>
    );
  }

  const tabs: TabId[] = [
    'lag',
    'tabell',
    'program',
    'regler',
    ...(userId === ADMIN_PLAYER_ID ? (['admin'] as const) : []),
    'profil',
  ];

  return (
    <div className="app-shell">
      {tab === 'lag' && <TeamScreen userId={userId} />}
      {tab === 'tabell' && <TabellScreen />}
      {tab === 'program' && <ProgramScreen />}
      {tab === 'regler' && <ReglerScreen />}
      {tab === 'admin' && <AdminScreen userId={userId} />}
      {tab === 'profil' && <ProfilScreen userId={userId} />}
      <TabBar active={tab} setActive={setTab} tabs={tabs} />
    </div>
  );
}
