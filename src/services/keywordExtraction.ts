
import { GeminiCore } from './geminiCore';

export class KeywordExtractionService {
  static async extractKeywords(jobDescription: string): Promise<string[]> {
    const enhancedPrompt = `Extract the most important and relevant keywords from this job description for ATS optimization and resume targeting:
    
    Job Description: ${jobDescription}
    
    EXTRACTION REQUIREMENTS:
    - Extract 15-25 high-impact keywords that are most critical for ATS systems
    - Prioritize keywords by importance: skills, technologies, qualifications, industry terms
    - Include both hard skills (technical) and soft skills mentioned
    - Focus on job-specific terminology and requirements
    - Consider synonyms and variations of key terms
    - Include level indicators (senior, junior, lead, etc.) if mentioned
    - Extract industry-specific certifications or qualifications
    - Include action-oriented terms and competencies
    
    KEYWORD CATEGORIES TO FOCUS ON:
    1. Technical Skills & Tools
    2. Programming Languages & Frameworks
    3. Industry-Specific Terms
    4. Soft Skills & Competencies
    5. Certifications & Qualifications
    6. Experience Level Indicators
    7. Job Function Keywords
    8. Process & Methodology Terms
    
    Return the most strategic keywords that will maximize ATS matching and recruiter appeal.`;

    const response = await GeminiCore.callAI(enhancedPrompt, 'advanced_keyword_extraction', {
      jobDescription,
      extractionType: 'comprehensive',
      focusAreas: ['technical_skills', 'soft_skills', 'industry_terms', 'qualifications']
    });

    return response.suggestions.keywords;
  }
}
