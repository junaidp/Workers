import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, Clock, CheckCircle, XCircle, DollarSign, TrendingUp, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Layout from '../../components/Layout/Layout'
import api from '../../lib/api'
import { formatDateTime } from '../../lib/utils'

export default function TradesmanDashboard() {
  const [jobResponses, setJobResponses] = useState<any[]>([])
  const [credit, setCredit] = useState(0)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [responsesRes, creditRes, transactionsRes] = await Promise.all([
        api.get('/tradesman/dashboard/jobs'),
        api.get('/credit/balance'),
        api.get('/credit/transactions')
      ])
      setJobResponses(responsesRes.data)
      setCredit(creditRes.data.balance)
      setTransactions(transactionsRes.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptJob = async (jobId: string) => {
    if (credit < 1) {
      toast.error('Insufficient credit. Please top up.')
      return
    }

    try {
      await api.post(`/jobs/${jobId}/accept`)
      toast.success('Job accepted successfully!')
      fetchDashboardData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to accept job')
    }
  }

  const handleDeclineJob = async (jobId: string) => {
    try {
      await api.post(`/jobs/${jobId}/decline`)
      toast.success('Job declined')
      fetchDashboardData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to decline job')
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: any = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      ACCEPTED: { color: 'bg-green-100 text-green-800', text: 'Accepted' },
      DECLINED: { color: 'bg-red-100 text-red-800', text: 'Declined' },
      TIMEOUT: { color: 'bg-gray-100 text-gray-800', text: 'Timeout' },
    }
    const badge = badges[status] || badges.PENDING
    return <span className={`badge ${badge.color}`}>{badge.text}</span>
  }

  const pendingJobs = jobResponses.filter(r => r.status === 'PENDING')
  const acceptedJobs = jobResponses.filter(r => r.status === 'ACCEPTED')
  const declinedJobs = jobResponses.filter(r => r.status === 'DECLINED')

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Tradesman Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your job leads and earnings</p>
          </div>

          {credit < 3 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-yellow-800 font-medium">Low Credit Balance</p>
                <p className="text-yellow-700 text-sm mt-1">
                  You have only {credit} credit(s) remaining. Top up to keep receiving job leads.
                </p>
              </div>
              <Link to="/credit/topup" className="btn btn-accent btn-sm whitespace-nowrap">
                Top Up Now
              </Link>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Credit Balance</p>
                  <p className="text-2xl font-bold text-gray-900">{credit}</p>
                </div>
                <DollarSign className="w-10 h-10 text-green-600" />
              </div>
              <Link to="/credit/topup" className="mt-3 text-sm text-primary-600 hover:text-primary-700 font-medium">
                Top up credit →
              </Link>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Leads</p>
                  <p className="text-2xl font-bold text-gray-900">{pendingJobs.length}</p>
                </div>
                <Clock className="w-10 h-10 text-yellow-600" />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Accepted Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">{acceptedJobs.length}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Leads</p>
                  <p className="text-2xl font-bold text-gray-900">{jobResponses.length}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="card">
                <h2 className="text-xl font-semibold mb-4">Pending Job Leads</h2>
                
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                  </div>
                ) : pendingJobs.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No pending job leads at the moment</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingJobs.map(response => (
                      <div key={response.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">Job #{response.job.jobId}</h3>
                            <p className="text-sm text-gray-600">
                              {response.job.services.map((s: any) => s.service.name).join(', ')}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              📍 {response.job.location}
                            </p>
                          </div>
                          {getStatusBadge(response.status)}
                        </div>

                        {response.job.description && (
                          <p className="text-gray-700 text-sm mb-3">{response.job.description}</p>
                        )}

                        <div className="flex gap-2 pt-3 border-t">
                          <button
                            onClick={() => handleAcceptJob(response.job.jobId)}
                            disabled={credit < 1}
                            className="btn btn-primary btn-sm flex-1"
                          >
                            Accept (1 Credit)
                          </button>
                          <button
                            onClick={() => handleDeclineJob(response.job.jobId)}
                            className="btn btn-secondary btn-sm flex-1"
                          >
                            Decline
                          </button>
                        </div>

                        <p className="text-xs text-gray-500 mt-2">
                          Received: {formatDateTime(response.notifiedAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card">
                <h2 className="text-xl font-semibold mb-4">Accepted Jobs</h2>
                
                {acceptedJobs.length === 0 ? (
                  <p className="text-gray-600 text-center py-4">No accepted jobs yet</p>
                ) : (
                  <div className="space-y-4">
                    {acceptedJobs.map(response => (
                      <div key={response.id} className="border border-green-200 bg-green-50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold">Job #{response.job.jobId}</h3>
                            <p className="text-sm text-gray-600">
                              {response.job.services.map((s: any) => s.service.name).join(', ')}
                            </p>
                          </div>
                          {getStatusBadge(response.status)}
                        </div>

                        <div className="bg-white rounded p-3 mt-3">
                          <p className="text-sm font-medium mb-1">Customer Contact:</p>
                          <p className="text-sm text-gray-700">
                            {response.job.customer.fullName}
                          </p>
                          <p className="text-sm text-gray-600">
                            📞 {response.job.customer.user.mobile}
                          </p>
                          <p className="text-sm text-gray-600">
                            WhatsApp: {response.job.customer.user.whatsapp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="card">
                <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
                
                {transactions.length === 0 ? (
                  <p className="text-gray-600 text-sm">No transactions yet</p>
                ) : (
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map(transaction => (
                      <div key={transaction.id} className="flex justify-between items-center text-sm">
                        <div>
                          <p className="font-medium">{transaction.type.replace(/_/g, ' ')}</p>
                          <p className="text-gray-500 text-xs">
                            {formatDateTime(transaction.createdAt)}
                          </p>
                        </div>
                        <span className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card bg-primary-50 border border-primary-200">
                <h3 className="font-semibold text-primary-900 mb-2">How It Works</h3>
                <ul className="space-y-2 text-sm text-primary-800">
                  <li>• Receive job leads matching your skills</li>
                  <li>• Pay 1 credit only when you view customer contact</li>
                  <li>• Respond within 1 hour for best results</li>
                  <li>• Build your reputation with good reviews</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
