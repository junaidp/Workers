import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, XCircle, Loader } from 'lucide-react'
import toast from 'react-hot-toast'
import Layout from '../../components/Layout/Layout'
import api from '../../lib/api'
import { useAuthStore } from '../../stores/authStore'

export default function VerifyPage() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      verifyToken(token)
    } else {
      setStatus('error')
      setMessage('No verification token provided')
    }
  }, [searchParams])

  const verifyToken = async (token: string) => {
    try {
      const response = await api.post('/auth/verify', { token })
      setStatus('success')
      setMessage(response.data.message)
      
      if (response.data.token && response.data.user) {
        setAuth(response.data.token, response.data.user)
        toast.success('Account verified successfully!')
        
        setTimeout(() => {
          if (response.data.user.role === 'ADMIN') {
            navigate('/dashboard/admin')
          } else if (response.data.user.role === 'TRADESMAN') {
            navigate('/dashboard/tradesman')
          } else {
            navigate('/dashboard/customer')
          }
        }, 2000)
      }
    } catch (error: any) {
      setStatus('error')
      setMessage(error.response?.data?.message || 'Verification failed')
    }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          {status === 'loading' && (
            <>
              <Loader className="mx-auto h-16 w-16 text-primary-600 animate-spin" />
              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                Verifying your account...
              </h2>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                Verification Successful!
              </h2>
              <p className="mt-2 text-gray-600">{message}</p>
              <p className="mt-4 text-sm text-gray-500">
                Redirecting to your dashboard...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="mx-auto h-16 w-16 text-red-500" />
              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                Verification Failed
              </h2>
              <p className="mt-2 text-gray-600">{message}</p>
              <button
                onClick={() => navigate('/login')}
                className="mt-6 btn btn-primary btn-md"
              >
                Go to Login
              </button>
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}
