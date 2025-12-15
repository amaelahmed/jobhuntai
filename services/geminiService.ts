import { GoogleGenAI, Type } from "@google/genai";
import { ParsedResumeData, SearchResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to extract raw text info from Resume PDF/Image
export const analyzeResume = async (fileBase64: string, mimeType: string): Promise<ParsedResumeData> => {
  const model = "gemini-2.5-flash";
  
  const prompt = `
    Analyze the provided resume. Extract the following details specifically to fill into a job search template:
    1. Current Job Title (job name)
    2. Years of Experience (approximate number)
    3. Key Skills (comma separated list)
    4. Certifications (comma separated list, or "None" if none found)

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
          },
          required: ["jobName", "experienceYears", "skills", "certifications"]
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
  
  // Constructing the exact prompt requested by the user
  const searchPrompt = `
    I work as a ${data.jobName} and my experience is ${data.experienceYears}.
    My skills: ${data.skills}.
    My certifications: ${data.certifications}.
    I am looking for a job in ${location}.
    Specifically, I am interested in: ${interests}.
    
    Find me specific job listings. 
    **MANDATORY**: You must specifically search for and prioritize open positions on **Naukri**, **Indeed**, and **LinkedIn** if available in the region, along with other company career pages.
    
    I want a separated list of all available jobs with their exact locations.
    Details to contact them and the job application links if there is any.
    Please search in the most recent sources to provide me with exact and fresh details.
    
    Format the output with Markdown links for any URLs found, e.g., [Apply on Naukri](https://...).
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