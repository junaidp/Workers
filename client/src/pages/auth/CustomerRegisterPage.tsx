import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import Layout from '../../components/Layout/Layout'
import api from '../../lib/api'
import { pakistanCities } from '../../lib/utils'
import { lahoreLocations } from '../../lib/constants'

export default function CustomerRegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    whatsapp: '',
    city: 'Lahore',
    area: '',
  })
  const [areaSearchQuery, setAreaSearchQuery] = useState('')
  const [filteredAreas, setFilteredAreas] = useState<any[]>([])
  const [showAreaSuggestions, setShowAreaSuggestions] = useState(false)
  const areaSearchRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (areaSearchRef.current && !areaSearchRef.current.contains(event.target as Node)) {
        setShowAreaSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (areaSearchQuery.trim()) {
      const filtered = lahoreLocations.filter(location =>
        location.name.toLowerCase().includes(areaSearchQuery.toLowerCase())
      )
      setFilteredAreas(filtered.slice(0, 10))
      setShowAreaSuggestions(true)
    } else {
      setFilteredAreas([])
      setShowAreaSuggestions(false)
    }
  }, [areaSearchQuery])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.post('/auth/register/customer', formData)
      toast.success('Registration successful! Please check your email/WhatsApp for verification.')
      navigate('/verify')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <UserPlus className="mx-auto h-12 w-12 text-primary-600" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Create Customer Account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Join for free and start posting jobs
            </p>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="fullName" className="label">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  className="input"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="email" className="label">
                  Email <span className="text-gray-500">(Optional)</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="input"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="mobile" className="label">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                    +92
                  </span>
                  <input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    required
                    className="input rounded-l-none"
                    placeholder="3001234567"
                    value={formData.mobile}
                    onChange={handleChange}
                    maxLength={10}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="whatsapp" className="label">
                  WhatsApp Number <span className="text-gray-500">(Recommended)</span>
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                    +92
                  </span>
                  <input
                    id="whatsapp"
                    name="whatsapp"
                    type="tel"
                    className="input rounded-l-none"
                    placeholder="3001234567"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    maxLength={10}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="city" className="label">
                    City <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="city"
                    name="city"
                    required
                    className="input bg-gray-100 cursor-not-allowed"
                    value={formData.city}
                    disabled
                  >
                    <option value="Lahore">Lahore</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="area" className="label">
                    Area/Town <span className="text-red-500">*</span>
                  </label>
                  <div className="relative" ref={areaSearchRef}>
                    <input
                      id="area"
                      type="text"
                      className="input"
                      placeholder="Type to search area/town..."
                      value={areaSearchQuery || formData.area}
                      onChange={(e) => {
                        setAreaSearchQuery(e.target.value)
                        setFormData(prev => ({ ...prev, area: '' }))
                      }}
                      onFocus={() => areaSearchQuery.trim() && setShowAreaSuggestions(true)}
                      required
                    />
                    {showAreaSuggestions && filteredAreas.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {filteredAreas.map((location) => (
                          <button
                            key={location.name}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, area: location.name }))
                              setAreaSearchQuery('')
                              setShowAreaSuggestions(false)
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-primary-50 transition-colors border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-gray-900">{location.name}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg w-full"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  )
}
