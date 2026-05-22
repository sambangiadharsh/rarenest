import { createBrowserRouter } from 'react-router-dom'
import AdminLayout from './components/layout/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'
import GuestRoute from './components/GuestRoute'
import Dashboard from './pages/Dashboard'
import Properties from './pages/Properties'
import PropertyTypes from './pages/PropertyTypes'
import Enquiries from './pages/Enquiries'
import Reviews from './pages/Reviews'
import Careers from './pages/content/Careers'
import AboutUs from './pages/content/AboutUs'
import ContactInfo from './pages/content/ContactInfo'
import Terms from './pages/content/Terms'
import Privacy from './pages/content/Privacy'
import Faqs from './pages/content/Faqs'
import Login from './pages/Login'
import NotFound from './pages/NotFound'

export const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [
      {
        path: '/login',
        element: <Login />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <AdminLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: 'properties', element: <Properties /> },
          { path: 'properties/types', element: <PropertyTypes /> },
          { path: 'enquiries', element: <Enquiries /> },
          { path: 'reviews', element: <Reviews /> },
          { path: 'careers', element: <Careers /> },
          { path: 'content/about-us', element: <AboutUs /> },
          { path: 'content/contact-info', element: <ContactInfo /> },
          { path: 'content/terms', element: <Terms /> },
          { path: 'content/privacy', element: <Privacy /> },
          { path: 'content/faqs', element: <Faqs /> },
          { path: '*', element: <NotFound /> },
        ],
      },
    ],
  },
])
