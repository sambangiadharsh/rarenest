import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'

//Redirects to home page if user already login or  register 

export default function GuestRoute() {
  const { isAuthenticated } = useSelector((state) => state.auth)

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
