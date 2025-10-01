import React, { useState } from 'react';
import { BookOpenIcon, TrophyIcon, AcademicCapIcon, LightBulbIcon, CheckIcon, XMarkIcon, EyeIcon } from '../components/icons';

interface Guide {
  id: string;
  title: string;
  description: string;
  category: 'courses' | 'guides' | 'info-packs' | 'schemes';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  features: string[];
  tags: string[];
}

const sampleGuides: Guide[] = [
  {
    id: '7',
    title: 'Comprehensive Guide to Claude Code',
    description: 'Master Anthropic\'s agentic coding assistant with this all-in-one guide covering installation, best practices, advanced features, and tech stack integration.',
    category: 'info-packs',
    difficulty: 'intermediate',
    features: [
      'Installation & setup guide',
      'Prompt engineering techniques',
      'Advanced agentic workflows',
      'React, Vite & Supabase integration',
      'MCP servers & browser automation',
      'Troubleshooting & optimization tips',
      'Real-world development examples',
      'Command reference & best practices'
    ],
    tags: ['Claude Code', 'AI Coding', 'Development Tools', 'Productivity', 'Web Development']
  }
];

const categories = [
  { id: 'all', label: 'All', icon: BookOpenIcon },
  { id: 'courses', label: 'Courses', icon: AcademicCapIcon },
  { id: 'guides', label: 'Guides', icon: BookOpenIcon },
  { id: 'info-packs', label: 'Info Packs', icon: LightBulbIcon },
  { id: 'schemes', label: 'Schemes', icon: TrophyIcon }
];

interface GuidesInfoProps {
  onNavigate?: (page: string) => void;
}

const GuidesInfo: React.FC<GuidesInfoProps> = ({ onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);

  const filteredGuides = sampleGuides.filter(guide => {
    const matchesCategory = selectedCategory === 'all' || guide.category === selectedCategory;
    const matchesSearch = guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guide.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guide.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

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
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{guide.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{guide.description}</p>

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

                    {/* Action */}
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          if (guide.id === '7' && onNavigate) {
                            onNavigate('claudecodeguide');
                          } else {
                            setSelectedGuide(guide);
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                      >
                        <EyeIcon className="h-4 w-4 mr-2" />
                        View Guide
                      </button>
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
              <div className="flex space-x-2 mb-6">
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getCategoryColor(selectedGuide.category)}`}>
                  {selectedGuide.category.replace('-', ' ')}
                </span>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getDifficultyColor(selectedGuide.difficulty)}`}>
                  {selectedGuide.difficulty}
                </span>
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-6">{selectedGuide.description}</p>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">What's included:</h3>
              <ul className="space-y-3 mb-6">
                {selectedGuide.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Topics covered:</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedGuide.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 text-sm bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedGuide(null)}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    if (selectedGuide.id === '7' && onNavigate) {
                      onNavigate('claudecodeguide');
                    }
                    setSelectedGuide(null);
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Full Guide
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