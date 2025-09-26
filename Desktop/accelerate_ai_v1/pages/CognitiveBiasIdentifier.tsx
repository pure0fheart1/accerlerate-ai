import React from 'react';
import { CognitiveBiasIdentifierIcon } from '../components/icons';

const CognitiveBiasIdentifier: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center gap-4 mb-8">
        <CognitiveBiasIdentifierIcon className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
        <h1 className="text-4xl font-bold text-gray-900 dark:text-slate-100">Cognitive Bias Identifier</h1>
      </header>
      <div className="flex-grow flex items-center justify-center bg-white/70 dark:bg-slate-800/50 backdrop-blur-md border border-gray-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl dark:shadow-2xl dark:shadow-black/20">
        <div className="text-center">
            <CognitiveBiasIdentifierIcon className="h-24 w-24 mx-auto text-gray-400 dark:text-slate-600 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-slate-300">Coming Soon!</h2>
            <p className="text-gray-500 dark:text-slate-400 mt-2">Identify potential cognitive biases in a piece of text or argument.</p>
        </div>
      </div>
    </div>
  );
};

export default CognitiveBiasIdentifier;