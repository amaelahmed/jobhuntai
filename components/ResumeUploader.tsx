import React, { useCallback, useState } from 'react';

interface ResumeUploaderProps {
  onUpload: (file: File) => void;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndUpload(e.dataTransfer.files[0]);
    }
  }, []); 

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndUpload(e.target.files[0]);
    }
  };

  const validateAndUpload = (file: File) => {
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
    if (validTypes.includes(file.type)) {
      onUpload(file);
    } else {
      alert("Please upload a PDF or Image file.");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative group cursor-pointer transition-all duration-300 ease-out
          rounded-2xl border-2 border-dashed
          ${isDragging 
            ? 'border-blue-500 bg-blue-500/5 shadow-2xl shadow-blue-500/10' 
            : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/30 bg-white/50 dark:bg-gray-900/20'
          }
        `}
      >
        <div className="p-12 flex flex-col items-center justify-center text-center">
          
          <div className={`
            w-16 h-16 mb-6 rounded-2xl flex items-center justify-center transition-colors duration-300
            ${isDragging ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 group-hover:text-gray-600 dark:group-hover:text-gray-300'}
          `}>
             <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
             </svg>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Upload your resume
          </h3>
          <p className="text-gray-500 dark:text-gray-500 text-sm mb-8 max-w-sm">
            Drag and drop your PDF or Image file here, or click to browse your files.
          </p>
          
          <input 
            type="file" 
            id="resume-upload" 
            className="hidden" 
            accept=".pdf,image/*" 
            onChange={handleFileChange}
          />
          <label 
            htmlFor="resume-upload"
            className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-lg"
          >
            Select File
          </label>
        </div>
      </div>
    </div>
  );
};