import React, { useState } from 'react';
import { BookOpenIcon, ShoppingCartIcon, StarIcon, ClockIcon, UserGroupIcon, TrophyIcon, AcademicCapIcon, LightBulbIcon, CheckIcon, XMarkIcon, EyeIcon } from '../components/icons';

interface Guide {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: 'courses' | 'guides' | 'info-packs' | 'schemes';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  rating: number;
  students: number;
  features: string[];
  preview?: string;
  author: string;
  tags: string[];
}

const sampleGuides: Guide[] = [
  {
    id: '1',
    title: 'Complete AI Prompt Engineering Mastery',
    description: 'Master the art of prompt engineering with advanced techniques, real-world examples, and proven frameworks that get results.',
    price: 97,
    originalPrice: 197,
    category: 'courses',
    difficulty: 'intermediate',
    duration: '8 hours',
    rating: 4.9,
    students: 1247,
    features: [
      'Advanced prompt frameworks',
      'Real-world case studies',
      'Template library (100+ prompts)',
      'Live Q&A sessions',
      'Lifetime updates'
    ],
    author: 'Sarah Chen',
    tags: ['AI', 'Prompts', 'GPT', 'Productivity']
  },
  {
    id: '2',
    title: 'Automation Schemes for Content Creators',
    description: 'Automated workflows and systems to scale your content creation using AI tools and proven methodologies.',
    price: 67,
    category: 'schemes',
    difficulty: 'beginner',
    duration: '4 hours',
    rating: 4.7,
    students: 892,
    features: [
      'Content automation workflows',
      'AI tool integration guides',
      'Template collection',
      'Growth strategies',
      'Community access'
    ],
    author: 'Marcus Rivera',
    tags: ['Automation', 'Content', 'Workflows', 'AI Tools']
  },
  {
    id: '3',
    title: 'AI Business Intelligence Info Pack',
    description: 'Comprehensive guide to implementing AI in business decision-making processes with real data examples.',
    price: 47,
    category: 'info-packs',
    difficulty: 'advanced',
    duration: '6 hours',
    rating: 4.8,
    students: 543,
    features: [
      'BI implementation roadmap',
      'AI model selection guide',
      'Case study collection',
      'ROI calculation tools',
      'Expert interviews'
    ],
    author: 'Dr. Alex Thompson',
    tags: ['Business Intelligence', 'Data Analysis', 'AI Strategy', 'ROI']
  },
  {
    id: '4',
    title: 'Social Media AI Optimization Guide',
    description: 'Step-by-step guide to optimize your social media presence using AI tools for maximum engagement and growth.',
    price: 37,
    originalPrice: 77,
    category: 'guides',
    difficulty: 'beginner',
    duration: '3 hours',
    rating: 4.6,
    students: 1856,
    features: [
      'Platform-specific strategies',
      'AI content generation',
      'Engagement optimization',
      'Analytics interpretation',
      'Growth hacking techniques'
    ],
    author: 'Emma Davis',
    tags: ['Social Media', 'Marketing', 'AI Content', 'Growth']
  },
  {
    id: '5',
    title: 'Advanced Machine Learning Schemes',
    description: 'Professional-level schemes and methodologies for implementing ML solutions in enterprise environments.',
    price: 147,
    category: 'schemes',
    difficulty: 'advanced',
    duration: '12 hours',
    rating: 4.9,
    students: 267,
    features: [
      'Enterprise ML architecture',
      'Deployment strategies',
      'Performance optimization',
      'Security considerations',
      'Mentorship included'
    ],
    author: 'Prof. Michael Zhang',
    tags: ['Machine Learning', 'Enterprise', 'Architecture', 'Advanced']
  },
  {
    id: '6',
    title: 'Personal Productivity AI Stack',
    description: 'Complete info pack on building your personal AI-powered productivity system with recommended tools and workflows.',
    price: 27,
    category: 'info-packs',
    difficulty: 'beginner',
    duration: '2 hours',
    rating: 4.5,
    students: 2143,
    features: [
      'Tool recommendations',
      'Workflow templates',
      'Integration guides',
      'Productivity metrics',
      'Bonus resources'
    ],
    author: 'Jordan Lee',
    tags: ['Productivity', 'AI Tools', 'Workflows', 'Personal Development']
  }
];

const categories = [
  { id: 'all', label: 'All', icon: BookOpenIcon },
  { id: 'courses', label: 'Courses', icon: AcademicCapIcon },
  { id: 'guides', label: 'Guides', icon: BookOpenIcon },
  { id: 'info-packs', label: 'Info Packs', icon: LightBulbIcon },
  { id: 'schemes', label: 'Schemes', icon: TrophyIcon }
];

