import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Wrench, ArrowRight } from 'lucide-react'
import Layout from '../../components/Layout/Layout'
import api from '../../lib/api'

export default function ServiceCategoryPage() {
  const { categorySlug } = useParams()
  const [category, setCategory] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (categorySlug) {
      fetchCategory()
    }
  }, [categorySlug])

  const fetchCategory = async () => {
    try {
      const response = await api.get(`/services/category/${categorySlug}`)
      setCategory(response.data)
    } catch (error) {
      console.error('Error fetching category:', error)
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

  if (!category) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Category Not Found</h2>
            <Link to="/" className="btn btn-primary btn-md mt-4">
              Back to Home
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{category.name}</h1>
            <p className="text-xl text-primary-100 max-w-3xl">
              {category.description || `Find verified professionals for ${category.name.toLowerCase()} in Pakistan`}
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Services</h2>
            <p className="text-gray-600">Choose the specific service you need</p>
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
                    <Wrench className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1 group-hover:text-primary-600">
                      {service.name}
                    </h3>
                    {service.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{service.description}</p>
                    )}
                    {service.children && service.children.length > 0 && (
                      <p className="text-xs text-gray-500 mt-2">
                        {service.children.length} sub-services available
                      </p>
                    )}
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600" />
                </div>
              </Link>
            ))}
          </div>

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
