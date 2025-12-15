import React from 'react';
import { GroundingSource } from '../types';

interface SavedJobsProps {
  jobs: GroundingSource[];
  onToggleSave: (job: GroundingSource) => void;
  onBack: () => void;
}

export const SavedJobs: React.FC<SavedJobsProps> = ({ jobs, onToggleSave, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto pb-20">
      
      <div className="flex items-center space-x-4 mb-8">
        <button 
            onClick={onBack}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
        >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
        </button>
        <div>
            <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Saved Jobs</h2>
            <p className="text-gray-500 dark:text-gray-500 mt-1">Review and apply to your bookmarked positions.</p>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="glass-panel rounded-xl p-16 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                 <svg className="w-8 h-8 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                 </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No jobs saved yet</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                Go back to your search results and click the bookmark icon to save jobs you are interested in.
            </p>
            <button 
                onClick={onBack}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors"
            >
                Browse Jobs
            </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job, idx) => (
                <div key={idx} className="glass-panel p-6 rounded-xl group relative hover:border-blue-500/30 transition-all border border-transparent">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400">
                             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <button 
                            onClick={() => onToggleSave(job)}
                            className="text-blue-600 dark:text-blue-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                            title="Remove from saved"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                        </button>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2" title={job.title}>
                        {job.title || "Job Listing"}
                    </h3>
                    <p className="text-sm text-gray-500 mb-6 truncate">
                        {new URL(job.uri).hostname}
                    </p>

                    <div className="flex items-center space-x-3">
                         <a 
                            href={job.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-1 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity text-center"
                        >
                            Apply Now
                        </a>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};