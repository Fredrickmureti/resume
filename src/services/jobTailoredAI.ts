
import { supabase } from '@/integrations/supabase/client';

export interface JobTailoredAIResponse {
  suggestions: {
    optimizedSummary: string;
    matchScore: number;
    missingKeywords: string[];
    recommendedSkills: string[];
    recommendedKeywords: string[];
    atsOptimizations: string[];
  };
  extractedData: {
    personalInfo: {
      fullName: string;
      email: string;
      phone: string;
      location: string;
      linkedIn: string;
      website: string;
    };
    summary: string;
    experience: Array<{
      jobTitle: string;
      company: string;
      location: string;
      startDate: string;
      endDate: string;
      current: boolean;
      description: string[];
      optimizedDescription: string[];
    }>;
    education: Array<{
      degree: string;
      school: string;
      location: string;
      graduationDate: string;
      gpa?: string;
      honors?: string;
    }>;
    skills: Array<{
      name: string;
      level: string;
      category: string;
    }>;
    projects: Array<{
      name: string;
      description: string;
      technologies: string[];
      url?: string;
      startDate: string;
      endDate: string;
    }>;
    certifications: Array<{
      name: string;
      issuer: string;
      date: string;
      url?: string;
    }>;
    languages: Array<{
      name: string;
      proficiency: string;
    }>;
  };
  confidence: number;
}

export class JobTailoredAIService {
  static async analyzeJobTailoredCV(
    cvContent: string,
    jobContext: {
      jobDescription?: string;
      jobTitle?: string;
      jobType?: string;
      targetCompany?: string;
      extractedJobContent?: string;
    }
  ): Promise<JobTailoredAIResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('gemini-ai-assistant', {
        body: { 
          prompt: cvContent, 
          type: 'job_tailored_cv_analysis', 
          context: {
            cvContent,
            jobContext,
            analysisType: 'job_tailored_optimization',
            requireOptimization: true
          }
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Job-tailored AI Service error:', error);
      throw error;
    }
  }
}
