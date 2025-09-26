import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ClockIcon, PlayIcon, PauseIcon, StopIcon, PlusIcon, TrashIcon, GlobeAltIcon } from '../components/icons';

interface Timer {
  id: string;
  name: string;
  duration: number; // in seconds
  remaining: number;
  isRunning: boolean;
  isFinished: boolean;
}

interface Stopwatch {
  id: string;
  name: string;
  elapsed: number; // in milliseconds
  isRunning: boolean;
  laps: number[];
}

interface WorldClock {
  id: string;
  city: string;
  timezone: string;
}

const ClockTimerHub: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timers, setTimers] = useState<Timer[]>([]);
  const [stopwatches, setStopwatches] = useState<Stopwatch[]>([]);
  const [worldClocks, setWorldClocks] = useState<WorldClock[]>([
    { id: '1', city: 'New York', timezone: 'America/New_York' },
    { id: '2', city: 'London', timezone: 'Europe/London' },
    { id: '3', city: 'Tokyo', timezone: 'Asia/Tokyo' },
    { id: '4', city: 'Sydney', timezone: 'Australia/Sydney' },
  ]);

  const [activeTab, setActiveTab] = useState<'clock' | 'timer' | 'stopwatch'>('clock');
  const [newTimerName, setNewTimerName] = useState('');
  const [newTimerMinutes, setNewTimerMinutes] = useState(5);
  const [newStopwatchName, setNewStopwatchName] = useState('');
  const [isAddingTimer, setIsAddingTimer] = useState(false);
  const [isAddingStopwatch, setIsAddingStopwatch] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio for timer notifications
  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhDjuBz+zfjDsLFWa26ew9DhxWoNzQp2gXCFPAxdCOQw0PUaDbyJxoGQddwLbP');
  }, []);

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Handle timers and stopwatches
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimers(prevTimers =>
        prevTimers.map(timer => {
          if (timer.isRunning && timer.remaining > 0) {
            const newRemaining = timer.remaining - 1;
            if (newRemaining === 0) {
              // Timer finished
              audioRef.current?.play().catch(() => {});
              return { ...timer, remaining: 0, isRunning: false, isFinished: true };
            }
            return { ...timer, remaining: newRemaining };
          }
          return timer;
        })
      );

      setStopwatches(prevStopwatches =>
        prevStopwatches.map(stopwatch => {
          if (stopwatch.isRunning) {
            return { ...stopwatch, elapsed: stopwatch.elapsed + 100 };
          }
          return stopwatch;
        })
      );
    }, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Load data from localStorage
  useEffect(() => {
    const savedTimers = localStorage.getItem('accelerate-timers');
    const savedStopwatches = localStorage.getItem('accelerate-stopwatches');
    const savedWorldClocks = localStorage.getItem('accelerate-world-clocks');

    if (savedTimers) {
      setTimers(JSON.parse(savedTimers));
    }
    if (savedStopwatches) {
      setStopwatches(JSON.parse(savedStopwatches));
    }
    if (savedWorldClocks) {
      setWorldClocks(JSON.parse(savedWorldClocks));
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('accelerate-timers', JSON.stringify(timers));
  }, [timers]);

  useEffect(() => {
    localStorage.setItem('accelerate-stopwatches', JSON.stringify(stopwatches));
  }, [stopwatches]);

  useEffect(() => {
    localStorage.setItem('accelerate-world-clocks', JSON.stringify(worldClocks));
  }, [worldClocks]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const formatStopwatchTime = useCallback((milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const ms = Math.floor((milliseconds % 1000) / 10);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  }, []);

  const addTimer = () => {
    if (!newTimerName.trim()) return;

    const timer: Timer = {
      id: Date.now().toString(),
      name: newTimerName,
      duration: newTimerMinutes * 60,
      remaining: newTimerMinutes * 60,
      isRunning: false,
      isFinished: false,
    };

    setTimers(prev => [...prev, timer]);
    setNewTimerName('');
    setNewTimerMinutes(5);
    setIsAddingTimer(false);
  };

  const toggleTimer = (id: string) => {
    setTimers(prev =>
      prev.map(timer =>
        timer.id === id
          ? { ...timer, isRunning: !timer.isRunning, isFinished: false }
          : timer
      )
    );
  };

  const resetTimer = (id: string) => {
    setTimers(prev =>
      prev.map(timer =>
        timer.id === id
          ? { ...timer, remaining: timer.duration, isRunning: false, isFinished: false }
          : timer
      )
    );
  };

  const deleteTimer = (id: string) => {
    setTimers(prev => prev.filter(timer => timer.id !== id));
  };

  const addStopwatch = () => {
    if (!newStopwatchName.trim()) return;

    const stopwatch: Stopwatch = {
      id: Date.now().toString(),
      name: newStopwatchName,
      elapsed: 0,
      isRunning: false,
      laps: [],
    };

    setStopwatches(prev => [...prev, stopwatch]);
    setNewStopwatchName('');
    setIsAddingStopwatch(false);
  };

  const toggleStopwatch = (id: string) => {
    setStopwatches(prev =>
      prev.map(stopwatch =>
        stopwatch.id === id
          ? { ...stopwatch, isRunning: !stopwatch.isRunning }
          : stopwatch
      )
    );
  };

  const resetStopwatch = (id: string) => {
    setStopwatches(prev =>
      prev.map(stopwatch =>
        stopwatch.id === id
          ? { ...stopwatch, elapsed: 0, isRunning: false, laps: [] }
          : stopwatch
      )
    );
  };

  const lapStopwatch = (id: string) => {
    setStopwatches(prev =>
      prev.map(stopwatch =>
        stopwatch.id === id
          ? { ...stopwatch, laps: [...stopwatch.laps, stopwatch.elapsed] }
          : stopwatch
      )
    );
  };

  const deleteStopwatch = (id: string) => {
    setStopwatches(prev => prev.filter(stopwatch => stopwatch.id !== id));
  };

  const getTimeInTimezone = (timezone: string) => {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(currentTime);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2 flex items-center justify-center gap-2">
          <ClockIcon className="h-8 w-8 text-indigo-600" />
          Clock & Timer Hub
        </h1>
        <p className="text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
          Keep track of time with world clocks, set multiple timers, and use precision stopwatches.
        </p>
      </div>

      {/* Current Time Display */}
      <div className="text-center">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="text-6xl font-mono font-bold mb-2">
            {currentTime.toLocaleTimeString([], { hour12: false })}
          </div>
          <div className="text-xl opacity-90">
            {currentTime.toLocaleDateString([], {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-1 border border-gray-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('clock')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'clock'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100'
            }`}
          >
            World Clock
          </button>
          <button
            onClick={() => setActiveTab('timer')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'timer'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100'
            }`}
          >
            Timers
          </button>
          <button
            onClick={() => setActiveTab('stopwatch')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'stopwatch'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100'
            }`}
          >
            Stopwatch
          </button>
        </div>
      </div>

      {/* World Clock Tab */}
      {activeTab === 'clock' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {worldClocks.map((clock) => (
            <div key={clock.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <GlobeAltIcon className="h-5 w-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">{clock.city}</h3>
              </div>
              <div className="text-3xl font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {getTimeInTimezone(clock.timezone)}
              </div>
              <div className="text-sm text-gray-600 dark:text-slate-400 mt-2">
                {clock.timezone.replace('_', ' ')}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Timer Tab */}
      {activeTab === 'timer' && (
        <div className="space-y-6">
          <div className="flex justify-center">
            <button
              onClick={() => setIsAddingTimer(true)}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Add Timer
            </button>
          </div>

          {/* Add Timer Form */}
          {isAddingTimer && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Add New Timer</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Timer Name
                  </label>
                  <input
                    type="text"
                    value={newTimerName}
                    onChange={(e) => setNewTimerName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., Break Timer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1440"
                    value={newTimerMinutes}
                    onChange={(e) => setNewTimerMinutes(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={addTimer}
                    className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Add Timer
                  </button>
                  <button
                    onClick={() => setIsAddingTimer(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Timers List */}
          {timers.length === 0 ? (
            <div className="text-center py-12">
              <ClockIcon className="h-16 w-16 text-gray-400 dark:text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2">No timers yet</h3>
              <p className="text-gray-600 dark:text-slate-400">Add your first timer to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {timers.map((timer) => (
                <div key={timer.id} className={`bg-white dark:bg-slate-800 rounded-xl p-6 border-2 transition-colors ${
                  timer.isFinished ? 'border-red-400 bg-red-50 dark:bg-red-900/10' :
                  timer.isRunning ? 'border-green-400' : 'border-gray-200 dark:border-slate-700'
                }`}>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">
                      {timer.name}
                    </h3>
                    <div className={`text-4xl font-mono font-bold mb-4 ${
                      timer.isFinished ? 'text-red-600' :
                      timer.isRunning ? 'text-green-600' : 'text-gray-900 dark:text-slate-100'
                    }`}>
                      {formatTime(timer.remaining)}
                    </div>
                    <div className="flex justify-center gap-2 mb-3">
                      <button
                        onClick={() => toggleTimer(timer.id)}
                        disabled={timer.remaining === 0 && !timer.isRunning}
                        className={`p-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                          timer.isRunning
                            ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                            : 'bg-green-500 hover:bg-green-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed'
                        }`}
                      >
                        {timer.isRunning ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => resetTimer(timer.id)}
                        className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                      >
                        <StopIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteTimer(timer.id)}
                        className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                    {timer.isFinished && (
                      <div className="text-red-600 font-medium">Timer Finished! 🔔</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stopwatch Tab */}
      {activeTab === 'stopwatch' && (
        <div className="space-y-6">
          <div className="flex justify-center">
            <button
              onClick={() => setIsAddingStopwatch(true)}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Add Stopwatch
            </button>
          </div>

          {/* Add Stopwatch Form */}
          {isAddingStopwatch && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">Add New Stopwatch</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                    Stopwatch Name
                  </label>
                  <input
                    type="text"
                    value={newStopwatchName}
                    onChange={(e) => setNewStopwatchName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., Workout Timer"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={addStopwatch}
                    className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Add Stopwatch
                  </button>
                  <button
                    onClick={() => setIsAddingStopwatch(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Stopwatches List */}
          {stopwatches.length === 0 ? (
            <div className="text-center py-12">
              <ClockIcon className="h-16 w-16 text-gray-400 dark:text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100 mb-2">No stopwatches yet</h3>
              <p className="text-gray-600 dark:text-slate-400">Add your first stopwatch to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stopwatches.map((stopwatch) => (
                <div key={stopwatch.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">
                      {stopwatch.name}
                    </h3>
                    <div className={`text-4xl font-mono font-bold mb-4 ${
                      stopwatch.isRunning ? 'text-green-600' : 'text-gray-900 dark:text-slate-100'
                    }`}>
                      {formatStopwatchTime(stopwatch.elapsed)}
                    </div>
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => toggleStopwatch(stopwatch.id)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                          stopwatch.isRunning
                            ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                      >
                        {stopwatch.isRunning ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
                        {stopwatch.isRunning ? 'Pause' : 'Start'}
                      </button>
                      <button
                        onClick={() => lapStopwatch(stopwatch.id)}
                        disabled={!stopwatch.isRunning}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                      >
                        Lap
                      </button>
                      <button
                        onClick={() => resetStopwatch(stopwatch.id)}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
                      >
                        Reset
                      </button>
                      <button
                        onClick={() => deleteStopwatch(stopwatch.id)}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Laps */}
                  {stopwatch.laps.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Laps</h4>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {stopwatch.laps.map((lap, index) => (
                          <div key={index} className="flex justify-between text-sm text-gray-600 dark:text-slate-400 bg-gray-50 dark:bg-slate-700 px-3 py-1 rounded">
                            <span>Lap {index + 1}</span>
                            <span className="font-mono">{formatStopwatchTime(lap)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClockTimerHub;