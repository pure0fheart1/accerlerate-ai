import React, { useState } from 'react';

interface Game {
  id: string;
  title: string;
  description: string;
  category: 'puzzle' | 'action' | 'strategy' | 'casual' | 'educational';
  difficulty: 'easy' | 'medium' | 'hard';
  playTime: string;
  players: string;
  image: string;
  status: 'available' | 'coming-soon' | 'beta';
}

const Games: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  const games: Game[] = [
    {
      id: '1',
      title: 'Memory Master',
      description: 'Test your memory with this challenging pattern recognition game. Match sequences and improve your cognitive abilities.',
      category: 'puzzle',
      difficulty: 'medium',
      playTime: '5-15 min',
      players: '1',
      image: '🧠',
      status: 'available'
    },
    {
      id: '2',
      title: 'Speed Math',
      description: 'Sharpen your arithmetic skills with fast-paced mathematical challenges. Perfect for improving mental calculation speed.',
      category: 'educational',
      difficulty: 'easy',
      playTime: '3-10 min',
      players: '1',
      image: '🔢',
      status: 'available'
    },
    {
      id: '3',
      title: 'Strategy Commander',
      description: 'Lead your army to victory in this turn-based strategy game. Plan your moves carefully to outmaneuver opponents.',
      category: 'strategy',
      difficulty: 'hard',
      playTime: '15-30 min',
      players: '1-4',
      image: '⚔️',
      status: 'beta'
    },
    {
      id: '4',
      title: 'Reaction Rush',
      description: 'Test your reflexes in this high-speed action game. Click, tap, and react as fast as you can to beat the clock.',
      category: 'action',
      difficulty: 'medium',
      playTime: '2-5 min',
      players: '1',
      image: '⚡',
      status: 'available'
    },
    {
      id: '5',
      title: 'Word Wizard',
      description: 'Expand your vocabulary while having fun. Create words from letter combinations and unlock new challenges.',
      category: 'puzzle',
      difficulty: 'easy',
      playTime: '5-20 min',
      players: '1',
      image: '📝',
      status: 'available'
    },
    {
      id: '6',
      title: 'Zen Garden',
      description: 'Relax and unwind with this peaceful simulation game. Create beautiful patterns and find your inner calm.',
      category: 'casual',
      difficulty: 'easy',
      playTime: '10-∞ min',
      players: '1',
      image: '🌸',
      status: 'available'
    },
    {
      id: '7',
      title: 'Physics Playground',
      description: 'Experiment with realistic physics in this educational sandbox. Learn while you play with gravity, momentum, and forces.',
      category: 'educational',
      difficulty: 'medium',
      playTime: '10-30 min',
      players: '1',
      image: '🔬',
      status: 'coming-soon'
    },
    {
      id: '8',
      title: 'Color Harmony',
      description: 'Match colors and create beautiful combinations in this relaxing puzzle game. Perfect for designers and art lovers.',
      category: 'casual',
      difficulty: 'easy',
      playTime: '5-15 min',
      players: '1',
      image: '🎨',
      status: 'available'
    }
  ];

  const categories = [
    { id: 'all', label: 'All Games', icon: '🎮' },
    { id: 'puzzle', label: 'Puzzle', icon: '🧩' },
    { id: 'action', label: 'Action', icon: '💥' },
    { id: 'strategy', label: 'Strategy', icon: '🎯' },
    { id: 'casual', label: 'Casual', icon: '😌' },
    { id: 'educational', label: 'Educational', icon: '📚' }
  ];

  const filteredGames = games.filter(game => {
    const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;
    const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         game.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      case 'hard': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'beta': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
      case 'coming-soon': return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700';
    }
  };

  const handlePlayGame = (game: Game) => {
    if (game.status === 'available' || game.status === 'beta') {
      alert(`Starting ${game.title}... (Game integration would go here)`);
    } else {
      alert(`${game.title} is coming soon! Stay tuned for updates.`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🎮 Game Center
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Explore our collection of engaging games designed to entertain, educate, and challenge your mind.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search games..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                }`}
              >
                {category.icon} {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGames.map((game) => (
            <div
              key={game.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 dark:border-gray-700"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl">{game.image}</div>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(game.difficulty)}`}>
                      {game.difficulty}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(game.status)}`}>
                      {game.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {game.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                  {game.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Play Time:</span>
                    <span className="text-gray-700 dark:text-gray-300">{game.playTime}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Players:</span>
                    <span className="text-gray-700 dark:text-gray-300">{game.players}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handlePlayGame(game)}
                    disabled={game.status === 'coming-soon'}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                      game.status === 'coming-soon'
                        ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg'
                    }`}
                  >
                    {game.status === 'coming-soon' ? 'Coming Soon' : 'Play Now'}
                  </button>
                  <button
                    onClick={() => setSelectedGame(game)}
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                  >
                    Info
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredGames.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No games found</h3>
            <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filter criteria.</p>
          </div>
        )}

        {/* Game Details Modal */}
        {selectedGame && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-6xl">{selectedGame.image}</div>
                  <button
                    onClick={() => setSelectedGame(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {selectedGame.title}
                </h2>

                <div className="flex gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(selectedGame.difficulty)}`}>
                    {selectedGame.difficulty}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedGame.status)}`}>
                    {selectedGame.status.replace('-', ' ')}
                  </span>
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {selectedGame.description}
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Category:</span>
                    <span className="text-gray-600 dark:text-gray-400 capitalize">{selectedGame.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Play Time:</span>
                    <span className="text-gray-600 dark:text-gray-400">{selectedGame.playTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Players:</span>
                    <span className="text-gray-600 dark:text-gray-400">{selectedGame.players}</span>
                  </div>
                </div>

                <button
                  onClick={() => handlePlayGame(selectedGame)}
                  disabled={selectedGame.status === 'coming-soon'}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                    selectedGame.status === 'coming-soon'
                      ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg'
                  }`}
                >
                  {selectedGame.status === 'coming-soon' ? 'Coming Soon' : 'Play Now'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Games;