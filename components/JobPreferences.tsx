import React, { useState } from 'react';
import { ParsedResumeData } from '../types';

interface JobPreferencesProps {
  initialData: ParsedResumeData;
  onSubmit: (location: string, interests: string, updatedData: ParsedResumeData) => void;
}

export const JobPreferences: React.FC<JobPreferencesProps> = ({ initialData, onSubmit }) => {
  const [data, setData] = useState<ParsedResumeData>(initialData);
  const [location, setLocation] = useState('');
  const [interests, setInterests] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim()) {
      alert("Please enter a location");
      return;
    }
    onSubmit(location, interests || "relevant positions", data);
  };

  const handleDataChange = (field: keyof ParsedResumeData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const getScoreConfig = (score: number) => {
    if (score >= 80) return { color: 'text-green-600 dark:text-green-400', borderColor: 'border-green-500', label: 'Excellent' };
    if (score >= 60) return { color: 'text-yellow-600 dark:text-yellow-400', borderColor: 'border-yellow-500', label: 'Good' };
    return { color: 'text-red-600 dark:text-red-400', borderColor: 'border-red-500', label: 'Needs Work' };
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* ATS Score Section */}
      {data.atsScore !== undefined && (
        <div className="mb-8 p-6 glass-panel rounded-2xl border border-gray-200 dark:border-gray-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
          
          <h3 className="text-lg font-display font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 relative z-10">
             <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
             ATS Resume Analysis
          </h3>
          
          <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
             {/* Score Circle */}
             <div className="flex flex-col items-center">
                <div className={`relative w-32 h-32 flex items-center justify-center rounded-full border-4 ${getScoreConfig(data.atsScore).borderColor} shadow-[0_0_20px_rgba(0,0,0,0.05)] bg-white dark:bg-gray-900`}>
                    <div className="text-center">
                    <span className={`text-4xl font-bold ${getScoreConfig(data.atsScore).color}`}>{data.atsScore}</span>
                    <span className="text-xs font-medium uppercase block text-gray-400">Score</span>
                    </div>
                </div>
                <span className={`mt-3 text-sm font-bold uppercase tracking-wider ${getScoreConfig(data.atsScore).color}`}>
                    {getScoreConfig(data.atsScore).label}
                </span>
             </div>
             
             {/* Recommendations */}
             <div className="flex-grow w-full md:w-auto">
               <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">AI Recommendations</h4>
               <ul className="space-y-3">
                  {data.atsRecommendations?.map((rec, idx) => (
                    <li key={idx} className="flex items-start text-sm text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                       <span className="mr-3 text-blue-500 mt-0.5">•</span>
                       {rec}
                    </li>
                  ))}
               </ul>
             </div>
          </div>
        </div>
      )}

      {/* Profile Form */}
      <div className="glass-panel rounded-2xl p-8">
        <div className="mb-8 border-b border-gray-200 dark:border-gray-800 pb-6">
            <h2 className="text-2xl font-display font-semibold text-gray-900 dark:text-white">Profile Details</h2>
            <p className="text-gray-500 text-sm mt-1">Review your extracted information before searching.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">Job Title</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        value={data.jobName}
                        onChange={(e) => handleDataChange('jobName', e.target.value)}
                        className="w-full tech-input pl-10 pr-4 py-3 rounded-lg font-medium"
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">Experience</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        value={data.experienceYears}
                        onChange={(e) => handleDataChange('experienceYears', e.target.value)}
                        className="w-full tech-input pl-10 pr-4 py-3 rounded-lg font-medium"
                    />
                </div>
            </div>
            </div>

            <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">Skills</label>
            <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none text-gray-400 dark:text-gray-500">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <textarea
                        rows={2}
                        value={data.skills}
                        onChange={(e) => handleDataChange('skills', e.target.value)}
                        className="w-full tech-input pl-10 pr-4 py-3 rounded-lg font-medium resize-none"
                    />
            </div>
            </div>

            <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">Certifications</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <input
                    type="text"
                    value={data.certifications}
                    onChange={(e) => handleDataChange('certifications', e.target.value)}
                    className="w-full tech-input pl-10 pr-4 py-3 rounded-lg font-medium"
                />
            </div>
            </div>

            <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-display font-semibold text-gray-900 dark:text-white mb-6">Search Preferences</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide ml-1">Target Location</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-500/60">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <input
                        type="text"
                        placeholder="e.g. New York, Remote"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full tech-input pl-10 pr-4 py-3 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-bold border-blue-500/20 focus:border-blue-500"
                        required
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-wide ml-1">Specific Interests</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-indigo-500/60">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                        <input
                        type="text"
                        placeholder="e.g. Fintech, Startups"
                        value={interests}
                        onChange={(e) => setInterests(e.target.value)}
                        className="w-full tech-input pl-10 pr-4 py-3 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 font-medium"
                        />
                    </div>
                </div>
            </div>
            </div>

            <div className="pt-6 flex justify-end">
                <button
                    type="submit"
                    className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-lg"
                >
                    Start Search
                </button>
            </div>

        </form>
      </div>
    </div>
  );
};