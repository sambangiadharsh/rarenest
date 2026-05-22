import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import SellerDashboard from './SellerDashboard'
import { logout } from '@/store/authSlice'
import { getAdminLoginUrl } from '@/config/app'

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

  return <SellerDashboard isSeller={isSeller} />
}
