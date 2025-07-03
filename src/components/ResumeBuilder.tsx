
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PersonalInfoForm } from './forms/PersonalInfoForm';
import { SummaryForm } from './forms/SummaryForm';
import { ExperienceForm } from './forms/ExperienceForm';
import { EducationForm } from './forms/EducationForm';
import { SkillsForm } from './forms/SkillsForm';
import { ProjectsForm } from './forms/ProjectsForm';
import { ReferencesForm } from './forms/ReferencesForm';
import { CertificateUploader } from './CertificateUploader';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ResumeData } from '@/types/resume';
import { User, FileText, Briefcase, GraduationCap, Wrench, FolderOpen, Users, Award } from 'lucide-react';

interface ResumeBuilderProps {
  resumeData: ResumeData;
  onUpdate: (data: ResumeData) => void;
}

export const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ resumeData, onUpdate }) => {
  const updateSection = (section: keyof ResumeData, data: any) => {
    onUpdate({
      ...resumeData,
      [section]: data
    });
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Build Your Resume</h2>
        <p className="text-sm text-gray-600">Fill in your information to create your perfect resume</p>
      </div>

      <Accordion type="multiple" defaultValue={["personal", "summary"]} className="w-full">
        <AccordionItem value="personal">
          <AccordionTrigger className="text-left">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Personal Information</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <PersonalInfoForm 
              data={resumeData.personalInfo}
              onChange={(data) => updateSection('personalInfo', data)}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="summary">
          <AccordionTrigger className="text-left">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Professional Summary</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <SummaryForm 
              data={resumeData.summary}
              onChange={(data) => updateSection('summary', data)}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="experience">
          <AccordionTrigger className="text-left">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-4 w-4" />
              <span>Work Experience</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <ExperienceForm 
              data={resumeData.experience}
              onChange={(data) => updateSection('experience', data)}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="education">
          <AccordionTrigger className="text-left">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-4 w-4" />
              <span>Education</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <EducationForm 
              data={resumeData.education}
              onChange={(data) => updateSection('education', data)}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="skills">
          <AccordionTrigger className="text-left">
            <div className="flex items-center space-x-2">
              <Wrench className="h-4 w-4" />
              <span>Skills</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <SkillsForm 
              data={resumeData.skills}
              onChange={(data) => updateSection('skills', data)}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="projects">
          <AccordionTrigger className="text-left">
            <div className="flex items-center space-x-2">
              <FolderOpen className="h-4 w-4" />
              <span>Projects</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <ProjectsForm 
              data={resumeData.projects}
              onChange={(data) => updateSection('projects', data)}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="references">
          <AccordionTrigger className="text-left">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>References</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <ReferencesForm 
              data={resumeData.references}
              onChange={(data) => updateSection('references', data)}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="certificates">
          <AccordionTrigger className="text-left">
            <div className="flex items-center space-x-2">
              <Award className="h-4 w-4" />
              <span>Certificates & Achievements</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <CertificateUploader 
              resumeData={resumeData}
              onCertificatesUpdate={() => {
                // Trigger a refresh or update if needed
              }}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
