import React from 'react'
import { createBrowserRouter } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Properties from './pages/Properties'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import CreateListing from './pages/CreateListing'
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
        path: 'properties/create',
        element: <CreateListing />
      },
      {
        path: '*',
        element: <NotFound />
      }
    ]
  }
])
