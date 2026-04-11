import { useEffect, useState } from 'react'
import { Users, Briefcase, CheckCircle, Clock, Award, Eye, X, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import Layout from '../../components/Layout/Layout'
import api from '../../lib/api'
import { formatDateTime } from '../../lib/utils'

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [pendingTradesmen, setPendingTradesmen] = useState<any[]>([])
  const [selectedTradesman, setSelectedTradesman] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pending' | 'users' | 'reports'>('pending')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, tradesmenRes] = await Promise.all([
        api.get('/admin/dashboard/stats'),
        api.get('/admin/tradesmen/pending')
      ])
      setStats(statsRes.data)
      setPendingTradesmen(tradesmenRes.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveTradesman = async (id: string) => {
    try {
      await api.post(`/admin/tradesman/${id}/approve`)
      toast.success('Tradesman approved successfully')
      fetchDashboardData()
      setSelectedTradesman(null)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to approve tradesman')
    }
  }

  const handleRejectTradesman = async (id: string) => {
    const reason = prompt('Enter rejection reason (optional):')
    try {
      await api.post(`/admin/tradesman/${id}/reject`, { reason })
      toast.success('Tradesman rejected')
      fetchDashboardData()
      setSelectedTradesman(null)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reject tradesman')
    }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage platform operations and users</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6 mb-8">
                <button 
                  onClick={() => setActiveTab('users')}
                  className="card hover:shadow-lg transition-shadow cursor-pointer text-left"
                >
                  <div className="text-center">
                    <Users className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalCustomers || 0}</p>
                    <p className="text-sm text-gray-600">Customers</p>
                  </div>
                </button>

                <button 
                  onClick={() => setActiveTab('users')}
                  className="card hover:shadow-lg transition-shadow cursor-pointer text-left"
                >
                  <div className="text-center">
                    <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalTradesmen || 0}</p>
                    <p className="text-sm text-gray-600">Tradesmen</p>
                  </div>
                </button>

                <button 
                  onClick={() => setActiveTab('pending')}
                  className="card hover:shadow-lg transition-shadow cursor-pointer text-left"
                >
                  <div className="text-center">
                    <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{stats?.pendingTradesmen || 0}</p>
                    <p className="text-sm text-gray-600">Pending</p>
                  </div>
                </button>

                <button 
                  onClick={() => setActiveTab('reports')}
                  className="card hover:shadow-lg transition-shadow cursor-pointer text-left"
                >
                  <div className="text-center">
                    <Briefcase className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalJobs || 0}</p>
                    <p className="text-sm text-gray-600">Total Jobs</p>
                  </div>
                </button>

                <button 
                  onClick={() => setActiveTab('reports')}
                  className="card hover:shadow-lg transition-shadow cursor-pointer text-left"
                >
                  <div className="text-center">
                    <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{stats?.activeJobs || 0}</p>
                    <p className="text-sm text-gray-600">Active Jobs</p>
                  </div>
                </button>

                <button 
                  onClick={() => setActiveTab('reports')}
                  className="card hover:shadow-lg transition-shadow cursor-pointer text-left"
                >
                  <div className="text-center">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{stats?.completedJobs || 0}</p>
                    <p className="text-sm text-gray-600">Completed</p>
                  </div>
                </button>
              </div>

              <div className="card">
                <div className="border-b border-gray-200 mb-6">
                  <nav className="flex space-x-8">
                    <button
                      onClick={() => setActiveTab('pending')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'pending'
                          ? 'border-primary-600 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Pending Approvals ({pendingTradesmen.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('users')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'users'
                          ? 'border-primary-600 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      User Management
                    </button>
                    <button
                      onClick={() => setActiveTab('reports')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'reports'
                          ? 'border-primary-600 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Reports
                    </button>
                  </nav>
                </div>

                {activeTab === 'pending' && (
                  <div>
                    {pendingTradesmen.length === 0 ? (
                      <div className="text-center py-8">
                        <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No pending tradesman applications</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {pendingTradesmen.map(tradesman => (
                          <div key={tradesman.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg">{tradesman.businessName}</h3>
                                <p className="text-sm text-gray-600">
                                  {tradesman.user.firstName} {tradesman.user.lastName}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Mobile: {tradesman.user.mobile} | Email: {tradesman.user.email || 'N/A'}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Location: {tradesman.town}, {tradesman.city}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Applied: {formatDateTime(tradesman.createdAt)}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setSelectedTradesman(tradesman)}
                                  className="btn btn-secondary btn-sm"
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  Review
                                </button>
                                <button
                                  onClick={() => handleApproveTradesman(tradesman.id)}
                                  className="btn btn-primary btn-sm"
                                >
                                  <Check className="w-4 h-4 mr-1" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleRejectTradesman(tradesman.id)}
                                  className="btn btn-secondary btn-sm text-red-600"
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Reject
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'users' && (
                  <div className="text-center py-8">
                    <p className="text-gray-600">User management interface</p>
                  </div>
                )}

                {activeTab === 'reports' && (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Reports and analytics</p>
                  </div>
                )}
              </div>
            </>
          )}

          {selectedTradesman && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-2xl font-bold">Review Application</h2>
                    <button
                      onClick={() => setSelectedTradesman(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2">Business Information</h3>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                        <p><strong>Business Name:</strong> {selectedTradesman.businessName}</p>
                        <p><strong>Owner:</strong> {selectedTradesman.user.firstName} {selectedTradesman.user.lastName}</p>
                        <p><strong>CNIC:</strong> {selectedTradesman.cnicNumber}</p>
                        <p><strong>Address:</strong> {selectedTradesman.businessAddress}</p>
                        <p><strong>Mobile:</strong> {selectedTradesman.user.mobile}</p>
                        <p><strong>WhatsApp:</strong> {selectedTradesman.user.whatsapp}</p>
                        <p><strong>Email:</strong> {selectedTradesman.user.email || 'N/A'}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedTradesman.description}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Services Offered ({selectedTradesman.services.length})</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedTradesman.services.map((ts: any) => (
                          <span key={ts.id} className="bg-primary-50 text-primary-700 px-3 py-1 rounded text-sm">
                            {ts.service.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold mb-2">Profile Picture</h3>
                        <img src={selectedTradesman.profilePicture} alt="Profile" className="w-full h-48 object-cover rounded-lg" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">CNIC Image</h3>
                        <img src={selectedTradesman.cnicImage} alt="CNIC" className="w-full h-48 object-cover rounded-lg" />
                      </div>
                    </div>

                    {selectedTradesman.portfolioImages.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Portfolio ({selectedTradesman.portfolioImages.length})</h3>
                        <div className="grid grid-cols-3 gap-4">
                          {selectedTradesman.portfolioImages.map((img: any) => (
                            <img key={img.id} src={img.imageUrl} alt="Portfolio" className="w-full h-32 object-cover rounded-lg" />
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-4 pt-4 border-t">
                      <button
                        onClick={() => handleApproveTradesman(selectedTradesman.id)}
                        className="btn btn-primary btn-lg flex-1"
                      >
                        Approve Application
                      </button>
                      <button
                        onClick={() => handleRejectTradesman(selectedTradesman.id)}
                        className="btn btn-secondary btn-lg flex-1"
                      >
                        Reject Application
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
