
import { ResumeData } from '@/types/resume';
import { GeminiCore } from './geminiCore';

export class ATSAnalysisService {
  static async analyzeATSScore(
    resumeData: ResumeData,
    targetKeywords: string[] = []
  ): Promise<{ score: number; recommendations: string[] }> {
    const comprehensivePrompt = `Perform a detailed ATS (Applicant Tracking System) analysis of this resume and provide an accurate score with actionable recommendations:

    RESUME DATA: ${JSON.stringify(resumeData)}
    TARGET KEYWORDS: ${targetKeywords.join(', ')}
    
    COMPREHENSIVE ATS ANALYSIS CRITERIA:
    
    1. CONTACT INFORMATION (10 points)
       - Complete contact details (name, email, phone)
       - Professional email format
       - LinkedIn profile included
       - Location information
    
    2. FORMATTING & STRUCTURE (15 points)
       - Clean, ATS-friendly formatting
       - Proper section headers
       - Consistent formatting
       - No complex layouts or graphics
    
    3. KEYWORD OPTIMIZATION (25 points)
       - Relevant keywords from job description
       - Natural keyword integration
       - Skills section optimization
       - Industry-specific terminology
    
    4. EXPERIENCE SECTION (20 points)
       - Strong action verbs
       - Quantified achievements
       - Relevant experience highlighted
       - Clear job progression
    
    5. SKILLS ALIGNMENT (15 points)
       - Technical skills relevance
       - Soft skills inclusion
       - Skills match job requirements
       - Appropriate skill categorization
    
    6. PROFESSIONAL SUMMARY (10 points)
       - Compelling opening statement
       - Keyword inclusion
       - Value proposition clear
       - Length appropriate (2-3 sentences)
    
    7. EDUCATION & CERTIFICATIONS (5 points)
       - Relevant education included
       - Certifications highlighted
       - Proper formatting
    
    Provide specific, actionable recommendations for improvement focusing on:
    - Missing critical keywords
    - Formatting improvements
    - Content enhancement suggestions
    - ATS optimization tactics
    - Industry best practices`;

    const response = await GeminiCore.callAI(comprehensivePrompt, 'comprehensive_ats_analysis', {
      resumeData,
      targetKeywords,
      analysisDepth: 'detailed',
      scoringCriteria: 'ats_focused'
    });

    return {
      score: response.suggestions.ats_score || 0,
      recommendations: response.suggestions.recommendations
    };
  }
}
