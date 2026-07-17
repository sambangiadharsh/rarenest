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


import {
  LoginPage,
  RegisterPage,
  DashboardPage,
  ProfilePage,
  ChangePasswordPage,
  GuestRoute,
  ForgotPasswordPage,
  ResetPasswordPage,
} from '@/features/auth'
import { MyPropertyDetailPage } from '@/features/seller'
import { MyEnquiriesPage } from '@/features/enquiries'
import { MyWishlistPage } from '@/features/wishlist'
import { MessagesPage } from '@/features/messaging'
import {
  SupportCenterPage,
  CreateTicketPage,
  TicketListPage,
  TicketDetailPage,
} from '@/features/support'
import { AboutPage, TermsPage, PrivacyPage } from '@/features/cms'
import { ContactPage } from '@/features/contact'
import { FaqsPage } from '@/features/faqs'
import { CareersPage, CareerDetailPage } from '@/features/careers'
import { NotFoundPage } from '@/features/notFound'
import { BuilderApplyPage, BuilderProfilePage } from '@/features/builders'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'properties', element: <PropertiesPage /> },
      {
        element: <GuestRoute />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'register', element: <RegisterPage /> },
          { path: 'signup', element: <RegisterPage /> },
          { path: 'forgot-password', element: <ForgotPasswordPage /> },
          { path: 'reset-password', element: <ResetPasswordPage /> },
        ],
      },
      { path: 'dashboard', element: <DashboardPage /> },
      {
        path: 'my-properties/:id',
        element: (
          <RequireAuth>
            <MyPropertyDetailPage />
          </RequireAuth>
        ),
      },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'change-password', element: <ChangePasswordPage /> },
      { path: 'enquiries', element: <MyEnquiriesPage /> },
      { path: 'wishlist', element: <MyWishlistPage /> },
      {
        path: 'messages',
        element: (
          <RequireAuth>
            <MessagesPage />
          </RequireAuth>
        ),
      },
      {
        path: 'messages/:conversationId',
        element: (
          <RequireAuth>
            <MessagesPage />
          </RequireAuth>
        ),
      },
      {
        path: 'support',
        element: (
          <RequireAuth>
            <SupportCenterPage />
          </RequireAuth>
        ),
      },
      {
        path: 'support/new',
        element: (
          <RequireAuth>
            <CreateTicketPage />
          </RequireAuth>
        ),
      },
      {
        path: 'support/tickets',
        element: (
          <RequireAuth>
            <TicketListPage />
          </RequireAuth>
        ),
      },
      {
        path: 'support/:id',
        element: (
          <RequireAuth>
            <TicketDetailPage />
          </RequireAuth>
        ),
      },
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
      {
        path: 'builders/apply',
        element: (
          <RequireAuth>
            <BuilderApplyPage />
          </RequireAuth>
        ),
      },
      { path: 'builders/:id', element: <BuilderProfilePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
