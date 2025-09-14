
import React, { useState } from 'react';

interface GatewayProps {
  onLoginSuccess: () => void;
}

const Gateway: React.FC<GatewayProps> = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'J4M1E') {
      setError(null);
      onLoginSuccess();
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-slate-900 text-slate-200">
      <div className="w-full max-w-md p-8 space-y-6 bg-slate-800 rounded-xl shadow-2xl border border-slate-700">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-400">Creative Studio AI</h1>
          <p className="mt-2 text-slate-400">Please enter the password to access the studio.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}
          <div>
            <button
              type="submit"
              className="w-full px-4 py-3 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-blue-500 transition-all duration-200 active:scale-95"
            >
              Enter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Gateway;