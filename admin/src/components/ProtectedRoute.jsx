import { useSelector } from 'react-redux'
import { Navigate, Outlet } from 'react-router-dom'

export default function ProtectedRoute() {
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const isAdmin = user?.role?.toLowerCase() === 'admin'

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
