import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, MapPin, Star, Briefcase, Phone, MessageCircle } from 'lucide-react'
import Layout from '../components/Layout/Layout'
import api from '../lib/api'
import { pakistanCities } from '../lib/utils'

export default function TradePeoplePage() {
  const [tradespeople, setTradespeople] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchTradespeople()
  }, [page, selectedCity])

  const fetchTradespeople = async () => {
    setLoading(true)
    try {
      const params: any = { page, limit: 12 }
      if (selectedCity) params.city = selectedCity
      if (searchQuery) params.search = searchQuery

      const response = await api.get('/tradesman/list', { params })
      setTradespeople(response.data.tradespeople)
      setTotalPages(response.data.totalPages)
    } catch (error) {
      console.error('Error fetching tradespeople:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchTradespeople()
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-primary-600 text-white py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold mb-4">Find Tradespeople</h1>
            <p className="text-xl text-primary-100">Browse verified professionals in your area</p>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by name or business..."
                  className="input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="md:w-64">
                <select
                  className="input"
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value)
                    setPage(1)
                  }}
                >
                  <option value="">All Cities</option>
                  {pakistanCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-primary">
                <Search className="w-5 h-5 mr-2" />
                Search
              </button>
            </form>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-gray-600">Loading tradespeople...</p>
            </div>
          ) : tradespeople.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No tradespeople found</h3>
              <p className="text-gray-600">Try adjusting your search filters</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tradespeople.map((tradesperson) => (
                  <div key={tradesperson.id} className="card hover:shadow-lg transition-shadow">
                    <div className="flex items-start space-x-4 mb-4">
                      <img
                        src={tradesperson.profilePicture || '/default-avatar.png'}
                        alt={tradesperson.businessName}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {tradesperson.user.firstName} {tradesperson.user.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">{tradesperson.businessName}</p>
                        <div className="flex items-center mt-1">
                          <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-600">{tradesperson.city}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 mb-4">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                        <span className="text-sm font-medium">{tradesperson.rating.toFixed(1)}</span>
                        <span className="text-sm text-gray-500 ml-1">({tradesperson.reviewCount})</span>
                      </div>
                      <div className="flex items-center">
                        <Briefcase className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-600">{tradesperson.completedJobs} jobs</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Services:</p>
                      <div className="flex flex-wrap gap-2">
                        {tradesperson.services.slice(0, 3).map((ts: any) => (
                          <span key={ts.id} className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                            {ts.service.name}
                          </span>
                        ))}
                        {tradesperson.services.length > 3 && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            +{tradesperson.services.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {tradesperson.portfolioImages.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        {tradesperson.portfolioImages.map((img: any, idx: number) => (
                          <img
                            key={idx}
                            src={img.imageUrl}
                            alt="Portfolio"
                            className="w-full h-20 object-cover rounded"
                          />
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Link
                        to={`/tradesman/${tradesperson.tradesmanId}`}
                        className="btn btn-primary btn-sm flex-1"
                      >
                        View Profile
                      </Link>
                      <a
                        href={`https://wa.me/92${tradesperson.user.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-secondary btn-sm"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-8">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn btn-secondary btn-sm"
                  >
                    Previous
                  </button>
                  <span className="text-gray-600">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="btn btn-secondary btn-sm"
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
