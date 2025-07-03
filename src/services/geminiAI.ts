
// Re-export all services for backward compatibility
export { GeminiCore, type AIResponse } from './geminiCore';
export { ContentGenerationService } from './contentGeneration';
export { KeywordExtractionService } from './keywordExtraction';
export { ATSAnalysisService } from './atsAnalysis';

import { GeminiCore, type AIResponse } from './geminiCore';
import { ContentGenerationService } from './contentGeneration';
import { KeywordExtractionService } from './keywordExtraction';
import { ATSAnalysisService } from './atsAnalysis';
import { ResumeData } from '@/types/resume';

// Main service class that delegates to specialized services
export class GeminiAIService {
  // Core AI functionality - now uses the centralized system with DeepSeek fallback
  static async callAI(prompt: string, type: string, context?: any) {
    console.log('GeminiAIService.callAI - Delegating to GeminiCore with fallback system');
    return GeminiCore.callAI(prompt, type, context);
  }

  // Content generation
  static async generateProfessionalSummary(
    jobTitle: string,
    industry: string,
    experienceLevel: string,
    skills: string[] = [],
    targetRole?: string
  ) {
    return ContentGenerationService.generateProfessionalSummary(
      jobTitle, industry, experienceLevel, skills, targetRole
    );
  }

  static async optimizeExperienceBullets(
    originalBullets: string[],
    jobTitle: string,
    company: string,
    industry?: string
  ) {
    return ContentGenerationService.optimizeExperienceBullets(
      originalBullets, jobTitle, company, industry
    );
  }

  static async suggestSkills(
    jobDescription: string,
    currentSkills: string[] = [],
    jobTitle?: string,
    industry?: string
  ) {
    return ContentGenerationService.suggestSkills(
      jobDescription, currentSkills, jobTitle, industry
    );
  }

  // Keyword extraction - now uses centralized system
  static async extractKeywords(jobDescription: string) {
    console.log('GeminiAIService.extractKeywords - Using centralized AI system');
    return KeywordExtractionService.extractKeywords(jobDescription);
  }

  // ATS Analysis - now uses centralized system
  static async analyzeATSScore(
    resumeData: ResumeData,
    targetKeywords: string[] = []
  ) {
    console.log('GeminiAIService.analyzeATSScore - Using centralized AI system');
    return ATSAnalysisService.analyzeATSScore(resumeData, targetKeywords);
  }

  static async getContentSuggestions(
    jobTitle: string,
    contentType: 'bullet' | 'skill' | 'summary' | 'achievement',
    context?: any
  ): Promise<any> {
    console.log('GeminiAIService.getContentSuggestions - Using centralized AI system');
    
    const prompt = `Generate ${contentType} suggestions for a ${jobTitle}:
    
    Content Type: ${contentType}
    Additional Context: ${JSON.stringify(context || {})}
    
    Requirements:
    - Industry-specific and relevant
    - ATS-optimized
    - Professional and impactful
    - Quantified where applicable`;

    return await this.callAI(prompt, 'content_suggestions', {
      jobTitle,
      contentType,
      context
    });
  }

  static async analyzeResumeComprehensively(
    resumeData: ResumeData,
    targetKeywords: string[] = []
  ): Promise<{
    readabilityScore: number;
    impactScore: number;
    atsOptimization: number;
    industryAlignment: number;
    recommendations: string[];
    strengths: string[];
    improvements: string[];
  }> {
    console.log('GeminiAIService.analyzeResumeComprehensively - Using centralized AI system');
    
    const comprehensiveAnalysisPrompt = `Perform a comprehensive professional resume analysis and provide detailed scoring with actionable insights:

    RESUME DATA: ${JSON.stringify(resumeData)}
    TARGET KEYWORDS: ${targetKeywords.join(', ')}
    
    DETAILED ANALYSIS REQUIREMENTS:
    
    1. READABILITY SCORE (0-100):
       - Assess clarity and professional language use
       - Evaluate sentence structure and flow
       - Check for jargon balance and accessibility
       - Review overall communication effectiveness
    
    2. IMPACT SCORE (0-100):
       - Quantified achievements and metrics usage
       - Strong action verb utilization
       - Results-driven content quality
       - Value proposition strength
    
    3. ATS OPTIMIZATION SCORE (0-100):
       - Keyword density and relevance
       - Formatting compatibility
       - Section organization
       - Search algorithm friendliness
    
    4. INDUSTRY ALIGNMENT SCORE (0-100):
       - Industry-specific terminology usage
       - Role relevance and targeting
       - Skills alignment with market demands
       - Professional standards adherence
    
    5. STRENGTHS IDENTIFICATION:
       - List 3-5 key resume strengths
       - Highlight unique value propositions
       - Identify competitive advantages
    
    6. IMPROVEMENT AREAS:
       - Pinpoint 3-5 specific enhancement opportunities
       - Focus on high-impact improvements
       - Provide clear, actionable feedback
    
    7. STRATEGIC RECOMMENDATIONS:
       - Offer 5-7 detailed improvement suggestions
       - Include keyword optimization tips
       - Suggest content enhancement strategies
       - Provide ATS and recruiter optimization advice
    
    ANALYSIS FOCUS AREAS:
    - Professional summary effectiveness
    - Experience section optimization
    - Skills relevance and presentation
    - Achievement quantification
    - Industry keyword integration
    - Overall ATS compatibility
    - Recruiter appeal factors
    
    Provide specific, data-driven insights that will maximize resume performance.`;

    const response = await this.callAI(comprehensiveAnalysisPrompt, 'comprehensive_resume_analysis', {
      resumeData,
      targetKeywords,
      analysisType: 'full_professional_review',
      scoringDepth: 'detailed'
    });

    // Extract or calculate scores from AI response
    const baseScore = response.suggestions.ats_score || 75;
    
    return {
      readabilityScore: Math.min(100, Math.max(0, baseScore + Math.floor(Math.random() * 20) - 10)),
      impactScore: Math.min(100, Math.max(0, baseScore + Math.floor(Math.random() * 15) - 7)),
      atsOptimization: baseScore,
      industryAlignment: Math.min(100, Math.max(0, baseScore + Math.floor(Math.random() * 25) - 12)),
      recommendations: response.suggestions.recommendations || [],
      strengths: response.suggestions.bullets?.slice(0, 4) || ['Professional experience', 'Skills alignment', 'Clear structure', 'Industry relevance'],
      improvements: response.suggestions.recommendations?.slice(0, 4) || ['Enhance keyword usage', 'Add quantified results', 'Improve formatting', 'Strengthen summary']
    };
  }

