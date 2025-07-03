
import { ResumeData } from '@/types/resume';
import { GeminiAIService } from './geminiAI';
import { toast } from '@/components/ui/use-toast';

export interface AIAnalytics {
  readabilityScore: number;
  impactScore: number;
  atsOptimization: number;
  industryAlignment: number;
  recommendations: string[];
  strengths: string[];
  improvements: string[];
}

export class AIAnalyticsService {
  static async performComprehensiveAnalysis(
    resumeData: ResumeData,
    targetKeywords: string[]
  ): Promise<AIAnalytics> {
    const analysisPrompt = `Analyze this resume comprehensively and provide detailed analytics with scores and recommendations:

RESUME DATA:
${JSON.stringify(resumeData, null, 2)}

TARGET KEYWORDS: ${targetKeywords.join(', ')}

Please provide a comprehensive analysis with:

1. READABILITY SCORE (0-100): Assess clarity, sentence structure, and professional language
2. IMPACT SCORE (0-100): Evaluate achievement quantification, action verbs, and results-driven content
3. ATS OPTIMIZATION SCORE (0-100): Rate keyword usage, formatting, and ATS-friendly structure
4. INDUSTRY ALIGNMENT SCORE (0-100): Assess relevance to target industry/role

5. STRENGTHS: List 3-5 key strengths of this resume
6. IMPROVEMENTS: List 3-5 specific improvement suggestions
7. RECOMMENDATIONS: Provide 5-7 actionable recommendations for enhancement

Focus on:
- Professional language and clarity
- Quantified achievements and impact metrics  
- Keyword optimization and ATS compatibility
- Industry-specific terminology and relevance
- Overall structure and presentation
- Skills alignment with target keywords
- Experience descriptions quality
- Professional summary effectiveness

Return analysis in this JSON format:
{
  "readabilityScore": 85,
  "impactScore": 75,
  "atsOptimization": 80,
  "industryAlignment": 70,
  "strengths": ["Strong quantified achievements", "Clear professional summary"],
  "improvements": ["Add more industry keywords", "Improve bullet point structure"],
  "recommendations": ["Include specific metrics in experience", "Optimize for ATS scanning"]
}`;

    try {
      const response = await GeminiAIService.callAI(analysisPrompt, 'resume_analytics', {
        resumeData,
        targetKeywords,
        analysisType: 'comprehensive_analytics'
      });

      if (response && response.suggestions) {
        return {
          readabilityScore: response.suggestions.ats_score || 70,
          impactScore: Math.min(100, Math.max(0, response.suggestions.ats_score - 10 || 65)),
          atsOptimization: response.suggestions.ats_score || 75,
          industryAlignment: Math.min(100, Math.max(0, response.suggestions.ats_score + 5 || 80)),
          recommendations: response.suggestions.recommendations || [],
          strengths: response.suggestions.bullets?.slice(0, 3) || ['Professional experience', 'Skills alignment', 'Clear structure'],
          improvements: response.suggestions.recommendations?.slice(0, 3) || ['Enhance keyword usage', 'Add quantified results', 'Improve formatting']
        };
      } else {
        throw new Error('Invalid AI response format');
      }
    } catch (error) {
      console.error('Error performing AI analysis:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to generate AI analytics. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  }
}
