import { createBrowserRouter, Navigate } from 'react-router';
import { Root } from './components/Root';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { GroupsPage } from './pages/GroupsPage';
import { CreateGroupPage } from './pages/CreateGroupPage';
import { AdminPanel } from './pages/AdminPanel';
import { ScheduledPrayers } from './pages/ScheduledPrayers';
import { GroupDetail } from './pages/GroupDetail';
import { PastorDirectory } from './pages/PastorDirectory';
import { PastorProfile } from './pages/PastorProfile';
import { PastorPanel } from './pages/PastorPanel';
import { About } from './pages/About';
import { BibleReader } from './pages/BibleReader';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      {
        index: true,
        Component: LandingPage,
      },
      {
        path: 'about',
        Component: About,
      },
      {
        path: 'dashboard',
        Component: Dashboard,
      },
      {
        path: 'flocks',
        Component: GroupsPage,
      },
      {
        path: 'flocks/:id',
        Component: GroupDetail,
      },
      {
        path: 'create-flock',
        Component: CreateGroupPage,
      },
      {
        path: 'prayers',
        Component: ScheduledPrayers,
      },
      {
        path: 'sages',
        Component: PastorDirectory,
      },
      {
        path: 'sages/:id',
        Component: PastorProfile,
      },
      {
        path: 'admin',
        Component: AdminPanel,
      },
      {
        path: 'sage-panel',
        Component: PastorPanel,
      },
      {
        path: 'bible',
        Component: BibleReader,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);