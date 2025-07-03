
import { GeminiCore } from './geminiCore';

export class ContentGenerationService {
  static async generateProfessionalSummary(
    jobTitle: string,
    industry: string,
    experienceLevel: string,
    skills: string[] = [],
    targetRole?: string
  ): Promise<string> {
    console.log('ContentGenerationService.generateProfessionalSummary - Starting generation');
    
    const prompt = `Generate a professional summary for a ${jobTitle} with ${experienceLevel} experience in ${industry}. 
    Current skills: ${skills.join(', ')}. 
    ${targetRole ? `Target role: ${targetRole}` : ''}
    
    Requirements:
    - 2-3 compelling sentences
    - 50-150 words
    - Include relevant keywords
    - ATS-optimized
    - No first-person pronouns`;

    const response = await GeminiCore.callAI(prompt, 'professional_summary', {
      jobTitle,
      industry,
      experienceLevel,
      skills,
      targetRole
    });

    console.log('ContentGenerationService.generateProfessionalSummary - Response:', response);
    return response.suggestions.summary;
  }

  static async optimizeExperienceBullets(
    originalBullets: string[],
    jobTitle: string,
    company: string,
    industry?: string
  ): Promise<string[]> {
    console.log('ContentGenerationService.optimizeExperienceBullets - Starting optimization');
    
    const prompt = `Optimize these experience bullet points for a ${jobTitle} at ${company}:
    
    Original bullets:
    ${originalBullets.map((bullet, i) => `${i + 1}. ${bullet}`).join('\n')}
    
    Requirements:
    - Start with strong action verbs
    - Include quantified results where possible
    - 1-2 lines each
    - ATS-friendly
    - Industry-relevant keywords${industry ? ` for ${industry}` : ''}`;

    const response = await GeminiCore.callAI(prompt, 'experience_optimization', {
      originalBullets,
      jobTitle,
      company,
      industry
    });

    console.log('ContentGenerationService.optimizeExperienceBullets - Response:', response);
    return response.suggestions.bullets;
  }

  static async suggestSkills(
    jobDescription: string,
    currentSkills: string[] = [],
    jobTitle?: string,
    industry?: string
  ): Promise<{ technical: string[]; soft: string[]; other: string[] }> {
    console.log('ContentGenerationService.suggestSkills - Starting skill suggestion');
    
    const prompt = `Analyze this job description and suggest relevant skills:
    
    Job Description: ${jobDescription}
    Current Skills: ${currentSkills.join(', ')}
    ${jobTitle ? `Job Title: ${jobTitle}` : ''}
    ${industry ? `Industry: ${industry}` : ''}
    
    Suggest 8-15 skills total, categorized as:
    - Technical skills (programming, tools, certifications)
    - Soft skills (leadership, communication, etc.)
    - Other industry-specific skills`;

    const response = await GeminiCore.callAI(prompt, 'skills_suggestion', {
      jobDescription,
      currentSkills,
      jobTitle,
      industry
    });

    console.log('ContentGenerationService.suggestSkills - Response:', response);
    return response.suggestions.skills;
  }
}
