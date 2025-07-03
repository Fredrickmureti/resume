export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedIn: string;
  website: string;
  profileImage?: string; // Optional profile image for CVs
}

export interface Experience {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string[];
}

export interface Education {
  id: string;
  degree: string;
  school: string;
  location: string;
  graduationDate: string;
  gpa?: string;
  honors?: string;
}

export interface Skill {
  id: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  category: 'Technical' | 'Soft' | 'Language' | 'Other';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  startDate: string;
  endDate: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

export interface Language {
  id: string;
  name: string;
  proficiency: 'Basic' | 'Conversational' | 'Fluent' | 'Native';
}

export interface Reference {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  relationship: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  certifications: Certification[];
  languages: Language[];
  references: Reference[];
  customSections?: CustomSection[];
  targetJob?: string;
  keywords?: string[];
}

export interface CustomSection {
  id: string;
  title: string;
  content: string[];
}

export interface ResumeVersion {
  id: string;
  name: string;
  data: ResumeData;
  template: Template;
  createdAt: string;
  updatedAt: string;
}

export interface KeywordAnalysis {
  matched: string[];
  missing: string[];
  density: Record<string, number>;
  suggestions: string[];
}

export interface ATSAnalysis {
  score: number;
  sections: {
    contactInfo: boolean;
    summary: boolean;
    experience: boolean;
    education: boolean;
    skills: boolean;
    keywords: boolean;
    formatting: boolean;
    quantifiedAchievements: boolean;
  };
  keywords: KeywordAnalysis;
  suggestions: string[];
}

export type Template = 'modern' | 'classic' | 'creative' | 'minimal' | 'executive' | 'tech' | 'healthcare' | 'finance' | 'academic' | 'consulting' | 'marketing' | 'sales' | 'luxury' | 'artistic' | 'corporate' | 'elegant' | 'bold' | 'contemporary' | 'professional' | 'stylish' | 'sophisticated' | 'vibrant' | 'premium';

export type ColorScheme = 'blue' | 'green' | 'purple' | 'red' | 'orange' | 'teal' | 'gray';

export type FontFamily = 'inter' | 'roboto' | 'arial' | 'times' | 'calibri';
