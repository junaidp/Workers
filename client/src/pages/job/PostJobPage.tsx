import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Upload, Camera } from 'lucide-react'
import toast from 'react-hot-toast'
import Layout from '../../components/Layout/Layout'
import api from '../../lib/api'
import { pakistanCities } from '../../lib/utils'
import { useAuthStore } from '../../stores/authStore'

const STEPS = ['Service', 'Details', 'Description', 'Photos', 'Location', 'Schedule', 'Contact']

export default function PostJobPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [categories, setCategories] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<any>(null)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [formData, setFormData] = useState({
    description: '',
    city: '',
    area: '',
    preferredDate: '',
    preferredTime: '',
    isFlexible: false,
    fullName: '',
    email: '',
    mobile: '',
    whatsapp: '',
  })
  const [images, setImages] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuthStore()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await api.get('/services/categories')
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setImages(prev => [...prev, ...newFiles].slice(0, 5))
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please login or register to post a job')
      navigate('/register/customer')
      return
    }

    if (selectedServices.length === 0) {
      toast.error('Please select at least one service')
      return
    }

    setLoading(true)

    try {
      const submitData = new FormData()
      submitData.append('serviceIds', JSON.stringify(selectedServices))
      submitData.append('description', formData.description)
      submitData.append('city', formData.city)
      submitData.append('area', formData.area)
      submitData.append('preferredDate', formData.preferredDate)
      submitData.append('preferredTime', formData.preferredTime)
      submitData.append('isFlexible', formData.isFlexible.toString())
      
      images.forEach(image => {
        submitData.append('images', image)
      })

      const response = await api.post('/jobs', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      toast.success('Job posted successfully!')
      navigate('/dashboard/customer')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to post job')
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (currentStep === 0 && selectedServices.length === 0) {
      toast.error('Please select at least one service')
      return
    }
    if (currentStep === 4 && (!formData.city || !formData.area)) {
      toast.error('Please enter city and area')
      return
    }
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleSubmit()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Post a Job</h1>
            <p className="text-gray-600">Tell us what you need and get matched with verified tradespeople</p>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between">
              {STEPS.map((step, index) => (
                <div key={step} className="flex-1 relative">
                  <div className={`flex items-center ${index !== STEPS.length - 1 ? 'pr-8' : ''}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      index <= currentStep ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    {index !== STEPS.length - 1 && (
                      <div className={`absolute top-5 left-10 w-full h-0.5 ${
                        index < currentStep ? 'bg-primary-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                  <p className="text-xs mt-1 hidden md:block">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card min-h-[400px]">
            {currentStep === 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">What service do you need?</h2>
                <div className="space-y-6">
                  {categories.map(category => (
                    <div key={category.id}>
                      <h3 className="font-semibold text-primary-600 mb-3">{category.name}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {category.services.map((service: any) => (
                          <label key={service.id} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                              type="checkbox"
                              checked={selectedServices.includes(service.id)}
                              onChange={() => handleServiceToggle(service.id)}
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <span>{service.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">More details about the service</h2>
                <p className="text-gray-600 mb-4">Select specific services you need (Optional)</p>
                <div className="space-y-3">
                  <p className="text-sm text-gray-500">You can add more details in the next step</p>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Describe your job</h2>
                <p className="text-gray-600 mb-4">Provide details to help tradespeople understand your requirements (Optional)</p>
                <textarea
                  className="input"
                  rows={6}
                  placeholder="E.g., I need to install a ceiling fan in my bedroom. The fan is already purchased."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Add photos (Optional)</h2>
                <p className="text-gray-600 mb-4">Photos help tradespeople understand the job better</p>
                
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <label className="btn btn-secondary btn-md cursor-pointer">
                      <Upload className="w-5 h-5 mr-2" />
                      Upload Photos
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {images.length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Where is the work needed?</h2>
                <p className="text-gray-600 mb-4">Your full address won't be shared until you choose a tradesperson</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="label">City *</label>
                    <select
                      className="input"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      required
                    >
                      <option value="">Select City</option>
                      {pakistanCities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label">Area/Town *</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="E.g., Clifton, DHA Phase 5"
                      value={formData.area}
                      onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">When do you need this done?</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center space-x-2 mb-4">
                      <input
                        type="checkbox"
                        checked={formData.isFlexible}
                        onChange={(e) => setFormData(prev => ({ ...prev, isFlexible: e.target.checked }))}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span>I'm flexible with the date and time</span>
                    </label>
                  </div>

                  {!formData.isFlexible && (
                    <>
                      <div>
                        <label className="label">Preferred Date</label>
                        <input
                          type="date"
                          className="input"
                          value={formData.preferredDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, preferredDate: e.target.value }))}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>

                      <div>
                        <label className="label">Preferred Time</label>
                        <select
                          className="input"
                          value={formData.preferredTime}
                          onChange={(e) => setFormData(prev => ({ ...prev, preferredTime: e.target.value }))}
                        >
                          <option value="">Select time</option>
                          <option value="morning">Morning (8 AM - 12 PM)</option>
                          <option value="afternoon">Afternoon (12 PM - 4 PM)</option>
                          <option value="evening">Evening (4 PM - 8 PM)</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {currentStep === 6 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Review and Submit</h2>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Selected Services:</h3>
                    <p className="text-sm text-gray-600">{selectedServices.length} service(s) selected</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Location:</h3>
                    <p className="text-sm text-gray-600">{formData.area}, {formData.city}</p>
                  </div>

                  {formData.description && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Description:</h3>
                      <p className="text-sm text-gray-600">{formData.description}</p>
                    </div>
                  )}

                  {images.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Photos:</h3>
                      <p className="text-sm text-gray-600">{images.length} photo(s) attached</p>
                    </div>
                  )}

                  <div className="bg-primary-50 border border-primary-200 p-4 rounded-lg">
                    <p className="text-sm text-primary-800">
                      By submitting, you'll receive responses from up to 3 verified tradespeople. 
                      Your contact information will only be shared with tradespeople who accept your job.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8 pt-6 border-t">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="btn btn-secondary btn-md"
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Back
              </button>

              <button
                onClick={nextStep}
                disabled={loading}
                className="btn btn-primary btn-md"
              >
                {currentStep === STEPS.length - 1 ? (loading ? 'Submitting...' : 'Submit Job') : (
                  <>
                    Next
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
