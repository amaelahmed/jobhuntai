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

  // Group parsing logic
  const renderContent = () => {
    const parts = result.text.split(/(?=# Group:)/);
    
    return parts.map((part, idx) => {
        const cleanPart = part.trim();
        if (!cleanPart) return null;

        if (cleanPart.startsWith('# Group:')) {
            const lines = cleanPart.split('\n');
            const title = lines[0].replace('# Group:', '').trim();
            const contentLines = lines.slice(1);
            
            // Extract summary if present
            const summaryIndex = contentLines.findIndex(l => l.trim().startsWith('**Summary**:'));
            let summary = '';
            let jobsLines = contentLines;

            if (summaryIndex !== -1) {
                summary = contentLines[summaryIndex].replace('**Summary**:', '').trim();
                jobsLines = contentLines.slice(summaryIndex + 1);
            }

            return (
                <div key={idx} className="glass-panel rounded-xl p-6 mb-6 hover:border-blue-500/30 transition-all">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white">{title}</h3>
                    </div>
                    
                    {summary && (
                        <div className="mb-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
                            <p className="text-sm text-gray-600 dark:text-gray-300 italic">"{summary}"</p>
                        </div>
                    )}

                    <div className="space-y-3">
                        {jobsLines.map((line, lIdx) => {
                            if (!line.trim()) return null;
                            const isList = line.trim().startsWith('*') || line.trim().startsWith('-');
                            if (!isList) return <p key={lIdx} className="text-sm text-gray-500 dark:text-gray-400 mb-2">{line}</p>;

                            // Parse links in the list item
                            const content = line.replace(/^[\*\-]\s*/, '');
                            const linkRegex = /\[([^\]]+)\]\(([^)]+)\)|(https?:\/\/[^\s]+)/g;
                            const elements = [];
                            let lastIndex = 0;
                            let match;

                            while ((match = linkRegex.exec(content)) !== null) {
                                if (match.index > lastIndex) {
                                    elements.push(content.substring(lastIndex, match.index));
                                }
                                const url = match[2] || match[3];
                                const text = match[1] || "Apply";
                                
                                elements.push(
                                    <a key={match.index} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:underline font-medium mx-1">
                                        <span>{text}</span>
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                );
                                lastIndex = linkRegex.lastIndex;
                            }
                            if (lastIndex < content.length) {
                                elements.push(content.substring(lastIndex));
                            }

                            return (
                                <div key={lIdx} className="flex items-start pl-2 border-l-2 border-gray-200 dark:border-gray-700 py-1">
                                    <span className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm md:text-base">
                                        {elements.length ? elements : content}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            );
        } else {
             // Fallback for intro text or unstructured content
             return (
                 <div key={idx} className="mb-6 text-gray-600 dark:text-gray-300 leading-relaxed px-4">
                     {part}
                 </div>
             )
        }
    });
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      
      <div className="flex justify-between items-center mb-8">
        <div>
            <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Job Matches</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Refined opportunities based on your profile.</p>
        </div>
        <button 
            onClick={onReset}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-700 rounded-lg hover:text-black dark:hover:text-white hover:border-gray-400 dark:hover:border-gray-500 transition-colors bg-white dark:bg-transparent"
        >
            New Search
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Feed */}
          <div className="lg:col-span-2">
                 {renderContent()}
          </div>

          {/* Sidebar / Sources */}
          <div className="space-y-6">
             <div className="bg-white dark:bg-[#0b101b] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Source Links</h3>
                {result.sources.length > 0 ? (
                    <div className="space-y-3">
                        {result.sources.map((source, idx) => {
                            const saved = isJobSaved(source.uri);
                            return (
                                <div 
                                    key={idx}
                                    className="group flex flex-col p-3 rounded-lg bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-gray-800 hover:border-blue-500/50 hover:bg-gray-100 dark:hover:bg-[#161e31] transition-all relative pr-10"
                                >
                                    <a 
                                        href={source.uri}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block"
                                    >
                                        <div className="flex justify-between items-start">
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-white truncate pr-2">
                                                {source.title || "Job Link"}
                                            </p>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-600 truncate mt-1">{new URL(source.uri).hostname}</p>
                                    </a>
                                    
                                    <button 
                                        onClick={() => onToggleSave(source)}
                                        className={`absolute right-3 top-3 p-1 rounded-full transition-colors ${saved ? 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/10' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
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
                    <p className="text-sm text-gray-500">No direct links found.</p>
                )}
             </div>

             {/* Insights Card */}
             <div className="glass-panel rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Search Insight</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    Jobs have been grouped by title to help you browse faster. Check the summaries for a quick market overview.
                </p>
             </div>
          </div>
      </div>
    </div>
  );
};