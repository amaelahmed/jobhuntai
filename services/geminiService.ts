import { GoogleGenAI, Type } from "@google/genai";
import { ParsedResumeData, SearchResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to extract raw text info from Resume PDF/Image
export const analyzeResume = async (fileBase64: string, mimeType: string): Promise<ParsedResumeData> => {
  const model = "gemini-2.5-flash";
  
  const prompt = `
    Analyze the provided resume. Extract specific details for a job search and perform an ATS (Applicant Tracking System) audit.

    1. **Extraction**:
       - Current Job Title (job name)
       - Years of Experience (approximate number)
       - Key Skills (comma separated list)
       - Certifications (comma separated list, or "None" if none found)

    2. **ATS Audit**:
       - **ATS Score**: Calculate a score from 0-100 based on keyword relevance, formatting clarity, quantifiable achievements, and overall impact. Be strict but fair.
       - **Recommendations**: Provide 3-4 specific, actionable, and short bullet points on how to improve the resume (e.g., "Use more action verbs", "Quantify sales results", "Add specific technical keywords").

    Return the result in JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: fileBase64
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            jobName: { type: Type.STRING },
            experienceYears: { type: Type.STRING },
            skills: { type: Type.STRING },
            certifications: { type: Type.STRING },
            atsScore: { type: Type.NUMBER },
            atsRecommendations: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            }
          },
          required: ["jobName", "experienceYears", "skills", "certifications", "atsScore", "atsRecommendations"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as ParsedResumeData;
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("Error analyzing resume:", error);
    throw error;
  }
};

// Perform the search using Google Search Grounding
export const searchForJobs = async (
  data: ParsedResumeData, 
  location: string, 
  interests: string
): Promise<SearchResult> => {
  
  // Constructing a "Deep Search" prompt to cover the whole internet
  const searchPrompt = `
    Role: You are an expert AI Recruitment Researcher performing an exhaustive "Deep Web" search.

    Candidate Profile:
    - Role: ${data.jobName}
    - Experience: ${data.experienceYears}
    - Skills: ${data.skills}
    - Certifications: ${data.certifications}
    - Target Location: ${location}
    - Specific Interests: ${interests}
    
    Task: Conduct a comprehensive search across the entire internet to find every relevant active job listing. Do not limit yourself to one platform.

    Search Scope:
    1. **Major Aggregators**: Scan LinkedIn, Indeed, Naukri, Glassdoor, Monster, ZipRecruiter, and Google Jobs.
    2. **Startup & Tech Hubs**: Search Wellfound (AngelList), Y Combinator (Bookface/Jobs), BuiltIn, and Product Hunt.
    3. **Direct Company Career Pages**: Identify companies in ${location} matching the profile and find direct links to their ATS (Lever, Greenhouse, Ashby, Workday, etc.).
    4. **Niche Communities**: Search specialized boards (e.g., GitHub/StackOverflow for devs, Behance/Dribbble for creative, ProBlogger for writing).

    Directives:
    - **Maximize Coverage**: Find as many high-quality, distinct listings as possible.
    - **Deep Matching**: Look for roles that specifically mention the candidate's key skills (${data.skills}).
    - **Freshness**: Prioritize jobs posted within the last 14 days.
    
    Structure your response using the following Markdown format exactly:

    # Group: [Descriptive Category Name, e.g., "Top Corporate Roles", "High-Growth Startups", "Remote Opportunities"]
    **Summary**: [Brief market insight about this specific category]
    *   [Job Title] at [Company] - [Location] ([Apply Link])
    *   [Job Title] at [Company] - [Location] ([Apply Link])
    
    # Group: [Another Category]
    **Summary**: [Insight]
    *   [Job Title] at [Company] - [Location] ([Apply Link])

    (Continue for up to 5-6 distinct groups to organize the large volume of results)

    Rules:
    - Ensure every job has a direct URL. If a direct link is unavailable, link to the company's career page.
    - Do not hallucinate links.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: searchPrompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    // Extract grounding chunks (URLs)
    const sources: { uri: string; title: string }[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) {
          sources.push({ uri: chunk.web.uri, title: chunk.web.title });
        }
      });
    }

    return {
      text: response.text || "No results found.",
      sources: sources
    };

  } catch (error) {
    console.error("Error searching for jobs:", error);
    throw error;
  }
};