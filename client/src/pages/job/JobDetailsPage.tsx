import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Calendar, Clock, Briefcase, User, Phone, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Layout from '../../components/Layout/Layout'
import api from '../../lib/api'
import { formatDateTime } from '../../lib/utils'

export default function JobDetailsPage() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchJobDetails()
  }, [jobId])

  const fetchJobDetails = async () => {
    try {
      const response = await api.get(`/jobs/${jobId}`)
      setJob(response.data)
    } catch (error: any) {
      console.error('Error fetching job details:', error)
      toast.error(error.response?.data?.message || 'Failed to load job details')
      navigate('/dashboard/customer')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: any = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      ACCEPTED: { color: 'bg-green-100 text-green-800', text: 'Accepted' },
      COMPLETED: { color: 'bg-blue-100 text-blue-800', text: 'Completed' },
      CANCELLED: { color: 'bg-red-100 text-red-800', text: 'Cancelled' },
    }
    const badge = badges[status] || badges.PENDING
    return <span className={`badge ${badge.color}`}>{badge.text}</span>
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    )
  }

  if (!job) {
    return null
  }

  const acceptedResponses = job.responses?.filter((r: any) => r.status === 'ACCEPTED') || []

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <Link 
            to="/dashboard/customer" 
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>

          <div className="card mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Job #{job.jobId}</h1>
                {getStatusBadge(job.status)}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start gap-3">
                <Briefcase className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Services</p>
                  <p className="font-medium">
                    {job.services?.map((s: any) => s.service.name).join(', ')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium">{job.location}</p>
                </div>
              </div>

              {job.preferredDate && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Preferred Date</p>
                    <p className="font-medium">{formatDateTime(job.preferredDate)}</p>
                  </div>
                </div>
              )}

              {job.preferredTime && (
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Preferred Time</p>
                    <p className="font-medium">{job.preferredTime}</p>
                  </div>
                </div>
              )}
            </div>

            {job.description && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
              </div>
            )}

            {job.images && job.images.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {job.images.map((image: string, index: number) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Job image ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600">
                Posted on {formatDateTime(job.createdAt)}
              </p>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">
              Interested Tradespeople ({acceptedResponses.length})
            </h2>

            {acceptedResponses.length === 0 ? (
              <div className="text-center py-8">
                <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No tradespeople have accepted this job yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  You'll be notified when someone accepts your job request
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {acceptedResponses.map((response: any) => (
                  <div 
                    key={response.id} 
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">
                          {response.tradesman.businessName}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Tradesman ID: {response.tradesman.tradesmanId}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            <span>{response.tradesman.user.mobile}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            <span>{response.tradesman.user.whatsapp}</span>
                          </div>
                        </div>
                      </div>
                      <Link
                        to={`/tradesman/${response.tradesman.tradesmanId}`}
                        className="btn btn-primary btn-sm"
                      >
                        View Profile
                      </Link>
                    </div>

                    {response.respondedAt && (
                      <p className="text-xs text-gray-500 pt-3 border-t">
                        Accepted on {formatDateTime(response.respondedAt)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
