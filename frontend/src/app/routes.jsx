import { createBrowserRouter } from 'react-router-dom'
import Layout from '@/shared/components/layout/Layout'
import {
  HomePage,
  PropertiesPage,
  PropertyDetailPage,
  CreateListingPage,
  EditListingPage,
} from '@/features/properties'
import RequireAuth from '@/shared/components/auth/RequireAuth'


import { LoginPage, RegisterPage, DashboardPage, ProfilePage } from '@/features/auth'
import { MyEnquiriesPage } from '@/features/enquiries'
import { MyWishlistPage } from '@/features/wishlist'
import { AboutPage, TermsPage, PrivacyPage } from '@/features/cms'
import { ContactPage } from '@/features/contact'
import { FaqsPage } from '@/features/faqs'
import { CareersPage, CareerDetailPage } from '@/features/careers'
import { NotFoundPage } from '@/features/notFound'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'properties', element: <PropertiesPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'enquiries', element: <MyEnquiriesPage /> },
      { path: 'wishlist', element: <MyWishlistPage /> },
      { path: 'properties/:id', element: <PropertyDetailPage /> },
      {
        path: 'properties/:id/edit',
        element: (
          <RequireAuth>
            <EditListingPage />
          </RequireAuth>
        ),
      },
      { path: 'properties/create', element: <CreateListingPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'terms', element: <TermsPage /> },
      { path: 'privacy', element: <PrivacyPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'faqs', element: <FaqsPage /> },
      { path: 'careers', element: <CareersPage /> },
      { path: 'careers/:id', element: <CareerDetailPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
