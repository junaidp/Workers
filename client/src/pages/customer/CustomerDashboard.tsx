import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, Clock, CheckCircle, XCircle, Eye, Plus } from 'lucide-react'
import Layout from '../../components/Layout/Layout'
import api from '../../lib/api'
import { formatDateTime } from '../../lib/utils'

export default function CustomerDashboard() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs/my-jobs')
      setJobs(response.data)
    } catch (error) {
      console.error('Error fetching jobs:', error)
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

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Jobs</h1>
              <p className="text-gray-600 mt-1">Track and manage your job requests</p>
            </div>
            <Link to="/post-job" className="btn btn-primary btn-md">
              <Plus className="w-5 h-5 mr-2" />
              Post New Job
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">{jobs.length}</p>
                </div>
                <Briefcase className="w-10 h-10 text-primary-600" />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {jobs.filter(j => j.status === 'PENDING').length}
                  </p>
                </div>
                <Clock className="w-10 h-10 text-yellow-600" />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {jobs.filter(j => j.status === 'COMPLETED').length}
                  </p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-4">All Jobs</h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">You haven't posted any jobs yet</p>
                <Link to="/post-job" className="btn btn-primary btn-md">
                  Post Your First Job
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map(job => (
                  <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">Job #{job.jobId}</h3>
                          {getStatusBadge(job.status)}
                        </div>
                        <p className="text-gray-600 text-sm mb-2">
                          {job.services.map((s: any) => s.service.name).join(', ')}
                        </p>
                        <p className="text-gray-500 text-sm">
                          📍 {job.location} • 📅 {formatDateTime(job.createdAt)}
                        </p>
                      </div>
                    </div>

                    {job.description && (
                      <p className="text-gray-700 text-sm mb-3">{job.description}</p>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="text-sm text-gray-600">
                        {job.responses.filter((r: any) => r.status === 'ACCEPTED').length} tradesperson(s) accepted
                      </div>
                      <Link to={`/job/${job.jobId}`} className="btn btn-outline btn-sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Link>
                    </div>

                    {job.responses.filter((r: any) => r.status === 'ACCEPTED').length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="text-sm font-semibold mb-2">Interested Tradespeople:</h4>
                        <div className="space-y-2">
                          {job.responses
                            .filter((r: any) => r.status === 'ACCEPTED')
                            .map((response: any) => (
                              <div key={response.id} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                                <div>
                                  <p className="font-medium">Tradesman {response.tradesman.tradesmanId}</p>
                                  <p className="text-sm text-gray-600">
                                    📞 {response.tradesman.user.mobile} • 
                                    WhatsApp: {response.tradesman.user.whatsapp}
                                  </p>
                                </div>
                                <Link 
                                  to={`/tradesman/${response.tradesman.tradesmanId}`}
                                  className="btn btn-secondary btn-sm"
                                >
                                  View Profile
                                </Link>
                              </div>
                            ))}
                        </div>
                      </div>
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
