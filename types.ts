export interface ParsedResumeData {
  jobName: string;
  experienceYears: string;
  skills: string;
  certifications: string;
}

export interface JobSearchParams {
  parsedData: ParsedResumeData;
  location: string;
  jobInterests: string;
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface SearchResult {
  text: string;
  sources: GroundingSource[];
}

export enum AppStep {
  UPLOAD = 'UPLOAD',
  ANALYZING = 'ANALYZING',
  CONFIRM_DETAILS = 'CONFIRM_DETAILS',
  SEARCHING = 'SEARCHING',
  RESULTS = 'RESULTS',
  SAVED_JOBS = 'SAVED_JOBS',
  ERROR = 'ERROR'
}