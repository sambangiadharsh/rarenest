import React from 'react'
import { createBrowserRouter } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Properties from './pages/Properties'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import CreateListing from './pages/CreateListing'
import PropertyDetail from './pages/PropertyDetail'
import About from './pages/About'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Contact from './pages/Contact'
import Faqs from './pages/Faqs'
import Careers from './pages/Careers'
import CareerDetail from './pages/CareerDetail'
import NotFound from './pages/NotFound'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: 'properties',
        element: <Properties />
      },
      {
        path: 'login',
        element: <Login />
      },
      {
        path: 'register',
        element: <Register />
      },
      {
        path: 'dashboard',
        element: <Dashboard />
      },
      {
        path: 'properties/:id',
        element: <PropertyDetail />
      },
      {
        path: 'properties/create',
        element: <CreateListing />
      },
      {
        path: 'about',
        element: <About />
      },
      {
        path: 'terms',
        element: <Terms />
      },
      {
        path: 'privacy',
        element: <Privacy />
      },
      {
        path: 'contact',
        element: <Contact />
      },
      {
        path: 'faqs',
        element: <Faqs />
      },
      {
        path: 'careers',
        element: <Careers />
      },
      {
        path: 'careers/:id',
        element: <CareerDetail />
      },
      {
        path: '*',
        element: <NotFound />
      }
    ]
  }
])
