import React, { useState, useEffect } from 'react';
import { BookmarkIcon, PlusIcon, PencilIcon, TrashIcon, FolderIcon, GlobeAltIcon, TagIcon, ExternalLinkIcon } from '../components/icons';

interface Bookmark {
  id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  tags: string[];
  createdAt: Date;
  favicon?: string;
}

interface BookmarkCategory {
  id: string;
  name: string;
  color: string;
}

const BookmarksManager: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [categories, setCategories] = useState<BookmarkCategory[]>([
    { id: 'work', name: 'Work', color: 'blue' },
    { id: 'personal', name: 'Personal', color: 'green' },
    { id: 'learning', name: 'Learning', color: 'purple' },
    { id: 'entertainment', name: 'Entertainment', color: 'pink' },
    { id: 'tools', name: 'Tools', color: 'indigo' },
    { id: 'news', name: 'News', color: 'red' },
    { id: 'other', name: 'Other', color: 'gray' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [isAddingBookmark, setIsAddingBookmark] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    category: 'personal',
    tags: ''
  });

  useEffect(() => {
    const savedBookmarks = localStorage.getItem('accelerate-bookmarks');
    const savedCategories = localStorage.getItem('accelerate-bookmark-categories');

    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks).map((bookmark: any) => ({
        ...bookmark,
        createdAt: new Date(bookmark.createdAt)
      })));
    }
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('accelerate-bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('accelerate-bookmark-categories', JSON.stringify(categories));
  }, [categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.url.trim()) return;

    // Basic URL validation and formatting
    let url = formData.url.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    const tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);

    // Extract domain for favicon
    const domain = new URL(url).hostname;
    const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

    if (editingBookmark) {
      setBookmarks(prev => prev.map(bookmark =>
        bookmark.id === editingBookmark.id
          ? {
              ...bookmark,
              title: formData.title,
              url: url,
              description: formData.description,
              category: formData.category,
              tags,
              favicon
            }
          : bookmark
      ));
      setEditingBookmark(null);
    } else {
      const newBookmark: Bookmark = {
        id: Date.now().toString(),
        title: formData.title,
        url: url,
        description: formData.description,
        category: formData.category,
        tags,
        createdAt: new Date(),
        favicon
      };
      setBookmarks(prev => [...prev, newBookmark]);
    }

    setFormData({
      title: '',
      url: '',
      description: '',
      category: 'personal',
      tags: ''
    });
    setIsAddingBookmark(false);
  };

  const handleEdit = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark);
    setFormData({
      title: bookmark.title,
      url: bookmark.url,
      description: bookmark.description,
      category: bookmark.category,
      tags: bookmark.tags.join(', ')
    });
    setIsAddingBookmark(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this bookmark?')) {
      setBookmarks(prev => prev.filter(bookmark => bookmark.id !== id));
    }
  };

  const importBookmarks = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();

      // Try to parse as JSON first (export format)
      try {
        const importedBookmarks = JSON.parse(text);
        if (Array.isArray(importedBookmarks)) {
          const newBookmarks = importedBookmarks.map((bookmark: any) => ({
            ...bookmark,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            createdAt: new Date(),
          }));
          setBookmarks(prev => [...prev, ...newBookmarks]);
          alert(`Successfully imported ${newBookmarks.length} bookmarks!`);
        }
      } catch {
        // If JSON parsing fails, try to parse as HTML (browser export)
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        const links = doc.querySelectorAll('a[href]');

        const importedBookmarks: Bookmark[] = Array.from(links).map((link, index) => ({
          id: (Date.now() + index).toString(),
          title: link.textContent || link.getAttribute('href') || 'Untitled',
          url: link.getAttribute('href') || '',
          description: '',
          category: 'other',
          tags: [],
          createdAt: new Date(),
          favicon: `https://www.google.com/s2/favicons?domain=${new URL(link.getAttribute('href') || '').hostname}&sz=32`
        }));

        setBookmarks(prev => [...prev, ...importedBookmarks]);
        alert(`Successfully imported ${importedBookmarks.length} bookmarks from HTML!`);
      }
    } catch (error) {
      alert('Failed to import bookmarks. Please check the file format.');
    }
    setIsImporting(false);

    // Reset file input
    event.target.value = '';
  };

  const exportBookmarks = () => {
    const dataStr = JSON.stringify(bookmarks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `accelerate-bookmarks-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getAllTags = () => {
    const tags = new Set<string>();
    bookmarks.forEach(bookmark => {
      bookmark.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    const color = category?.color || 'gray';

    const colorMap: Record<string, string> = {
      blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      green: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
      purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      pink: 'bg-pink-100 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800',
      indigo: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      red: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
      gray: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600',
    };

    return colorMap[color] || colorMap.gray;
  };

  const filteredBookmarks = bookmarks.filter(bookmark => {
    const matchesSearch = bookmark.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bookmark.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bookmark.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bookmark.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || bookmark.category === selectedCategory;
    const matchesTag = !selectedTag || bookmark.tags.includes(selectedTag);

    return matchesSearch && matchesCategory && matchesTag;
  });

  const getCategoryStats = () => {
    return categories.map(category => ({
      ...category,
      count: bookmarks.filter(b => b.category === category.id).length
    }));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2 flex items-center justify-center gap-2">
          <BookmarkIcon className="h-8 w-8 text-indigo-600" />
          Bookmarks Manager
        </h1>
        <p className="text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
          Organize and manage your favorite websites with categories, tags, and descriptions.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{bookmarks.length}</p>
              <p className="text-gray-600 dark:text-slate-400 text-sm">Total Bookmarks</p>
            </div>
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
              <BookmarkIcon className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{categories.length}</p>
              <p className="text-gray-600 dark:text-slate-400 text-sm">Categories</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <FolderIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{getAllTags().length}</p>
              <p className="text-gray-600 dark:text-slate-400 text-sm">Unique Tags</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <TagIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                {new Set(bookmarks.map(b => new URL(b.url).hostname)).size}
              </p>
              <p className="text-gray-600 dark:text-slate-400 text-sm">Unique Domains</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <GlobeAltIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search bookmarks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name} ({bookmarks.filter(b => b.category === category.id).length})
              </option>
            ))}
          </select>

          {getAllTags().length > 0 && (
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">All Tags</option>
              {getAllTags().map(tag => (
                <option key={tag} value={tag}>
                  {tag} ({bookmarks.filter(b => b.tags.includes(tag)).length})
                </option>
              ))}
            </select>
          )}

          <input
            type="file"
            accept=".json,.html"
            onChange={importBookmarks}
            className="hidden"
            id="import-bookmarks"
            disabled={isImporting}
          />
          <label
            htmlFor="import-bookmarks"
            className={`px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors cursor-pointer ${
              isImporting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isImporting ? 'Importing...' : 'Import'}
          </label>

          <button
            onClick={exportBookmarks}
            disabled={bookmarks.length === 0}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            Export
          </button>

          <button
            onClick={() => setIsAddingBookmark(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <PlusIcon className="h-4 w-4" />
            Add Bookmark
          </button>
        </div>
      </div>

      {/* Add/Edit Bookmark Form */}
      {isAddingBookmark && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
            {editingBookmark ? 'Edit Bookmark' : 'Add New Bookmark'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Bookmark title..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  URL *
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="https://example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="productivity, tools, reference"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  placeholder="Optional description..."
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
              >
                {editingBookmark ? 'Update Bookmark' : 'Add Bookmark'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingBookmark(false);
                  setEditingBookmark(null);
                  setFormData({
                    title: '',
                    url: '',
                    description: '',
                    category: 'personal',
                    tags: ''
                  });
                }}
                className="px-6 py-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category Filter Pills */}
      {!isAddingBookmark && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
            }`}
          >
            All ({bookmarks.length})
          </button>
          {getCategoryStats().map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors border ${
                selectedCategory === category.id
                  ? getCategoryColor(category.id)
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 border-transparent'
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>
      )}

      {/* Bookmarks List */}
      {filteredBookmarks.length === 0 ? (
        <div className="text-center py-12">
          <BookmarkIcon className="h-16 w-16 text-gray-400 dark:text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2">
            {bookmarks.length === 0 ? 'No bookmarks yet' : 'No bookmarks match your filters'}
          </h3>
          <p className="text-gray-600 dark:text-slate-400 mb-6">
            {bookmarks.length === 0
              ? 'Add your first bookmark to organize your favorite websites.'
              : 'Try adjusting your search terms or filters.'
            }
          </p>
          {bookmarks.length === 0 && (
            <button
              onClick={() => setIsAddingBookmark(true)}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              Add Your First Bookmark
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookmarks.map((bookmark) => (
            <div key={bookmark.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {bookmark.favicon && (
                    <img
                      src={bookmark.favicon}
                      alt=""
                      className="w-6 h-6 mt-1 rounded flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 truncate">
                      {bookmark.title}
                    </h3>
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline truncate flex items-center gap-1"
                    >
                      {new URL(bookmark.url).hostname}
                      <ExternalLinkIcon className="h-3 w-3 flex-shrink-0" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={() => handleEdit(bookmark)}
                    className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                    title="Edit bookmark"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(bookmark.id)}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                    title="Delete bookmark"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {bookmark.description && (
                  <p className="text-gray-600 dark:text-slate-400 text-sm line-clamp-2">
                    {bookmark.description}
                  </p>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCategoryColor(bookmark.category)}`}>
                    {categories.find(c => c.id === bookmark.category)?.name || bookmark.category}
                  </span>

                  {bookmark.tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="text-xs text-gray-500 dark:text-slate-500 pt-2 border-t border-gray-200 dark:border-slate-700">
                  Added {bookmark.createdAt.toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookmarksManager;