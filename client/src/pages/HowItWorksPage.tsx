import { Link } from 'react-router-dom'
import { FileText, Users, CheckCircle, Star, Shield, DollarSign, Clock, Award } from 'lucide-react'
import Layout from '../components/Layout/Layout'

export default function HowItWorksPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h1>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              Simple, transparent, and designed to connect you with the right professionals
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-4xl mx-auto space-y-16">
            <section>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">For Homeowners</h2>
                <p className="text-xl text-gray-600">100% free and takes just a few minutes</p>
              </div>

              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                      1
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <FileText className="w-6 h-6 text-primary-600" />
                      Post Your Job for Free
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      Describe your project in a simple form. Tell us what you need, where you need it, and when you need it done. 
                      You can add photos to help tradespeople understand your requirements better. It's completely free with no hidden charges.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                      2
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Users className="w-6 h-6 text-primary-600" />
                      Tradespeople Respond
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      We match your job with up to 3 qualified tradespeople in your area. They review your requirements and decide if they want to take on your job. 
                      You'll receive notifications via WhatsApp and email when someone is interested. Only serious, verified professionals contact you.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                      3
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-6 h-6 text-primary-600" />
                      Review, Compare & Hire
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      Check the profiles, ratings, and reviews of interested tradespeople. View their previous work and certifications. 
                      Contact them directly to discuss details and pricing. Choose the one that best fits your needs and budget. Hire with confidence!
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-12 text-center">
                <Link to="/post-job" className="btn btn-accent btn-lg">
                  Post Your Job Now
                </Link>
              </div>
            </section>

            <div className="border-t border-gray-200"></div>

            <section>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">For Tradespeople</h2>
                <p className="text-xl text-gray-600">Grow your business with zero commission</p>
              </div>

              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                      1
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Award className="w-6 h-6 text-green-600" />
                      Join for Free
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      Create your professional profile by uploading your business details, certifications, and portfolio. 
                      Our team verifies your documents to ensure quality. Get 2 FREE job leads to start building your reputation. 
                      No monthly fees, no subscription charges.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                      2
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Clock className="w-6 h-6 text-green-600" />
                      Receive Job Leads
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      Get notified instantly via WhatsApp and email when there's a job matching your skills in your area. 
                      View job details including location, requirements, and customer preferences. Respond within 1 hour to maximize your chances. 
                      Only pay when you decide to view customer contact details.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                      3
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <DollarSign className="w-6 h-6 text-green-600" />
                      Connect & Earn
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      Contact the customer directly to discuss the job details and provide a quote. Negotiate the price and schedule that works for both of you. 
                      Complete the job and keep 100% of your earnings - we never take commission. Build your reputation with positive reviews to get more jobs.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-12 grid md:grid-cols-3 gap-6">
                <div className="card text-center">
                  <DollarSign className="w-10 h-10 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">No Commission</h3>
                  <p className="text-sm text-gray-600">Keep 100% of what you earn</p>
                </div>
                <div className="card text-center">
                  <Shield className="w-10 h-10 text-primary-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Verified Leads</h3>
                  <p className="text-sm text-gray-600">All customers are real and verified</p>
                </div>
                <div className="card text-center">
                  <Star className="w-10 h-10 text-yellow-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">2 FREE Jobs</h3>
                  <p className="text-sm text-gray-600">Start winning customers today</p>
                </div>
              </div>

              <div className="mt-12 text-center">
                <Link to="/register/tradesman" className="btn btn-primary btn-lg">
                  Join as a Tradesperson
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  )
}
