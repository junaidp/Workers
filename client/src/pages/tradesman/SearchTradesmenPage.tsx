import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Star, MapPin, Award } from 'lucide-react'
import Layout from '../../components/Layout/Layout'
import api from '../../lib/api'
import { pakistanCities } from '../../lib/utils'

export default function SearchTradesmenPage() {
  const [tradesmen, setTradesmen] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [filters, setFilters] = useState({
    city: '',
    serviceId: '',
    page: 1
  })
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    searchTradesmen()
  }, [filters])

  const fetchCategories = async () => {
    try {
      const response = await api.get('/services/categories')
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const searchTradesmen = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.city) params.append('city', filters.city)
      if (filters.serviceId) params.append('serviceId', filters.serviceId)
      params.append('page', filters.page.toString())

      const response = await api.get(`/tradesman/search?${params}`)
      setTradesmen(response.data.tradesmen)
      setTotalPages(response.data.totalPages)
    } catch (error) {
      console.error('Error searching tradesmen:', error)
    } finally {
      setLoading(false)
    }
  }

  const getBadgeColor = (badge: string) => {
    const colors: any = {
      VERIFIED: 'badge-verified',
      PLATINUM: 'badge-platinum',
      GOLD: 'badge-gold',
      SILVER: 'badge-silver',
    }
    return colors[badge] || 'badge-verified'
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Tradespeople</h1>
            <p className="text-gray-600">Browse verified professionals in your area</p>
          </div>

          <div className="card mb-8">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="label">City</label>
                <select
                  className="input"
                  value={filters.city}
                  onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value, page: 1 }))}
                >
                  <option value="">All Cities</option>
                  {pakistanCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Service</label>
                <select
                  className="input"
                  value={filters.serviceId}
                  onChange={(e) => setFilters(prev => ({ ...prev, serviceId: e.target.value, page: 1 }))}
                >
                  <option value="">All Services</option>
                  {categories.map(category => (
                    <optgroup key={category.id} label={category.name}>
                      {category.services.map((service: any) => (
                        <option key={service.id} value={service.id}>{service.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={searchTradesmen}
                  className="btn btn-primary btn-md w-full"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : tradesmen.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No tradespeople found matching your criteria</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tradesmen.map(tradesman => (
                  <div key={tradesman.id} className="card hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4 mb-4">
                      <img
                        src={tradesman.profilePicture || '/default-avatar.png'}
                        alt={tradesman.businessName}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{tradesman.businessName}</h3>
                            <p className="text-sm text-gray-600">ID: {tradesman.tradesmanId}</p>
                          </div>
                          <span className={`badge ${getBadgeColor(tradesman.badge)}`}>
                            {tradesman.badge}
                          </span>
                        </div>
                      </div>
                    </div>

                    {tradesman.rating > 0 && (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center">
                          <Star className="w-5 h-5 text-yellow-500 fill-current" />
                          <span className="font-semibold ml-1">{tradesman.rating.toFixed(1)}</span>
                        </div>
                        <span className="text-sm text-gray-600">
                          ({tradesman.reviewCount} reviews)
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>{tradesman.city}</span>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {tradesman.description}
                      </p>
                    </div>

                    {tradesman.services.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {tradesman.services.slice(0, 3).map((ts: any) => (
                            <span key={ts.id} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              {ts.service.name}
                            </span>
                          ))}
                          {tradesman.services.length > 3 && (
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              +{tradesman.services.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {tradesman.portfolioImages.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {tradesman.portfolioImages.map((img: any) => (
                          <img
                            key={img.id}
                            src={img.imageUrl}
                            alt="Portfolio"
                            className="w-full h-20 object-cover rounded"
                          />
                        ))}
                      </div>
                    )}

                    <Link
                      to={`/tradesman/${tradesman.tradesmanId}`}
                      className="btn btn-primary btn-md w-full"
                    >
                      View Profile & Contact
                    </Link>

                    {tradesman.reviews.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-gray-600 italic">
                          "{tradesman.reviews[0].comment || 'Great work!'}"
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={filters.page === 1}
                    className="btn btn-secondary btn-md"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-gray-700">
                    Page {filters.page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
                    disabled={filters.page === totalPages}
                    className="btn btn-secondary btn-md"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}
