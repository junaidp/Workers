import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Briefcase, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import Layout from '../../components/Layout/Layout'
import api from '../../lib/api'
import { pakistanCities } from '../../lib/utils'

export default function TradesmanRegisterPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    businessName: '',
    buildingNumber: '',
    street: '',
    town: '',
    city: '',
    description: '',
    whatsapp: '',
    mobile: '',
    landline: '',
    website: '',
    cnicNumber: '',
  })
  const [files, setFiles] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await api.get('/services/categories')
      setCategories(response.data)
      const allServices = response.data.flatMap((cat: any) => cat.services)
      setServices(allServices)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    if (e.target.files) {
      setFiles((prev: any) => ({
        ...prev,
        [fieldName]: e.target.files
      }))
    }
  }

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedServices.length === 0) {
      toast.error('Please select at least one service')
      return
    }

    if (!files.profilePicture || !files.cnicImage || !files.proofOfAddress) {
      toast.error('Please upload all required documents')
      return
    }

    setLoading(true)

    try {
      const submitData = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value)
      })
      submitData.append('serviceIds', JSON.stringify(selectedServices))

      Object.entries(files).forEach(([key, fileList]) => {
        if (fileList) {
          if (key === 'portfolioImages' || key === 'certifications') {
            Array.from(fileList as FileList).forEach((file) => {
              submitData.append(key, file)
            })
          } else {
            submitData.append(key, (fileList as FileList)[0])
          }
        }
      })

      await api.post('/tradesman/register', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      toast.success('Registration submitted! Please check your phone for verification.')
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
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Briefcase className="mx-auto h-12 w-12 text-primary-600" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Join as a Tradesperson
            </h2>
            <p className="mt-2 text-lg text-gray-600">
              Grow your business with zero commission
            </p>
            <div className="mt-4 flex justify-center gap-6 text-sm">
              <span className="text-green-600 font-semibold">✓ No Monthly Fees</span>
              <span className="text-green-600 font-semibold">✓ Keep 100% Earnings</span>
              <span className="text-green-600 font-semibold">✓ 2 FREE Jobs</span>
            </div>
          </div>

          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">First Name <span className="text-red-500">*</span></label>
                    <input name="firstName" required className="input" value={formData.firstName} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="label">Last Name <span className="text-red-500">*</span></label>
                    <input name="lastName" required className="input" value={formData.lastName} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input name="email" type="email" className="input" value={formData.email} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="label">CNIC Number <span className="text-red-500">*</span></label>
                    <input name="cnicNumber" required className="input" placeholder="1234567890123" value={formData.cnicNumber} onChange={handleChange} />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Business Information</h3>
                <div className="space-y-6">
                  <div>
                    <label className="label">Business Name <span className="text-red-500">*</span></label>
                    <input name="businessName" required className="input" value={formData.businessName} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="label">Website</label>
                    <input
                      name="website"
                      type="url"
                      placeholder="https://yourbusiness.com"
                      className="input"
                      value={formData.website}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="label">Building Number <span className="text-red-500">*</span></label>
                      <input name="buildingNumber" required className="input" value={formData.buildingNumber} onChange={handleChange} />
                    </div>
                    <div>
                      <label className="label">Street <span className="text-red-500">*</span></label>
                      <input name="street" required className="input" value={formData.street} onChange={handleChange} />
                    </div>
                    <div>
                      <label className="label">Town <span className="text-red-500">*</span></label>
                      <input name="town" required className="input" value={formData.town} onChange={handleChange} />
                    </div>
                    <div>
                      <label className="label">City <span className="text-red-500">*</span></label>
                      <select name="city" required className="input" value={formData.city} onChange={handleChange}>
                        <option value="">Select City</option>
                        {pakistanCities.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="label">Business Description <span className="text-red-500">*</span></label>
                    <textarea name="description" required className="input" rows={4} value={formData.description} onChange={handleChange} />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Contact Details</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">Mobile <span className="text-red-500">*</span></label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50">+92</span>
                      <input name="mobile" type="tel" required className="input rounded-l-none" placeholder="3001234567" value={formData.mobile} onChange={handleChange} maxLength={10} />
                    </div>
                  </div>
                  <div>
                    <label className="label">WhatsApp <span className="text-red-500">*</span></label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50">+92</span>
                      <input name="whatsapp" type="tel" required className="input rounded-l-none" placeholder="3001234567" value={formData.whatsapp} onChange={handleChange} maxLength={10} />
                    </div>
                  </div>
                  <div>
                    <label className="label">Landline</label>
                    <input name="landline" type="tel" className="input" value={formData.landline} onChange={handleChange} />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Documents</h3>
                <div className="space-y-4">
                  <div>
                    <label className="label">Profile Picture <span className="text-red-500">*</span></label>
                    <input type="file" accept="image/*" required onChange={(e) => handleFileChange(e, 'profilePicture')} className="input" />
                  </div>
                  <div>
                    <label className="label">CNIC Image <span className="text-red-500">*</span></label>
                    <input type="file" accept="image/*" required onChange={(e) => handleFileChange(e, 'cnicImage')} className="input" />
                  </div>
                  <div>
                    <label className="label">Proof of Address (Utility Bill) <span className="text-red-500">*</span></label>
                    <input type="file" accept="image/*,application/pdf" required onChange={(e) => handleFileChange(e, 'proofOfAddress')} className="input" />
                  </div>
                  <div>
                    <label className="label">Trade License</label>
                    <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(e, 'tradeLicense')} className="input" />
                  </div>
                  <div>
                    <label className="label">Portfolio Images</label>
                    <input type="file" accept="image/*" multiple onChange={(e) => handleFileChange(e, 'portfolioImages')} className="input" />
                  </div>
                  <div>
                    <label className="label">Certifications</label>
                    <input type="file" accept="image/*,application/pdf" multiple onChange={(e) => handleFileChange(e, 'certifications')} className="input" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Services Offered <span className="text-red-500">*</span></h3>
                <div className="space-y-4 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
                  {categories.map(category => (
                    <div key={category.id}>
                      <h4 className="font-semibold text-primary-600 mb-2">{category.name}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {category.services.map((service: any) => (
                          <label key={service.id} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedServices.includes(service.id)}
                              onChange={() => toggleService(service.id)}
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm">{service.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-sm text-gray-500">Selected: {selectedServices.length} service(s)</p>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
                {loading ? 'Submitting...' : 'Submit Registration'}
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
