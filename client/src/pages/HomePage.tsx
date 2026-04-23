import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Search, CheckCircle, Users, Shield, Star, ArrowRight, Wrench, Zap, Home } from 'lucide-react'
import Layout from '../components/Layout/Layout'
import api from '../lib/api'
import { getImageUrl } from '../lib/imageUtils'

export default function HomePage() {
  const [categories, setCategories] = useState<any[]>([])
  const [allServices, setAllServices] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredServices, setFilteredServices] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

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

  const [selectedIndex, setSelectedIndex] = useState(-1)

  const handleServiceSelect = (serviceName: string) => {
    setSearchQuery(serviceName)
    setFilteredServices([])
    setShowSuggestions(false)
    setSelectedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || filteredServices.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => 
        prev < filteredServices.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      handleServiceSelect(filteredServices[selectedIndex].name)
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setSelectedIndex(-1)
    }
  }

  return (
    <Layout>
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Find Trusted Tradespeople in Pakistan
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Free for homeowners. Verified professionals. Get the job done right.
            </p>
            
            <div className="bg-white rounded-lg shadow-xl p-4 md:p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative" ref={searchRef}>
                  <input
                    type="text"
                    placeholder="What service do you need? (e.g., electrician, plumber)"
                    className="w-full px-4 py-3 text-gray-900 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
                    onKeyDown={handleKeyDown}
                  />
                  {showSuggestions && filteredServices.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {filteredServices.map((service, index) => (
                        <button
                          key={service.id}
                          onClick={() => handleServiceSelect(service.name)}
                          className={`w-full text-left px-4 py-3 transition-colors border-b border-gray-100 last:border-b-0 ${
                            index === selectedIndex ? 'bg-primary-100' : 'hover:bg-primary-50'
                          }`}
                        >
                          <div className="font-medium text-gray-900">{service.name}</div>
                          <div className="text-sm text-gray-500">{service.categoryName}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <Link
                  to={`/post-job${searchQuery ? `?service=${searchQuery}` : ''}`}
                  className="btn btn-accent btn-lg whitespace-nowrap"
                >
                  Post Your Job
                </Link>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>100% Free for Customers</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                <span>Verified Tradespeople</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>Trusted by Thousands</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How to Hire the Right Tradesperson
            </h2>
            <p className="text-xl text-gray-600">3 Simple Steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Post Your Job for Free</h3>
              <p className="text-gray-600">
                Tell us what you need done. It takes just a few minutes and is completely free.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Tradespeople Respond</h3>
              <p className="text-gray-600">
                Receive responses from up to 3 verified tradespeople eager to take on your job.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Review & Choose</h3>
              <p className="text-gray-600">
                Check profiles, reviews, and previous work. Then hire with confidence!
              </p>
            </div>
          </div>

          <div className="text-center mt-10">
            <Link to="/how-it-works" className="btn btn-primary btn-lg">
              See How It Works
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              All Services
            </h2>
            <p className="text-xl text-gray-600">Find the right professional for your needs</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/services/${category.slug}`}
                className="card hover:shadow-lg transition-shadow text-center group"
              >
                <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-primary-600 group-hover:text-white transition-colors overflow-hidden">
                  {category.image ? (
                    <img 
                      src={getImageUrl(category.image)} 
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Wrench className="w-8 h-8" />
                  )}
                </div>
                <h3 className="font-semibold text-sm md:text-base">{category.name}</h3>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/services" className="btn btn-outline btn-lg">
              View All Services
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
              Why WorkersHub is the Reliable Way
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <Users className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Get Matched with Available Tradespeople</h3>
                <p className="text-primary-100">
                  Post your job for free and receive responses from tradespeople eager to take it on.
                </p>
              </div>

              <div className="text-center">
                <Star className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Choose Who You Want</h3>
                <p className="text-primary-100">
                  Read reviews, view profiles, and browse previous work before making your decision.
                </p>
              </div>

              <div className="text-center">
                <Shield className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Hire with Confidence</h3>
                <p className="text-primary-100">
                  All tradespeople undergo verification checks including ID, certifications, and skills.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Looking for Leads?
            </h2>
            <h3 className="text-2xl md:text-3xl font-semibold mb-6 text-primary-400">
              Grow Your Business with WorkersHub
            </h3>
            <p className="text-xl mb-8 text-gray-300">
              Get a steady stream of local job opportunities that match your skills. Take on big jobs or smaller gap fillers - it's up to you.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-800 p-6 rounded-lg">
                <Zap className="w-10 h-10 text-accent-500 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">No Monthly Fees</h4>
                <p className="text-gray-400 text-sm">Join our network at zero cost</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg">
                <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">Keep 100% Earnings</h4>
                <p className="text-gray-400 text-sm">No commission on your work</p>
              </div>
              <div className="bg-gray-800 p-6 rounded-lg">
                <Star className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">2 FREE Jobs</h4>
                <p className="text-gray-400 text-sm">Start winning customers today</p>
              </div>
            </div>

            <Link to="/register/tradesman" className="btn btn-accent btn-lg">
              Tradespeople Join for Free
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Hire with Confidence?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of satisfied customers who found their perfect tradesperson
          </p>
          <Link to="/post-job" className="btn btn-accent btn-lg">
            Post Your Job Now
          </Link>
        </div>
      </section>
    </Layout>
  )
}
