import React from 'react';
import { SearchResult, GroundingSource } from '../types';

interface SearchResultsProps {
  result: SearchResult;
  onReset: () => void;
  savedJobs: GroundingSource[];
  onToggleSave: (job: GroundingSource) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({ result, onReset, savedJobs, onToggleSave }) => {
  
  const isJobSaved = (uri: string) => savedJobs.some(j => j.uri === uri);

  const formatText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      const cleanLine = line.trim();
      if (!cleanLine) return <div key={idx} className="h-4" />;
      
      // Headers
      if (cleanLine.startsWith('**') && cleanLine.endsWith('**')) {
        return (
            <h3 key={idx} className="text-lg font-display font-semibold text-white mt-8 mb-4">
                {cleanLine.replace(/\*\*/g, '')}
            </h3>
        );
      }
      if (cleanLine.startsWith('#')) {
         return <h3 key={idx} className="text-xl font-display font-bold text-white mt-8 mb-4">{cleanLine.replace(/^#+ /, '')}</h3>;
      }
      
      const isList = cleanLine.startsWith('* ') || cleanLine.startsWith('- ');
      const content = isList ? cleanLine.substring(2) : cleanLine;
      
      // Parse markdown links
      const parts = [];
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)|(https?:\/\/[^\s]+)/g;
      let lastIndex = 0;
      let match;

      while ((match = linkRegex.exec(content)) !== null) {
        if (match.index > lastIndex) {
          parts.push(content.substring(lastIndex, match.index));
        }

        if (match[1] && match[2]) {
            parts.push(
                <a key={match.index} href={match[2]} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline underline-offset-2 font-medium">
                    {match[1]}
                </a>
            );
        } else if (match[3]) {
            parts.push(
                <a key={match.index} href={match[3]} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline underline-offset-2 break-all">
                   link
                </a>
            );
        }
        lastIndex = linkRegex.lastIndex;
      }
      if (lastIndex < content.length) {
        parts.push(content.substring(lastIndex));
      }

      return (
        <div key={idx} className={`mb-3 text-gray-300 leading-relaxed ${isList ? 'pl-4 border-l-2 border-gray-700 ml-1' : ''}`}>
             {isList}
             <span>{parts.length > 0 ? parts : content}</span>
        </div>
      );
    });
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      
      <div className="flex justify-between items-center mb-8">
        <div>
            <h2 className="text-3xl font-display font-bold text-white">Job Matches</h2>
            <p className="text-gray-500 mt-1">Based on your profile and preferences.</p>
        </div>
        <button 
            onClick={onReset}
            className="px-4 py-2 text-sm font-medium text-gray-400 border border-gray-700 rounded-lg hover:text-white hover:border-gray-500 transition-colors"
        >
            New Search
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-panel rounded-xl p-8">
                 {formatText(result.text)}
            </div>
          </div>

          {/* Sidebar / Sources */}
          <div className="space-y-6">
             <div className="bg-[#0b101b] border border-gray-800 rounded-xl p-6">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Application Sources</h3>
                {result.sources.length > 0 ? (
                    <div className="space-y-3">
                        {result.sources.map((source, idx) => {
                            const saved = isJobSaved(source.uri);
                            return (
                                <div 
                                    key={idx}
                                    className="group flex flex-col p-3 rounded-lg bg-[#111827] border border-gray-800 hover:border-blue-500/50 hover:bg-[#161e31] transition-all relative pr-10"
                                >
                                    <a 
                                        href={source.uri}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block"
                                    >
                                        <div className="flex justify-between items-start">
                                            <p className="text-sm font-medium text-gray-300 group-hover:text-white truncate pr-2">
                                                {source.title || "Job Link"}
                                            </p>
                                        </div>
                                        <p className="text-xs text-gray-600 truncate mt-1">{new URL(source.uri).hostname}</p>
                                    </a>
                                    
                                    <button 
                                        onClick={() => onToggleSave(source)}
                                        className={`absolute right-3 top-3 p-1 rounded-full transition-colors ${saved ? 'text-blue-400 bg-blue-500/10' : 'text-gray-600 hover:text-gray-300'}`}
                                        title={saved ? "Remove from saved" : "Save job"}
                                    >
                                        <svg className="w-4 h-4" fill={saved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                        </svg>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-sm text-gray-600">No direct links found.</p>
                )}
             </div>

             {/* Insights Card */}
             <div className="glass-panel rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                <h3 className="text-sm font-semibold text-white mb-2">Search Insight</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                    Our AI has prioritized listings from Naukri and Indeed as requested. Use the bookmark icon to save jobs to your personal list.
                </p>
             </div>
          </div>
      </div>
    </div>
  );
};