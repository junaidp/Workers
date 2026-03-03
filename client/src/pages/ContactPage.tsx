import { useState } from 'react'
import { Mail, Phone, MapPin, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import Layout from '../components/Layout/Layout'
import api from '../lib/api'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.post('/contact', formData)
      toast.success('Message sent successfully! We will get back to you soon.')
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
              <p className="text-xl text-gray-600">
                We're here to help. Send us a message and we'll respond as soon as possible.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="card">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a message</h2>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="name" className="label">
                        Your Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        className="input"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="label">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="input"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <label htmlFor="subject" className="label">
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="subject"
                        name="subject"
                        required
                        className="input"
                        value={formData.subject}
                        onChange={handleChange}
                      >
                        <option value="">Select a subject</option>
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Customer Support">Customer Support</option>
                        <option value="Tradesman Support">Tradesman Support</option>
                        <option value="Technical Issue">Technical Issue</option>
                        <option value="Billing Question">Billing Question</option>
                        <option value="Feedback">Feedback</option>
                        <option value="Report Fake Lead">Report Fake Lead</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="message" className="label">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={6}
                        required
                        className="input"
                        placeholder="Please provide details about your inquiry..."
                        value={formData.message}
                        onChange={handleChange}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary btn-lg w-full"
                    >
                      <Send className="w-5 h-5 mr-2" />
                      {loading ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                </div>
              </div>

              <div className="space-y-6">
                <div className="card">
                  <h3 className="font-semibold text-lg mb-4">Contact Information</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-primary-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium text-gray-900">Email</p>
                        <p className="text-gray-600 text-sm">info@workershub.pk</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-primary-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium text-gray-900">Phone</p>
                        <p className="text-gray-600 text-sm">+92 300 1234567</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-primary-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-medium text-gray-900">Address</p>
                        <p className="text-gray-600 text-sm">Karachi, Pakistan</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card bg-primary-50 border border-primary-200">
                  <h3 className="font-semibold text-primary-900 mb-2">Quick Help</h3>
                  <p className="text-sm text-primary-800 mb-4">
                    For immediate assistance, check out our help center or FAQs.
                  </p>
                  <a href="/how-it-works" className="btn btn-primary btn-sm w-full">
                    Visit Help Center
                  </a>
                </div>

                <div className="card">
                  <h3 className="font-semibold text-gray-900 mb-2">Business Hours</h3>
                  <div className="text-sm space-y-1 text-gray-600">
                    <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p>Saturday: 10:00 AM - 4:00 PM</p>
                    <p>Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
