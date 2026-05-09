import { useState } from 'react';
import { TabBar } from './components/TabBar';
import { SplashScreen } from './screens/SplashScreen';
import { TeamScreen } from './screens/TeamScreen';
import { TabellScreen } from './screens/TabellScreen';
import { ProgramScreen } from './screens/ProgramScreen';
import { ReglerScreen } from './screens/ReglerScreen';
import { AdminScreen } from './screens/AdminScreen';
import { ProfilScreen } from './screens/ProfilScreen';
import { ADMIN_PLAYER_ID } from './data/players';
import { useCurrentUserId } from './lib/store';
import { useFirebaseAuth } from './lib/auth';

export type TabId = 'lag' | 'tabell' | 'program' | 'regler' | 'admin' | 'profil';

export function App() {
  // Initializes Firebase auth listener and reconciles with localStorage user.
  useFirebaseAuth();
  const userId = useCurrentUserId();
  const [tab, setTab] = useState<TabId>('lag');

  if (!userId) {
    return (
      <div className="app-shell">
        <SplashScreen />
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
