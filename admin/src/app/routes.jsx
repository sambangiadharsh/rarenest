import { createBrowserRouter } from 'react-router-dom'
import AdminLayout from '@/shared/components/layout/AdminLayout'
import { ProtectedRoute, GuestRoute, LoginPage } from '@/features/auth'
import { DashboardPage } from '@/features/dashboard'
import { PropertiesPage } from '@/features/properties'
import { PropertyTypesPage } from '@/features/propertyTypes'
import { EnquiriesPage } from '@/features/enquiries'
import { ReviewsPage } from '@/features/reviews'
import { CareersPage } from '@/features/careers'
import { AboutUsPage, TermsPage, PrivacyPage } from '@/features/cms'
import { ContactInfoPage } from '@/features/contact'
import { FaqsPage } from '@/features/faqs'
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
          { path: 'enquiries', element: <EnquiriesPage /> },
          { path: 'reviews', element: <ReviewsPage /> },
          { path: 'content/careers', element: <CareersPage /> },
          { path: 'content/about-us', element: <AboutUsPage /> },
          { path: 'content/contact-info', element: <ContactInfoPage /> },
          { path: 'content/terms', element: <TermsPage /> },
          { path: 'content/privacy', element: <PrivacyPage /> },
          { path: 'content/faqs', element: <FaqsPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
])
