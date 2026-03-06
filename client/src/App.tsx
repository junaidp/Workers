import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import HomePage from './pages/HomePage'
import LoginPage from './pages/auth/LoginPage'
import CustomerRegisterPage from './pages/auth/CustomerRegisterPage'
import TradesmanRegisterPage from './pages/auth/TradesmanRegisterPage'
import VerifyPage from './pages/auth/VerifyPage'
import PostJobPage from './pages/job/PostJobPage'
import SearchTradesmenPage from './pages/tradesman/SearchTradesmenPage'
import TradesmanProfilePage from './pages/tradesman/TradesmanProfilePage'
import CustomerDashboard from './pages/customer/CustomerDashboard'
import TradesmanDashboard from './pages/tradesman/TradesmanDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import ServiceCategoryPage from './pages/services/ServiceCategoryPage'
import ServiceDetailPage from './pages/services/ServiceDetailPage'
import ContactPage from './pages/ContactPage'
import HowItWorksPage from './pages/HowItWorksPage'
import BlogPage from './pages/BlogPage'
import JobDetailsPage from './pages/job/JobDetailsPage'

function App() {
  const { user } = useAuthStore()

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register/customer" element={<CustomerRegisterPage />} />
      <Route path="/register/tradesman" element={<TradesmanRegisterPage />} />
      <Route path="/verify" element={<VerifyPage />} />
      
      <Route path="/post-job" element={<PostJobPage />} />
      <Route path="/job/:jobId" element={<JobDetailsPage />} />
      <Route path="/search-tradesmen" element={<SearchTradesmenPage />} />
      <Route path="/tradesman/:tradesmanId" element={<TradesmanProfilePage />} />
      
      <Route path="/services/:categorySlug" element={<ServiceCategoryPage />} />
      <Route path="/service/:serviceSlug" element={<ServiceDetailPage />} />
      
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/how-it-works" element={<HowItWorksPage />} />
      <Route path="/blog" element={<BlogPage />} />
      
      <Route 
        path="/dashboard/customer" 
        element={user?.role === 'CUSTOMER' ? <CustomerDashboard /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/dashboard/tradesman" 
        element={user?.role === 'TRADESMAN' ? <TradesmanDashboard /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/dashboard/admin" 
        element={user?.role === 'ADMIN' ? <AdminDashboard /> : <Navigate to="/login" />} 
      />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App
