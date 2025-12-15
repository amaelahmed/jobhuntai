import React, { useState, useEffect, Suspense } from 'react';
import { analyzeResume, searchForJobs } from './services/geminiService';
import { AppStep, ParsedResumeData, SearchResult, GroundingSource } from './types';

// Lazy load components
const ResumeUploader = React.lazy(() => import('./components/ResumeUploader').then(module => ({ default: module.ResumeUploader })));
const JobPreferences = React.lazy(() => import('./components/JobPreferences').then(module => ({ default: module.JobPreferences })));
const SearchResults = React.lazy(() => import('./components/SearchResults').then(module => ({ default: module.SearchResults })));
const SavedJobs = React.lazy(() => import('./components/SavedJobs').then(module => ({ default: module.SavedJobs })));

const LoadingSpinner = () => (
  <div className="w-full h-40 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
  </div>
);

// Helper component for cycling text
const LoadingText = ({ texts }: { texts: string[] }) => {
  const [index, setIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % texts.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [texts]);

  return (
    <p key={index} className="text-gray-500 mt-2 animate-in fade-in slide-in-from-bottom-2 duration-500 h-6">
      {texts[index]}
    </p>
  );
};

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-800">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-900">
          <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 text-gray-600 dark:text-gray-300 leading-relaxed text-sm space-y-4">
          {children}
        </div>
      </div>
    </div>
);

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD);
  const [resumeData, setResumeData] = useState<ParsedResumeData | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedJobs, setSavedJobs] = useState<GroundingSource[]>([]);
  
  // Theme State
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('job_hunter_theme');
    if (saved !== null) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Modal States
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  useEffect(() => {
    localStorage.setItem('job_hunter_theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Load saved jobs
  useEffect(() => {
    const saved = localStorage.getItem('job_hunter_saved_jobs');
    if (saved) {
      try {
        setSavedJobs(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved jobs", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('job_hunter_saved_jobs', JSON.stringify(savedJobs));
  }, [savedJobs]);

  const toggleSaveJob = (job: GroundingSource) => {
    setSavedJobs(prev => {
      const exists = prev.find(j => j.uri === job.uri);
      if (exists) {
        return prev.filter(j => j.uri !== job.uri);
      }
      return [...prev, job];
    });
  };

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

  const goToSavedJobs = () => {
    setStep(AppStep.SAVED_JOBS);
  };

  const goBackFromSaved = () => {
    if (searchResults) {
      setStep(AppStep.RESULTS);
    } else if (resumeData) {
      setStep(AppStep.CONFIRM_DETAILS);
    } else {
      setStep(AppStep.UPLOAD);
    }
  };

  return (
    <div className={`relative min-h-screen flex flex-col font-sans transition-colors duration-300 ${darkMode ? 'bg-[#030712] text-gray-200' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#030712]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-end">
           
           <nav className="flex items-center space-x-4">
             <button
               onClick={() => setDarkMode(!darkMode)}
               className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
               title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
             >
               {darkMode ? (
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                 </svg>
               ) : (
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                 </svg>
               )}
             </button>

             <button 
                onClick={goToSavedJobs}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium ${
                  step === AppStep.SAVED_JOBS 
                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`}
             >
               <svg className="w-4 h-4" fill={step === AppStep.SAVED_JOBS ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
               </svg>
               <span>Saved ({savedJobs.length})</span>
             </button>
           </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow pt-12 px-6 pb-20">
        <div className="max-w-4xl mx-auto">
            
          {/* Progress Steps */}
          {step !== AppStep.SAVED_JOBS && (
            <div className="mb-16">
               <div className="flex items-center justify-between relative">
                  <div className="absolute left-0 right-0 top-1/2 h-px bg-gray-200 dark:bg-gray-800 -z-10 transition-colors"></div>
                  {[AppStep.UPLOAD, AppStep.CONFIRM_DETAILS, AppStep.RESULTS].map((s, i) => {
                      let stepNum = 0;
                      if (step === AppStep.UPLOAD || step === AppStep.ANALYZING) stepNum = 0;
                      else if (step === AppStep.CONFIRM_DETAILS || step === AppStep.SEARCHING) stepNum = 1;
                      else if (step === AppStep.RESULTS) stepNum = 2;
                      else stepNum = 0; 

                      const isActive = i <= stepNum;
                      const isCurrent = i === stepNum;

                      return (
                          <div key={s} className="flex flex-col items-center bg-gray-50 dark:bg-[#030712] px-4 transition-colors duration-300">
                              <div className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${isActive ? 'bg-blue-600 border-blue-600 dark:bg-blue-500 dark:border-blue-500' : 'bg-gray-50 dark:bg-[#030712] border-gray-300 dark:border-gray-600'}`}></div>
                              <span className={`mt-2 text-xs font-medium tracking-wide transition-colors ${isCurrent ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                                  {s === AppStep.UPLOAD ? 'Resume' : s === AppStep.CONFIRM_DETAILS ? 'Preferences' : 'Opportunities'}
                              </span>
                          </div>
                      )
                  })}
               </div>
            </div>
          )}

          <Suspense fallback={<LoadingSpinner />}>
            {step === AppStep.UPLOAD && (
                <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
                    Find your next role with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-500">Intelligent Search</span>
                </h1>
                <p className="max-w-xl mx-auto text-lg text-gray-600 dark:text-gray-400 mb-12 leading-relaxed">
                    Upload your resume. Our AI agent will extract your skills and match you with live listings from top platforms.
                </p>
                <ResumeUploader onUpload={handleResumeUpload} />
                </div>
            )}

            {step === AppStep.ANALYZING && (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="relative w-20 h-24 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden mb-8">
                        {/* Document Lines */}
                        <div className="absolute top-3 left-3 right-3 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full"></div>
                        <div className="absolute top-7 left-3 right-8 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full"></div>
                        <div className="absolute top-11 left-3 right-3 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full"></div>
                        <div className="absolute top-15 left-3 right-5 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full"></div>
                        
                        {/* Scan Line */}
                        <div className="absolute left-0 right-0 h-8 bg-gradient-to-b from-blue-500/0 via-blue-500/10 to-blue-500/30 border-b border-blue-500/50 animate-[scan_1.5s_linear_infinite]"></div>
                    </div>
                    <style>{`@keyframes scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(250%); } }`}</style>
                    <h2 className="text-xl font-display font-semibold text-gray-900 dark:text-white">Analyzing Resume</h2>
                    <p className="text-gray-500 mt-2">Extracting your skills and experience...</p>
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
                    <div className="relative w-16 h-16 mb-8 flex items-center justify-center">
                        <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                        <div className="absolute inset-0 border-4 border-t-blue-500 border-r-blue-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-display font-semibold text-gray-900 dark:text-white">Deep Web Search</h2>
                    <LoadingText texts={[
                        "Initializing Deep Web Search...",
                        "Scanning major aggregators (LinkedIn, Indeed)...",
                        "Crawling company career pages & ATS...",
                        "Checking startup hubs & niche boards...",
                        "Compiling best matches from across the internet..."
                    ]} />
                </div>
            )}

            {step === AppStep.RESULTS && searchResults && (
                <div className="animate-in slide-in-from-bottom-8 duration-700">
                    <SearchResults 
                    result={searchResults} 
                    onReset={handleReset}
                    savedJobs={savedJobs}
                    onToggleSave={toggleSaveJob}
                    />
                </div>
            )}

            {step === AppStep.SAVED_JOBS && (
                <div className="animate-in slide-in-from-right-8 duration-500">
                <SavedJobs 
                    jobs={savedJobs} 
                    onToggleSave={toggleSaveJob} 
                    onBack={goBackFromSaved}
                />
                </div>
            )}
          </Suspense>

          {step === AppStep.ERROR && (
             <div className="max-w-md mx-auto text-center py-12 glass-panel rounded-xl p-8">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-red-600 dark:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Process Failed</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 text-sm">{errorMsg || "An unexpected error occurred."}</p>
                <button 
                    onClick={handleReset}
                    className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
                >
                    Try Again
                </button>
             </div>
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800/50 py-8 bg-white/50 dark:bg-[#030712] transition-colors">
        <div className="max-w-6xl mx-auto px-6 text-center md:text-left flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 dark:text-gray-600">
            <div className="flex flex-col md:flex-row items-center gap-4">
                <p>&copy; {new Date().getFullYear()} Job Search Assistant.</p>
                <span className="hidden md:inline text-gray-300 dark:text-gray-700">|</span>
                <p className="flex items-center gap-1">
                  Developer: <a href="https://instagram.com/amaelahmd" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-500 hover:underline">@amaelahmd</a>
                </p>
            </div>
            
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 mt-4 md:mt-0">
                <button onClick={() => setShowPrivacy(true)} className="hover:text-gray-900 dark:hover:text-gray-400 transition-colors">Privacy</button>
                <button onClick={() => setShowTerms(true)} className="hover:text-gray-900 dark:hover:text-gray-400 transition-colors">Terms</button>
            </div>
        </div>
      </footer>

      {/* Modals */}
      {showPrivacy && (
        <Modal title="Privacy Policy" onClose={() => setShowPrivacy(false)}>
          <p>We respect your privacy. This application processes your resume directly using Google's Gemini API.</p>
          <p>1. <strong>Data Handling:</strong> Your resume is sent to the AI for analysis but is not stored on our servers permanently.</p>
          <p>2. <strong>Search Queries:</strong> We use your extracted skills to perform searches on third-party platforms.</p>
          <p>3. <strong>Cookies:</strong> We use local storage to save your preferences and bookmarked jobs on your device.</p>
        </Modal>
      )}

      {showTerms && (
        <Modal title="Terms of Service" onClose={() => setShowTerms(false)}>
          <p>By using this Job Search Assistant, you agree to the following terms:</p>
          <p>1. <strong>Usage:</strong> This tool is for personal job search assistance only.</p>
          <p>2. <strong>Accuracy:</strong> We do not guarantee the accuracy of job listings found. Always verify with the source.</p>
          <p>3. <strong>Liability:</strong> The developer is not responsible for any outcomes resulting from the use of this tool.</p>
        </Modal>
      )}

    </div>
  );
};

export default App;