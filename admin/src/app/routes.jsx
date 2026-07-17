import { createBrowserRouter } from 'react-router-dom'
import AdminLayout from '@/shared/components/layout/AdminLayout'
import { ProtectedRoute, GuestRoute, LoginPage } from '@/features/auth'
import { DashboardPage } from '@/features/dashboard'
import { PropertiesPage, PropertyFeaturesPage } from '@/features/properties'
import { PropertyTypesPage } from '@/features/propertyTypes'
import {
  BuilderApplicationsPage,
  BuilderApplicationDetailPage,
  BuildersPage,
  BuilderReviewsPage,
  FeaturedBuildersPage,
} from '@/features/builders'

import { CareersPage } from '@/features/careers'
import { AboutUsPage, TermsPage, PrivacyPage } from '@/features/cms'
import { ContactInfoPage } from '@/features/contact'
import { FaqsPage } from '@/features/faqs'
import { HeroBannersPage } from '@/features/heroBanners'
import { SupportTicketsPage, SupportTicketDetailPage } from '@/features/support'
import { NotFoundPage } from '@/features/notFound'

export const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [{ path: '/login', element: <LoginPage /> }],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <AdminLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'properties', element: <PropertiesPage /> },
          { path: 'properties/types', element: <PropertyTypesPage /> },
          { path: 'properties/features', element: <PropertyFeaturesPage /> },
          { path: 'builders', element: <BuildersPage /> },
          { path: 'builders/applications', element: <BuilderApplicationsPage /> },
          { path: 'builders/applications/:id', element: <BuilderApplicationDetailPage /> },
          { path: 'builders/reviews', element: <BuilderReviewsPage /> },
          { path: 'builders/featured', element: <FeaturedBuildersPage /> },
          { path: 'content/careers', element: <CareersPage /> },
          { path: 'content/about-us', element: <AboutUsPage /> },
          { path: 'content/contact-info', element: <ContactInfoPage /> },
          { path: 'content/terms', element: <TermsPage /> },
          { path: 'content/privacy', element: <PrivacyPage /> },
          { path: 'content/faqs', element: <FaqsPage /> },
          { path: 'content/hero-banners', element: <HeroBannersPage /> },
          { path: 'support/tickets', element: <SupportTicketsPage /> },
          { path: 'support/tickets/:id', element: <SupportTicketDetailPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
])
