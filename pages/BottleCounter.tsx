import React, { useState, useEffect } from 'react';

const BottleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M7 2v2h10V2c1.103 0 2 .897 2 2v16c0 1.103-.897 2-2 2H5c-1.103 0-2-.897-2-2V4c0-1.103.897-2 2-2h2zm0 4H5v14h14V6h-2v2H7V6z" />
    <path d="M9 8h6v2H9z" />
  </svg>
);

const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

const MinusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
  </svg>
);

const ResetIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const CounterDisplay: React.FC<{
  label: string;
  value: string;
  icon: React.ReactNode;
  colorClasses: string;
}> = ({ label, value, icon, colorClasses }) => (
  <div className={`rounded-xl p-6 flex flex-col items-center justify-center text-center ${colorClasses}`}>
    <div className="flex items-center gap-3">
      {icon}
      <span className="text-5xl md:text-6xl font-black">{value}</span>
    </div>
    <p className="mt-2 text-lg font-medium opacity-80">{label}</p>
  </div>
);

const BottleCounter: React.FC = () => {
  const [bottleCount, setBottleCount] = useState(0);
  const [history, setHistory] = useState<number[]>([]);

  // Load saved data on component mount
  useEffect(() => {
    const savedCount = localStorage.getItem('accelerate-bottle-count');
    const savedHistory = localStorage.getItem('accelerate-bottle-history');

    if (savedCount) {
      setBottleCount(parseInt(savedCount, 10));
    }
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save data when count changes
  useEffect(() => {
    localStorage.setItem('accelerate-bottle-count', bottleCount.toString());
    localStorage.setItem('accelerate-bottle-history', JSON.stringify(history));
  }, [bottleCount, history]);

  const handleAddBottle = () => {
    const newCount = bottleCount + 1;
    setBottleCount(newCount);
    setHistory(prev => [...prev, newCount]);
  };

  const handleRemoveBottle = () => {
    if (bottleCount > 0) {
      const newCount = bottleCount - 1;
      setBottleCount(newCount);
      setHistory(prev => [...prev, newCount]);
    }
  };

  const handleReset = () => {
    setBottleCount(0);
    setHistory([]);
    localStorage.removeItem('accelerate-bottle-count');
    localStorage.removeItem('accelerate-bottle-history');
  };

  const totalValue = bottleCount * 0.10;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 dark:from-slate-900 dark:to-slate-800 text-gray-800 dark:text-white flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 md:p-8 space-y-6 transform transition-shadow duration-300 hover:shadow-2xl">
          <header className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-emerald-800 dark:text-emerald-400">
              Bottle Return Tracker
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Each bottle is worth 10¢ • Track your recycling progress
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CounterDisplay
              label="Bottles Collected"
              value={bottleCount.toString()}
              icon={<BottleIcon className="text-emerald-600 dark:text-emerald-400" />}
              colorClasses="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-100"
            />
            <CounterDisplay
              label="Total Value"
              value={`$${totalValue.toFixed(2)}`}
              icon={<span className="text-5xl md:text-6xl font-bold text-amber-600 dark:text-amber-400">$</span>}
              colorClasses="bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <button
              onClick={handleAddBottle}
              className="bg-emerald-600 dark:bg-emerald-700 text-white font-bold py-4 px-6 rounded-xl text-lg flex items-center justify-center gap-2
                         hover:bg-emerald-700 dark:hover:bg-emerald-600 active:bg-emerald-800 transform hover:-translate-y-1 transition-all duration-200
                         shadow-lg hover:shadow-emerald-300 dark:hover:shadow-emerald-500/20 focus:outline-none focus:ring-4 focus:ring-emerald-300"
            >
              <PlusIcon />
              Add Bottle
            </button>

            <button
              onClick={handleRemoveBottle}
              disabled={bottleCount === 0}
              className="bg-orange-600 dark:bg-orange-700 text-white font-bold py-4 px-6 rounded-xl text-lg flex items-center justify-center gap-2
                         hover:bg-orange-700 dark:hover:bg-orange-600 active:bg-orange-800 transform hover:-translate-y-1 transition-all duration-200
                         shadow-lg hover:shadow-orange-300 dark:hover:shadow-orange-500/20 focus:outline-none focus:ring-4 focus:ring-orange-300
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <MinusIcon />
              Remove
            </button>

            <button
              onClick={handleReset}
              className="bg-red-600 dark:bg-red-700 text-white font-bold py-4 px-6 rounded-xl text-lg flex items-center justify-center gap-2
                         hover:bg-red-700 dark:hover:bg-red-600 active:bg-red-800 transform hover:-translate-y-1 transition-all duration-200
                         shadow-lg hover:shadow-red-300 dark:hover:shadow-red-500/20 focus:outline-none focus:ring-4 focus:ring-red-300"
            >
              <ResetIcon />
              Reset
            </button>
          </div>

          {/* Progress Bar */}
          {bottleCount > 0 && (
            <div className="pt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Progress to next dollar
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {bottleCount % 10}/10 bottles
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-emerald-600 dark:bg-emerald-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(bottleCount % 10) * 10}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Stats */}
          {bottleCount > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {Math.floor(bottleCount / 10)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Full Dollars</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {bottleCount % 10}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Remaining</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {history.length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Actions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {(bottleCount * 0.10 * 52).toFixed(0)} {/* Estimate yearly if weekly */}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">$/Year Est.</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="mt-8 text-center text-gray-400 dark:text-gray-500 text-sm">
        <p>🌱 Recycle and earn! Every bottle counts for the environment.</p>
      </footer>
    </div>
  );
};

export default BottleCounter;