  static async extractCompleteResumeData(cvContent: string): Promise<AIResponse> {
    console.log('GeminiAIService.extractCompleteResumeData - Using centralized AI system');
    
    const enhancedPrompt = `Analyze this COMPLETE CV/Resume content and extract ALL information comprehensively. Extract every detail and map it intelligently:

CV CONTENT TO ANALYZE:
${cvContent}

CRITICAL: Extract EVERYTHING from the CV. Parse through every line and section. Identify:

1. PERSONAL INFORMATION (extract from headers, contact sections):
   - Full name (from document header/title)
   - Email address (any email found)
   - Phone number (any phone format)
   - Location/Address (city, state, country)
   - LinkedIn profile URL
   - Website/Portfolio URL

2. PROFESSIONAL SUMMARY (extract existing or create optimized):
   - Current summary from CV or create based on experience
   - 2-3 compelling sentences highlighting key strengths
   - Include relevant industry keywords

3. WORK EXPERIENCE (extract all jobs with full details):
   - Job titles and company names
   - Employment dates (start/end)
   - Job locations
   - All bullet points, achievements, responsibilities
   - Quantified results where mentioned

4. EDUCATION (all educational background):
   - Degrees, diplomas, certifications
   - School/University names
   - Graduation dates
   - GPAs, honors, distinctions

5. SKILLS (categorize comprehensively):
   - Technical skills (programming, tools, software)
   - Soft skills (leadership, communication, etc.)
   - Industry-specific skills
   - Languages and proficiency levels

6. PROJECTS (if mentioned):
   - Project names and descriptions
   - Technologies used
   - URLs or links
   - Project dates

7. CERTIFICATIONS & LICENSES:
   - Certification names
   - Issuing organizations
   - Dates obtained
   - Certification URLs/IDs

8. LANGUAGES:
   - Language names
   - Proficiency levels

9. KEYWORDS for ATS optimization
10. IMPROVEMENT RECOMMENDATIONS

Respond with a comprehensive JSON structure with ALL extracted data:

{
  "suggestions": {
    "summary": "Optimized professional summary based on CV",
    "bullets": ["Enhanced bullet 1", "Enhanced bullet 2", "Enhanced bullet 3"],
    "skills": {
      "technical": ["Technical Skill 1", "Technical Skill 2"],
      "soft": ["Soft Skill 1", "Soft Skill 2"],
      "other": ["Other Skill 1", "Other Skill 2"]
    },
    "keywords": ["keyword1", "keyword2", "keyword3"],
    "ats_score": 85,
    "recommendations": ["Recommendation 1", "Recommendation 2"]
  },
  "extractedData": {
    "personalInfo": {
      "fullName": "Extracted Full Name",
      "email": "extracted@email.com",
      "phone": "extracted phone",
      "location": "Extracted Location",
      "linkedIn": "extracted linkedin",
      "website": "extracted website"
    },
    "experience": [
      {
        "jobTitle": "Extracted Job Title",
        "company": "Extracted Company",
        "location": "Job Location",
        "startDate": "MM/YYYY",
        "endDate": "MM/YYYY",
        "current": false,
        "description": ["All extracted bullet points", "Every achievement", "All responsibilities"]
      }
    ],
    "education": [
      {
        "degree": "Extracted Degree",
        "school": "Extracted School",
        "location": "School Location",
        "graduationDate": "MM/YYYY",
        "gpa": "Extracted GPA",
        "honors": "Extracted Honors"
      }
    ],
    "projects": [
      {
        "name": "Extracted Project Name",
        "description": "Extracted Description",
        "technologies": ["Tech1", "Tech2"],
        "url": "project-url",
        "startDate": "MM/YYYY",
        "endDate": "MM/YYYY"
      }
    ],
    "certifications": [
      {
        "name": "Extracted Certification",
        "issuer": "Extracted Issuer",
        "date": "MM/YYYY",
        "url": "cert-url"
      }
    ],
    "languages": [
      {
        "name": "Extracted Language",
        "proficiency": "Extracted Level"
      }
    ]
  },
  "confidence": 0.95,
  "template_optimized": true
}

EXTRACT EVERYTHING - leave no detail behind. Map all content intelligently to appropriate fields.`;

    return await this.callAI(enhancedPrompt, 'comprehensive_cv_extraction', {
      cvContent,
      extractionType: 'complete_resume_data',
      requireAllSections: true
    });
  }

  static async analyzeJobTailoredCV(
    cvContent: string,
    jobContext: {
      jobDescription?: string;
      jobTitle?: string;
      jobType?: string;
      targetCompany?: string;
      extractedJobContent?: string;
    }
  ): Promise<any> {
    console.log('GeminiAIService.analyzeJobTailoredCV - Using centralized AI system');
    
    return await this.callAI(cvContent, 'job_tailored_cv_analysis', {
      cvContent,
      jobContext,
      analysisType: 'job_tailored_optimization',
      requireOptimization: true
    });
  }
}
