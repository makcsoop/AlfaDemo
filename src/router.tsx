import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { OnboardingPage } from '@/features/onboarding/OnboardingPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { IdeaEvalPage } from '@/features/idea-eval/IdeaEvalPage';
import { ShowcasePage } from '@/features/marketplace-showcase/ShowcasePage';
import { TendersPage } from '@/features/tenders/TendersPage';
import { PocketAdminPage } from '@/features/pocket-admin/PocketAdminPage';
import { MpAnalyticsPage } from '@/features/mp-analytics/MpAnalyticsPage';
import { FinancialRadarPage } from '@/features/financial-radar/FinancialRadarPage';
import { RegistrationPage } from '@/features/registration/RegistrationPage';
import { DemoStoryPage } from '@/features/demo-story/DemoStoryPage';
import { NotFoundPage } from '@/features/_shared/NotFoundPage';
import { GatedRoute } from '@/features/_shared/GatedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/onboarding" replace /> },
      { path: 'onboarding', element: <OnboardingPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'idea', element: <IdeaEvalPage /> },
      { path: 'storefront', element: <GatedRoute route="/storefront"><ShowcasePage /></GatedRoute> },
      { path: 'tenders', element: <GatedRoute route="/tenders"><TendersPage /></GatedRoute> },
      { path: 'admin', element: <GatedRoute route="/admin"><PocketAdminPage /></GatedRoute> },
      { path: 'analytics', element: <GatedRoute route="/analytics"><MpAnalyticsPage /></GatedRoute> },
      { path: 'radar', element: <GatedRoute route="/radar"><FinancialRadarPage /></GatedRoute> },
      { path: 'registration', element: <RegistrationPage /> },
      { path: 'demo-story', element: <DemoStoryPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
