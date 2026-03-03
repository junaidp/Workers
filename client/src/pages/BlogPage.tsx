import { Link } from 'react-router-dom'
import { Calendar, User, ArrowRight } from 'lucide-react'
import Layout from '../components/Layout/Layout'

const blogPosts = [
  {
    id: 1,
    title: 'Finding the Right Electrician: A Complete Guide for Pakistani Homeowners',
    excerpt: 'Learn how to identify qualified electricians, what questions to ask, and how to ensure your electrical work is done safely and professionally.',
    author: 'WorkersHub Team',
    date: '2024-03-01',
    category: 'Home Improvement',
    image: '/blog/electrician-guide.jpg'
  },
  {
    id: 2,
    title: 'Top 10 Home Maintenance Tips Every Pakistani Homeowner Should Know',
    excerpt: 'Preventive maintenance can save you thousands. Discover essential tips for keeping your home in top condition throughout the year.',
    author: 'WorkersHub Team',
    date: '2024-02-28',
    category: 'Maintenance',
    image: '/blog/maintenance-tips.jpg'
  },
  {
    id: 3,
    title: 'How to Budget for Home Renovation Projects in Pakistan',
    excerpt: 'Planning a renovation? Get expert advice on budgeting, cost estimation, and managing expenses for successful home improvement projects.',
    author: 'WorkersHub Team',
    date: '2024-02-25',
    category: 'Renovation',
    image: '/blog/renovation-budget.jpg'
  },
  {
    id: 4,
    title: 'The Benefits of Regular AC Servicing in Pakistani Climate',
    excerpt: 'With extreme summers, regular AC maintenance is crucial. Learn why servicing your AC can save energy, money, and ensure comfort.',
    author: 'WorkersHub Team',
    date: '2024-02-20',
    category: 'AC & Cooling',
    image: '/blog/ac-servicing.jpg'
  },
  {
    id: 5,
    title: 'Understanding Plumbing Issues: Common Problems and Solutions',
    excerpt: 'From leaky faucets to clogged drains, understand common plumbing issues and when to call a professional plumber.',
    author: 'WorkersHub Team',
    date: '2024-02-15',
    category: 'Plumbing',
    image: '/blog/plumbing-issues.jpg'
  },
  {
    id: 6,
    title: 'Solar Panel Installation Guide: Is It Right for Your Home?',
    excerpt: 'With rising electricity costs, solar panels are becoming popular. Learn about installation, costs, and potential savings in Pakistan.',
    author: 'WorkersHub Team',
    date: '2024-02-10',
    category: 'Energy Efficiency',
    image: '/blog/solar-panels.jpg'
  }
]

export default function BlogPage() {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Blog</h1>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              Tips, guides, and insights for homeowners and tradespeople
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map(post => (
              <article key={post.id} className="card hover:shadow-lg transition-shadow group">
                <div className="aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center text-gray-400">
                  <Calendar className="w-12 h-12" />
                </div>
                
                <div className="mb-3">
                  <span className="text-xs font-semibold text-primary-600 uppercase tracking-wide">
                    {post.category}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                  {post.title}
                </h2>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <User className="w-4 h-4" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(post.date).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>

                <Link to={`/blog/${post.id}`} className="mt-4 btn btn-outline btn-sm w-full group-hover:bg-primary-600 group-hover:text-white group-hover:border-primary-600">
                  Read More
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </article>
            ))}
          </div>

          <div className="mt-12 bg-primary-50 border border-primary-200 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Start Your Project?
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Whether you need a quick repair or a major renovation, find the right professional on WorkersHub
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
