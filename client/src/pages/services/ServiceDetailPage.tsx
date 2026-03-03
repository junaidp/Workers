import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle, ArrowRight, Star } from 'lucide-react'
import Layout from '../../components/Layout/Layout'
import api from '../../lib/api'

export default function ServiceDetailPage() {
  const { serviceSlug } = useParams()
  const [service, setService] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (serviceSlug) {
      fetchService()
    }
  }, [serviceSlug])

  const fetchService = async () => {
    try {
      const response = await api.get(`/services/service/${serviceSlug}`)
      setService(response.data)
    } catch (error) {
      console.error('Error fetching service:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  if (!service) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Not Found</h2>
            <Link to="/" className="btn btn-primary btn-md mt-4">
              Back to Home
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl">
              <div className="text-sm text-primary-100 mb-2">
                <Link to={`/services/${service.category.slug}`} className="hover:text-white">
                  {service.category.name}
                </Link>
                {service.parent && (
                  <>
                    {' > '}
                    <Link to={`/service/${service.parent.slug}`} className="hover:text-white">
                      {service.parent.name}
                    </Link>
                  </>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{service.name}</h1>
              <p className="text-xl text-primary-100">
                Professional {service.name.toLowerCase()} services in Pakistan
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="card">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About {service.name}</h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {service.description || `Get professional ${service.name.toLowerCase()} services from verified tradespeople. Our platform connects you with experienced professionals who can handle your job with expertise and reliability.`}
                  </p>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Why Choose Our Platform?</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>100% free for customers - no hidden charges</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>All tradespeople are verified with ID and credentials</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Get responses from up to 3 qualified professionals</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Read reviews from real customers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Save time and get the job done right</span>
                    </li>
                  </ul>

                  <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">How It Works</h3>
                  <ol className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">1</span>
                      <div>
                        <strong>Post your job requirements</strong>
                        <p className="text-gray-600">Tell us what you need done - it's quick and free</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">2</span>
                      <div>
                        <strong>Receive quotes from professionals</strong>
                        <p className="text-gray-600">Up to 3 verified tradespeople will contact you</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">3</span>
                      <div>
                        <strong>Choose and hire with confidence</strong>
                        <p className="text-gray-600">Compare profiles, reviews, and prices before deciding</p>
                      </div>
                    </li>
                  </ol>
                </div>
              </div>

              {service.children && service.children.length > 0 && (
                <div className="card">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Specific Services Available</h2>
                  <div className="grid md:grid-cols-2 gap-3">
                    {service.children.map((child: any) => (
                      <Link
                        key={child.id}
                        to={`/service/${child.slug}`}
                        className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-colors"
                      >
                        <ArrowRight className="w-4 h-4 text-primary-600" />
                        <span className="font-medium text-gray-900">{child.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="card bg-accent-50 border-2 border-accent-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Get Started Now</h3>
                <Link to={`/post-job?service=${service.name}`} className="btn btn-accent btn-lg w-full mb-3">
                  Post a Job - Free
                </Link>
                <p className="text-sm text-gray-600 text-center">
                  Average response time: 2 hours
                </p>
              </div>

              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-3">Or Browse Professionals</h3>
                <Link
                  to={`/search-tradesmen?service=${service.id}`}
                  className="btn btn-outline btn-md w-full"
                >
                  Search Tradespeople
                </Link>
              </div>

              <div className="card bg-gray-50">
                <h3 className="font-semibold text-gray-900 mb-3">Customer Benefits</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <Star className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <span>Rated 4.8/5 by customers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>No payment until job completion</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Support available 7 days a week</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
