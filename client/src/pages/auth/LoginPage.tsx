import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import toast from 'react-hot-toast'
import Layout from '../../components/Layout/Layout'
import api from '../../lib/api'
import { useAuthStore } from '../../stores/authStore'

export default function LoginPage() {
  const [loginType, setLoginType] = useState<'mobile' | 'email'>('mobile')
  const [mobile, setMobile] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const loginData = loginType === 'mobile' 
        ? { mobile } 
        : { email, password }
      
      const response = await api.post('/auth/login', loginData)
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
            <p className="mt-2 text-sm text-gray-600">
              Or{' '}
              <Link to="/register/customer" className="font-medium text-primary-600 hover:text-primary-500">
                create a new customer account
              </Link>
            </p>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setLoginType('mobile')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                loginType === 'mobile'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Mobile Login
            </button>
            <button
              type="button"
              onClick={() => setLoginType('email')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                loginType === 'email'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Email Login
            </button>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {loginType === 'mobile' ? (
              <div>
                <label htmlFor="mobile" className="label">
                  Mobile Number
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                    +92
                  </span>
                  <input
                    id="mobile"
                    type="tel"
                    required
                    className="input rounded-l-none"
                    placeholder="3001234567"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    maxLength={10}
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Enter your 10-digit mobile number (without country code)
                </p>
              </div>
            ) : (
              <>
                <div>
                  <label htmlFor="email" className="label">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    className="input"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
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
                  <p className="mt-1 text-sm text-gray-500">
                    For Admin and Tradesman accounts
                  </p>
                </div>
              </>
            )}

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
