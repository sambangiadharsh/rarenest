import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { SellerDashboard } from '@/features/seller'
import { logout } from '@/app/store/authSlice'
import { getAdminLoginUrl } from '@/shared/config/app'
import RequireAuth from '@/shared/components/auth/RequireAuth'

export default function Dashboard() {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()

  useEffect(() => {
    if (user?.role?.toLowerCase() === 'admin') {
      dispatch(logout())
      window.location.href = getAdminLoginUrl()
    }
  }, [user, dispatch])

  if (user?.role?.toLowerCase() === 'admin') {
    return null
  }

  const isSeller = user?.role?.toLowerCase() === 'seller'

  return (
    <RequireAuth>
      <SellerDashboard isSeller={isSeller} />
    </RequireAuth>
  )
}
