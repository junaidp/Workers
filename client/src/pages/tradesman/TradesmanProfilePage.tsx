import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Star, MapPin, Award, Image as ImageIcon, FileText, Phone, MessageCircle } from 'lucide-react'
import Layout from '../../components/Layout/Layout'
import api from '../../lib/api'
import { formatDate } from '../../lib/utils'

export default function TradesmanProfilePage() {
  const { tradesmanId } = useParams()
  const [tradesman, setTradesman] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (tradesmanId) {
      fetchTradesman()
    }
  }, [tradesmanId])

  const fetchTradesman = async () => {
    try {
      const response = await api.get(`/tradesman/${tradesmanId}`)
      setTradesman(response.data)
    } catch (error) {
      console.error('Error fetching tradesman:', error)
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

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  if (!tradesman) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Tradesman Not Found</h2>
            <Link to="/search-tradesmen" className="btn btn-primary btn-md mt-4">
              Back to Search
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="card mb-6">
              <div className="flex flex-col md:flex-row gap-6">
                <img
                  src={tradesman.profilePicture}
                  alt={tradesman.businessName}
                  className="w-32 h-32 rounded-full object-cover"
                />
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">{tradesman.businessName}</h1>
                      <p className="text-gray-600">
                        {tradesman.user.firstName} {tradesman.user.lastName}
                      </p>
                      <p className="text-sm text-gray-500">ID: {tradesman.tradesmanId}</p>
                    </div>
                    <span className={`badge ${getBadgeColor(tradesman.badge)} text-base px-3 py-1`}>
                      {tradesman.badge}
                    </span>
                  </div>

                  {tradesman.rating > 0 && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= tradesman.rating
                                ? 'text-yellow-500 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-semibold">{tradesman.rating.toFixed(1)}</span>
                      <span className="text-gray-600">({tradesman.reviewCount} reviews)</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <MapPin className="w-5 h-5" />
                    <span>{tradesman.city}</span>
                  </div>

                  <Link
                    to={`/post-job?tradesman=${tradesman.tradesmanId}`}
                    className="btn btn-accent btn-lg"
                  >
                    Contact for Job
                  </Link>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="card">
                  <h2 className="text-xl font-semibold mb-4">About *</h2>
                  <p className="text-gray-700 whitespace-pre-line">{tradesman.description}</p>
                  <p className="text-xs text-gray-500 mt-4">
                    * Our company does not verify tradesman's descriptions. If you suspect incorrect details, please contact us.
                  </p>
                </div>

                <div className="card">
                  <h2 className="text-xl font-semibold mb-4">Services Offered</h2>
                  <div className="flex flex-wrap gap-2">
                    {tradesman.services.map((ts: any) => (
                      <span
                        key={ts.id}
                        className="bg-primary-50 text-primary-700 px-3 py-1.5 rounded-lg text-sm font-medium"
                      >
                        {ts.service.name}
                      </span>
                    ))}
                  </div>
                </div>

                {tradesman.portfolioImages.length > 0 && (
                  <div className="card">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" />
                      Portfolio
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {tradesman.portfolioImages.map((img: any) => (
                        <img
                          key={img.id}
                          src={img.imageUrl}
                          alt="Portfolio"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {tradesman.certifications.length > 0 && (
                  <div className="card">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Certifications
                    </h2>
                    <div className="space-y-3">
                      {tradesman.certifications.map((cert: any) => (
                        <div key={cert.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Award className="w-5 h-5 text-primary-600" />
                          <span className="font-medium">{cert.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tradesman.reviews.length > 0 && (
                  <div className="card">
                    <h2 className="text-xl font-semibold mb-4">Customer Reviews</h2>
                    <div className="space-y-4">
                      {tradesman.reviews.map((review: any) => (
                        <div key={review.id} className="border-b border-gray-200 pb-4 last:border-0">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= review.rating
                                      ? 'text-yellow-500 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                          {review.comment && (
                            <p className="text-gray-700">{review.comment}</p>
                          )}
                          <p className="text-sm text-gray-500 mt-1">
                            - {review.customer.user.firstName || 'Customer'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="card bg-primary-50 border border-primary-200">
                  <h3 className="font-semibold text-primary-900 mb-4">Ready to hire?</h3>
                  <Link
                    to={`/post-job?tradesman=${tradesman.tradesmanId}`}
                    className="btn btn-accent btn-lg w-full"
                  >
                    Post a Job
                  </Link>
                  <p className="text-sm text-primary-800 mt-3">
                    Contact this tradesperson directly by posting your job requirements.
                  </p>
                </div>

                <div className="card">
                  <h3 className="font-semibold mb-3">Business Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-gray-600">Location</p>
                      <p className="font-medium">{tradesman.town}, {tradesman.city}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total Jobs Completed</p>
                      <p className="font-medium">{tradesman.totalJobsCompleted}</p>
                    </div>
                  </div>
                </div>

                <div className="card bg-yellow-50 border border-yellow-200">
                  <h3 className="font-semibold text-yellow-900 mb-2">Note</h3>
                  <p className="text-sm text-yellow-800">
                    Contact details will only be shared after you post a job and the tradesperson accepts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
