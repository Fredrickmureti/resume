
import { ResumeData } from '@/types/resume';

export interface BasicMetrics {
  wordCount: number;
  avgWordsPerSentence: number;
  keywordMatchCount: number;
  keywordMatchPercentage: number;
  sections: Array<{ name: string; completed: boolean }>;
  completionPercentage: number;
}

export const calculateBasicMetrics = (
  resumeData: ResumeData,
  targetKeywords: string[]
): BasicMetrics => {
  const allText = [
    resumeData.summary,
    ...resumeData.experience.flatMap(exp => exp.description),
    ...resumeData.projects.map(proj => proj.description)
  ].join(' ');

  const wordCount = allText.split(/\s+/).filter(word => word.length > 0).length;
  const sentences = allText.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const avgWordsPerSentence = sentences > 0 ? wordCount / sentences : 0;

  // Keyword match calculation
  const keywordMatchCount = targetKeywords.filter(keyword => {
    const text = [
      resumeData.summary,
      ...resumeData.experience.flatMap(exp => exp.description),
      ...resumeData.skills.map(skill => skill.name)
    ].join(' ').toLowerCase();
    return text.includes(keyword.toLowerCase());
  }).length;

  const keywordMatchPercentage = targetKeywords.length > 0 
    ? Math.round((keywordMatchCount / targetKeywords.length) * 100)
    : 0;

  // Section completeness
  const sections = [
    { name: 'Personal Info', completed: !!resumeData.personalInfo.fullName },
    { name: 'Summary', completed: resumeData.summary.length > 50 },
    { name: 'Experience', completed: resumeData.experience.length > 0 },
    { name: 'Education', completed: resumeData.education.length > 0 },
    { name: 'Skills', completed: resumeData.skills.length >= 5 },
    { name: 'Projects', completed: resumeData.projects.length > 0 }
  ];

  const completedSections = sections.filter(s => s.completed).length;
  const completionPercentage = Math.round((completedSections / sections.length) * 100);

  return {
    wordCount,
    avgWordsPerSentence,
    keywordMatchCount,
    keywordMatchPercentage,
    sections,
    completionPercentage
  };
};
