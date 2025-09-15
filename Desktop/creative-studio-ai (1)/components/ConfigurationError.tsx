import React from 'react';

const ConfigurationError: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-slate-800 rounded-lg p-8">
        <div className="text-center mb-8">
          <div className="text-yellow-400 text-6xl mb-4">⚙️</div>
          <h1 className="text-3xl font-bold text-slate-100 mb-4">Configuration Required</h1>
          <p className="text-slate-300 text-lg">
            Creative Studio AI needs to be configured with your Supabase credentials to function properly.
          </p>
        </div>

        <div className="bg-slate-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-slate-100 mb-4">Missing Environment Variables</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-red-400">✗</span>
              <code className="text-blue-300">VITE_SUPABASE_URL</code>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-red-400">✗</span>
              <code className="text-blue-300">VITE_SUPABASE_ANON_KEY</code>
            </div>
          </div>
        </div>

        <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-400 mb-3">Quick Setup</h3>
          <ol className="list-decimal list-inside space-y-2 text-slate-300 text-sm">
            <li>Go to your <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Supabase dashboard</a></li>
            <li>Select your project and go to Settings → API</li>
            <li>Copy your Project URL and Anonymous key</li>
            <li>Add these as environment variables in Vercel:
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li><code className="text-blue-300">VITE_SUPABASE_URL</code></li>
                <li><code className="text-blue-300">VITE_SUPABASE_ANON_KEY</code></li>
              </ul>
            </li>
            <li>Redeploy your application</li>
          </ol>
        </div>

        <div className="text-center">
          <a
            href="https://vercel.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Configure in Vercel Dashboard
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        <div className="mt-6 text-center text-sm text-slate-400">
          <p>Need help? Check the <code>SUPABASE_SETUP.md</code> file for detailed instructions.</p>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationError;