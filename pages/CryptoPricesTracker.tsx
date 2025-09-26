import React, { useState, useEffect } from 'react';
import { CurrencyDollarIcon, TrendingUpIcon, TrendingDownIcon, RefreshIcon, StarIcon, StarSolidIcon } from '../components/icons';

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  last_updated: string;
}

const CryptoPricesTracker: React.FC = () => {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'market_cap' | 'price' | 'change'>('market_cap');

  // Popular cryptocurrencies to display by default
  const defaultCryptos = [
    'bitcoin', 'ethereum', 'binancecoin', 'cardano', 'solana', 'polkadot',
    'dogecoin', 'avalanche-2', 'polygon', 'chainlink', 'litecoin', 'uniswap'
  ];

  useEffect(() => {
    const savedFavorites = localStorage.getItem('accelerate-crypto-favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('accelerate-crypto-favorites', JSON.stringify(favorites));
  }, [favorites]);

  const fetchCryptoData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Since we can't access real crypto APIs in this environment, we'll simulate the data
      const mockData: CryptoData[] = [
        {
          id: 'bitcoin',
          symbol: 'btc',
          name: 'Bitcoin',
          current_price: 43250.50,
          price_change_percentage_24h: 2.34,
          market_cap: 845000000000,
          total_volume: 15600000000,
          high_24h: 43980.25,
          low_24h: 42100.75,
          last_updated: new Date().toISOString(),
        },
        {
          id: 'ethereum',
          symbol: 'eth',
          name: 'Ethereum',
          current_price: 2650.75,
          price_change_percentage_24h: -1.25,
          market_cap: 318000000000,
          total_volume: 8200000000,
          high_24h: 2720.50,
          low_24h: 2580.30,
          last_updated: new Date().toISOString(),
        },
        {
          id: 'binancecoin',
          symbol: 'bnb',
          name: 'BNB',
          current_price: 310.25,
          price_change_percentage_24h: 0.85,
          market_cap: 46500000000,
          total_volume: 850000000,
          high_24h: 315.80,
          low_24h: 305.20,
          last_updated: new Date().toISOString(),
        },
        {
          id: 'cardano',
          symbol: 'ada',
          name: 'Cardano',
          current_price: 0.485,
          price_change_percentage_24h: 3.42,
          market_cap: 17200000000,
          total_volume: 425000000,
          high_24h: 0.492,
          low_24h: 0.465,
          last_updated: new Date().toISOString(),
        },
        {
          id: 'solana',
          symbol: 'sol',
          name: 'Solana',
          current_price: 58.75,
          price_change_percentage_24h: -2.15,
          market_cap: 26800000000,
          total_volume: 1250000000,
          high_24h: 61.20,
          low_24h: 56.80,
          last_updated: new Date().toISOString(),
        },
        {
          id: 'polkadot',
          symbol: 'dot',
          name: 'Polkadot',
          current_price: 7.25,
          price_change_percentage_24h: 1.75,
          market_cap: 9500000000,
          total_volume: 185000000,
          high_24h: 7.45,
          low_24h: 7.05,
          last_updated: new Date().toISOString(),
        },
        {
          id: 'dogecoin',
          symbol: 'doge',
          name: 'Dogecoin',
          current_price: 0.082,
          price_change_percentage_24h: 5.28,
          market_cap: 11700000000,
          total_volume: 485000000,
          high_24h: 0.086,
          low_24h: 0.078,
          last_updated: new Date().toISOString(),
        },
        {
          id: 'polygon',
          symbol: 'matic',
          name: 'Polygon',
          current_price: 0.845,
          price_change_percentage_24h: -0.95,
          market_cap: 8200000000,
          total_volume: 265000000,
          high_24h: 0.865,
          low_24h: 0.825,
          last_updated: new Date().toISOString(),
        }
      ];

      // Add some randomness to simulate real-time price changes
      const updatedData = mockData.map(crypto => ({
        ...crypto,
        current_price: crypto.current_price * (0.98 + Math.random() * 0.04),
        price_change_percentage_24h: crypto.price_change_percentage_24h + (Math.random() - 0.5) * 2,
        last_updated: new Date().toISOString(),
      }));

      setCryptoData(updatedData);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to fetch cryptocurrency data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const toggleFavorite = (cryptoId: string) => {
    setFavorites(prev =>
      prev.includes(cryptoId)
        ? prev.filter(id => id !== cryptoId)
        : [...prev, cryptoId]
    );
  };

  const formatPrice = (price: number) => {
    if (price < 1) {
      return `$${price.toFixed(6)}`;
    }
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`;
    }
    if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    }
    if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`;
    }
    return `$${marketCap.toLocaleString()}`;
  };

  const sortedData = [...cryptoData].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return b.current_price - a.current_price;
      case 'change':
        return b.price_change_percentage_24h - a.price_change_percentage_24h;
      case 'market_cap':
      default:
        return b.market_cap - a.market_cap;
    }
  });

  const filteredData = sortedData.filter(crypto =>
    crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const favoriteData = filteredData.filter(crypto => favorites.includes(crypto.id));
  const nonFavoriteData = filteredData.filter(crypto => !favorites.includes(crypto.id));
  const displayData = [...favoriteData, ...nonFavoriteData];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2 flex items-center justify-center gap-2">
          <CurrencyDollarIcon className="h-8 w-8 text-indigo-600" />
          Cryptocurrency Prices
        </h1>
        <p className="text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
          Track real-time cryptocurrency prices, market caps, and 24h changes.
        </p>
      </div>

      {/* Market Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{cryptoData.length}</p>
              <p className="text-gray-600 dark:text-slate-400 text-sm">Cryptocurrencies</p>
            </div>
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{favorites.length}</p>
              <p className="text-gray-600 dark:text-slate-400 text-sm">Favorites</p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <StarSolidIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-600">
                {cryptoData.filter(c => c.price_change_percentage_24h > 0).length}
              </p>
              <p className="text-gray-600 dark:text-slate-400 text-sm">Gaining (24h)</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <TrendingUpIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search cryptocurrencies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="market_cap">Sort by Market Cap</option>
            <option value="price">Sort by Price</option>
            <option value="change">Sort by 24h Change</option>
          </select>
          <button
            onClick={fetchCryptoData}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <RefreshIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Last Updated */}
      {lastUpdated && (
        <div className="text-center text-sm text-gray-600 dark:text-slate-400">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}

      {/* Crypto Cards */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-slate-400">Loading cryptocurrency data...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-red-600 dark:text-red-400 mb-4">
            <CurrencyDollarIcon className="h-16 w-16 mx-auto mb-2 opacity-50" />
            <p className="text-lg font-medium">{error}</p>
          </div>
          <button
            onClick={fetchCryptoData}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : displayData.length === 0 ? (
        <div className="text-center py-12">
          <CurrencyDollarIcon className="h-16 w-16 text-gray-400 dark:text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2">No cryptocurrencies found</h3>
          <p className="text-gray-600 dark:text-slate-400">Try adjusting your search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayData.map((crypto) => (
            <div key={crypto.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {crypto.symbol.toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">{crypto.name}</h3>
                    <p className="text-gray-600 dark:text-slate-400 text-sm uppercase">{crypto.symbol}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleFavorite(crypto.id)}
                  className="p-2 text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                  title={favorites.includes(crypto.id) ? 'Remove from favorites' : 'Add to favorites'}
                >
                  {favorites.includes(crypto.id)
                    ? <StarSolidIcon className="h-5 w-5 text-yellow-400" />
                    : <StarIcon className="h-5 w-5" />}
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-1">
                    {formatPrice(crypto.current_price)}
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    crypto.price_change_percentage_24h >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {crypto.price_change_percentage_24h >= 0
                      ? <TrendingUpIcon className="h-4 w-4" />
                      : <TrendingDownIcon className="h-4 w-4" />
                    }
                    {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-slate-400">Market Cap</p>
                    <p className="font-semibold text-gray-900 dark:text-slate-100">
                      {formatMarketCap(crypto.market_cap)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-slate-400">24h Volume</p>
                    <p className="font-semibold text-gray-900 dark:text-slate-100">
                      {formatMarketCap(crypto.total_volume)}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200 dark:border-slate-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-slate-400">24h High:</span>
                    <span className="font-medium text-gray-900 dark:text-slate-100">
                      {formatPrice(crypto.high_24h)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600 dark:text-slate-400">24h Low:</span>
                    <span className="font-medium text-gray-900 dark:text-slate-100">
                      {formatPrice(crypto.low_24h)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CryptoPricesTracker;