const GuidesInfo: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<string[]>([]);
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  const filteredGuides = sampleGuides.filter(guide => {
    const matchesCategory = selectedCategory === 'all' || guide.category === selectedCategory;
    const matchesSearch = guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guide.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guide.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const addToCart = (guideId: string) => {
    if (!cart.includes(guideId)) {
      setCart([...cart, guideId]);
    }
  };

  const removeFromCart = (guideId: string) => {
    setCart(cart.filter(id => id !== guideId));
  };

  const isInCart = (guideId: string) => cart.includes(guideId);

  const totalPrice = cart.reduce((total, guideId) => {
    const guide = sampleGuides.find(g => g.id === guideId);
    return total + (guide?.price || 0);
  }, 0);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'courses': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'guides': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'info-packs': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'schemes': return 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Guides & Info
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Unlock your potential with our curated collection of courses, guides, info packs, and proven schemes.
              Learn from experts and accelerate your AI journey.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            {/* Search */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search guides..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              />
            </div>

            {/* Categories */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <category.icon className="h-5 w-5" />
                    <span>{category.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cart */}
            {cart.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <ShoppingCartIcon className="h-5 w-5 mr-2" />
                  Cart ({cart.length})
                </h3>
                <div className="space-y-2 mb-4">
                  {cart.map(guideId => {
                    const guide = sampleGuides.find(g => g.id === guideId);
                    return guide ? (
                      <div key={guideId} className="flex justify-between items-center text-sm">
                        <span className="truncate mr-2">{guide.title}</span>
                        <span className="font-semibold">${guide.price}</span>
                      </div>
                    ) : null;
                  })}
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                  <div className="flex justify-between items-center font-semibold">
                    <span>Total:</span>
                    <span>${totalPrice}</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowCheckout(true)}
                  className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Checkout
                </button>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Results Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {selectedCategory === 'all' ? 'All Items' : categories.find(c => c.id === selectedCategory)?.label}
                <span className="text-gray-500 dark:text-gray-400 ml-2">({filteredGuides.length})</span>
              </h2>
            </div>

            {/* Guides Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
              {filteredGuides.map((guide) => (
                <div key={guide.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex space-x-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(guide.category)}`}>
                          {guide.category.replace('-', ' ')}
                        </span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(guide.difficulty)}`}>
                          {guide.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-yellow-400">
                        <StarIcon className="h-4 w-4 fill-current" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{guide.rating}</span>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{guide.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{guide.description}</p>

                    {/* Meta Info */}
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {guide.duration}
                      </div>
                      <div className="flex items-center">
                        <UserGroupIcon className="h-4 w-4 mr-1" />
                        {guide.students.toLocaleString()} students
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">What's included:</h4>
                      <ul className="space-y-1">
                        {guide.features.slice(0, 3).map((feature, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                            <CheckIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                        {guide.features.length > 3 && (
                          <li className="text-sm text-gray-500 dark:text-gray-400">
                            +{guide.features.length - 3} more features
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {guide.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Author */}
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">By {guide.author}</p>

                    {/* Price & Action */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">${guide.price}</span>
                        {guide.originalPrice && (
                          <span className="text-lg text-gray-500 dark:text-gray-400 line-through">
                            ${guide.originalPrice}
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedGuide(guide)}
                          className="px-3 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors flex items-center"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View
                        </button>
                        <button
                          onClick={() => isInCart(guide.id) ? removeFromCart(guide.id) : addToCart(guide.id)}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            isInCart(guide.id)
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {isInCart(guide.id) ? 'In Cart' : 'Add to Cart'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredGuides.length === 0 && (
              <div className="text-center py-12">
                <BookOpenIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No guides found</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Try adjusting your search terms or category filter.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Guide Detail Modal */}
      {selectedGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-600">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedGuide.title}</h2>
              <button
                onClick={() => setSelectedGuide(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="flex space-x-2 mb-4">
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getCategoryColor(selectedGuide.category)}`}>
                      {selectedGuide.category.replace('-', ' ')}
                    </span>
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getDifficultyColor(selectedGuide.difficulty)}`}>
                      {selectedGuide.difficulty}
                    </span>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 mb-6">{selectedGuide.description}</p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <ClockIcon className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <div className="text-sm text-gray-500 dark:text-gray-400">Duration</div>
                      <div className="font-semibold text-gray-900 dark:text-white">{selectedGuide.duration}</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <UserGroupIcon className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <div className="text-sm text-gray-500 dark:text-gray-400">Students</div>
                      <div className="font-semibold text-gray-900 dark:text-white">{selectedGuide.students.toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 mb-6">
                    <div className="flex items-center text-yellow-400">
                      <StarIcon className="h-5 w-5 fill-current" />
                      <span className="ml-1 font-semibold text-gray-900 dark:text-white">{selectedGuide.rating}</span>
                    </div>
                    <span className="text-gray-500 dark:text-gray-400">({selectedGuide.students} reviews)</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">What you'll get:</h3>
                  <ul className="space-y-3 mb-6">
                    {selectedGuide.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Tags:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedGuide.tags.map((tag, index) => (
                        <span key={index} className="px-3 py-1 text-sm bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-center p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Created by</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{selectedGuide.author}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">${selectedGuide.price}</span>
                    {selectedGuide.originalPrice && (
                      <span className="text-xl text-gray-500 dark:text-gray-400 line-through">
                        ${selectedGuide.originalPrice}
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setSelectedGuide(null)}
                      className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        if (!isInCart(selectedGuide.id)) {
                          addToCart(selectedGuide.id);
                        }
                        setSelectedGuide(null);
                      }}
                      className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                        isInCart(selectedGuide.id)
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isInCart(selectedGuide.id) ? 'Already in Cart' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-600">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Checkout</h2>
              <button
                onClick={() => setShowCheckout(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h3>
                <div className="space-y-3">
                  {cart.map(guideId => {
                    const guide = sampleGuides.find(g => g.id === guideId);
                    return guide ? (
                      <div key={guideId} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-600">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{guide.title}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">by {guide.author}</p>
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white">${guide.price}</span>
                      </div>
                    ) : null;
                  })}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span className="text-gray-900 dark:text-white">Total:</span>
                    <span className="text-gray-900 dark:text-white">${totalPrice}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 transition-colors text-center">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">PayPal</div>
                    </button>
                    <button className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 transition-colors text-center">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Stripe</div>
                    </button>
                    <button className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 transition-colors text-center">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Crypto</div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex space-x-3">
                <button
                  onClick={() => setShowCheckout(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Continue Shopping
                </button>
                <button className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Complete Purchase (${totalPrice})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuidesInfo;