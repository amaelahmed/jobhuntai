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

  return (
    <div className="max-w-3xl mx-auto glass-panel rounded-2xl p-8">
      <div className="mb-8 border-b border-gray-800 pb-6">
        <h2 className="text-2xl font-display font-semibold text-white">Review Profile</h2>
        <p className="text-gray-500 text-sm mt-1">We extracted this information from your resume. Feel free to edit.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Job Title</label>
            <input
              type="text"
              value={data.jobName}
              onChange={(e) => handleDataChange('jobName', e.target.value)}
              className="w-full tech-input px-4 py-3 rounded-lg text-white placeholder-gray-600 font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Experience</label>
            <input
              type="text"
              value={data.experienceYears}
              onChange={(e) => handleDataChange('experienceYears', e.target.value)}
              className="w-full tech-input px-4 py-3 rounded-lg text-white placeholder-gray-600 font-medium"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Skills</label>
          <textarea
            rows={2}
            value={data.skills}
            onChange={(e) => handleDataChange('skills', e.target.value)}
            className="w-full tech-input px-4 py-3 rounded-lg text-white placeholder-gray-600 font-medium resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Certifications</label>
          <input
            type="text"
            value={data.certifications}
            onChange={(e) => handleDataChange('certifications', e.target.value)}
            className="w-full tech-input px-4 py-3 rounded-lg text-white placeholder-gray-600 font-medium"
          />
        </div>

        <div className="pt-6 mt-6 border-t border-gray-800">
           <h3 className="text-lg font-display font-semibold text-white mb-6">Search Preferences</h3>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
                <label className="text-xs font-medium text-blue-400 uppercase tracking-wide">Target Location</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <input
                    type="text"
                    placeholder="e.g. New York, Remote"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full tech-input pl-10 pr-4 py-3 rounded-lg text-white placeholder-gray-600 font-bold"
                    required
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-xs font-medium text-indigo-400 uppercase tracking-wide">Specific Interests</label>
                <input
                type="text"
                placeholder="e.g. Fintech, Startups"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                className="w-full tech-input px-4 py-3 rounded-lg text-white placeholder-gray-600 font-medium"
                />
            </div>
           </div>
        </div>

        <div className="pt-6 flex justify-end">
            <button
                type="submit"
                className="px-8 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg shadow-white/10"
            >
                Start Search
            </button>
        </div>

      </form>
    </div>
  );
};