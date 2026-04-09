import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, clearAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    clearAuth()
    navigate('/')
  }

  const getDashboardRoute = () => {
    if (user?.role === 'ADMIN') return '/dashboard/admin'
    if (user?.role === 'CUSTOMER') return '/dashboard/customer'
    if (user?.role === 'TRADESMAN') return '/dashboard/tradesman'
    return '/'
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary-600">
              WorkersHub
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            <Link to="/" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50">
              Home
            </Link>
            <Link to="/services" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50">
              Services
            </Link>
            <Link to="/tradespeople" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50">
              TradePeople
            </Link>
            <Link to="/blog" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50">
              Blog
            </Link>
            <Link to="/how-it-works" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50">
              How It Works
            </Link>
            <Link to="/contact" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50">
              Contact
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link to={getDashboardRoute()} className="btn btn-secondary btn-sm flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="btn btn-outline btn-sm flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/post-job" className="btn btn-accent btn-sm">
                  Post a Job
                </Link>
                <Link to="/login" className="btn btn-outline btn-sm">
                  Log in
                </Link>
                <Link to="/register/tradesman" className="btn btn-primary btn-sm">
                  Sign up as Tradesperson
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-50"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50">
              Home
            </Link>
            <Link to="/services" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50">
              Services
            </Link>
            <Link to="/tradespeople" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50">
              TradePeople
            </Link>
            <Link to="/blog" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50">
              Blog
            </Link>
            <Link to="/how-it-works" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50">
              How It Works
            </Link>
            <Link to="/contact" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50">
              Contact
            </Link>
            <div className="pt-4 space-y-2">
              {user ? (
                <>
                  <Link to={getDashboardRoute()} className="block btn btn-secondary btn-md w-full">
                    Dashboard
                  </Link>
                  <button onClick={handleLogout} className="block btn btn-outline btn-md w-full">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/post-job" className="block btn btn-accent btn-md w-full">
                    Post a Job
                  </Link>
                  <Link to="/login" className="block btn btn-outline btn-md w-full">
                    Log in
                  </Link>
                  <Link to="/register/tradesman" className="block btn btn-primary btn-md w-full">
                    Sign up as Tradesperson
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
