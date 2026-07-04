import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from './components/shell/AppShell';
import { TakeoverShell } from './components/shell/TakeoverShell';
import { DashboardPage } from './pages/DashboardPage';
import { CreatePage } from './pages/CreatePage';
import { ReviewPage } from './pages/ReviewPage';
import { StatusPage } from './pages/StatusPage';
import { BulkPage } from './pages/BulkPage';
import { ContractorPage } from './pages/ContractorPage';
import { SystemPage } from './pages/SystemPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/payments" replace /> },

  // Full app shell: dashboard, bulk, system reference.
  {
    element: <AppShell />,
    children: [
      { path: '/payments', element: <DashboardPage /> },
      { path: '/payments/bulk', element: <BulkPage /> },
      { path: '/system', element: <SystemPage /> },
    ],
  },

  // Focused takeover: create → review → sent (§2).
  {
    element: <TakeoverShell />,
    children: [
      { path: '/payments/new', element: <CreatePage /> },
      { path: '/payments/review/:draftId', element: <ReviewPage /> },
      { path: '/payments/status/:payoutId', element: <StatusPage /> },
    ],
  },

  // Contractor-side view renders in its own device-suggestive frame.
  { path: '/contractor/:payoutId', element: <ContractorPage /> },

  { path: '*', element: <NotFoundPage /> },
]);
