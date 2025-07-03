
import { ResumeData } from '@/types/resume';

export interface ValidationResult {
  isValid: boolean;
  score: number;
  missingFields: string[];
  suggestions: string[];
}

export class DocumentValidationService {
  static validateResumeData(data: ResumeData): ValidationResult {
    const missingFields: string[] = [];
    const suggestions: string[] = [];
    let score = 0;

    // Check personal info (required)
    if (!data.personalInfo.fullName?.trim()) {
      missingFields.push('Full Name');
    } else {
      score += 15;
    }

    if (!data.personalInfo.email?.trim()) {
      missingFields.push('Email');
    } else {
      score += 10;
    }

    if (!data.personalInfo.phone?.trim()) {
      missingFields.push('Phone');
    } else {
      score += 5;
    }

    // Check for at least one main section
    let hasMainContent = false;

    if (data.experience?.length > 0) {
      hasMainContent = true;
      score += 25;
      
      // Check experience quality
      const hasDetailedExperience = data.experience.some(exp => 
        exp.description?.length > 0 && exp.description.some(desc => desc.trim().length > 10)
      );
      if (hasDetailedExperience) {
        score += 15;
      } else {
        suggestions.push('Add detailed descriptions to your work experience');
      }
    }

    if (data.education?.length > 0) {
      if (!hasMainContent) {
        hasMainContent = true;
        score += 20;
      } else {
        score += 10;
      }
    }

    if (data.skills?.length > 0) {
      score += 10;
      if (data.skills.length >= 5) {
        score += 5;
      } else {
        suggestions.push('Add more skills to strengthen your profile');
      }
    }

    if (data.summary?.trim()) {
      score += 15;
    } else {
      suggestions.push('Add a professional summary to introduce yourself');
    }

    if (data.projects?.length > 0) {
      score += 10;
    }

    if (!hasMainContent) {
      missingFields.push('Main Content (Experience, Education, or Projects)');
    }

    // Additional suggestions
    if (score < 60) {
      suggestions.push('Your document needs more content to be considered complete');
    }

    if (!data.personalInfo.location?.trim()) {
      suggestions.push('Consider adding your location');
    }

    return {
      isValid: score >= 60 && missingFields.length === 0,
      score: Math.min(score, 100),
      missingFields,
      suggestions
    };
  }

  static validateCoverLetterContent(content: string, jobInfo?: { company?: string; position?: string }): ValidationResult {
    const missingFields: string[] = [];
    const suggestions: string[] = [];
    let score = 0;

    if (!content?.trim()) {
      missingFields.push('Cover Letter Content');
      return {
        isValid: false,
        score: 0,
        missingFields,
        suggestions: ['Write your cover letter content']
      };
    }

    const wordCount = content.trim().split(/\s+/).length;

    // Check length
    if (wordCount < 50) {
      suggestions.push('Your cover letter is too short. Aim for 150-300 words.');
      score += 10;
    } else if (wordCount >= 50 && wordCount <= 300) {
      score += 40;
    } else if (wordCount > 300) {
      suggestions.push('Your cover letter might be too long. Consider keeping it under 300 words.');
      score += 30;
    }

    // Check for key components
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('dear') || lowerContent.includes('hello')) {
      score += 15;
    } else {
      suggestions.push('Start with a proper greeting');
    }

    if (lowerContent.includes('sincerely') || lowerContent.includes('regards') || lowerContent.includes('best')) {
      score += 10;
    } else {
      suggestions.push('End with a professional closing');
    }

    // Check for company/position mention if provided
    if (jobInfo?.company && lowerContent.includes(jobInfo.company.toLowerCase())) {
      score += 15;
    } else if (jobInfo?.company) {
      suggestions.push(`Mention the company name "${jobInfo.company}" in your cover letter`);
    }

    if (jobInfo?.position && lowerContent.includes(jobInfo.position.toLowerCase().split(' ')[0])) {
      score += 10;
    } else if (jobInfo?.position) {
      suggestions.push(`Reference the position "${jobInfo.position}" in your cover letter`);
    }

    // Check for personal pronouns (engagement)
    if (lowerContent.includes('i ') || lowerContent.includes('my ')) {
      score += 10;
    } else {
      suggestions.push('Make your cover letter more personal by using "I" statements');
    }

    return {
      isValid: score >= 60 && missingFields.length === 0,
      score: Math.min(score, 100),
      missingFields,
      suggestions
    };
  }
}
