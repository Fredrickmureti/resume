
import { ResumeData } from '@/types/resume';

export const calculateATSScore = (data: ResumeData): number => {
  let score = 0;
  const maxScore = 100;

  // Contact Information (20 points)
  if (data.personalInfo.fullName) score += 5;
  if (data.personalInfo.email) score += 5;
  if (data.personalInfo.phone) score += 5;
  if (data.personalInfo.location) score += 3;
  if (data.personalInfo.linkedIn || data.personalInfo.website) score += 2;

  // Professional Summary (15 points)
  if (data.summary.length > 50) score += 10;
  if (data.summary.length > 100) score += 5;

  // Work Experience (25 points)
  if (data.experience.length > 0) score += 10;
  if (data.experience.length >= 2) score += 5;
  
  // Check for quantified achievements
  const hasQuantifiedAchievements = data.experience.some(exp => 
    exp.description.some(desc => /\d+[%$]?|\d+\+|\d+-\d+/.test(desc))
  );
  if (hasQuantifiedAchievements) score += 5;

  // Check for action verbs
  const actionVerbs = ['achieved', 'managed', 'led', 'developed', 'created', 'improved', 'increased', 'reduced', 'implemented', 'designed', 'built', 'launched'];
  const hasActionVerbs = data.experience.some(exp => 
    exp.description.some(desc => 
      actionVerbs.some(verb => desc.toLowerCase().includes(verb))
    )
  );
  if (hasActionVerbs) score += 5;

  // Education (10 points)
  if (data.education.length > 0) score += 10;

  // Skills (20 points)
  if (data.skills.length >= 3) score += 5;
  if (data.skills.length >= 5) score += 5;
  if (data.skills.length >= 8) score += 5;
  if (data.skills.length >= 12) score += 5;

  // Additional Sections (10 points)
  if (data.projects.length > 0) score += 5;
  if (data.certifications.length > 0) score += 3;
  if (data.languages.length > 0) score += 2;

  return Math.min(score, maxScore);
};
