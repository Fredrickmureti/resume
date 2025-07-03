
import { ResumeData, ATSAnalysis, KeywordAnalysis } from '@/types/resume';
import { analyzeKeywordDensity } from './aiSuggestions';

export const performDetailedATSAnalysis = (data: ResumeData, targetKeywords: string[] = []): ATSAnalysis => {
  const analysis: ATSAnalysis = {
    score: 0,
    sections: {
      contactInfo: false,
      summary: false,
      experience: false,
      education: false,
      skills: false,
      keywords: false,
      formatting: false,
      quantifiedAchievements: false
    },
    keywords: {
      matched: [],
      missing: [],
      density: {},
      suggestions: []
    },
    suggestions: []
  };

  let score = 0;

  // Contact Information (15 points)
  if (data.personalInfo.fullName && data.personalInfo.email && data.personalInfo.phone) {
    analysis.sections.contactInfo = true;
    score += 15;
  } else {
    analysis.suggestions.push('Complete all contact information fields');
  }

  // Professional Summary (15 points)
  if (data.summary.length > 50) {
    analysis.sections.summary = true;
    score += 15;
  } else {
    analysis.suggestions.push('Add a compelling professional summary (50+ characters)');
  }

  // Work Experience (20 points)
  if (data.experience.length > 0) {
    analysis.sections.experience = true;
    score += 20;
  } else {
    analysis.suggestions.push('Add work experience entries');
  }

  // Education (10 points)
  if (data.education.length > 0) {
    analysis.sections.education = true;
    score += 10;
  } else {
    analysis.suggestions.push('Add education information');
  }

  // Skills (15 points)
  if (data.skills.length >= 5) {
    analysis.sections.skills = true;
    score += 15;
  } else {
    analysis.suggestions.push('Add at least 5 relevant skills');
  }

  // Quantified Achievements (10 points)
  const hasQuantifiedAchievements = data.experience.some(exp => 
    exp.description.some(desc => /\d+[%$]?|\d+\+|\d+-\d+/.test(desc))
  );
  if (hasQuantifiedAchievements) {
    analysis.sections.quantifiedAchievements = true;
    score += 10;
  } else {
    analysis.suggestions.push('Add numbers and metrics to your achievements');
  }

  // Formatting (5 points) - Basic checks
  analysis.sections.formatting = true;
  score += 5;

  // Keyword Analysis (10 points)
  if (targetKeywords.length > 0) {
    const resumeText = [
      data.summary,
      ...data.experience.flatMap(exp => exp.description),
      ...data.skills.map(skill => skill.name)
    ].join(' ');

    analysis.keywords.density = analyzeKeywordDensity(resumeText, targetKeywords);
    analysis.keywords.matched = targetKeywords.filter(keyword => 
      analysis.keywords.density[keyword] > 0
    );
    analysis.keywords.missing = targetKeywords.filter(keyword => 
      analysis.keywords.density[keyword] === 0
    );

    if (analysis.keywords.matched.length > targetKeywords.length * 0.6) {
      analysis.sections.keywords = true;
      score += 10;
    } else {
      analysis.suggestions.push('Include more relevant keywords from the job description');
    }
  }

  analysis.score = Math.min(score, 100);
  return analysis;
};

export const getATSRecommendations = (analysis: ATSAnalysis): string[] => {
  const recommendations = [...analysis.suggestions];

  if (analysis.score < 60) {
    recommendations.push('Focus on completing basic sections first');
    recommendations.push('Use action verbs to start bullet points');
  }

  if (analysis.score >= 60 && analysis.score < 80) {
    recommendations.push('Add more quantified achievements');
    recommendations.push('Optimize keyword usage');
  }

  if (analysis.score >= 80) {
    recommendations.push('Fine-tune formatting and layout');
    recommendations.push('Consider adding a portfolio link');
  }

  return recommendations;
};
