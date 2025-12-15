import React, { useState } from 'react';
import { ResumeUploader } from './components/ResumeUploader';
import { JobPreferences } from './components/JobPreferences';
import { SearchResults } from './components/SearchResults';
import { analyzeResume, searchForJobs } from './services/geminiService';
import { AppStep, ParsedResumeData, SearchResult } from './types';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD);
  const [resumeData, setResumeData] = useState<ParsedResumeData | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleResumeUpload = async (file: File) => {
    setStep(AppStep.ANALYZING);
    setErrorMsg(null);
    try {
      const base64 = await fileToBase64(file);
      const data = await analyzeResume(base64, file.type);
      setResumeData(data);
      setStep(AppStep.CONFIRM_DETAILS);
    } catch (err) {
      console.error(err);
      setErrorMsg("We couldn't parse that file. Please try a different PDF or Image.");
      setStep(AppStep.ERROR);
    }
  };

  const handlePreferencesSubmit = async (location: string, interests: string, updatedData: ParsedResumeData) => {
    setStep(AppStep.SEARCHING);
    setResumeData(updatedData);
    try {
      const results = await searchForJobs(updatedData, location, interests);
      setSearchResults(results);
      setStep(AppStep.RESULTS);
    } catch (err) {
      console.error(err);
      setErrorMsg("Search failed due to a network issue. Please try again.");
      setStep(AppStep.ERROR);
    }
  };

  const handleReset = () => {
    setStep(AppStep.UPLOAD);
    setResumeData(null);
    setSearchResults(null);
    setErrorMsg(null);
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#030712] text-gray-200 font-sans">
      
      {/* Professional Header */}
      <header className="sticky top-0 z-50 bg-[#030712]/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
           <div className="flex items-center space-x-2">
              <span className="text-lg font-display font-bold text-white tracking-tight">Job Search</span>
           </div>
           
           <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-400">
             <span className="text-white">Dashboard</span>
             <span>Applications</span>
             <span>Profile</span>
           </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-12 px-6 pb-20">
        <div className="max-w-4xl mx-auto">
            
          {/* Clean Progress Steps */}
          <div className="mb-16">
             <div className="flex items-center justify-between relative">
                <div className="absolute left-0 right-0 top-1/2 h-px bg-gray-800 -z-10"></div>
                {[AppStep.UPLOAD, AppStep.CONFIRM_DETAILS, AppStep.RESULTS].map((s, i) => {
                    const currentIdx = [AppStep.UPLOAD, AppStep.CONFIRM_DETAILS, AppStep.RESULTS].indexOf(s);
                    // Simplify mapping for visual progress
                    let stepNum = 0;
                    if (step === AppStep.UPLOAD || step === AppStep.ANALYZING) stepNum = 0;
                    else if (step === AppStep.CONFIRM_DETAILS || step === AppStep.SEARCHING) stepNum = 1;
                    else if (step === AppStep.RESULTS) stepNum = 2;
                    else stepNum = 0; 

                    const isActive = i <= stepNum;
                    const isCurrent = i === stepNum;

                    return (
                        <div key={s} className="flex flex-col items-center bg-[#030712] px-4">
                            <div className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${isActive ? 'bg-blue-500 border-blue-500' : 'bg-[#030712] border-gray-600'}`}></div>
                            <span className={`mt-2 text-xs font-medium tracking-wide ${isCurrent ? 'text-white' : 'text-gray-500'}`}>
                                {s === AppStep.UPLOAD ? 'Resume' : s === AppStep.CONFIRM_DETAILS ? 'Preferences' : 'Opportunities'}
                            </span>
                        </div>
                    )
                })}
             </div>
          </div>

          {step === AppStep.UPLOAD && (
            <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
               <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6 tracking-tight">
                Find your next role with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Intelligent Search</span>
              </h1>
              <p className="max-w-xl mx-auto text-lg text-gray-400 mb-12 leading-relaxed">
                Upload your resume. Our AI agent will extract your skills and match you with live listings from top platforms.
              </p>
              <ResumeUploader onUpload={handleResumeUpload} />
            </div>
          )}

          {step === AppStep.ANALYZING && (
             <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-8"></div>
                <h2 className="text-xl font-display font-semibold text-white">Analyzing Profile</h2>
                <p className="text-gray-500 mt-2">Extracting skills, experience, and certifications...</p>
             </div>
          )}

          {step === AppStep.CONFIRM_DETAILS && resumeData && (
            <div className="animate-in fade-in duration-500">
                <JobPreferences 
                    initialData={resumeData} 
                    onSubmit={handlePreferencesSubmit} 
                />
            </div>
          )}

          {step === AppStep.SEARCHING && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-full max-w-xs h-1 bg-gray-800 rounded-full overflow-hidden mb-8">
                    <div className="h-full bg-blue-500 animate-[progress_1.5s_ease-in-out_infinite] w-full origin-left"></div>
                </div>
                <style>{`@keyframes progress { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }`}</style>
                <h2 className="text-xl font-display font-semibold text-white">Sourcing Opportunities</h2>
                <p className="text-gray-500 mt-2">Searching Indeed, LinkedIn, and Naukri...</p>
             </div>
          )}

          {step === AppStep.RESULTS && searchResults && (
            <div className="animate-in slide-in-from-bottom-8 duration-700">
                <SearchResults result={searchResults} onReset={handleReset} />
            </div>
          )}

          {step === AppStep.ERROR && (
             <div className="max-w-md mx-auto text-center py-12 glass-panel rounded-xl p-8">
                <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Process Failed</h3>
                <p className="text-gray-400 mb-8 text-sm">{errorMsg || "An unexpected error occurred."}</p>
                <button 
                    onClick={handleReset}
                    className="px-6 py-2.5 bg-white text-black text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                >
                    Try Again
                </button>
             </div>
          )}
        </div>
      </main>
      
      <footer className="border-t border-gray-800/50 py-8 bg-[#030712]">
        <div className="max-w-6xl mx-auto px-6 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
            <p>&copy; {new Date().getFullYear()} Job Search. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="hover:text-gray-400 transition-colors">Privacy</a>
                <a href="#" className="hover:text-gray-400 transition-colors">Terms</a>
                <a href="#" className="hover:text-gray-400 transition-colors">Support</a>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default App;