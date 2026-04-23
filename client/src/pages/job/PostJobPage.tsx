import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Upload, Camera } from 'lucide-react'
import toast from 'react-hot-toast'
import Layout from '../../components/Layout/Layout'
import api from '../../lib/api'
import { pakistanCities } from '../../lib/utils'
import { useAuthStore } from '../../stores/authStore'
import { getServiceIcon } from '../../lib/serviceIcons'
import { getImageUrl } from '../../lib/imageUtils'

const STEPS = ['Service', 'Location', 'Schedule', 'Contact']

export default function PostJobPage() {
  const [searchParams] = useSearchParams()
  const [currentStep, setCurrentStep] = useState(0)
  const [categories, setCategories] = useState<any[]>([])
  const [allServices, setAllServices] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<any>(null)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [selectedSubServices, setSelectedSubServices] = useState<string[]>([])
  const [subServices, setSubServices] = useState<any[]>([])
  const [showDescription, setShowDescription] = useState(false)
  const [showPhotos, setShowPhotos] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredServices, setFilteredServices] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const [hasPreSelectedService, setHasPreSelectedService] = useState(false)
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
    countryCode: '+92',
  })
  const [images, setImages] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuthStore()

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    const serviceParam = searchParams.get('service')
    if (serviceParam && allServices.length > 0 && !hasPreSelectedService) {
      const matchedService = allServices.find(s => 
        s.name.toLowerCase().includes(serviceParam.toLowerCase())
      )
      if (matchedService) {
        setSelectedServices([matchedService.id])
        fetchSubServices(matchedService.id)
        setHasPreSelectedService(true)
      }
    }
  }, [searchParams, allServices, hasPreSelectedService])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = allServices.filter(service =>
        service.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredServices(filtered.slice(0, 10))
      setShowSuggestions(true)
    } else {
      setFilteredServices([])
      setShowSuggestions(false)
    }
  }, [searchQuery, allServices])

  const fetchCategories = async () => {
    try {
      const response = await api.get('/services/categories')
      setCategories(response.data)
      const services = response.data.flatMap((cat: any) => 
        cat.services.map((service: any) => ({
          ...service,
          categoryName: cat.name
        }))
      )
      setAllServices(services)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchSubServices = async (serviceId: string) => {
    try {
      const service = allServices.find(s => s.id === serviceId)
      if (service) {
        const response = await api.get(`/services/service/${service.slug}`)
        if (response.data.children && response.data.children.length > 0) {
          setSubServices(response.data.children)
        } else {
          setSubServices([])
          setShowDescription(true)
        }
      }
    } catch (error) {
      console.error('Error fetching sub-services:', error)
      setSubServices([])
      setShowDescription(true)
    }
  }

  const handleServiceSelect = (serviceId: string) => {
    setSelectedServices([serviceId])
    setSelectedSubServices([])
    setSearchQuery('')
    setShowSuggestions(false)
    setShowDescription(false)
    setShowPhotos(false)
    fetchSubServices(serviceId)
  }

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices([serviceId])
    setSelectedSubServices([])
    setShowDescription(false)
    setShowPhotos(false)
    fetchSubServices(serviceId)
  }

  const handleSubServiceToggle = (subServiceId: string) => {
    setSelectedSubServices([subServiceId])
    if (!showDescription) {
      setShowDescription(true)
    }
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
      const allServiceIds = [...selectedServices, ...selectedSubServices]
      submitData.append('serviceIds', JSON.stringify(allServiceIds))
      submitData.append('description', formData.description)
      submitData.append('city', formData.city)
      submitData.append('area', formData.area)
      submitData.append('preferredDate', formData.preferredDate)
      submitData.append('preferredTime', formData.preferredTime)
      submitData.append('isFlexible', formData.isFlexible.toString())
      submitData.append('fullName', formData.fullName)
      submitData.append('mobile', formData.countryCode + formData.mobile)
      if (formData.email) {
        submitData.append('email', formData.email)
      }
      
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
      toast.error('Please select a service')
      return
    }
    if (currentStep === 1 && (!formData.city || !formData.area)) {
      toast.error('Please enter city and area')
      return
    }
    if (currentStep === 3 && (!formData.fullName || !formData.mobile)) {
      toast.error('Please enter your name and phone number')
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
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">What service do you need?</h2>
                  
                  <div className="mb-6 relative" ref={searchRef}>
                    <input
                      type="text"
                      placeholder="Search for a service (e.g., plumber, electrician)..."
                      className="input"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
                    />
                    {showSuggestions && filteredServices.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {filteredServices.map((service) => (
                          <button
                            key={service.id}
                            onClick={() => handleServiceSelect(service.id)}
                            className="w-full text-left px-4 py-3 hover:bg-primary-50 transition-colors border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-gray-900">{service.name}</div>
                            <div className="text-sm text-gray-500">{service.categoryName}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    {categories.map(category => {
                      const visibleServices = selectedServices.length > 0 
                        ? category.services.filter((service: any) => selectedServices.includes(service.id))
                        : category.services;
                      
                      if (visibleServices.length === 0) return null;
                      
                      return (
                        <div key={category.id}>
                          <h3 className="font-semibold text-primary-600 mb-3">{category.name}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {visibleServices.map((service: any) => (
                              <label key={service.id} className={`flex items-center space-x-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                selectedServices.includes(service.id) 
                                  ? 'border-primary-600 bg-primary-50' 
                                  : 'border-gray-200 hover:bg-gray-50'
                              }`}>
                                <input
                                  type="radio"
                                  checked={selectedServices.includes(service.id)}
                                  onChange={() => handleServiceToggle(service.id)}
                                  className="text-primary-600 focus:ring-primary-500"
                                />
                                <div className="flex items-center space-x-2 flex-1">
                                  {service.image ? (
                                    <img src={getImageUrl(service.image)} alt={service.name} className="w-8 h-8 object-cover rounded" />
                                  ) : (
                                    (() => {
                                      const IconComponent = getServiceIcon(service.name);
                                      return (
                                        <div className="w-8 h-8 bg-primary-100 rounded flex items-center justify-center">
                                          <IconComponent className="w-4 h-4 text-primary-600" />
                                        </div>
                                      );
                                    })()
                                  )}
                                  <span className="font-medium">{service.name}</span>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {subServices.length > 0 && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">
                      What do you need {selectedServices.length > 0 ? allServices.find(s => s.id === selectedServices[0])?.name.toLowerCase().replace(' services', '') : 'a tradesperson'}'s help with?
                    </h3>
                    <div className="space-y-2">
                      {subServices.map((subService: any) => (
                        <label key={subService.id} className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedSubServices.includes(subService.id) 
                            ? 'border-primary-600 bg-primary-50' 
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}>
                          <input
                            type="radio"
                            checked={selectedSubServices.includes(subService.id)}
                            onChange={() => handleSubServiceToggle(subService.id)}
                            className="text-primary-600 focus:ring-primary-500"
                          />
                          <div className="flex items-center space-x-2 flex-1">
                            {subService.image && (
                              <img src={getImageUrl(subService.image)} alt={subService.name} className="w-8 h-8 object-cover rounded" />
                            )}
                            <span className="font-medium">{subService.name}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {showDescription && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-2">Describe your job</h3>
                    <p className="text-gray-600 mb-4 text-sm">Provide details to help tradespeople understand your requirements (Optional)</p>
                    <textarea
                      className="input"
                      rows={4}
                      placeholder="E.g., I need to install a ceiling fan in my bedroom. The fan is already purchased."
                      value={formData.description}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, description: e.target.value }))
                        if (!showPhotos && e.target.value.trim()) {
                          setShowPhotos(true)
                        }
                      }}
                    />
                  </div>
                )}

                {showPhotos && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-2">Add photos (Optional)</h3>
                    <p className="text-gray-600 mb-4 text-sm">Photos help tradespeople understand the job better</p>
                    
                    <div className="space-y-4">
                      <label className="btn btn-secondary btn-md cursor-pointer inline-flex">
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
              </div>
            )}

            {currentStep === 1 && (
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

            {currentStep === 2 && (
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
                          className="input cursor-pointer"
                          value={formData.preferredDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, preferredDate: e.target.value }))}
                          onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
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
                          <option value="morning">Morning (6:00 AM - 12:00 PM)</option>
                          <option value="afternoon">Afternoon (12:00 PM - 6:00 PM)</option>
                          <option value="night">Night (6:00 PM - 6:00 AM)</option>
                        </select>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Contact</h2>
                <p className="text-gray-600 mb-6">By submitting, you'll receive responses from up to 3 verified tradespeople. Your contact information will only be shared with tradespeople who accept your job.</p>
                <div className="space-y-4">
                  <div>
                    <label className="label">Full Name *</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="label">Phone Number *</label>
                    <div className="flex gap-2">
                      <select
                        className="input w-32"
                        value={formData.countryCode}
                        onChange={(e) => setFormData(prev => ({ ...prev, countryCode: e.target.value }))}
                      >
                        <option value="+92">+92 (PK)</option>
                        <option value="+1">+1 (US)</option>
                        <option value="+44">+44 (UK)</option>
                        <option value="+91">+91 (IN)</option>
                        <option value="+971">+971 (UAE)</option>
                        <option value="+966">+966 (SA)</option>
                      </select>
                      <input
                        type="tel"
                        className="input flex-1"
                        placeholder="3001234567"
                        value={formData.mobile}
                        onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label">Email (Optional)</label>
                    <input
                      type="email"
                      className="input"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
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
