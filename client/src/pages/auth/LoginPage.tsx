import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import toast from 'react-hot-toast'
import Layout from '../../components/Layout/Layout'
import api from '../../lib/api'
import { useAuthStore } from '../../stores/authStore'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await api.post('/auth/login', { username, password })
      setAuth(response.data.token, response.data.user)
      
      toast.success('Login successful!')
      
      if (response.data.user.role === 'ADMIN') {
        navigate('/dashboard/admin')
      } else if (response.data.user.role === 'TRADESMAN') {
        navigate('/dashboard/tradesman')
      } else {
        navigate('/dashboard/customer')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <LogIn className="mx-auto h-12 w-12 text-primary-600" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Sign in to your account
            </h2>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="label">
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                className="input"
                placeholder="Mobile number or email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter your mobile number or email
              </p>
            </div>
            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                className="input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg w-full"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Don't have an account?
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Link to="/register/customer" className="btn btn-outline btn-md flex-1">
                  Sign up as Customer
                </Link>
                <Link to="/register/tradesman" className="btn btn-primary btn-md flex-1">
                  Sign up as Tradesman
                </Link>
              </div>
              <div className="pt-2">
                <Link hidden={true} to="/register/admin" className="text-sm text-gray-500 hover:text-primary-600">
                  Register as Admin
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}
