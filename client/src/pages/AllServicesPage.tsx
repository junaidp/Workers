import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Wrench, ArrowRight } from 'lucide-react'
import Layout from '../components/Layout/Layout'
import api from '../lib/api'
import { getServiceIcon } from '../lib/serviceIcons'

export default function AllServicesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await api.get('/services/categories')
      setCategories(response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
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

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">All Services</h1>
            <p className="text-xl text-primary-100 max-w-3xl">
              Browse all available services and find the right professional for your needs
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {categories.map((category) => (
            <div key={category.id} className="mb-12">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{category.name}</h2>
                <p className="text-gray-600">{category.description || `Professional ${category.name.toLowerCase()} services`}</p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.services.map((service: any) => (
                  <Link
                    key={service.id}
                    to={`/service/${service.slug}`}
                    className="card hover:shadow-lg transition-shadow group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-colors">
                        {service.image ? (
                          <img src={service.image} alt={service.name} className="w-8 h-8 object-cover rounded" />
                        ) : (
                          (() => {
                            const IconComponent = getServiceIcon(service.name);
                            return <IconComponent className="w-6 h-6" />;
                          })()
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 mb-1 group-hover:text-primary-600">
                          {service.name}
                        </h3>
                        {service.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">{service.description}</p>
                        )}
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <div className="mt-12 bg-primary-50 border border-primary-200 rounded-lg p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to get started?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Post your job for free and get matched with up to 3 verified tradespeople in your area
            </p>
            <Link to="/post-job" className="btn btn-accent btn-lg">
              Post a Job - It's Free
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}
