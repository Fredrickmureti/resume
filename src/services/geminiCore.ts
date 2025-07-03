
import { supabase } from '@/integrations/supabase/client';

export interface AIResponse {
  suggestions: {
    summary: string;
    bullets: string[];
    skills: {
      technical: string[];
      soft: string[];
      other: string[];
    };
    keywords: string[];
    ats_score: number | null;
    recommendations: string[];
  };
  content?: string;
  extractedData?: any;
  confidence: number;
  template_optimized: boolean;
}

export class GeminiCore {
  static async callAI(prompt: string, type: string, context?: any): Promise<AIResponse> {
    try {
      console.log('GeminiCore.callAI - Making request to gemini-ai-assistant function');
      
      const { data, error } = await supabase.functions.invoke('gemini-ai-assistant', {
        body: { prompt, type, context }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message);
      }

      console.log('GeminiCore.callAI - Response received:', data);

      // Ensure we return a properly formatted response
      if (data && typeof data === 'object') {
        return {
          suggestions: data.suggestions || {
            summary: data.content || data.response || prompt,
            bullets: [],
            skills: { technical: [], soft: [], other: [] },
            keywords: [],
            ats_score: null,
            recommendations: []
          },
          content: data.content || data.response,
          extractedData: data.extractedData,
          confidence: data.confidence || 0.8,
          template_optimized: data.template_optimized || false
        };
      }

      // Fallback for unexpected response format
      return {
        suggestions: {
          summary: "I'm here to help with your resume questions!",
          bullets: [],
          skills: { technical: [], soft: [], other: [] },
          keywords: [],
          ats_score: null,
          recommendations: []
        },
        content: "I'm here to help with your resume questions!",
        confidence: 0.5,
        template_optimized: false
      };
    } catch (error) {
      console.error('AI Service error:', error);
      throw error;
    }
  }
}
