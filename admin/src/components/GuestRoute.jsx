import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'

export default function GuestRoute() {
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const isAdmin = user?.role?.toLowerCase() === 'admin'

  if (isAuthenticated && isAdmin) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
