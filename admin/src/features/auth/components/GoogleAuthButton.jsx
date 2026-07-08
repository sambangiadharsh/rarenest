import React from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { useGoogleLogin } from '../hooks/useAuth'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setCredentials } from '@/app/store/authSlice'
import { toast } from 'sonner'

export default function GoogleAuthButton() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { mutateAsync: googleLoginApi } = useGoogleLogin()
  const [isProcessing, setIsProcessing] = React.useState(false)

  const handleSuccess = async (credentialResponse) => {
    if (isProcessing) return
    setIsProcessing(true)
    try {
      const res = await googleLoginApi(credentialResponse.credential)
      if (res.success) {
        if (res.user.role?.toLowerCase() !== 'admin') {
          toast.error('Access denied. Admin credentials are required.')
          return
        }

        const userData = {
          id: res.user.id,
          name:
            `${res.user.first_name || ''} ${res.user.last_name || ''}`.trim() ||
            res.user.email.split('@')[0],
          email: res.user.email,
          role: res.user.role.toLowerCase(),
        }

        dispatch(setCredentials(userData))
        toast.success(`Welcome back, ${userData.name}!`)
        navigate('/', { replace: true })
      } else {
        toast.error(res.message || 'Google authentication failed.')
      }
    } catch (err) {
      toast.error(err.message || 'Google authentication failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleError = () => {
    toast.error('Google Sign-In was cancelled or failed.')
  }

  return (
    <div className="w-full flex justify-center mt-2 relative">
      {isProcessing && (
        <div className="absolute inset-0 z-10 bg-white/50 dark:bg-neutral-900/50 flex items-center justify-center rounded-xl pointer-events-none">
          <span className="text-xs font-semibold text-neutral-500">Authenticating...</span>
        </div>
      )}
      <div className="w-full google-btn-wrapper" style={{ opacity: isProcessing ? 0.6 : 1 }}>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          text="continue_with"
          shape="circle"
          width="100%"
          theme="outline"
        />
      </div>
    </div>
  )
}
